import { certifications, education, experience } from "@/content/experience";
import { MonoLabel, Section, SectionHeading, StatusDot, Tag } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

/**
 * Deliberately editorial, not card-based: roles read as a column of entries
 * against a rule, so this section does not compete with Work above it.
 */
export function Experience() {
  return (
    <Section id="experience" className="border-t border-line">
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

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <RevealGroup as="ol" className="relative">
          {/* The spine that ties the entries together. */}
          <span aria-hidden className="absolute top-2 bottom-2 left-0 w-px bg-line" />

          {experience.map((role) => (
            <RevealItem as="li" key={role.id} className="relative pb-14 pl-8 last:pb-0 sm:pl-10">
              <span
                aria-hidden
                className="absolute top-2 -left-[3px] size-[7px] rounded-full border border-signal bg-void"
              />

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <MonoLabel className="text-signal">{role.period}</MonoLabel>
                {role.current ? (
                  <span className="flex items-center gap-1.5">
                    <StatusDot />
                    <MonoLabel className="text-live">Current</MonoLabel>
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
                {role.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-dim">
                <span className="text-ink">{role.company}</span>
                <span className="mx-2 text-ink-faint">·</span>
                {role.location}
              </p>

              <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-dim">
                {role.summary}
              </p>

              <ul className="mt-5 max-w-2xl space-y-2.5">
                {role.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-3 text-sm leading-relaxed text-ink-dim"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 block h-px w-3 shrink-0 bg-line-bright"
                    />
                    {highlight}
                  </li>
                ))}
              </ul>

              {role.stack?.length ? (
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {role.stack.map((item) => (
                    <li key={item}>
                      <Tag>{item}</Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="space-y-10">
          <div>
            <MonoLabel>Education</MonoLabel>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {education.map((entry) => (
                <li key={entry.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-ink">{entry.institution}</span>
                    <span className="shrink-0 font-mono text-[0.6875rem] text-ink-faint">
                      {entry.period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-dim">{entry.credential}</p>
                  {entry.detail ? (
                    <p className="mt-1 text-xs text-ink-faint">{entry.detail}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <MonoLabel>Certifications</MonoLabel>
            <ul className="mt-4 space-y-2">
              {certifications.map((certification) => (
                <li
                  key={certification.name}
                  className="flex items-center gap-3 text-sm text-ink-dim"
                >
                  <span aria-hidden className="size-1 rounded-full bg-signal" />
                  {certification.name}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
