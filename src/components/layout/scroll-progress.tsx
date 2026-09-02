"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useTrackProgress } from "@/components/layout/track";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/**
 * A one-pixel indicator of how far along the track the visitor has walked.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function ScrollProgress() {
  const reduceMotion = useMotionPreference();
  const fallback = useMotionValue(0);
  const progress = useTrackProgress() ?? fallback;
  const smoothed = useSpring(progress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-px origin-left bg-signal"
      style={{ scaleX: reduceMotion ? progress : smoothed }}
    />
  );
}
