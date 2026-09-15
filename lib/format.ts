/**
 * Pure formatting helpers for Puro Cleaning Services W.L.L.
 *
 * Every function here is pure: it has no side effects and its output depends
 * solely on its inputs. This keeps them trivially unit- and property-testable
 * (see lib/format design "Shared Utilities" and Correctness Properties 1-9).
 */

/**
 * Resolve the explicitly curated primary image for a source-backed work item.
 * The optional index is retained for existing card call sites; there is no
 * sequential legacy work-image fallback.
 */
export function resolveImagePath(
  project: { image: string },
  _index?: number,
): string {
  void _index;
  return project.image;
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

/**
 * Clamp `v` into the inclusive range `[lo, hi]`.
 *
 * Assumes `lo <= hi`, but is defensive: if the bounds are passed reversed
 * (`lo > hi`) they are normalized so the result is always within
 * `[min(lo,hi), max(lo,hi)]`. When `v` is already inside the range it is
 * returned unchanged (Correctness Property 13).
 * @example clamp(5, 0, 10)  // 5
 * @example clamp(-3, 0, 10) // 0
 * @example clamp(99, 0, 10) // 10
 */
export function clamp(v: number, lo: number, hi: number): number {
  const min = lo <= hi ? lo : hi;
  const max = lo <= hi ? hi : lo;
  return Math.min(max, Math.max(min, v));
}

/**
 * Linear interpolation from `a` to `b` by a clamped factor `t`.
 *
 * `t` is clamped to `[0, 1]` so the result never overshoots: `lerp(a,b,0) === a`,
 * `lerp(a,b,1) === b`, and every result lies within `[min(a,b), max(a,b)]`
 * (Correctness Property 12). Used for the smoothed pointer-follow easing.
 * @example lerp(0, 10, 0.5) // 5
 * @example lerp(0, 10, 2)   // 10 (t clamped)
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Upper bound (in normalized units) for {@link pointerVelocity}. Keeps the
 * displacement strength bounded so the WebGL warp never spikes on a huge
 * single-frame jump.
 */
export const POINTER_VELOCITY_MAX = 5;

/**
 * Magnitude of the pointer velocity between two positions over a time delta,
 * clamped to `[0, max]` (Req 10.4, Correctness Property 13).
 *
 * Computes `|(cur - prev) / dt|` and clamps it to a bounded, non-negative
 * range so it can safely scale the displacement/RGB-shift effect. Returns `0`
 * when `dt <= 0` (no meaningful elapsed time). Coordinates are expected in
 * normalized units (e.g. viewport fractions) so the default `max` of
 * {@link POINTER_VELOCITY_MAX} is sensible; pass a different `max` for other
 * unit spaces.
 * @example pointerVelocity({x:0,y:0}, {x:3,y:4}, 1) // 5 (== hypot(3,4))
 * @example pointerVelocity({x:0,y:0}, {x:1,y:0}, 0) // 0 (dt <= 0)
 */
export function pointerVelocity(
  prev: { x: number; y: number },
  cur: { x: number; y: number },
  dt: number,
  max: number = POINTER_VELOCITY_MAX,
): number {
  if (dt <= 0) return 0;
  const vx = (cur.x - prev.x) / dt;
  const vy = (cur.y - prev.y) / dt;
  const magnitude = Math.hypot(vx, vy);
  return clamp(magnitude, 0, max);
}
