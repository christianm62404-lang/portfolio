"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { useTrackScrollX } from "@/components/layout/track";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { cn } from "@/lib/utils";

/**
 * One parallax layer.
 *
 * The pattern is a repeating CSS background, and the element is translated by
 * the scroll offset wrapped into a single tile. Wrapping is what makes the
 * world endless: the layer never runs out however far the visitor travels, and
 * the transform stays a small number the compositor can handle.
 */
export function Layer({
  rate,
  tile,
  className,
  style,
}: {
  /** Fraction of the scroll distance this layer travels. */
  rate: number;
  /** Pattern period in pixels. */
  tile: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduceMotion = useMotionPreference();
  // Stands in when the layer is rendered outside a Track, so the hook order
  // stays fixed either way.
  const fallback = useMotionValue(0);
  const scrollX = useTrackScrollX() ?? fallback;

  const x = useTransform(scrollX, (value) => {
    const shifted = (value * rate) % tile;
    return -(shifted < 0 ? shifted + tile : shifted);
  });

  return (
    <motion.div
      aria-hidden
      className={cn("absolute inset-y-0 -left-px", className)}
      style={{
        ...style,
        width: `calc(100% + ${tile}px)`,
        x: reduceMotion ? 0 : x,
      }}
    />
  );
}
