"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { layers } from "@/content/layers";
import { MonoLabel } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const CYCLE_MS = 3200;

/**
 * The site's central metaphor, made operable.
 *
 * Five layers of the stack rendered as a signal path. It idles by walking a
 * pulse down the path; pointer or keyboard interaction takes over and holds
 * whichever layer the visitor is looking at. Every layer is a real button, so
 * the whole diagram is usable with a keyboard alone.
 */
export function StackDiagram({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const reduceMotion = useMotionPreference();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopIdleCycle = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    // The idle walk exists to show that the diagram is interactive. Once the
    // visitor engages — or if they prefer reduced motion — it stops for good.
    if (engaged || reduceMotion) {
      stopIdleCycle();
      return;
    }
    timer.current = setInterval(() => {
      setActiveIndex((index) => (index + 1) % layers.length);
    }, CYCLE_MS);
    return stopIdleCycle;
  }, [engaged, reduceMotion, stopIdleCycle]);

  const engage = (index: number) => {
    setEngaged(true);
    setActiveIndex(index);
  };

  return (
    <div
      className={cn("relative", className)}
      onPointerLeave={() => setEngaged(false)}
    >
      <div className="mb-4 flex items-center justify-between">
        <MonoLabel>Signal path</MonoLabel>
        <MonoLabel className="text-ink-faint">
          {String(activeIndex + 1).padStart(2, "0")} / {String(layers.length).padStart(2, "0")}
        </MonoLabel>
      </div>

      <ul className="relative flex flex-col gap-px" role="list">
        {/* The spine the pulse travels down. */}
        <span
          aria-hidden
          className="absolute top-6 bottom-6 left-[1.4375rem] w-px bg-line"
        />

        {layers.map((layer, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={layer.id} className="relative">
              <button
                type="button"
                onPointerEnter={() => engage(index)}
                onFocus={() => engage(index)}
                onClick={() => engage(index)}
                aria-expanded={isActive}
                className={cn(
                  "group relative flex w-full items-start gap-4 border px-4 py-3.5 text-left transition-[background-color,border-color,transform] duration-400 ease-[var(--ease-out-expo)] sm:px-5",
                  isActive
                    ? "border-line-bright bg-panel-2 sm:translate-x-1.5"
                    : "border-transparent bg-transparent hover:border-line",
                )}
              >
                {/* Node on the spine. */}
                <span
                  aria-hidden
                  className={cn(
                    "relative mt-1 grid size-3 shrink-0 place-items-center rounded-full border transition-colors duration-400",
                    isActive
                      ? "border-signal bg-signal"
                      : "border-line-bright bg-void group-hover:border-ink-faint",
                  )}
                >
                  {isActive ? (
                    <span className="absolute inset-0 -m-1.5 rounded-full border border-signal/35" />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <MonoLabel className={isActive ? "text-signal" : undefined}>
                      {layer.index}
                    </MonoLabel>
                    <span
                      className={cn(
                        "font-display text-lg leading-none font-medium tracking-tight transition-colors duration-300 sm:text-xl",
                        isActive ? "text-ink" : "text-ink-dim",
                      )}
                    >
                      {layer.name}
                    </span>
                    <span className="text-xs text-ink-faint">{layer.tagline}</span>
                  </span>

                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.span
                        className="block overflow-hidden"
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span className="block pt-3 text-sm leading-relaxed text-ink-dim">
                          {layer.blurb}
                        </span>
                        <span className="mt-3 flex flex-wrap gap-1.5">
                          {layer.signals.map((signal) => (
                            <span
                              key={signal}
                              className="border border-line px-2 py-0.5 font-mono text-[0.625rem] tracking-wide text-ink-faint"
                            >
                              {signal}
                            </span>
                          ))}
                        </span>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
