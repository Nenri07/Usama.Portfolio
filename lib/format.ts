/**
 * Pure formatting helpers for Qasim Events.
 *
 * Every function here is pure: it has no side effects and its output depends
 * solely on its inputs. This keeps them trivially unit- and property-testable
 * (see lib/format design "Shared Utilities" and Correctness Properties 1-9).
 */

/**
 * Zero-pad a number to a 3-digit string.
 * @example zeroPad3(0)  // '000'
 * @example zeroPad3(12) // '012'
 */
export function zeroPad3(n: number): string {
  return String(n).padStart(3, "0");
}

/**
 * Build the public path for the work image at a given zero-based index.
 * @example imagePathForIndex(0)  // '/work/img-000.png'
 * @example imagePathForIndex(12) // '/work/img-012.png'
 */
export function imagePathForIndex(i: number): string {
  return `/work/img-${zeroPad3(i)}.png`;
}

/**
 * Resolve the image path for a project: prefer an explicit `image` override,
 * otherwise fall back to the sequential path for its definition index (Req 4.2).
 * @example resolveImagePath({ image: '/work/custom.png' }, 3) // '/work/custom.png'
 * @example resolveImagePath({}, 3)                            // '/work/img-003.png'
 */
export function resolveImagePath(project: { image?: string }, i: number): string {
  return project.image ?? imagePathForIndex(i);
}

/**
 * Duplicate a wordmark list into a seamless marquee track.
 * The first and second halves are identical, so a translateX 0 -> -50%
 * loop has no visible seam.
 * @example buildMarqueeTrack(['a', 'b']) // ['a', 'b', 'a', 'b']
 */
export function buildMarqueeTrack<T>(ws: readonly T[]): T[] {
  return [...ws, ...ws];
}

/**
 * Per-item stagger delay, proportional to the item index.
 * @param i zero-based index
 * @param base base delay in ms (expected range [80, 150])
 * @example staggerDelay(0, 100) // 0
 * @example staggerDelay(3, 100) // 300
 */
export function staggerDelay(i: number, base: number): number {
  return base * i;
}

/**
 * Count-up display value for a given progress.
 *
 * Clamps progress to [0, 1], then maps to the interval [0, target] and rounds
 * toward the target. Guarantees:
 *   - countValue(target, 0) === 0
 *   - countValue(target, 1) === target (exact, even for floats like 3.75)
 *   - monotonic non-decreasing in p
 *   - result stays within [0, target]
 *
 * Integer targets round to whole numbers (so the counter shows integers).
 * Non-integer targets preserve their decimals so the exact target is reached
 * at p === 1 without over-rounding (e.g. target 3.75).
 */
export function countValue(target: number, p: number): number {
  const clampedP = p < 0 ? 0 : p > 1 ? 1 : p;
  // Exact endpoints, independent of any rounding.
  if (clampedP === 0) return 0;
  if (clampedP === 1) return target;

  const raw = target * clampedP;

  if (Number.isInteger(target)) {
    return Math.round(raw);
  }

  // For non-integer targets, round to the same number of decimals as the
  // target so intermediate values are readable but never exceed the target.
  const decimals = decimalPlaces(target);
  const factor = 10 ** decimals;
  const rounded = Math.round(raw * factor) / factor;
  // Guard against floating-point overshoot beyond the target.
  return rounded > target ? target : rounded;
}

/**
 * Count the number of decimal places in a finite number.
 */
function decimalPlaces(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const dot = s.indexOf(".");
  if (dot === -1) return 0;
  // Handle exponential notation defensively.
  const exp = s.indexOf("e");
  if (exp !== -1) return 0;
  return s.length - dot - 1;
}

/**
 * Split a headline into words, with surrounding and collapsed internal
 * whitespace normalized. Produces no empty entries.
 * @example splitWords('  hello   world ') // ['hello', 'world']
 */
export function splitWords(s: string): string[] {
  const trimmed = s.trim();
  if (trimmed.length === 0) return [];
  return trimmed.split(/\s+/);
}

/**
 * Build a mailto: link for an email address.
 * @example buildMailto('hi@example.com') // 'mailto:hi@example.com'
 */
export function buildMailto(email: string): string {
  return `mailto:${email}`;
}

/**
 * Build a wa.me WhatsApp link from a phone string, stripping all non-digits.
 * @example buildWaLink('+974 1234 5678') // 'https://wa.me/97412345678'
 */
export function buildWaLink(phone: string): string {
  return `https://wa.me/${digitsOnly(phone)}`;
}

/**
 * Remove every non-digit character from a string.
 * @example digitsOnly('+974 (12) 34') // '9741234'
 */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Whether a contact value should be treated as disabled (empty/whitespace).
 * @example isContactDisabled('   ') // true
 * @example isContactDisabled('hi')  // false
 */
export function isContactDisabled(v: string): boolean {
  return v.trim().length === 0;
}
