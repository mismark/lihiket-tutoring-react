/**
 * Generates PWA icons:
 *   - Round icon with gradient border ring (like eFootball / TikTok)
 *   - Maskable icon with safe-zone padding for adaptive icon shapes
 *
 * Run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const SOURCE = join(publicDir, 'logo1.png');

// ─── Helper: build a circular icon with gradient border ring ─────────────────
// size       = final canvas size (e.g. 512)
// borderPct  = border width as fraction of size (e.g. 0.045 = ~4.5%)
// The logo fills the inner circle; the outer ring is a CSS-like gradient.
async function buildCircleIcon(size, borderPct = 0.048) {
  const border  = Math.round(size * borderPct);
  const inner   = size - border * 2;          // diameter of the inner circle

  // ── 1. Resize logo to inner circle size ──────────────────────────────────
  const logoResized = await sharp(SOURCE)
    .resize(inner, inner, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer();

  // ── 2. Create a circular mask for the logo ───────────────────────────────
  const circleMask = Buffer.from(
    `<svg width="${inner}" height="${inner}">
       <circle cx="${inner/2}" cy="${inner/2}" r="${inner/2}" fill="white"/>
     </svg>`
  );

  const logoCircle = await sharp(logoResized)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // ── 3. Build the gradient ring as an SVG background ──────────────────────
  // Two-stop gradient: emerald (#10b981) → blue (#3b82f6) → violet (#8b5cf6)
  const ringRadius = size / 2;
  const ringSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   stop-color="#10b981"/>
           <stop offset="50%"  stop-color="#3b82f6"/>
           <stop offset="100%" stop-color="#8b5cf6"/>
         </linearGradient>
       </defs>
       <!-- Outer gradient ring -->
       <circle cx="${ringRadius}" cy="${ringRadius}" r="${ringRadius}"
               fill="url(#ring)"/>
       <!-- Dark inner background -->
       <circle cx="${ringRadius}" cy="${ringRadius}" r="${ringRadius - border}"
               fill="#0f172a"/>
     </svg>`
  );

  // ── 4. Composite logo circle onto the ring ───────────────────────────────
  const final = await sharp(ringSvg)
    .composite([{
      input: logoCircle,
      top:   border,
      left:  border,
    }])
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  return final;
}

// ─── Helper: maskable icon (full-bleed, safe zone) ───────────────────────────
// Android adaptive icons clip the icon into any shape (circle, squircle, etc.)
// The "safe zone" is the central 80% — logo must be fully inside it.
async function buildMaskableIcon(size) {
  const safeZone  = Math.round(size * 0.72);  // 72% of canvas = safe inner area
  const padding   = Math.round((size - safeZone) / 2);

  // Resize logo to safe zone
  const logoResized = await sharp(SOURCE)
    .resize(safeZone, safeZone, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
    .png()
    .toBuffer();

  // Dark gradient background (full bleed — covers the entire canvas)
  const bgSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <radialGradient id="bg" cx="50%" cy="50%" r="70%">
           <stop offset="0%"   stop-color="#0f172a"/>
           <stop offset="100%" stop-color="#020817"/>
         </radialGradient>
         <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   stop-color="#10b981" stop-opacity="0.25"/>
           <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.25"/>
         </linearGradient>
       </defs>
       <!-- Full-bleed background -->
       <rect width="${size}" height="${size}" fill="url(#bg)"/>
       <!-- Subtle gradient ring hint (helps adaptive icon look good when cropped) -->
       <circle cx="${size/2}" cy="${size/2}" r="${size*0.48}"
               fill="none" stroke="url(#ring)" stroke-width="${size*0.04}"/>
     </svg>`
  );

  const final = await sharp(bgSvg)
    .composite([{
      input: logoResized,
      top:   padding,
      left:  padding,
    }])
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  return final;
}

// ─── Generate all sizes ───────────────────────────────────────────────────────
console.log('Generating circular icons with gradient border ring...\n');

// Standard sizes — all circular with gradient ring
const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

for (const size of SIZES) {
  const buf  = await buildCircleIcon(size);
  const out  = join(publicDir, `icon-${size}.png`);
  await sharp(buf).toFile(out);
  console.log(`  ✅ icon-${size}.png`);
}

// Maskable variants (192 + 512) — full bleed for adaptive icons
for (const size of [192, 512]) {
  const buf = await buildMaskableIcon(size);
  const out = join(publicDir, `icon-maskable-${size}.png`);
  await sharp(buf).toFile(out);
  console.log(`  ✅ icon-maskable-${size}.png (maskable)`);
}

// favicon-32 — circular
const fav = await buildCircleIcon(32, 0.06);
await sharp(fav).toFile(join(publicDir, 'favicon-32.png'));
console.log('  ✅ favicon-32.png');

// Update favicon.svg to match circular style
import { writeFileSync } from 'fs';
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#10b981"/>
      <stop offset="50%"  stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="txt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#10b981"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <clipPath id="inner">
      <circle cx="32" cy="32" r="27"/>
    </clipPath>
  </defs>
  <!-- Gradient border ring -->
  <circle cx="32" cy="32" r="32" fill="url(#ring)"/>
  <!-- Dark inner background -->
  <circle cx="32" cy="32" r="27" fill="#0f172a"/>
  <!-- Letter L -->
  <text x="32" y="44" text-anchor="middle"
        font-family="Georgia, serif" font-size="30" font-weight="bold"
        fill="url(#txt)">L</text>
</svg>`;
writeFileSync(join(publicDir, 'favicon.svg'), faviconSvg);
console.log('  ✅ favicon.svg (circular with gradient ring)');

console.log('\nAll icons generated! Circular with gradient border ring.');
