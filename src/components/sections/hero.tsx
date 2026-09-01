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
 * a re-render of the section.
 */
export function Hero({ portraitSrc }: { portraitSrc: string | null }) {
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
  // The portrait leans very slightly toward the cursor, like a card on a desk.
  const portraitTiltY = useTransform(smoothX, [0, 1], [4, -4]);
  const portraitTiltX = useTransform(smoothY, [0, 1], [-3, 3]);

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
        className={cn("pointer-events-none absolute inset-0", !interactive && "signal-wash")}
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

      <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
        {/* Portrait first in the DOM so the face leads on a phone, moved to
            the second column on wide screens where reading order is lateral. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-[min(15rem,62%)] sm:w-[min(18rem,52%)] lg:order-2 lg:w-full lg:max-w-[26rem] lg:justify-self-end"
          style={
            interactive
              ? { rotateY: portraitTiltY, rotateX: portraitTiltX, transformPerspective: 1200 }
              : undefined
          }
        >
          <Portrait src={portraitSrc} priority />
        </motion.div>

        <div className="lg:order-1">
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
            transition={{ duration: 0.85, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="text-gradient-ink mt-6 text-[clamp(2.6rem,7.2vw,5rem)] leading-[0.95] font-semibold tracking-[-0.045em]"
          >
            {site.name}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-[clamp(1.25rem,2.6vw,1.85rem)] leading-tight font-medium tracking-[-0.03em]"
          >
            I build across the{" "}
            <span className="relative inline-block text-signal">
              stack.
              <span aria-hidden className="absolute -bottom-1 left-0 h-px w-full bg-signal/40" />
            </span>
          </motion.p>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-lg text-base leading-relaxed text-ink-dim sm:text-lg"
          >
            A computer engineering student who works from transistors up to cloud
            services, and finds the same question interesting at every level.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-3"
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
