import { site } from "@/content/site";
import { education } from "@/content/experience";
import { MonoLabel, Panel, SectionHeading } from "@/components/ui/primitives";
import { StackDiagram } from "@/components/visuals/stack-diagram";
import { Reveal } from "@/components/ui/reveal";

const facts = [
  { label: "Studying", value: "B.S. Computer Engineering, UCF" },
  { label: "Graduating", value: "May 2027" },
  { label: "Based in", value: site.location },
  { label: "Currently", value: "Developer intern at Intrastack Solutions" },
];

export function About() {
  return (
    <Panel id="about">
      <SectionHeading
        index="01"
        eyebrow="About"
        title="Two halves of the same question"
        lede="I started by taking things apart to find out why they worked. I have not really stopped — the things just got bigger."
      />

      <Reveal className="col col-lg space-y-5 text-[0.9375rem] leading-[1.7] text-ink-dim">
        <p>
          I&apos;m a computer engineering student at UCF. The degree puts analog
          electronics and operating systems in the same semester, and after a
          while you stop treating them as separate subjects.
        </p>
        <p>
          Electronics came first — biasing transistors, sketching Bode plots,
          arguing with LTspice about why the breadboard disagreed with the
          screen. Then programming, then embedded systems, where the two finally
          met. There is a bug you only get on a microcontroller, where the code
          is right and the timing is wrong; learning to find those changed how I
          debug everything else.
        </p>
        <p>
          Now most of my week goes into software, as a developer intern at{" "}
          <span className="text-ink">Intrastack Solutions</span> — leading the
          front-end track on an AI proposal platform and working on the CRM side
          of a multi-service point-of-sale system. I like building things that
          work end to end, and knowing what happens one layer below wherever I
          am. Different vocabulary, same curiosity.
        </p>
      </Reveal>

      {/* Wider than a reading column: the diagram expands one layer at a time,
          and at narrower widths that detail wrapped into a taller block than the
          prose beside it. */}
      <Reveal delay={0.08} className="col col-md">
        <div className="border border-line bg-panel p-4">
          <StackDiagram />
        </div>
      </Reveal>

      <Reveal delay={0.14} className="col col-xs space-y-8">
        <dl className="divide-y divide-line border-y border-line">
          {facts.map((fact) => (
            <div key={fact.label} className="py-3">
              <dt>
                <MonoLabel>{fact.label}</MonoLabel>
              </dt>
              <dd className="mt-1.5 text-sm text-ink">{fact.value}</dd>
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
                  <span className="font-mono text-xs text-ink-faint">
                    {entry.period}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </Reveal>
    </Panel>
  );
}
