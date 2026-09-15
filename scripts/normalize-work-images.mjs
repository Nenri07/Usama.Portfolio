// One-off image normalizer (dev tooling, NOT an app runtime dependency).
// Converts the space/paren WhatsApp work photos into clean, optimized WebP
// files named work-01.webp … work-NN.webp under public/puro/work/.
//
// Ordering is deterministic: sorted by the numeric timestamp + variant parsed
// from each WhatsApp filename, so re-running yields the same mapping.
//
// Usage: node scripts/normalize-work-images.mjs
import { readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = join(__dirname, '..', 'public', 'puro', 'work');

// Parse "WhatsApp Image 2026-09-15 at 3.00.37 PM (2).jpeg" into a sort key.
function parseKey(name) {
  const m = name.match(/at\s+(\d+)\.(\d+)\.(\d+)\s*PM(?:\s*\((\d+)\))?/i);
  if (!m) return null;
  const [, h, min, sec, variant] = m;
  return (
    Number(h) * 1_000_000 +
    Number(min) * 10_000 +
    Number(sec) * 100 +
    Number(variant ?? '0')
  );
}

async function main() {
  await mkdir(WORK_DIR, { recursive: true });
  const entries = await readdir(WORK_DIR);
  const whatsapp = entries
    .filter((f) => /^WhatsApp Image .*\.jpe?g$/i.test(f))
    .map((f) => ({ f, key: parseKey(f) }))
    .filter((x) => x.key != null)
    .sort((a, b) => a.key - b.key);

  if (whatsapp.length === 0) {
    console.log('No WhatsApp-named work photos found. Nothing to do.');
    return;
  }

  let i = 0;
  const manifest = [];
  for (const { f } of whatsapp) {
    i += 1;
    const out = `work-${String(i).padStart(2, '0')}.webp`;
    const src = join(WORK_DIR, f);
    const dest = join(WORK_DIR, out);
    // Gallery images (not hero LCP): cap the long edge and use a sane quality.
    await sharp(src)
      .rotate() // respect EXIF orientation
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(dest);
    manifest.push(out);
    console.log(`${f}  ->  ${out}`);
  }

  console.log(`\nNormalized ${manifest.length} photos into ${WORK_DIR}`);
  console.log('COUNT=' + manifest.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
