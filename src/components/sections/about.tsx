import fs from "node:fs";
import path from "node:path";
import { site } from "@/content/site";
import { education } from "@/content/experience";
import { MonoLabel, Section, SectionHeading } from "@/components/ui/primitives";
import { Portrait } from "@/components/ui/portrait";
import { Reveal } from "@/components/ui/reveal";

const facts = [
  { label: "Studying", value: "B.S. Computer Engineering, UCF" },
  { label: "Graduating", value: "May 2027" },
  { label: "Based in", value: site.location },
  { label: "Currently", value: "Developer intern at Intrastack Solutions" },
];

/** Formats accepted for the headshot, in the order they are preferred. */
const PORTRAIT_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

/**
 * Finds the headshot, if it has been added.
 *
 * The photo is supplied by the site owner rather than committed by the build,
 * so its presence is resolved on the server instead of being discovered by the
 * browser as a failed request. Any of the usual formats works — whichever the
 * photo happens to be saved as is the one that gets used.
 *
 * Returns the public path, or null to render the monogram plate instead.
 */
function findPortrait(): string | null {
  for (const extension of PORTRAIT_EXTENSIONS) {
    const file = `${site.portraitName}.${extension}`;
    try {
      if (fs.existsSync(path.join(process.cwd(), "public", file))) return `/${file}`;
    } catch {
      // An unreadable public directory is not worth failing the build over.
      return null;
    }
  }
  return null;
}

export function About() {
  const portrait = findPortrait();

  return (
    <Section id="about" className="border-t border-line">
      <SectionHeading
        index="01"
        eyebrow="About"
        title="Two halves of the same question"
        lede="I started by taking things apart to find out why they worked. I have not really stopped — the things just got bigger."
      />

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <Reveal className="max-w-2xl space-y-6 text-base leading-[1.75] text-ink-dim sm:text-[1.0625rem]">
          <p>
            I&apos;m a computer engineering student at UCF. The degree is the reason my
            background looks the way it does: it puts analog electronics and operating
            systems in the same semester, and after a while you stop treating them as
            separate subjects.
          </p>
          <p>
            Electronics came first — biasing transistors, sketching Bode plots, and
            arguing with LTspice about why the circuit on my breadboard disagreed with
            the one on my screen. Then programming, then embedded systems, which is
            where the two finally met. There is a particular kind of bug you only get
            on a microcontroller, where the code is right and the timing is wrong, and
            learning to find those changed how I debug everything else.
          </p>
          <p>
            Now most of my week goes into software. I&apos;m a developer intern at{" "}
            <span className="text-ink">Intrastack Solutions</span>, where I lead the
            front-end track on an AI proposal platform and work on the CRM side of a
            multi-service point-of-sale system. Typed front ends, Postgres schemas,
            authentication that has to actually hold — plus code review, which has
            probably taught me more than any tutorial.
          </p>
          <p>
            I like building things that work end to end, and I like knowing what is
            happening one layer below wherever I&apos;m working. That is the whole
            through-line: circuits, firmware, applications, services, models. Different
            vocabulary, same curiosity.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="space-y-8">
          <Portrait src={portrait} />

          <dl className="divide-y divide-line border-y border-line">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 py-3.5">
                <dt>
                  <MonoLabel>{fact.label}</MonoLabel>
                </dt>
                <dd className="text-right text-sm text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <MonoLabel>Also studied at</MonoLabel>
            <ul className="mt-3 space-y-2">
              {education
                .filter((entry) => !entry.current)
                .map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-baseline justify-between gap-4 text-sm text-ink-dim"
                  >
                    <span>{entry.institution}</span>
                    <span className="font-mono text-xs text-ink-faint">{entry.period}</span>
                  </li>
                ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
