# public/

- **`resume.pdf`** — the résumé every "Resume" button links to. Replace this file
  to update it; the path never changes.
- **`portrait.jpg`** — the headshot for the About section. *Not yet added.*

## Adding the headshot

Save the photo into this folder as `portrait.jpg`, then rebuild. Any of
`.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` works — `findPortrait()` in
`src/components/sections/about.tsx` looks for each in turn and uses whichever
it finds.

Until the file exists, the About section renders a monogram plate instead, and
makes no failed request for the missing image. A roughly 4:5 portrait crop
fits the frame best; it is displayed at about 350×440 px, so anything from
700 px wide up is plenty.
