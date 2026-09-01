# Christian Artigas — Portfolio

A personal portfolio site built with Next.js, TypeScript, Tailwind CSS, and Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Before you deploy

| What | Where | Status |
| --- | --- | --- |
| Résumé PDF | `public/resume.pdf` | **Done.** Replace the file to update it; the path never changes. |
| Headshot | `public/headshot_full.png` | **Done.** The name comes from `site.portraitName`; the build tries `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` in turn. Without a match the hero renders a monogram plate and makes no failed request. |
| Real domain | `site.url` in `src/content/site.ts` | **To set.** Used for canonical URLs, the sitemap, and Open Graph tags. |

## How the content is organised

Nothing a visitor reads is hard-coded in a component. Everything lives in
`src/content` as typed data, validated against the interfaces in
`src/types/content.ts`.

| File | Holds |
| --- | --- |
| `site.ts` | Name, contact details, socials, nav items, résumé path |
| `layers.ts` | The five stack layers — the site's organising metaphor |
| `projects.ts` | Work entries, including which visual treatment each uses |
| `skills.ts` | Skill groups, each tied to a layer |
| `experience.ts` | Roles, education, certifications |
| `journey.ts` | Timeline stages |
| `principles.ts` | The "How I think" entries |

### Adding a project

Append an entry to `projects` in `src/content/projects.ts`. Set `visual` to one
of the existing `ProjectVisual` values to reuse a treatment. To give it a new
one, add a value to the `ProjectVisual` union in `src/types/content.ts`, write
the component in `src/components/visuals/`, and add a case to
`src/components/projects/project-visual.tsx`. Nothing else changes.

`challenge`, `outcome`, and `learned` are optional — a project with none of them
renders a compact card rather than an empty placeholder.

### Adding an experience, skill group, or timeline stage

Append to the relevant array. The section renders whatever is there, and the
counts in the section headers are derived, so they stay correct.

## Structure

```
src/
├── app/            layout, page, metadata, OG image, sitemap, robots
├── components/
│   ├── layout/     nav, mobile menu, scroll progress, footer
│   ├── sections/   one component per page section
│   ├── projects/   project card, layer meter, visual switch
│   ├── visuals/    the interactive pieces (topology, RBAC shell, board,
│   │               schedule, Bode plot, ML lab, stack diagram)
│   └── ui/         button, primitives, reveal, portrait
├── content/        all site copy and data
├── hooks/          active section, media query, pointer field
├── lib/            utils, filter maths, machine-learning implementation
└── types/          the content model
```

## The interactive pieces are real

Three of them compute rather than illustrate:

- **Bode plot** (`lib/signal.ts`) — magnitude and phase evaluated from the
  actual transfer functions; the R value in the readout is solved from
  `fc = 1 / (2πRC)`.
- **ML lab** (`lib/ml.ts`) — logistic regression trained by batch gradient
  descent in the browser, with the confusion matrix and precision/recall/F1
  recomputed from the current model each step. Clustering runs Lloyd's
  algorithm one iteration per press.
- **MSP430 panel** — the potentiometer drives a real duty-cycle calculation and
  the displayed echo time uses the HC-SR04 relationship.

## Themes

Light and dark, following the operating system by default. The toggle in the
header cycles **system → light → dark**, so a visitor can always get back to
"whatever my computer does" — a two-state switch cannot.

Both modes are described once. Every colour is a role token defined with
`light-dark()` in `globals.css`, so there is no second stylesheet to drift:

```css
--signal: #ff7a2f;                      /* fallback for older browsers */
--signal: light-dark(#b23c10, #ff7a2f); /* light, dark */
```

The accent is the same hue in both modes but not the same colour — `#ff7a2f`
carries 7.7:1 on near-black and only 2.3:1 on paper, so light mode uses a
deeper burnt orange. Every text colour clears WCAG AA against both the page
ground and the highest surface, in both modes.

Setting `data-theme` on `<html>` pins `color-scheme`, which is what every
`light-dark()` token resolves against — one attribute repaints the whole
palette. An inline script in `<head>` applies a stored choice before first
paint, so there is no flash. The toggle holds no React state: which icon and
label show is decided in CSS from that same attribute, so the button renders
identically on the server and the client.

Switching wipes the new theme in diagonally from the top-right corner. That
is a View Transition: the animation is entirely in `globals.css`, so the
JavaScript only has to run the change inside `startViewTransition`.

The revealed region is the half-plane right of a 45° line, written as a quad
whose right edge sits far outside the viewport — four points at both ends is
what lets a `clip-path` interpolate. The outgoing snapshot is held visible by
an explicit keyframe rather than switched off with `animation: none`; with no
animation on it Chromium stops painting it, and the wipe reveals bare canvas
instead of the old theme.

Where View Transitions are unavailable, the palette cross-fades uniformly over
600 ms instead. That works because each token is registered with `@property`
as a typed `<color>`, which is what makes a custom property interpolable
rather than swappable, so one `transition` on `:root` carries the whole
palette — SVG fills and `color-mix()` results included. An operating-system
theme change fades that way too. Under `prefers-reduced-motion` neither runs
and the switch is immediate.

## Accessibility and motion

- Semantic landmarks, a skip link, and one consistent focus style.
- The skills section implements the WAI-ARIA tabs pattern, arrow keys included.
- The mobile menu uses Radix Dialog for focus trapping and scroll locking.
- Every animation checks `prefers-reduced-motion`, in CSS and in JS. Looping
  animations and the simulated sensor loop stop entirely rather than shortening.
- Contrast is verified rather than assumed: see the audit in the Themes
  section above.
- Off-screen work is paused with `IntersectionObserver`.
