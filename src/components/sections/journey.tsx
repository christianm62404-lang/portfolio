"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { journey } from "@/content/journey";
import { layerById } from "@/content/layers";
import { MonoLabel, Section, SectionHeading } from "@/components/ui/primitives";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/**
 * The progression, as a scroll-driven signal path.
 *
 * The spine fills as the section moves through the viewport — the same
 * pulse-travelling-down-a-path idea as the hero diagram, at the scale of
 * several years instead of a few seconds. Stages are broad rather than dated,
 * because the story is the accumulation, not the calendar.
 */
export function Journey() {
  const containerRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useMotionPreference();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <Section id="journey" className="border-t border-line">
      <SectionHeading
        index="06"
        eyebrow="Journey"
        title="How the breadth accumulated"
        lede="Each stage is the previous one asked at a different level of abstraction. Written as stages rather than dates, because that is the honest shape of it."
        meta={[
          { label: "Stages", value: String(journey.length).padStart(2, "0") },
          { label: "Invented dates", value: "0" },
        ]}
      />

      <ol ref={containerRef} className="relative mt-16 md:mt-20">
        {/* Track and fill. */}
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-[7px] w-px bg-line md:left-1/2 md:-translate-x-1/2"
        />
        <motion.span
          aria-hidden
          className="absolute top-0 bottom-0 left-[7px] w-px origin-top bg-signal md:left-1/2 md:-translate-x-1/2"
          style={{ scaleY: reduceMotion ? 1 : fill }}
        />

        {journey.map((stage, index) => {
          const layer = layerById[stage.layer];
          const alignRight = index % 2 === 1;

          return (
            <li
              key={stage.id}
              className="relative pb-14 pl-9 last:pb-0 md:grid md:grid-cols-2 md:gap-16 md:pb-16 md:pl-0"
            >
              {/* Node */}
              <span
                aria-hidden
                className="absolute top-1.5 left-0 z-10 grid size-[15px] place-items-center rounded-full border border-line-bright bg-void md:left-1/2 md:-translate-x-1/2"
              >
                <motion.span
                  className="size-[5px] rounded-full bg-signal"
                  initial={reduceMotion ? false : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -18% 0px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={
                  alignRight
                    ? "md:col-start-2 md:pl-4"
                    : "md:col-start-1 md:row-start-1 md:pr-4 md:text-right"
                }
              >
                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${
                    alignRight ? "" : "md:justify-end"
                  }`}
                >
                  <MonoLabel className="text-signal">{stage.marker}</MonoLabel>
                  <MonoLabel>
                    {layer.index} · {layer.name}
                  </MonoLabel>
                </div>

                <h3 className="mt-3 text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                  {stage.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-dim md:inline-block">
                  {stage.body}
                </p>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
