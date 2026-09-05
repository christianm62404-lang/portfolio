"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { MonoLabel, StatusDot } from "@/components/ui/primitives";
import { Portrait } from "@/components/ui/portrait";
import { usePointerFine } from "@/hooks/use-media-query";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { cn } from "@/lib/utils";

/**
 * The first screen: a face, a name, and one line about what the name does.
 *
 * The cursor drives two motion values that feed a parallax field and a soft
 * spotlight. They are motion values rather than React state on purpose — the
 * pointer can fire dozens of events per second and none of them should cause
 * a re-render of the panel.
 */
export function Hero({
  portraitSrc,
  hiddenPortraits = [],
}: {
  portraitSrc: string | null;
  hiddenPortraits?: string[];
}) {
  const containerRef = useRef<HTMLElement>(null);
  const reduceMotion = useMotionPreference();
  const canHover = usePointerFine();
  const interactive = canHover && !reduceMotion;

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const springConfig = { stiffness: 90, damping: 22, mass: 0.6 };
  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  const gridX = useTransform(smoothX, [0, 1], [14, -14]);
  const gridY = useTransform(smoothY, [0, 1], [10, -10]);
  const glowX = useTransform(smoothX, [0, 1], ["30%", "70%"]);
  const glowY = useTransform(smoothY, [0, 1], ["25%", "75%"]);
  const tiltY = useTransform(smoothX, [0, 1], [4, -4]);
  const tiltX = useTransform(smoothY, [0, 1], [-3, 3]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !interactive) return;

    let frame = 0;
    let next: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!next) return;
      pointerX.set(next.x);
      pointerY.set(next.y);
      next = null;
    };

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      next = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, pointerX, pointerY]);

  return (
    <section ref={containerRef} id="home" className="panel">
      <div className="frame relative">
        {/* The decoration is clipped here rather than on the frame itself: on a
            narrow screen the frame is what scrolls, and a frame that hides its
            own overflow would swallow everything below the fold. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 overflow-hidden",
            !interactive && "signal-wash",
          )}
        >
          <motion.div
            className="grid-field absolute -inset-24 opacity-[0.55]"
            style={interactive ? { x: gridX, y: gridY } : undefined}
          />
          {interactive ? (
            <motion.div
              className="signal-field absolute size-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: glowX, top: glowY }}
            />
          ) : null}
        </div>

        {/* The face is the thing worth meeting first. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="col col-sm relative"
          style={
            interactive
              ? { rotateY: tiltY, rotateX: tiltX, transformPerspective: 1200 }
              : undefined
          }
        >
          <Portrait src={portraitSrc} hidden={hiddenPortraits} priority />
        </motion.div>

        <div className="col col-lg relative">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <span className="flex items-center gap-2">
              <StatusDot />
              <MonoLabel>{site.location}</MonoLabel>
            </span>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <MonoLabel>Computer Engineering · UCF · &apos;27</MonoLabel>
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.85,
              delay: 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-gradient-ink mt-5 text-[clamp(2.4rem,5.6vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.045em]"
          >
            {site.name}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-base leading-relaxed text-ink-dim sm:text-lg"
          >
            A computer engineering student who works from transistors up to
            cloud services, and finds the same question interesting at every
            level.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <ButtonLink href="#work" variant="primary" size="md">
              See the work
            </ButtonLink>
            <ButtonLink
              href={site.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="md"
            >
              Resume
            </ButtonLink>
          </motion.div>

          <TravelCue />
        </div>
      </div>
    </section>
  );
}

/**
 * Says which way the site goes. A sideways site has to, once — nobody arrives
 * expecting it.
 */
function TravelCue() {
  return (
    <div className="mt-12 flex items-center gap-3 text-ink-faint">
      <MonoLabel>Scroll, or use</MonoLabel>
      <kbd className="grid size-6 place-items-center border border-line-bright font-mono text-[0.625rem] text-ink-dim">
        &larr;
      </kbd>
      <kbd className="grid size-6 place-items-center border border-line-bright font-mono text-[0.625rem] text-ink-dim">
        &rarr;
      </kbd>
      <span aria-hidden className="relative h-px w-16 overflow-hidden bg-line">
        <span className="absolute inset-y-0 left-0 w-6 animate-[travel-hint_2.2s_var(--ease-out-expo)_infinite] bg-signal" />
      </span>
    </div>
  );
}
