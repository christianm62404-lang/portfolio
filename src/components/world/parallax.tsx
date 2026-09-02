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
function Layer({
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

/**
 * The world the character walks through.
 *
 * Three layers moving at different rates: a sparse field far away, a run of
 * verticals in the middle distance, and a measured ground line underfoot. All
 * three are CSS gradients built from the palette tokens, so they cost nothing
 * to paint and follow the theme without a second definition.
 */
export function Parallax() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Far: a sparse dot field. */}
      <Layer
        rate={0.12}
        tile={96}
        className="opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12px 18px, var(--color-line-bright) 1px, transparent 1.6px)",
          backgroundSize: "96px 74px",
          maskImage: "linear-gradient(to bottom, transparent, black 55%)",
        }}
      />

      {/* Middle distance: two runs of verticals at different periods, which
          reads as depth rather than as a ruler. */}
      <Layer
        rate={0.32}
        tile={220}
        className="bottom-[var(--ground-offset)] top-auto h-24 opacity-55"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line) 0 2px, transparent 2px 55px)",
          maskImage: "linear-gradient(to bottom, transparent, black 70%)",
        }}
      />
      <Layer
        rate={0.52}
        tile={340}
        className="bottom-[var(--ground-offset)] top-auto h-14 opacity-70"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line-bright) 0 3px, transparent 3px 113px)",
          maskImage: "linear-gradient(to bottom, transparent, black 60%)",
        }}
      />

      {/* Underfoot: the measured ground the character stands on. */}
      <div
        className="absolute inset-x-0 bottom-[var(--ground-offset)] h-px"
        style={{ background: "var(--color-line-bright)" }}
      />
      <Layer
        rate={1}
        tile={120}
        className="bottom-[calc(var(--ground-offset)-10px)] top-auto h-2.5 opacity-80"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line-bright) 0 1px, transparent 1px 24px)",
        }}
      />
      <Layer
        rate={1}
        tile={120}
        className="bottom-[calc(var(--ground-offset)-18px)] top-auto h-4.5 opacity-90"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-signal) 0 1px, transparent 1px 120px)",
        }}
      />
    </div>
  );
}
