/**
 * Normalises the character sprite frames.
 *
 * The source art is generated per-frame, so the images arrive at different
 * canvas sizes, with the figure at different scales, and on an opaque white
 * background. Animating them as-is makes the character change size and hop.
 * This script makes one coherent sprite set out of them:
 *
 *   1. Cuts the background out by flood-filling white inward from the edges,
 *      which keeps the character's own whites — the shirt and the shoes are
 *      enclosed by outlines, so the fill cannot reach them.
 *   2. Peels two pixels off the silhouette, unconditionally, to take the white
 *      sticker outline with them.
 *   3. Crops each frame to what is actually drawn.
 *   4. Scales each frame so the character is the same height throughout. The
 *      source frames are drawn at scales that differ by a third, so this is
 *      the step that stops him growing and shrinking as he walks.
 *   5. Lays each onto an identical canvas, centred, with the feet on the
 *      bottom edge, so the ground line never moves.
 *   6. Writes palette PNGs, which pixel art quantises to a fraction of the
 *      original weight.
 *
 * Requires sharp, which is not a dependency of the site:
 *   npm i --no-save sharp && node scripts/normalize-sprites.mjs
 *
 * Pass --analyze to measure without writing anything, and --from <dir> to read
 * the raw art from somewhere other than the output folder.
 */
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUTPUT = "public/sprite";
const fromFlag = process.argv.indexOf("--from");
const SOURCE = fromFlag === -1 ? OUTPUT : process.argv[fromFlag + 1];
const TARGET_HEIGHT = 620; // standing height in the output canvas
const CANVAS_PADDING = 10; // breathing room so scaling never clips an outline

/**
 * Mid-stride frames are drawn a touch shorter than the standing ones, because
 * a walking body is: it is lowest with the legs apart and tallest at the
 * passing position. Normalising every frame to exactly the same height would
 * iron that out and leave the walk looking like a slide.
 */
const STRIDE_SCALE = 0.965;
const isStride = (name) => !name.startsWith("face");

/** Source file (however it is named) → the name the site expects. */
const RENAMES = {
  "face forward": "face-forward",
  "face left": "face-left",
  "face right": "face-right",
  "left left": "left-left",
  "left right": "left-right",
  "right left": "right-left",
  "right right": "right-right",
};

/**
 * A pixel counts as background if it is already transparent, or if it is light
 * and close to neutral.
 *
 * The transparency case matters: without it, running this over its own output
 * would treat the cleared canvas as part of the figure and rescale the padding
 * along with the character.
 */
const isBackground = (r, g, b, a) =>
  a < 16 || (Math.min(r, g, b) >= 228 && Math.max(r, g, b) - Math.min(r, g, b) <= 14);

/**
 * Clears the background by flooding inward from the border.
 *
 * A plain "make every white pixel transparent" pass would punch holes through
 * the shirt and the shoes. Only white that is reachable from outside the
 * figure is background.
 */
