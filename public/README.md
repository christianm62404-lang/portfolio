# public/

- **`resume.pdf`** — the résumé every "Resume" button links to. Replace this file
  to update it; the path never changes.
- **`portrait.jpg`** — the headshot. It is the hero image, so this is the most
  visible thing still missing. *Not yet added.*

## Adding the headshot

Save the photo into this folder as `portrait.jpg`, then rebuild. Any of
`.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` works — `findPortrait()` in
`src/lib/portrait.ts` looks for each in turn and uses whichever
it finds.

Until the file exists, the hero renders a monogram plate instead, and makes no
failed request for the missing image. The frame is **square**, so a square or
head-and-shoulders crop fits without clipping; it is displayed at up to about
416 px, so anything from 800 px wide up is plenty.
