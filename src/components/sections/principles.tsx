import { principles } from "@/content/principles";
import { MonoLabel, Section, SectionHeading } from "@/components/ui/primitives";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

/**
 * How I work, stated plainly. No card grid and no icons — a numbered list
 * with generous space reads as writing rather than as a feature comparison.
 */
export function Principles() {
  return (
    <Section id="principles" className="border-t border-line">
      <SectionHeading
        index="07"
        eyebrow="How I think"
        title="Five habits that survived contact with real projects"
        meta={[
          { label: "Count", value: String(principles.length).padStart(2, "0") },
          { label: "Buzzwords", value: "0" },
        ]}
      />

      <RevealGroup as="ol" className="mt-14 border-t border-line">
        {principles.map((principle) => (
          <RevealItem
            as="li"
            key={principle.index}
            className="group grid gap-4 border-b border-line py-9 md:grid-cols-[5rem_18rem_minmax(0,1fr)] md:gap-10 md:py-11"
          >
            <MonoLabel className="pt-1.5 transition-colors duration-300 group-hover:text-signal">
              {principle.index}
            </MonoLabel>
            <h3 className="text-xl leading-tight font-medium tracking-tight sm:text-2xl">
              {principle.title}
            </h3>
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-dim">
              {principle.body}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
