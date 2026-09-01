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
 * Consistent section heading: numeric index, rule, title, and optional lede.
 * Every section on the page uses this, which is most of what makes the page
 * feel like one document rather than a stack of blocks.
 */
export interface SectionMeta {
  label: string;
  value: string;
}

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
  /** Small factual annotations rendered in the outer column on wide screens. */
  meta?: SectionMeta[];
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid gap-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-end lg:gap-16",
        className,
      )}
    >
      <div className="max-w-3xl">
        <div className="flex items-center gap-4">
          <MonoLabel className="text-signal">{index}</MonoLabel>
          <MonoLabel>{eyebrow}</MonoLabel>
          <hr className="rule flex-1" />
        </div>
        <h2 className="mt-6 text-[clamp(2rem,5.2vw,3.5rem)] leading-[1.02] font-semibold">
          {title}
        </h2>
        {lede ? (
          <p className="mt-5 text-base leading-relaxed text-ink-dim sm:text-lg">{lede}</p>
        ) : null}
      </div>

      {meta?.length ? (
        <dl className="hidden divide-y divide-line border-y border-line lg:block">
          {meta.map((item) => (
            <div key={item.label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt>
                <MonoLabel>{item.label}</MonoLabel>
              </dt>
              <dd className="font-mono text-[0.6875rem] text-ink-dim">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}

/** Full-width section wrapper with the page's shared rhythm and gutters. */
export function Section({
  id,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { id: string }) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 px-5 py-24 sm:px-8 md:py-32 lg:px-12", className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-[1240px]">{children}</div>
    </section>
  );
}
