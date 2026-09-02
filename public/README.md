# public/

- **`resume.pdf`** — the résumé every "Resume" button links to. Replace the file
  to update it; the path never changes.
- **`headshot_full.png`** — the hero portrait.
- **`sprite/`** — the walking character's frames. **Not yet added.**

## Adding the character

The site scrolls sideways and a character walks along the bottom of the screen
in whichever direction the visitor is travelling. It needs seven frames, saved
as PNGs with transparent backgrounds, in **`public/sprite/`**:

| File | The frame |
| --- | --- |
| `face-forward.png` | standing, facing the viewer — shown when the page is still |
| `face-right.png` | standing, in profile facing right |
| `face-left.png` | standing, in profile facing left |
| `right-right.png` | walking right, right leg forward |
| `right-left.png` | walking right, left leg forward |
| `left-right.png` | walking left, right leg forward |
| `left-left.png` | walking left, left leg forward |

The cycles are stride, pass, opposite stride, pass:

- travelling right — `right-right` → `face-right` → `right-left` → `face-right`
- travelling left — `left-right` → `face-left` → `left-left` → `face-left`

Names are matched exactly, in `src/lib/sprite.ts`. Frames that are missing are
simply absent: a left-facing frame with no file is mirrored from its
right-facing twin, and with no files at all the character does not render and
makes no failed requests. So the four right-facing frames plus `face-forward`
are enough if you would rather not draw the left ones.

**Trim the transparent margin** before saving. All seven should be the same
canvas size with the feet on the bottom edge, otherwise the character changes
size and hops as the cycle plays.
