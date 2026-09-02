import { certifications, education, experience } from "@/content/experience";
import { MonoLabel, Panel, SectionHeading, StatusDot, Tag } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

/** Roles as columns, read left to right in the order they happened. */
export function Experience() {
  return (
    <Panel id="experience">
      <SectionHeading
        index="05"
        eyebrow="Experience"
        title="Where the work happened"
        meta={[
          { label: "Roles", value: String(experience.length).padStart(2, "0") },
          { label: "Institutions", value: String(education.length).padStart(2, "0") },
          { label: "Certifications", value: String(certifications.length).padStart(2, "0") },
        ]}
      />

      {experience.map((role, index) => (
        <Reveal
          key={role.id}
          delay={index * 0.06}
          className="col col-lg border-l border-line pl-8"
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <MonoLabel className="text-signal">{role.period}</MonoLabel>
            {role.current ? (
              <span className="flex items-center gap-1.5">
                <StatusDot />
                <MonoLabel className="text-live">Current</MonoLabel>
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-semibold">
            {role.title}
          </h3>
          <p className="mt-1.5 text-sm text-ink-dim">
            <span className="text-ink">{role.company}</span>
            <span className="mx-2 text-ink-faint">·</span>
            {role.location}
          </p>

          <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-dim">{role.summary}</p>

          <ul className="mt-4 space-y-2">
            {role.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-[0.8125rem] leading-relaxed text-ink-dim">
                <span aria-hidden className="mt-2 block h-px w-3 shrink-0 bg-line-bright" />
                {highlight}
              </li>
            ))}
          </ul>

          {role.stack?.length ? (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {role.stack.map((item) => (
                <li key={item}>
                  <Tag>{item}</Tag>
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      ))}

      <Reveal delay={0.16} className="col col-xs space-y-8 border-l border-line pl-8">
        <div>
          <MonoLabel>Education</MonoLabel>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {education.map((entry) => (
              <li key={entry.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[0.8125rem] font-medium text-ink">
                    {entry.institution}
                  </span>
                  <span className="shrink-0 font-mono text-[0.625rem] text-ink-faint">
                    {entry.period}
                  </span>
                </div>
                <p className="mt-1 text-[0.8125rem] text-ink-dim">{entry.credential}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>Certifications</MonoLabel>
          <ul className="mt-3 space-y-2">
            {certifications.map((certification) => (
              <li
                key={certification.name}
                className="flex items-center gap-2.5 text-[0.8125rem] text-ink-dim"
              >
                <span aria-hidden className="size-1 rounded-full bg-signal" />
                {certification.name}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Panel>
  );
}
