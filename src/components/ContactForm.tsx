import { useState, type FormEvent } from 'react';

/**
 * React island (the Astro + React integration in action).
 * Rendered with `client:load` so it hydrates in the browser; the rest of the
 * page stays static HTML for SEO.
 *
 * On a static host there is no server to receive the POST, so wire `action` to
 * a form handler:
 *   - Cloudflare Pages Function at /functions/contact.ts, OR
 *   - a service like Formspree (action="https://formspree.io/f/XXXX").
 * On success it redirects to /thank-you/.
 */
interface Props {
  action?: string;
}

const HEAR_OPTIONS = [
  'Google Search',
  'Social Media',
  'HealthProfs',
  'Primary Care Referral',
  'Word-of-Mouth',
  'Other',
];

export default function ContactForm({ action = '' }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!action) {
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      const data = new FormData(e.currentTarget);
      const res = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed');
      window.location.href = '/thank-you/';
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} method="POST" action={action || undefined}>
      <input type="hidden" name="source" value="contact-page" />
      {/* Honeypot: hidden from users; bots that fill it are rejected server-side. */}
      <p aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </p>
      <p>
        <label htmlFor="firstName">First name *</label>
        <input id="firstName" name="firstName" type="text" required autoComplete="given-name" />
      </p>
      <p>
        <label htmlFor="lastName">Last name *</label>
        <input id="lastName" name="lastName" type="text" required autoComplete="family-name" />
      </p>
      <p>
        <label htmlFor="email">Email *</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </p>
      <p>
        <label htmlFor="phone">Phone *</label>
        <input id="phone" name="phone" type="tel" required autoComplete="tel" />
      </p>
      <p>
        <label htmlFor="hear">How did you hear about us? *</label>
        <select id="hear" name="hear" required defaultValue="">
          <option value="" disabled>--- Select Choice ---</option>
          {HEAR_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </p>
      <p>
        <label htmlFor="message">Message *</label>
        <textarea id="message" name="message" rows={5} required></textarea>
      </p>
      <p>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Submit'}
        </button>
      </p>
      {status === 'error' && (
        <p role="alert">
          Sorry, your message couldn't be sent. Please try again or call{' '}
          <a href="tel:+19154445110">(915) 444-5110</a>.
        </p>
      )}
    </form>
  );
}
