# Character sprites

The seven frames of the character who walks along the bottom of the site.
Drop them in this folder as PNGs with transparent backgrounds, named exactly
as below — the names are matched literally in `src/lib/sprite.ts`.

| File | The frame |
| --- | --- |
| `face-forward.png` | standing, facing the viewer |
| `face-right.png` | standing, in profile facing right |
| `face-left.png` | standing, in profile facing left |
| `right-right.png` | walking right, right leg forward |
| `right-left.png` | walking right, left leg forward |
| `left-right.png` | walking left, right leg forward |
| `left-left.png` | walking left, left leg forward |

## How they are used

`face-forward` shows whenever the page is still. Travelling plays a four-frame
cycle — stride, pass, opposite stride, pass — where the standing profile is the
passing position:

- **right** — `right-right` → `face-right` → `right-left` → `face-right`
- **left** — `left-right` → `face-left` → `left-left` → `face-left`

The cycle restarts on each change of direction, so a walk always begins on its
first frame.

## Missing frames are fine

A frame with no file is skipped rather than requested: a left-facing frame
falls back to its right-facing twin, mirrored, so the four right-facing frames
plus `face-forward` are enough if you would rather not draw the left ones. With
no files at all the character simply does not appear, and the page makes no
failed requests for it.

## These frames have been normalised

The files here are not the raw exports. The originals arrived at three
different canvas sizes, with the character drawn at scales that differed by a
third, on opaque white backgrounds — which would have made him change size and
hop as the cycle played.

`scripts/normalize-sprites.mjs` produced what is here: it cuts the background
by flooding white inward from the edges (so the white shirt and shoes survive,
being enclosed by outlines), crops to the figure, scales each frame so the
character is one height throughout, and lays them all on an identical
350 × 630 canvas with the feet on the bottom edge.

To replace a frame, drop the new art in with the same name and run:

```bash
npm i --no-save sharp
node scripts/normalize-sprites.mjs          # --analyze to measure only
```

It is safe to run repeatedly — already-normalised frames come out unchanged.
