// Cloudflare Pages Function — handles lead/contact form submissions.
//
// Route: POST /api/lead  (Cloudflare auto-routes files in /functions)
// Lives OUTSIDE src/ so Astro ignores it; Cloudflare Pages deploys it as an
// edge function alongside the static site.
//
// Required environment variables (Cloudflare Pages > Settings > Variables):
//   RESEND_API_KEY       — your Resend API key (Secret)
//   LEAD_TO_EMAIL        — where leads are delivered (default: info@kmwellnesscenter.com)
//   LEAD_FROM_EMAIL      — verified Resend sender (default: leads@kmwellnesscenter.com)
//   TURNSTILE_SECRET_KEY — Cloudflare Turnstile secret key (Secret)
//   RATE_LIMIT_KV        — Workers KV binding used for IP-based rate limiting (see README)
//
// Progressive enhancement: JS clients send `Accept: application/json` and get
// JSON back (then redirect to /thank-you/). Plain HTML form posts (no JS) get a
// 303 redirect to /thank-you/ directly, so the form works even without JS.

// Minimal shape for the KV binding — avoids pulling in @cloudflare/workers-types
// just for this one interface.
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
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

async function verifyTurnstile(token: string, secret: string, remoteip?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set('remoteip', remoteip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// IP-based rate limit on top of the honeypot + Turnstile checks — a defense
// against a bot that has a valid solved Turnstile token. Fails OPEN (never
// blocks a real lead) if the KV binding is missing or a KV call throws.
async function isRateLimited(kv: KVNamespaceLike | undefined, ip: string | undefined): Promise<boolean> {
  if (!kv || !ip) return false;
  try {
    const key = `ratelimit:${ip}`;
    const count = parseInt((await kv.get(key)) ?? '0', 10);
    if (count >= RATE_LIMIT_MAX) return true;
    await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
    return false;
  } catch {
    return false;
  }
}

export const onRequestPost: (ctx: {
  request: Request;
  env: Env;
}) => Promise<Response> = async ({ request, env }) => {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const ok = () =>
    wantsJson
      ? new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      : Response.redirect(new URL('/thank-you/', request.url).toString(), 303);
  const fail = (msg: string, code = 400) =>
    wantsJson
      ? new Response(JSON.stringify({ success: false, error: msg }), {
          status: code,
          headers: { 'content-type': 'application/json' },
        })
      : Response.redirect(new URL('/contact-us/?error=1', request.url).toString(), 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('Invalid form submission.');
  }
  const get = (k: string) => (form.get(k)?.toString() ?? '').trim().slice(0, 2000);

  // Honeypot: real users never fill this hidden field. Silently "succeed" so
  // bots don't learn they were blocked, but send nothing.
  if (get('company')) return ok();

  const remoteip = request.headers.get('CF-Connecting-IP') || undefined;

  // Rate limit before the Turnstile verification fetch — cheaper, and avoids
  // wasting the external API call on a bot that has a valid solved token.
  if (await isRateLimited(env.RATE_LIMIT_KV, remoteip)) {
    return fail('Too many submissions. Please try again later or call (915) 444-5110.', 429);
  }

  // Accept both the full contact form and the compact lead form field sets.
  const name = get('name') || [get('firstName'), get('lastName')].filter(Boolean).join(' ');
  const email = get('email');
  const phone = get('phone');
  const service = get('service');
  const hear = get('hear');
  const message = get('message');
  const source = get('source') || 'website';
  const turnstileToken = get('cf-turnstile-response');

  if (!name || !email || !phone) return fail('Please provide your name, email, and phone.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Please provide a valid email.');

  if (!env.TURNSTILE_SECRET_KEY || !turnstileToken) return fail('Verification failed. Please try again.', 403);
  const verified = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, remoteip);
  if (!verified) return fail('Verification failed. Please try again.', 403);

  if (!env.RESEND_API_KEY) return fail('Email service is not configured.', 500);

  const to = env.LEAD_TO_EMAIL || 'info@kmwellnesscenter.com';
  const from = env.LEAD_FROM_EMAIL || 'KM Wellness Website <leads@kmwellnesscenter.com>';

  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const detailRows = [
    ['Phone', phone, `tel:${phone.replace(/[^\d+]/g, '')}`],
    service && ['Service interest', service],
    hear && ['How they heard about us', hear],
    ['Source page', source],
    ['Submitted', `${submittedAt} (Mountain Time)`],
  ].filter(Boolean) as [string, string, string?][];

  const firstName = name.split(' ')[0] || name;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e5e5e5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e5e5e5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#111111;padding:28px 32px;">
            <span style="font-family:'Avenir Next','Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:3px;color:#a3a3a3;">KM WELLNESS CENTER</span>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#ffffff;margin-top:6px;">New Website Lead</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;">Name</p>
            <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#111111;">${esc(name)}</p>

            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;">Email</p>
            <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;"><a href="mailto:${esc(email)}" style="color:#111111;text-decoration:none;">${esc(email)}</a></p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #d4d4d4;margin-bottom:20px;">
              ${detailRows
                .map(
                  ([k, v, href]) => `<tr>
                <td style="padding:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;width:170px;vertical-align:top;">${esc(k)}</td>
                <td style="padding:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111111;">${href ? `<a href="${esc(href)}" style="color:#111111;text-decoration:none;">${esc(v)}</a>` : esc(v)}</td>
              </tr>`,
                )
                .join('')}
            </table>

            ${
              message
                ? `<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#737373;">Message</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;border-left:3px solid #404040;border-radius:4px;margin-bottom:24px;">
              <tr><td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#404040;">${esc(message).replace(/\n/g, '<br>')}</td></tr>
            </table>`
                : ''
            }

            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:6px;background:#111111;">
                <a href="mailto:${esc(email)}" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Reply to ${esc(firstName)}</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;background:#e5e5e5;border-top:1px solid #d4d4d4;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#737373;">Submitted from the contact form at kmwellnesscenter.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text =
    `New website lead\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    detailRows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    (message ? `\n\nMessage:\n${message}` : '');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New lead: ${name}${service ? ` — ${service}` : ''}`,
      html,
      text,
    }),
  });

  if (!res.ok) return fail('Could not send your message. Please call (915) 444-5110.', 502);
  return ok();
};
