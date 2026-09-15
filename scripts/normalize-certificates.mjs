// One-off certificate optimizer (dev tooling, NOT an app runtime dependency).
// Converts the 10 real certificate PNGs into optimized WebP with clean names
// cert-01.webp … cert-10.webp under public/puro/certificates/, preserving the
// full document (no crop). Documents can be large, so we cap the long edge
// generously to keep them crisp when enlarged in the coverflow centre.
//
// Usage: node scripts/normalize-certificates.mjs
import { readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'public', 'puro', 'certificates');

async function main() {
  await mkdir(DIR, { recursive: true });
  const entries = await readdir(DIR);
  const pngs = entries
    .filter((f) => /^\d\d_.*\.png$/i.test(f))
    .sort(); // 01_..10_ already sort lexicographically

  if (pngs.length === 0) {
    console.log('No numbered certificate PNGs found. Nothing to do.');
    return;
  }

  let i = 0;
  for (const f of pngs) {
    i += 1;
    const out = `cert-${String(i).padStart(2, '0')}.webp`;
    await sharp(join(DIR, f))
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(DIR, out));
    console.log(`${f}  ->  ${out}`);
  }
  console.log(`\nOptimized ${i} certificates into ${DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
