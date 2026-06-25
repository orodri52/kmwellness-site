// Cloudflare Pages Function — handles lead/contact form submissions.
//
// Route: POST /api/lead  (Cloudflare auto-routes files in /functions)
// Lives OUTSIDE src/ so Astro ignores it; Cloudflare Pages deploys it as an
// edge function alongside the static site.
//
// Required environment variables (Cloudflare Pages > Settings > Variables):
//   RESEND_API_KEY   — your Resend API key (Secret)
//   LEAD_TO_EMAIL    — where leads are delivered (default: info@kmwellnesscenter.com)
//   LEAD_FROM_EMAIL  — verified Resend sender (default: leads@kmwellnesscenter.com)
//
// Progressive enhancement: JS clients send `Accept: application/json` and get
// JSON back (then redirect to /thank-you/). Plain HTML form posts (no JS) get a
// 303 redirect to /thank-you/ directly, so the form works even without JS.

interface Env {
  RESEND_API_KEY: string;
  LEAD_TO_EMAIL?: string;
  LEAD_FROM_EMAIL?: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

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
  const get = (k: string) => (form.get(k)?.toString() ?? '').trim();

  // Honeypot: real users never fill this hidden field. Silently "succeed" so
  // bots don't learn they were blocked, but send nothing.
  if (get('company')) return ok();

  // Accept both the full contact form and the compact lead form field sets.
  const name = get('name') || [get('firstName'), get('lastName')].filter(Boolean).join(' ');
  const email = get('email');
  const phone = get('phone');
  const service = get('service');
  const hear = get('hear');
  const message = get('message');
  const source = get('source') || 'website';

  if (!name || !email || !phone) return fail('Please provide your name, email, and phone.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Please provide a valid email.');

  if (!env.RESEND_API_KEY) return fail('Email service is not configured.', 500);

  const to = env.LEAD_TO_EMAIL || 'info@kmwellnesscenter.com';
  const from = env.LEAD_FROM_EMAIL || 'KM Wellness Website <leads@kmwellnesscenter.com>';

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone],
    service && ['Service interest', service],
    hear && ['How they heard about us', hear],
    ['Source page', source],
    message && ['Message', message],
  ].filter(Boolean) as [string, string][];

  const html =
    `<h2>New lead from kmwellnesscenter.com</h2><table cellpadding="6" style="border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd"><strong>${esc(k)}</strong></td><td style="border:1px solid #ddd">${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('') +
    `</table>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

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
