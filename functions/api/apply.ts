// Cloudflare Pages Function — handles careers application submissions.
//
// Route: POST /api/apply
// Reuses the same Resend and recipient settings as the contact/lead forms:
//   RESEND_API_KEY, LEAD_TO_EMAIL, LEAD_FROM_EMAIL, TURNSTILE_SECRET_KEY,
//   and the optional RATE_LIMIT_KV binding.

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  RESEND_API_KEY: string;
  LEAD_TO_EMAIL?: string;
  LEAD_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY: string;
  RATE_LIMIT_KV?: KVNamespaceLike;
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const allowedResumeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const esc = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] as string,
  );

async function verifyTurnstile(
  token: string,
  secret: string,
  remoteip?: string,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set('remoteip', remoteip);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      'error-codes'?: string[];
    };
    if (result.success !== true) {
      console.warn('Turnstile verification failed (application form):', result['error-codes'] ?? 'unknown');
      return false;
    }
    if (result.action && result.action !== 'job_application') {
      console.warn('Turnstile action mismatch (application form):', result.action);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      'Turnstile siteverify request failed (application form):',
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

const MAX_BODY_BYTES = 7 * 1024 * 1024; // MAX_RESUME_BYTES (5 MB) plus multipart/field overhead.

async function isRateLimited(
  kv: KVNamespaceLike | undefined,
  ip: string | undefined,
): Promise<boolean> {
  if (!kv || !ip) return false;

  try {
    const key = `application-ratelimit:${ip}`;
    const count = Number.parseInt((await kv.get(key)) ?? '0', 10);
    if (count >= RATE_LIMIT_MAX) return true;
    await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
    return false;
  } catch {
    // The rate limit is an extra defense. Do not lose a real application if KV
    // is unavailable.
    return false;
  }
}

function startsWithBytes(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

function isExpectedFile(extension: string, bytes: Uint8Array): boolean {
  if (extension === 'pdf') {
    const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
    const searchLength = Math.min(bytes.length - pdfSignature.length + 1, 1024);
    for (let index = 0; index < searchLength; index += 1) {
      if (pdfSignature.every((byte, offset) => bytes[index + offset] === byte)) return true;
    }
    return false;
  }

  if (extension === 'doc') {
    // Compound File Binary signature used by legacy Microsoft Word documents.
    return startsWithBytes(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }

  if (extension === 'docx') {
    // DOCX files are ZIP containers and begin with a local-file header.
    return startsWithBytes(bytes, [0x50, 0x4b, 0x03, 0x04]);
  }

  return false;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}

function safeAttachmentName(candidateName: string, extension: string): string {
  const asciiName = candidateName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return `${asciiName || 'candidate'}-resume.${extension}`;
}

export const onRequestPost: (context: {
  request: Request;
  env: Env;
}) => Promise<Response> = async ({ request, env }) => {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const jsonHeaders = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  };
  const success = () =>
    wantsJson
      ? new Response(JSON.stringify({ success: true }), { status: 200, headers: jsonHeaders })
      : Response.redirect(new URL('/application-received/', request.url).toString(), 303);
  const failure = (message: string, status = 400) => {
    if (wantsJson) {
      return new Response(JSON.stringify({ success: false, error: message }), {
        status,
        headers: jsonHeaders,
      });
    }

    const failureUrl = new URL('/careers/', request.url);
    failureUrl.searchParams.set('application', 'error');
    failureUrl.hash = 'openings';
    return Response.redirect(failureUrl.toString(), 303);
  };

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return failure('Request too large.', 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure('Invalid form submission. Please refresh the page and try again.');
  }

  const getText = (key: string, maxLength = 2000) => {
    const value = form.get(key);
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
  };
  const stripCrlf = (value: string) => value.replace(/[\r\n]+/g, ' ');

  // Honeypot fields are not visible to real applicants. Silently accept bot
  // submissions so the filter is not revealed.
  if (getText('company')) return success();

  const remoteip = request.headers.get('CF-Connecting-IP') || undefined;
  if (await isRateLimited(env.RATE_LIMIT_KV, remoteip)) {
    return failure('Too many applications were submitted. Please wait and try again.', 429);
  }

  const name = getText('name', 120);
  const email = getText('email', 254);
  const phone = getText('phone', 40);
  const position = getText('position', 120);
  const jobId = getText('jobId', 80);
  const coverNote = getText('coverNote', 4000);
  const source = getText('source', 100) || 'careers-page';
  const turnstileToken = getText('cf-turnstile-response', 3000);
  const resumeEntry = form.get('resume');

  if (!name || !email || !phone || !position) {
    return failure('Please provide your name, email, phone number, and position.');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return failure('Please provide a valid email address.');
  }
  if (jobId && !/^[a-z0-9-]+$/.test(jobId)) {
    return failure('The selected position is invalid. Please refresh the page and try again.');
  }
  if (!(resumeEntry instanceof File) || !resumeEntry.name) {
    return failure('Please attach your resume as a PDF, DOC, or DOCX file.');
  }
  if (resumeEntry.size === 0) return failure('The attached resume is empty. Please choose another file.');
  if (resumeEntry.size > MAX_RESUME_BYTES) {
    return failure('Your resume must be no larger than 5 MB.', 413);
  }

  const originalResumeName = resumeEntry.name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 255);
  const extension = originalResumeName.split('.').pop()?.toLowerCase() || '';
  const expectedMimeType = allowedResumeTypes[extension];
  if (!expectedMimeType) {
    return failure('Please attach your resume as a PDF, DOC, or DOCX file.');
  }

  const submittedMimeType = resumeEntry.type.toLowerCase().split(';')[0];
  const genericMimeType = !submittedMimeType || submittedMimeType === 'application/octet-stream';
  if (!genericMimeType && submittedMimeType !== expectedMimeType) {
    return failure('The resume file type does not match its filename. Please choose another file.');
  }

  let resumeBuffer: ArrayBuffer;
  try {
    resumeBuffer = await resumeEntry.arrayBuffer();
  } catch {
    return failure('The resume could not be read. Please choose the file again.');
  }

  if (!isExpectedFile(extension, new Uint8Array(resumeBuffer))) {
    return failure('The resume does not appear to be a valid PDF, DOC, or DOCX file.');
  }

  if (!env.TURNSTILE_SECRET_KEY || !turnstileToken) {
    return failure('Verification failed. Please refresh the page and try again.', 403);
  }
  if (!(await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, remoteip))) {
    return failure('Verification failed. Please refresh the page and try again.', 403);
  }
  if (!env.RESEND_API_KEY) return failure('Email service is not configured.', 500);

  const to = env.LEAD_TO_EMAIL || 'info@kmwellnesscenter.com';
  const from = env.LEAD_FROM_EMAIL || 'KM Wellness Website <leads@kmwellnesscenter.com>';
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const attachmentName = safeAttachmentName(name, extension);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const firstName = name.split(/\s+/)[0] || name;

  const detailRows: [string, string, string?][] = [
    ['Position', position],
    ['Phone', phone, phoneHref],
    ['Resume', `${originalResumeName} (${(resumeEntry.size / (1024 * 1024)).toFixed(2)} MB)`],
    ['Source page', source],
    ['Submitted', `${submittedAt} (Mountain Time)`],
  ];

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e5e5e5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e5e5e5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#111111;padding:28px 32px;">
            <span style="font-family:'Avenir Next','Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:3px;color:#a3a3a3;">KM WELLNESS CENTER</span>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#ffffff;margin-top:6px;">New Job Application</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;">Applicant</p>
            <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#111111;">${esc(name)}</p>

            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;">Email</p>
            <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;"><a href="mailto:${esc(email)}" style="color:#111111;text-decoration:none;">${esc(email)}</a></p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #d4d4d4;margin-bottom:20px;">
              ${detailRows
                .map(
                  ([label, value, href]) => `<tr>
                <td style="padding:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;width:150px;vertical-align:top;">${esc(label)}</td>
                <td style="padding:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111111;">${href ? `<a href="${esc(href)}" style="color:#111111;text-decoration:none;">${esc(value)}</a>` : esc(value)}</td>
              </tr>`,
                )
                .join('')}
            </table>

            ${
              coverNote
                ? `<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;">Why they're interested</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;border-left:3px solid #404040;border-radius:4px;margin-bottom:24px;">
              <tr><td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#404040;">${esc(coverNote).replace(/\n/g, '<br>')}</td></tr>
            </table>`
                : ''
            }

            <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;">The applicant's resume is attached to this email as <strong style="color:#111111;">${esc(attachmentName)}</strong>.</p>

            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:6px;background:#111111;">
                <a href="mailto:${esc(email)}" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Reply to ${esc(firstName)}</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;background:#e5e5e5;border-top:1px solid #d4d4d4;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#737373;">Submitted from the careers page at kmwellnesscenter.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text =
    `New job application\n\n` +
    `Applicant: ${name}\n` +
    `Email: ${email}\n` +
    detailRows.map(([label, value]) => `${label}: ${value}`).join('\n') +
    (coverNote ? `\n\nWhy they're interested:\n${coverNote}` : '') +
    `\n\nResume attached as: ${attachmentName}`;

  let attachmentContent: string;
  try {
    attachmentContent = arrayBufferToBase64(resumeBuffer);
  } catch {
    return failure('The resume could not be prepared for delivery. Please try another file.', 500);
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: stripCrlf(`Job application: ${position} — ${name}`),
      html,
      text,
      attachments: [
        {
          filename: attachmentName,
          content: attachmentContent,
        },
      ],
    }),
  });

  if (!resendResponse.ok) {
    console.error('Resend rejected a job application email.', resendResponse.status);
    return failure(
      'Your application could not be sent. Please try again or email info@kmwellnesscenter.com.',
      502,
    );
  }

  return success();
};
