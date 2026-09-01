"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { MonoLabel, StatusDot } from "@/components/ui/primitives";
import { StackDiagram } from "@/components/visuals/stack-diagram";
import { usePointerFine } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/**
 * The first screen.
 *
 * The cursor drives two motion values that feed a parallax field and a soft
 * spotlight. They are motion values rather than React state on purpose — the
 * pointer can fire dozens of events per second and none of them should cause
 * a re-render of the section.
 */
export function Hero() {
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
  const titleShift = useTransform(smoothX, [0, 1], [4, -4]);

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
    <section
      ref={containerRef}
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pt-28 pb-20 sm:px-8 lg:px-12"
    >
      {/* Parallax field. Decorative and inert. */}
      <motion.div
        aria-hidden
        className="grid-field pointer-events-none absolute -inset-24 opacity-[0.55]"
        style={interactive ? { x: gridX, y: gridY } : undefined}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          !interactive && "signal-wash",
        )}
      >
        {interactive ? (
          <motion.div
            className="signal-field absolute size-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: glowX, top: glowY }}
          />
        ) : null}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-canvas to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-20">
        <div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.85, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={interactive ? { x: titleShift } : undefined}
            className="mt-7 text-[clamp(2.9rem,9vw,6.25rem)] leading-[0.92] font-semibold tracking-[-0.045em]"
          >
            <span className="block text-gradient-ink">I build</span>
            <span className="block text-gradient-ink">across the</span>
            <span className="relative inline-block text-signal">
              stack.
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-full bg-signal/40"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-lg text-base leading-relaxed text-ink-dim sm:text-lg"
          >
            {site.name} — a computer engineering student who works from transistors up
            to cloud services, and finds the same question interesting at every level.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <ButtonLink href="#work" variant="primary" size="lg">
              See the work
            </ButtonLink>
            <ButtonLink
              href={site.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
            >
              Resume
            </ButtonLink>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="border border-line bg-panel/70 p-5 backdrop-blur-sm sm:p-7"
        >
          <StackDiagram />
        </motion.div>
      </div>

      <ScrollCue />
    </section>
  );
}

function ScrollCue() {
  return (
    <a
      href="#about"
      className="group absolute inset-x-0 bottom-6 mx-auto hidden w-fit flex-col items-center gap-2 text-ink-faint transition-colors hover:text-ink lg:flex"
    >
      <MonoLabel className="transition-colors group-hover:text-ink">Scroll</MonoLabel>
      <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-line">
        <span className="absolute inset-x-0 top-0 h-4 animate-scroll-hint bg-signal" />
      </span>
      <span className="sr-only">Scroll to the about section</span>
    </a>
  );
}
