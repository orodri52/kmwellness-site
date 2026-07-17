// Generates the default Open Graph / Twitter card using the canonical logo.
// Run with: `npm run gen:images`.
//
// The client-supplied public/images/logo.png is intentionally never generated
// or modified here. It is composited directly into the social card instead.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const image = (file) => resolve(root, 'public/images', file);
const logoPath = image('logo.png');
const ogPath = image('og-default.jpg');

// --- Open Graph card (1200x630) -----------------------------------------
// Keep this palette strictly neutral so the card matches the black, white, and
// gray site refresh. The logo itself is added below from the original PNG.
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#171717"/>
      <stop offset="1" stop-color="#050505"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5b5b5b" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#b8b8b8"/>
      <stop offset="1" stop-color="#5b5b5b" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <rect x="30" y="30" width="1140" height="570" rx="18" fill="none" stroke="#4c4c4c" stroke-width="2"/>
  <path d="M72 72h150M72 72v150M1128 72H978M1128 72v150" fill="none" stroke="#777" stroke-width="2"/>
  <path d="M72 558h150M72 558V408M1128 558H978M1128 558V408" fill="none" stroke="#777" stroke-width="2"/>
  <line x1="390" y1="457" x2="810" y2="457" stroke="url(#rule)" stroke-width="2"/>
  <text x="600" y="490" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="21" letter-spacing="5" fill="#d0d0d0">HOLISTIC WEIGHT LOSS &amp; NUTRITION CLINIC</text>
  <text x="600" y="540" text-anchor="middle" font-family="Palatino, Georgia, serif" font-style="italic" font-size="37" fill="#f5f5f5">Personalized nutrition counseling in El Paso, TX</text>
  <text x="600" y="580" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="23" letter-spacing="3" fill="#a6a6a6">kmwellnesscenter.com  ·  (915) 444-5110</text>
</svg>`;

const logo = await sharp(logoPath)
  .resize({ width: 650, kernel: sharp.kernel.lanczos3, withoutEnlargement: true })
  .png()
  .toBuffer();
const { width: logoWidth, height: logoHeight } = await sharp(logo).metadata();

await sharp(Buffer.from(ogSvg))
  .composite([
    {
      input: logo,
      left: Math.round((1200 - logoWidth) / 2),
      top: Math.round((445 - logoHeight) / 2) + 12,
    },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(ogPath);

console.log('Wrote public/images/og-default.jpg using the original public/images/logo.png.');
