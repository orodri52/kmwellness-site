// Reports contact-form lead volume broken down by "How did you hear about
// us?", sourced from the Resend email logs (there's no DB — every lead is a
// notification email sent by functions/api/lead.ts).
//
// Ad hoc run (prints to console):
//   RESEND_API_KEY=re_xxx node scripts/lead-sources-report.mjs [YYYY-MM]
//   Defaults to the trailing 7 days if no month is given.
//
// Scheduled run (also emails the report):
//   Set REPORT_TO_EMAILS to a comma-separated list of recipients and the
//   report is sent via Resend in addition to being printed. See
//   .github/workflows/lead-sources-report.yml for the weekly cron job.

const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) {
  console.error('Missing RESEND_API_KEY environment variable.');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${API_KEY}` };

async function resendGet(path) {
  const res = await fetch(`https://api.resend.com${path}`, { headers });
  if (!res.ok) throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// A calendar month ("2026-04") groups by that month; otherwise defaults to a
// rolling 7-day window ending today, for the weekly scheduled run.
function dateRangeFor(arg) {
  if (arg && /^\d{4}-\d{2}$/.test(arg)) {
    const [y, m] = arg.split('-').map(Number);
    const start = `${arg}-01`;
    const end = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10); // first day of next month
    return { start, end, label: arg };
  }
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const end = new Date(Date.now() + 86400000).toISOString().slice(0, 10); // tomorrow, exclusive
  return { start, end, label: `${start} to ${today}` };
}

// The list endpoint returns emails newest-first and has no date filter, so
// page backward until we pass the start of the range, keeping only lead emails.
async function listLeadEmails(start, end) {
  const matches = [];
  let after;
  while (true) {
    const qs = new URLSearchParams({ limit: '100' });
    if (after) qs.set('after', after);
    const page = await resendGet(`/emails?${qs}`);
    if (!page.data?.length) break;

    for (const email of page.data) {
      const emailDate = email.created_at.slice(0, 10);
      if (emailDate < start) return matches; // paged past the start of the range
      if (emailDate < end && email.subject?.startsWith('New lead:')) {
        matches.push(email);
      }
    }

    if (!page.has_more) break;
    after = page.data[page.data.length - 1].id;
  }
  return matches;
}

// The list endpoint doesn't include the body, so each lead needs a follow-up
// fetch for its "How they heard about us" line. Resend's default rate limit
// is 10 req/sec, so batch conservatively.
async function withRateLimit(items, concurrency, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map(fn))));
    if (i + concurrency < items.length) await new Promise((r) => setTimeout(r, 1000));
  }
  return results;
}

const HEAR_LINE = /^How they heard about us: (.+)$/m;

async function categorize(emails) {
  const counts = new Map();
  await withRateLimit(emails, 8, async (email) => {
    const detail = await resendGet(`/emails/${email.id}`);
    const source = detail.text?.match(HEAR_LINE)?.[1]?.trim() || 'Unknown';
    counts.set(source, (counts.get(source) || 0) + 1);
  });
  return counts;
}

async function sendReportEmail({ from, to, label, rows, total, leadsCount }) {
  const pctOf = (count) => (total ? ((count / total) * 100).toFixed(1) : '0.0');

  const tableRows = rows
    .map(
      ([source, count]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;">${source}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">${count}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">${pctOf(count)}%</td></tr>`,
    )
    .join('');

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;">
    <h2 style="margin:0 0 8px;">Lead sources report — ${label}</h2>
    <p style="margin:0 0 16px;color:#555;">${leadsCount} lead${leadsCount === 1 ? '' : 's'} total.</p>
    <table style="border-collapse:collapse;width:100%;max-width:480px;">
      <thead><tr><th style="text-align:left;padding:6px 12px;border-bottom:2px solid #111;">Source</th><th style="text-align:right;padding:6px 12px;border-bottom:2px solid #111;">Count</th><th style="text-align:right;padding:6px 12px;border-bottom:2px solid #111;">%</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>`;

  const text =
    `Lead sources report — ${label}\n${leadsCount} lead(s) total.\n\n` +
    rows.map(([source, count]) => `${source}: ${count} (${pctOf(count)}%)`).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject: `Lead sources report — ${label}`, html, text }),
  });
  if (!res.ok) throw new Error(`Resend send error ${res.status}: ${await res.text()}`);
}

const { start, end, label } = dateRangeFor(process.argv[2]);
const leads = await listLeadEmails(start, end);
console.log(`Found ${leads.length} lead email(s) for ${label}.\n`);

const counts = await categorize(leads);
const total = [...counts.values()].reduce((a, b) => a + b, 0);
const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
const nameWidth = Math.max(6, ...rows.map(([name]) => name.length));

console.log(`${'Source'.padEnd(nameWidth)}  Count  %`);
for (const [source, count] of rows) {
  const pct = total ? ((count / total) * 100).toFixed(1) : '0.0';
  console.log(`${source.padEnd(nameWidth)}  ${String(count).padStart(5)}  ${pct}%`);
}

const recipients = (process.env.REPORT_TO_EMAILS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (recipients.length) {
  const from = process.env.REPORT_FROM_EMAIL || 'KM Wellness Reports <leads@kmwellnesscenter.com>';
  await sendReportEmail({ from, to: recipients, label, rows, total, leadsCount: leads.length });
  console.log(`\nEmailed report to ${recipients.join(', ')}`);
}
