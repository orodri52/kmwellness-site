// Generates brand raster assets from SVG sources using sharp (already a
// dependency via Astro's image pipeline). Run with: `npm run gen:images`.
//
//   public/images/logo.png        -> raster logo (Organization JSON-LD + fallback)
//   public/images/og-default.jpg  -> 1200x630 Open Graph / Twitter card
//
// Brand palette (see src/styles/global.css):
//   paper #f4eadc · ink #1d1a15 · ink-soft #5f574c · clay #b88766 · sage #8b9677
//   gold #c9a24a · maroon #741722
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => resolve(root, 'public/images', p);

const boxedLogoMark = `
  <path d="M160 39 V12 H282 V132 H160 V112" fill="none" stroke="#741722" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter"/>
  <text x="43" y="26" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="5" fill="#c9a24a">KM</text>
  <text x="39" y="80" font-family="Georgia, 'Times New Roman', serif" font-size="65" font-weight="500" letter-spacing="-3" fill="#741722">Well</text>
  <text x="159" y="86" font-family="Georgia, 'Times New Roman', serif" font-size="65" font-weight="500" letter-spacing="-3" fill="#741722">ness</text>
  <text x="43" y="107" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="800" letter-spacing="8" fill="#741722">CENTER</text>
  <line x1="125" y1="98" x2="125" y2="108" stroke="#c9a24a" stroke-width="1"/>
  <text x="166" y="106" font-family="'Helvetica Neue', Arial, sans-serif" font-size="4.5" font-weight="800" letter-spacing=".35" fill="#741722">NUTRITION COUNSELING &amp; FAMILY FITNESS</text>
  <text x="45" y="121" font-family="'Helvetica Neue', Arial, sans-serif" font-size="5.8" font-weight="800" letter-spacing="2.4" fill="#c9a24a">WEIGHT LOSS CLINIC</text>`;

// --- Logo (raster PNG on transparent: boxed gold + maroon wordmark) -------
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="424" viewBox="0 0 340 150">
  ${boxedLogoMark}
</svg>`;

// --- Open Graph card (1200x630) -----------------------------------------
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf6ec"/>
      <stop offset="1" stop-color="#efe2d1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="40" y="40" width="1120" height="550" rx="28" fill="none" stroke="#d8c7b0" stroke-width="3"/>
  <g transform="translate(260 82) scale(2)">
    ${boxedLogoMark}
  </g>
  <text x="600" y="440" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="24" letter-spacing="6" fill="#8b9677">HOLISTIC WEIGHT LOSS &amp; NUTRITION CLINIC</text>
  <line x1="450" y1="455" x2="750" y2="455" stroke="#c9a24a" stroke-width="3"/>
  <text x="600" y="515" text-anchor="middle" font-family="Palatino, Georgia, serif" font-style="italic" font-size="44" fill="#5f574c">Personalized nutrition counseling in El Paso, TX</text>
  <text x="600" y="575" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="4" fill="#741722">kmwellnesscenter.com  ·  (915) 444-5110</text>
</svg>`;

await sharp(Buffer.from(logoSvg)).png().toFile(out('logo.png'));
await sharp(Buffer.from(ogSvg)).jpeg({ quality: 88, mozjpeg: true }).toFile(out('og-default.jpg'));

console.log('Wrote public/images/logo.png and public/images/og-default.jpg');
