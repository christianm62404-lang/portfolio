# Christian Artigas — Portfolio

A personal portfolio site built with Next.js, TypeScript, Tailwind CSS, and Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Before you deploy — three things to add

| What | Where | Notes |
| --- | --- | --- |
| Résumé PDF | `public/resume.pdf` | The Resume buttons link here. The file is intentionally **not** in the repo — add your real one. |
| Headshot | `public/portrait.jpg` | Optional. Its presence is checked at build time; without it the About section renders a monogram plate instead, with no failed request. |
| Real domain | `site.url` in `src/content/site.ts` | Used for canonical URLs, the sitemap, and Open Graph tags. |

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

## Accessibility and motion

- Semantic landmarks, a skip link, and one consistent focus style.
- The skills section implements the WAI-ARIA tabs pattern, arrow keys included.
- The mobile menu uses Radix Dialog for focus trapping and scroll locking.
- Every animation checks `prefers-reduced-motion`, in CSS and in JS. Looping
  animations and the simulated sensor loop stop entirely rather than shortening.
- Off-screen work is paused with `IntersectionObserver`.