function cutBackground(data, width, height) {
  const total = width * height;
  const outside = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const consider = (index) => {
    if (outside[index]) return;
    const o = index * 4;
    if (!isBackground(data[o], data[o + 1], data[o + 2], data[o + 3])) return;
    outside[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    consider(x);
    consider((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    consider(y * width);
    consider(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = (index / width) | 0;
    if (x > 0) consider(index - 1);
    if (x < width - 1) consider(index + 1);
    if (y > 0) consider(index - width);
    if (y < height - 1) consider(index + width);
  }

  // Alpha is binary here. Ramping it by how light a pixel is — the obvious
  // thing — is what left a grey rim: it kept the anti-aliased matte at nearly
  // full opacity wherever the blend happened to fall below the threshold.
  // erodeEdge removes that ring outright instead.
  for (let index = 0; index < total; index += 1) {
    data[index * 4 + 3] = outside[index] ? 0 : 255;
  }
}

/**
 * Peels rings of pixels off the silhouette.
 *
 * The art traces a thin white line around the figure, which over a dark page
 * reads as a halo. Measured in the source, that line is one pixel deep: the
 * outermost ring averages a mid grey where the white has been anti-aliased
 * against the ink, and the ring behind it is already the ink itself.
 *
 * Earlier this was done by colour — remove edge pixels that look white — and
 * it left remnants, because half that ring blends down to a grey too dark for
 * any threshold that does not also eat the character's white shoes. Peeling a
 * fixed depth cannot leave remnants. It costs one extra pixel of ink, which at
 * the size these are drawn is a fifth of a screen pixel.
 */
function erodeEdge(data, width, height, rings = 2) {
  const alphaAt = (x, y) =>
    x < 0 || y < 0 || x >= width || y >= height ? 0 : data[(y * width + x) * 4 + 3];

  for (let ring = 0; ring < rings; ring += 1) {
    const doomed = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const o = (y * width + x) * 4;
        if (data[o + 3] < 32) continue;
        if (
          alphaAt(x - 1, y) < 32 ||
          alphaAt(x + 1, y) < 32 ||
          alphaAt(x, y - 1) < 32 ||
          alphaAt(x, y + 1) < 32
        ) {
          doomed.push(o);
        }
      }
    }
    if (doomed.length === 0) break;
    for (const o of doomed) data[o + 3] = 0;
  }
}

/** Tight box around everything still opaque. */
function boundingBox(data, width, height) {
  let top = height;
  let bottom = -1;
  let left = width;
  let right = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 24) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function measure(file) {
  const source = path.join(SOURCE, file);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  cutBackground(data, info.width, info.height);
  erodeEdge(data, info.width, info.height);
  const box = boundingBox(data, info.width, info.height);
  return { file, data, info, box };
}

const analyzeOnly = process.argv.includes("--analyze");

const files = (await readdir(SOURCE)).filter((name) => name.toLowerCase().endsWith(".png"));
const measured = [];
for (const file of files) measured.push(await measure(file));

console.log("frame                 source        drawn box        aspect");
for (const m of measured) {
  console.log(
    `${m.file.padEnd(20)} ${String(m.info.width).padStart(4)}x${String(m.info.height).padEnd(5)} ` +
      `${String(m.box.width).padStart(4)}x${String(m.box.height).padEnd(5)}  ` +
      `${(m.box.width / m.box.height).toFixed(3)}`,
  );
}

if (analyzeOnly) process.exit(0);

// Each frame gets its own scale, because the source art is drawn at sizes
// that differ by a third. What is held constant is the character, not the file.
for (const m of measured) {
  const wanted = TARGET_HEIGHT * (isStride(path.basename(m.file, ".png")) ? STRIDE_SCALE : 1);
  m.scale = wanted / m.box.height;
  m.drawnHeight = Math.round(wanted);
  m.drawnWidth = Math.max(1, Math.round(m.box.width * m.scale));
}

// Padding sits above the figure only: the feet land on the bottom edge of the
// canvas, so every frame plants them on the same line and the shorter
// mid-stride frames simply carry more empty space over the head.
const canvasHeight = TARGET_HEIGHT + CANVAS_PADDING;
const canvasWidth = Math.max(...measured.map((m) => m.drawnWidth)) + CANVAS_PADDING * 2;

console.log(`\ncanvas ${canvasWidth} x ${canvasHeight}\n`);

await mkdir(OUTPUT, { recursive: true });

for (const m of measured) {
  const base = path.basename(m.file, ".png");
  const outName = `${RENAMES[base] ?? base.replace(/\s+/g, "-")}.png`;

  const { drawnWidth, drawnHeight } = m;

  const figure = await sharp(m.data, {
    raw: { width: m.info.width, height: m.info.height, channels: 4 },
  })
    .extract(m.box)
    .resize(drawnWidth, drawnHeight, { kernel: "nearest" })
    .png()
    .toBuffer();

  const out = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: figure,
        // Centred, feet on the bottom edge, so the ground line never moves.
        left: Math.round((canvasWidth - drawnWidth) / 2),
        top: canvasHeight - drawnHeight,
      },
    ])
    .png({ palette: true, quality: 92, effort: 10 })
    .toBuffer();

  await writeFile(path.join(OUTPUT, outName), out);
  console.log(
    `${outName.padEnd(20)} ${String(drawnWidth).padStart(3)}x${drawnHeight}  scale ${m.scale.toFixed(3)}  ${(out.length / 1024).toFixed(0)} KB`,
  );
}

// A contact sheet, so the set can be eyeballed as a set rather than one file
// at a time. Not part of the site — written outside public/.
const sheetTargets = Object.values(RENAMES);
const sheet = await sharp({
  create: {
    width: canvasWidth * sheetTargets.length,
    height: canvasHeight,
    channels: 4,
    background: { r: 24, g: 24, b: 27, alpha: 255 },
  },
})
  .composite(
    sheetTargets.map((name, index) => ({
      input: path.join(OUTPUT, `${name}.png`),
      left: index * canvasWidth,
      top: 0,
    })),
  )
  .png()
  .toBuffer();
await writeFile("sprite-sheet.png", sheet);
console.log("\ncontact sheet -> sprite-sheet.png");
