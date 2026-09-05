/**
 * Cuts the LED strip photograph down to a tile that repeats seamlessly.
 *
 * The source is a whole strip shot end to end: transparent background already,
 * but with a gold solder tab at each end and a lot of empty space above and
 * below. Repeating that as-is would march a row of connector tabs across the
 * page and leave the strip floating in a tall band of nothing.
 *
 * So: crop to the strip itself, stay well inside both tabs, and take a whole
 * number of the strip's own repeating period — found by autocorrelation over
 * the column luminance rather than guessed — which is what makes the seam
 * between one copy and the next invisible.
 *
 * Requires sharp, which is not a dependency of the site:
 *   npm i --no-save sharp && node scripts/make-led-tile.mjs
 */
import sharp from "sharp";

const SOURCE = "public/red led.png";
const OUTPUT = "public/led-tile.png";

/** Periods per tile. More than one, so the repeat is less obvious. */
const PERIODS = 3;
/** Search window for the period, in pixels. */
const MIN_LAG = 20;
const MAX_LAG = 400;

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const pixel = (x, y) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};

/* The strip, vertically: the band of the image that is not transparent. */
let top = height;
let bottom = -1;
let left = width;
let right = -1;
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (pixel(x, y)[3] <= 32) continue;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
    if (x < left) left = x;
    if (x > right) right = x;
  }
}

/* The solder tabs, horizontally: the only strongly yellow thing in the frame. */
const goldColumns = [];
for (let x = left; x <= right; x += 1) {
  let gold = 0;
  for (let y = top; y <= bottom; y += 1) {
    const [r, g, b, a] = pixel(x, y);
    if (a < 128) continue;
    if (r > 120 && g > 90 && b < 110 && r - b > 50 && g - b > 25) gold += 1;
  }
  if (gold > 10) goldColumns.push(x);
}
const middle = (left + right) / 2;
const tabEnd = goldColumns.filter((x) => x < middle).pop() ?? left;
const tabStart = goldColumns.find((x) => x > middle) ?? right;

// A margin past each tab, so no part of the taper is in the tile.
const from = tabEnd + 24;
const to = tabStart - 24;

/* The period, by autocorrelation of the column luminance. */
const profile = [];
for (let x = from; x <= to; x += 1) {
  let sum = 0;
  let count = 0;
  for (let y = top; y <= bottom; y += 1) {
    const [r, g, b, a] = pixel(x, y);
    if (a < 128) continue;
    sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    count += 1;
  }
  profile.push(count ? sum / count : 0);
}
const mean = profile.reduce((a, b) => a + b, 0) / profile.length;
const centred = profile.map((v) => v - mean);

let period = MIN_LAG;
let bestScore = -Infinity;
for (let lag = MIN_LAG; lag <= Math.min(MAX_LAG, centred.length - 1); lag += 1) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i + lag < centred.length; i += 1) {
    sum += centred[i] * centred[i + lag];
    count += 1;
  }
  const score = sum / count;
  if (score > bestScore) {
    bestScore = score;
    period = lag;
  }
}

/* Autocorrelation finds the period to the nearest pixel, but the real spacing
   is fractional, so a tile cut at exactly N x period drifts and the seam shows.
   Refine it by measuring the seam itself: over widths near N x period and a
   range of starting offsets, take the cut where the last column actually
   matches the first. */
const columnOf = (x) => {
  const out = [];
  for (let y = top; y <= bottom; y += 1) out.push(pixel(x, y));
  return out;
};
const columnDelta = (a, b) =>
  a.reduce(
    (total, p, i) =>
      total + Math.abs(p[0] - b[i][0]) + Math.abs(p[1] - b[i][1]) + Math.abs(p[2] - b[i][2]),
    0,
  ) /
  (a.length * 3);

const nominal = period * PERIODS;
let tileWidth = nominal;
let startX = from;
let bestSeam = Infinity;
for (let candidate = nominal - PERIODS * 3; candidate <= nominal + PERIODS * 3; candidate += 1) {
  for (let start = from; start + candidate <= to; start += 1) {
    const seamHere = columnDelta(columnOf(start + candidate - 1), columnOf(start));
    if (seamHere < bestSeam) {
      bestSeam = seamHere;
      tileWidth = candidate;
      startX = start;
    }
  }
}

console.log(`strip     y ${top}..${bottom} (${bottom - top + 1}px tall)`);
console.log(`tabs      end ${tabEnd}, start ${tabStart} — cutting from ${from} to ${to}`);
console.log(`period    ${period}px nominal; tile refined to ${tileWidth}px from x ${startX}`);

/* How well the tile actually meets itself: the seam is the last column against
   the first, and it should be no worse than two neighbouring columns inside. */
const seam = columnDelta(columnOf(startX + tileWidth - 1), columnOf(startX));
const inside = columnDelta(columnOf(startX + 40), columnOf(startX + 41));
console.log(`seam      ${seam.toFixed(1)} vs ${inside.toFixed(1)} for two adjacent columns inside the tile`);

await sharp(SOURCE)
  .extract({ left: startX, top, width: tileWidth, height: bottom - top + 1 })
  .png()
  .toFile(OUTPUT);
console.log(`wrote     ${OUTPUT}  ${tileWidth}x${bottom - top + 1}`);
