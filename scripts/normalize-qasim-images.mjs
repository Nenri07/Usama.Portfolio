// One-off Qasim events image normalizer (dev tooling, NOT an app runtime dep).
//
// The source folders in public/qasim-khalid-projects/ embed PRIVATE FINANCIAL
// data (revenue / cost / net_profit) in their image FILENAMES and in
// MANIFEST.csv. Those originals must NEVER be served or committed. This script
// reads each project folder, optimizes its images to clean WebP files at a
// financial-free path — public/qasim/<NN>-<slug>/<NN>.webp (and -02, -03, …) —
// so the app references only the sanitized copies.
//
// Guarantees:
//   • Output paths contain NO financial tokens (no "QAR", "rev-", "cost-",
//     "profit-"), no spaces, no source metadata — just <NN>-<slug>/<NN>.webp.
//   • Deterministic ordering: source files are sorted by their slideNN + trailing
//     index, so re-running yields the same clean names.
//   • The originals on disk are left untouched (they are git-ignored instead).
//
// Usage: node scripts/normalize-qasim-images.mjs
import { readdir, mkdir, rm, readFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:process';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = join(__dirname, '..', 'public', 'qasim-khalid-projects');
const OUT_ROOT = join(__dirname, '..', 'public', 'qasim');

// Several source paths exceed the Windows 260-char MAX_PATH limit (the deck
// filenames are very long). The extended-length `\\?\` prefix on an absolute
// path lets libvips/sharp open them. No-op on non-Windows platforms.
function longPath(p) {
  if (platform !== 'win32') return p;
  const abs = resolve(p);
  return abs.startsWith('\\\\?\\') ? abs : `\\\\?\\${abs}`;
}

// Canonical financial-free slug for each project number. These match the
// `slug` values used in lib/data.ts (QasimProject) so the app resolves the
// right folder for every event. Numbers 01–16, ordered as in the source deck.
const SLUGS = {
  1: 'formula-1-motogp-fan-zone',
  2: 'hello-asia',
  3: 'flower-festival',
  4: 'eid-festival',
  5: 'darb-al-lusail-parade',
  6: 'eid-ul-adha-festival',
  7: 'aljama-celebration-week-2023',
  8: 'qatar-custom-show-2023',
  9: 'building-block-city',
  10: 'aljama-celebration-week-2022',
  11: 'fifa-fan-zone-lagoona',
  12: 'fifa-fan-zone-festival-city',
  13: 'fifa-balloons-distribution',
  14: 'eid-in-qatar',
  15: 'qatar-custom-show-2022',
  16: 'qatar-international-food-festival',
};

// Parse the leading project number from a source folder name (e.g. "07_...").
function folderNumber(name) {
  const m = name.match(/^(\d{2})_/);
  return m ? Number(m[1]) : null;
}

// Deterministic sort key from a source image filename. Files look like
// "…__slide07_02.jpeg" — sort by slide number, then the trailing variant.
function imageSortKey(name) {
  const m = name.match(/slide(\d+)_(\d+)\.jpe?g$/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return Number(m[1]) * 1000 + Number(m[2]);
}

async function main() {
  let srcFolders;
  try {
    srcFolders = await readdir(SRC_ROOT, { withFileTypes: true });
  } catch {
    console.log(`Source folder not found: ${SRC_ROOT}. Nothing to do.`);
    return;
  }

  // Start clean so removed/renamed sources never leave stale output behind.
  await rm(OUT_ROOT, { recursive: true, force: true });
  await mkdir(OUT_ROOT, { recursive: true });

  const projectDirs = srcFolders
    .filter((d) => d.isDirectory())
    .map((d) => ({ name: d.name, no: folderNumber(d.name) }))
    .filter((d) => d.no != null && SLUGS[d.no])
    .sort((a, b) => a.no - b.no);

  if (projectDirs.length === 0) {
    console.log('No numbered project folders found. Nothing to do.');
    return;
  }

  const summary = [];
  for (const { name, no } of projectDirs) {
    const slug = SLUGS[no];
    const nn = String(no).padStart(2, '0');
    const srcDir = join(SRC_ROOT, name);
    const outDir = join(OUT_ROOT, `${nn}-${slug}`);
    await mkdir(outDir, { recursive: true });

    const files = (await readdir(longPath(srcDir)))
      .filter((f) => /\.jpe?g$/i.test(f))
      .sort((a, b) => imageSortKey(a) - imageSortKey(b));

    let count = 0;
    for (const f of files) {
      count += 1;
      const outName = `${nn}-${String(count).padStart(2, '0')}.webp`;
      // Read via a buffer using the extended-length path so very long source
      // filenames (>260 chars on Windows) still open; output paths are short.
      const input = await readFile(longPath(join(srcDir, f)));
      await sharp(input)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 72 })
        .toFile(join(outDir, outName));
    }

    summary.push({ no, slug, count });
    console.log(`${nn}-${slug}: ${count} image(s)`);
  }

  const total = summary.reduce((sum, s) => sum + s.count, 0);
  console.log(`\nNormalized ${total} image(s) across ${summary.length} projects into ${OUT_ROOT}`);
  console.log('COUNTS=' + summary.map((s) => `${String(s.no).padStart(2, '0')}:${s.count}`).join(','));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
