"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/**
 * A one-pixel read-position indicator across the top of the page.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useMotionPreference();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-signal"
      style={{ scaleX: reduceMotion ? scrollYProgress : smoothed }}
    />
  );
}
