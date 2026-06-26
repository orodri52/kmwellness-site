// Generates brand raster assets from SVG sources using sharp (already a
// dependency via Astro's image pipeline). Run with: `npm run gen:images`.
//
//   public/images/logo.png        -> raster logo (Organization JSON-LD + fallback)
//   public/images/og-default.jpg  -> 1200x630 Open Graph / Twitter card
//
// Brand palette (see src/styles/global.css):
//   paper #f4eadc · ink #1d1a15 · ink-soft #5f574c · clay #b88766 · sage #8b9677
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => resolve(root, 'public/images', p);

// --- Logo (raster PNG on transparent: soil "K M" over ink "WELLNESS") ---
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="460" viewBox="0 0 960 460">
  <text x="50%" y="240" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="500" font-size="240" letter-spacing="28" fill="#8b6f55">K M</text>
  <text x="50%" y="360" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="68" letter-spacing="36" fill="#1d1a15">WELLNESS</text>
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
  <text x="600" y="240" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="500" font-size="150" letter-spacing="30" fill="#8b6f55">K M</text>
  <text x="600" y="320" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="34" letter-spacing="20" fill="#1d1a15">WELLNESS CENTER</text>
  <text x="600" y="372" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="24" letter-spacing="6" fill="#8b9677">HOLISTIC WEIGHT LOSS &amp; NUTRITION CLINIC</text>
  <line x1="450" y1="385" x2="750" y2="385" stroke="#b88766" stroke-width="3"/>
  <text x="600" y="445" text-anchor="middle" font-family="Palatino, Georgia, serif" font-style="italic" font-size="44" fill="#5f574c">Personalized nutrition counseling in El Paso, TX</text>
  <text x="600" y="540" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="4" fill="#1d1a15">kmwellnesscenter.com  ·  (915) 444-5110</text>
</svg>`;

await sharp(Buffer.from(logoSvg)).png().toFile(out('logo.png'));
await sharp(Buffer.from(ogSvg)).jpeg({ quality: 88, mozjpeg: true }).toFile(out('og-default.jpg'));

console.log('Wrote public/images/logo.png and public/images/og-default.jpg');
