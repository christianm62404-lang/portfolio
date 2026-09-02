import type { Project } from "@/types/content";
import { MonoLabel, Tag } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { LayerMeter } from "@/components/projects/layer-meter";
import { ProjectVisualSwitch } from "@/components/projects/project-visual";

/**
 * One project, laid out as three columns the reader walks through: the thing
 * itself, what it was, and what it cost. Each project's visual is a different
 * component entirely, so the section reads as a sequence of different problems
 * rather than four copies of one card.
 */
export function ProjectCard({ project }: { project: Project }) {
  const details = [
    { label: "Challenge", body: project.challenge },
    { label: "Outcome", body: project.outcome },
  ].filter((detail): detail is { label: string; body: string } => Boolean(detail.body));

  return (
    <>
      <Reveal className="col col-lg border-l border-line pl-8">
        <div className="flex items-center gap-3">
          <MonoLabel className="text-signal">{project.index}</MonoLabel>
          <MonoLabel>{project.kicker}</MonoLabel>
        </div>

        <h3 className="mt-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.03] font-semibold">
          {project.name}
        </h3>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-4">
          {[
            { label: "Role", value: project.role },
            { label: "Context", value: project.context },
            { label: "Period", value: project.period },
          ].map((item) => (
            <div key={item.label}>
              <dt>
                <MonoLabel>{item.label}</MonoLabel>
              </dt>
              <dd className="mt-1.5 text-[0.8125rem] leading-snug text-ink-dim">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-dim">
          {project.summary}
        </p>

        <div className="mt-6">
          <LayerMeter active={project.layers} />
        </div>
      </Reveal>

      <Reveal delay={0.06} className="col col-md">
        <div className="border border-line">
          <ProjectVisualSwitch project={project} />
        </div>
      </Reveal>

      <Reveal delay={0.1} className="col col-lg">
        {details.map((detail) => (
          <div key={detail.label} className="mb-5">
            <MonoLabel>{detail.label}</MonoLabel>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-dim">{detail.body}</p>
          </div>
        ))}

        {project.learned ? (
          <blockquote className="mb-5 border-l-2 border-signal pl-4">
            <MonoLabel>What it taught me</MonoLabel>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink italic">
              {project.learned}
            </p>
          </blockquote>
        ) : null}

        <ul className="mb-5 flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>

        {project.links?.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-9 items-center gap-2 border border-line-bright px-3.5 text-[0.8125rem] text-ink transition-colors duration-200 hover:border-signal hover:text-signal"
              >
                {link.label}
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                  className="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
                >
                  <path
                    d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ))}
          </div>
        ) : null}

        {project.note ? (
          <p className="flex gap-2.5 text-[0.6875rem] leading-relaxed text-ink-faint">
            <span aria-hidden className="mt-1 block h-px w-4 shrink-0 bg-line-bright" />
            {project.note}
          </p>
        ) : null}
      </Reveal>
    </>
  );
}
