import type { Project } from "@/types/content";
import { MonoLabel, Tag } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { LayerMeter } from "@/components/projects/layer-meter";
import { ProjectVisualSwitch } from "@/components/projects/project-visual";
import { cn } from "@/lib/utils";

/**
 * One project, laid out as an editorial spread.
 *
 * The layout alternates sides down the page so the section reads as a
 * sequence rather than a grid of identical cards, and each project's visual
 * is a different component entirely.
 */
export function ProjectCard({ project, flip }: { project: Project; flip: boolean }) {
  const details = [
    { label: "Challenge", body: project.challenge },
    { label: "Outcome", body: project.outcome },
  ].filter((detail): detail is { label: string; body: string } => Boolean(detail.body));

  return (
    <Reveal as="article" className="border-t border-line pt-10 md:pt-14">
      <div
        className={cn(
          "grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-14",
          flip && "lg:[&>*:first-child]:order-2",
        )}
      >
        {/* Visual */}
        <div className="border border-line lg:sticky lg:top-28">
          <ProjectVisualSwitch project={project} />
        </div>

        {/* Copy */}
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <MonoLabel className="text-signal">{project.index}</MonoLabel>
            <MonoLabel>{project.kicker}</MonoLabel>
          </div>

          <h3 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.03] font-semibold">
            {project.name}
          </h3>

          <dl className="mt-6 grid gap-x-8 gap-y-4 border-y border-line py-5 sm:grid-cols-3">
            {[
              { label: "Role", value: project.role },
              { label: "Context", value: project.context },
              { label: "Period", value: project.period },
            ].map((item) => (
              <div key={item.label}>
                <dt>
                  <MonoLabel>{item.label}</MonoLabel>
                </dt>
                <dd className="mt-2 text-sm leading-snug text-ink-dim">{item.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-base leading-relaxed text-ink-dim sm:text-[1.0625rem]">
            {project.summary}
          </p>

          {details.length > 0 ? (
            <div className="mt-8 space-y-6">
              {details.map((detail) => (
                <div key={detail.label}>
                  <MonoLabel>{detail.label}</MonoLabel>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-dim">{detail.body}</p>
                </div>
              ))}
            </div>
          ) : null}

          {project.learned ? (
            <blockquote className="mt-8 border-l-2 border-signal pl-5">
              <MonoLabel>What it taught me</MonoLabel>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink italic">
                {project.learned}
              </p>
            </blockquote>
          ) : null}

          <div className="mt-8">
            <LayerMeter active={project.layers} />
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <li key={item}>
                  <Tag>{item}</Tag>
                </li>
              ))}
            </ul>
          </div>

          {project.links?.length ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {project.links.map((link) =>
                link.pending ? (
                  <span
                    key={link.label}
                    className="inline-flex h-10 items-center border border-dashed border-line px-4 text-sm text-ink-faint"
                  >
                    {link.label} — link pending
                  </span>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-10 items-center gap-2 border border-line-bright px-4 text-sm text-ink transition-colors duration-200 hover:border-signal hover:text-signal"
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
                ),
              )}
            </div>
          ) : null}

          {project.note ? (
            <p className="mt-6 flex gap-2.5 text-[0.6875rem] leading-relaxed text-ink-faint">
              <span aria-hidden className="mt-1 block h-px w-4 shrink-0 bg-line-bright" />
              {project.note}
            </p>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
