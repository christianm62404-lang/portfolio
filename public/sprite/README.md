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

## Before you export

**Trim the transparent margin and use one canvas size for all seven, with the
feet on the bottom edge.** Frames of different sizes or with different amounts
of padding make the character change size and hop as the cycle plays. If that
is awkward to do by hand, upload them as they are and say so — they can be
normalised in the repo instead.
