/**
 * Generates all PWA icon sizes from logo1.png (1254x1254)
 * Run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Source: existing high-res logo1.png
const SOURCE = join(publicDir, 'logo1.png');

// All sizes needed
const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

console.log('Generating PWA icons from logo1.png...\n');

for (const size of SIZES) {
  const outPath = join(publicDir, `icon-${size}.png`);
  await sharp(SOURCE)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  ✅ icon-${size}.png`);
}

// Also create a proper maskable version:
// Maskable = logo centered on dark background with ~15% safe-zone padding
for (const size of [192, 512]) {
  const padding = Math.round(size * 0.12); // 12% padding = safe zone
  const innerSize = size - padding * 2;
  const outPath = join(publicDir, `icon-maskable-${size}.png`);

  // Create dark background + centered logo
  const logoBuffer = await sharp(SOURCE)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 255 }, // #0f172a
    }
  })
  .composite([{ input: logoBuffer, gravity: 'center' }])
  .png({ quality: 95 })
  .toFile(outPath);

  console.log(`  ✅ icon-maskable-${size}.png (maskable with safe zone)`);
}

// favicon-32.png for browser tab
await sharp(SOURCE)
  .resize(32, 32, { fit: 'cover' })
  .png()
  .toFile(join(publicDir, 'favicon-32.png'));
console.log('  ✅ favicon-32.png');

console.log('\nAll icons generated successfully!');
