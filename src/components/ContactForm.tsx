import { useEffect, useRef, useState, type FormEvent } from 'react';

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

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;

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
  const [formError, setFormError] = useState('');
  const [token, setToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        size: 'flexible',
        appearance: 'interaction-only',
        callback: (t: string) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderWidget);
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!action) {
      setStatus('error');
      return;
    }
    if (!TURNSTILE_SITE_KEY) {
      setFormError('Verification is not configured. Please call us instead.');
      setStatus('error');
      return;
    }
    if (!token) {
      setFormError('Please complete the verification challenge.');
      setStatus('error');
      return;
    }
    setFormError('');
    setStatus('submitting');
    try {
      const data = new FormData(e.currentTarget);
      data.set('cf-turnstile-response', token);
      const res = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed');
      window.location.href = '/thank-you/';
    } catch {
      setStatus('error');
    } finally {
      if (window.turnstile && widgetIdRef.current) window.turnstile.reset(widgetIdRef.current);
      setToken('');
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
        {TURNSTILE_SITE_KEY ? (
          <div ref={turnstileRef} />
        ) : (
          <span role="alert">Verification is not configured.</span>
        )}
      </p>
      <p>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Submit'}
        </button>
      </p>
      {status === 'error' && (
        <p role="alert">
          {formError || (
            <>
              Sorry, your message couldn't be sent. Please try again or call{' '}
              <a href="tel:+19154445110">(915) 444-5110</a>.
            </>
          )}
        </p>
      )}
    </form>
  );
}
