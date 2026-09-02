import * as React from "react";
import { cn } from "@/lib/utils";

/** Small uppercase monospace annotation — the site's engineering voice. */
export function MonoLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("label-mono", className)} {...props}>
      {children}
    </span>
  );
}

/** A live-status dot. Decorative, so it is hidden from assistive tech. */
export function StatusDot({ className, pulse = true }: { className?: string; pulse?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 rounded-full bg-live",
        pulse && "animate-[pulse-dot_2.4s_ease-in-out_infinite]",
        className,
      )}
    />
  );
}


export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-line px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide text-ink-dim transition-colors duration-200 hover:border-line-bright hover:text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * A section, as one screen of the sideways scroll.
 *
 * Panels are laid out as a flex row inside the track, so their width is set by
 * their content and the reader travels through them left to right.
 */
export function Panel({
  id,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { id: string }) {
  return (
    <section id={id} className={cn("panel", className)} {...props}>
      {children}
    </section>
  );
}

/** A column inside a panel. */
export function Column({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("col", className)} {...props}>
      {children}
    </div>
  );
}

export interface SectionMeta {
  label: string;
  value: string;
}

/**
 * The leading column of a section: its number, name, title, and standfirst,
 * plus any factual annotations. Reading it is how you know which section you
 * have just walked into.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  meta,
  className,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Small factual annotations, rendered under the standfirst. */
  meta?: SectionMeta[];
  className?: string;
}) {
  return (
    <header className={cn("col col-xs flex flex-col", className)}>
      <div className="flex items-center gap-3">
        <MonoLabel className="text-signal">{index}</MonoLabel>
        <MonoLabel>{eyebrow}</MonoLabel>
        <hr className="rule flex-1" />
      </div>

      <h2 className="mt-5 text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.03] font-semibold">
        {title}
      </h2>

      {lede ? (
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-dim">{lede}</p>
      ) : null}

      {meta?.length ? (
        <dl className="mt-auto divide-y divide-line border-y border-line pt-6">
          {meta.map((item) => (
            <div key={item.label} className="flex items-baseline justify-between gap-4 py-2">
              <dt>
                <MonoLabel>{item.label}</MonoLabel>
              </dt>
              <dd className="font-mono text-[0.6875rem] text-ink-dim">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {/* Direction of travel — the section header doubles as a signpost. */}
      <p className="mt-6 flex items-center gap-2 text-ink-faint">
        <MonoLabel>Keep going</MonoLabel>
        <span aria-hidden className="h-px flex-1 bg-line" />
        <span aria-hidden>&rarr;</span>
      </p>
    </header>
  );
}
