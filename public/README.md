# public/

- **`resume.pdf`** — the résumé every "Resume" button links to. Replace the file
  to update it; the path never changes.
- **`headshot_full.png`** — the hero portrait.

## Replacing the headshot

`site.portraitName` in `src/content/site.ts` holds the basename; `findPortrait()`
in `src/lib/portrait.ts` tries `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif` in
that order. Drop a file with the same basename and it is picked up on the next
build — or change the basename there to match a new filename.

The frame is square. The image is rendered slightly taller than the frame and
anchored to the top, which crops the soft band along the bottom edge of the
current photo; if you swap in a clean image, that offset lives in
`src/components/ui/portrait.tsx`.

With no matching file the hero renders a monogram plate and makes no failed
request for the missing image.
