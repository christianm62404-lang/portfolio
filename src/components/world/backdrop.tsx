"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { useTrackProgress } from "@/components/layout/track";
import { useHiddenMode } from "@/lib/hidden-mode";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { Layer } from "@/components/world/layer";

/**
 * The world behind everything.
 *
 * Four depths, each travelling at its own fraction of the scroll, so walking
 * the site reads as walking through somewhere rather than sliding a sheet of
 * paper sideways:
 *
 *   aura      colour, barely moving, like weather on the horizon
 *   nodes     a sparse field of points
 *   traces    tall verticals in the middle distance
 *   pylons    shorter, denser verticals close to the ground
 *
 * Everything is drawn from CSS gradients over palette tokens, so it costs no
 * images, follows the theme, and cross-fades with it. Nothing legible is drawn
 * here — the aura hues carry their own alpha and sit far below the contrast
 * the text needs.
 */
export function Backdrop() {
  const reduceMotion = useMotionPreference();
  const hidden = useHiddenMode();
  const fallback = useMotionValue(0);
  const progress = useTrackProgress() ?? fallback;

  // The aura is enormous and soft, so it does not need to wrap — it simply
  // drifts across the whole journey.
  const auraX = useTransform(progress, [0, 1], ["0%", "-22%"]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute -inset-y-1/4 left-0 w-[145%]"
        style={{ x: reduceMotion ? 0 : auraX }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: [
              "radial-gradient(58rem 46rem at 12% 24%, var(--aura-violet), transparent 62%)",
              "radial-gradient(52rem 44rem at 44% 78%, var(--aura-indigo), transparent 60%)",
              "radial-gradient(46rem 40rem at 72% 18%, var(--aura-magenta), transparent 58%)",
              "radial-gradient(54rem 46rem at 96% 70%, var(--aura-violet), transparent 60%)",
            ].join(","),
            filter: "blur(30px)",
            animation: reduceMotion
              ? undefined
              : "aura-drift 26s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* A sparse field of points, furthest away. */}
      <Layer
        rate={0.08}
        tile={128}
        className="opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 16px 22px, var(--color-line-bright) 1.2px, transparent 2px)",
          backgroundSize: "128px 96px",
        }}
      />

      {/* Middle distance: tall traces rising from the ground line. */}
      <Layer
        rate={0.22}
        tile={264}
        className="top-auto bottom-[var(--ground-offset)] h-[62vh] opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line) 0 2px, transparent 2px 88px)",
          maskImage: "linear-gradient(to top, black, transparent 88%)",
        }}
      />
      <Layer
        rate={0.34}
        tile={186}
        className="top-auto bottom-[var(--ground-offset)] h-[38vh] opacity-55"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line-bright) 0 2px, transparent 2px 62px)",
          maskImage: "linear-gradient(to top, black, transparent 78%)",
        }}
      />

      {/* Close to the ground: shorter, denser, and the only layer tinted by
          the accent, which is what gives the near field its depth. */}
      <Layer
        rate={0.62}
        tile={148}
        className="top-auto bottom-[var(--ground-offset)] h-[15vh] opacity-45"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, color-mix(in oklab, var(--color-signal) 55%, transparent) 0 3px, transparent 3px 74px)",
          maskImage: "linear-gradient(to top, black, transparent 82%)",
        }}
      />

      {hidden ? <Embers reduceMotion={reduceMotion} /> : null}

      {/* Settles the whole field towards the page ground so panel text always
          has somewhere quiet to sit. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--color-canvas) 55%, transparent), transparent 30%, transparent 62%, color-mix(in oklab, var(--color-canvas) 45%, transparent))",
        }}
      />
    </div>
  );
}

/**
 * Scattered red lights, only in the hidden mode.
 *
 * Three groups rather than one. Each is a tile of gradients placed at
 * deliberately irregular offsets, and the tiles are 331, 523 and 787 pixels
 * wide — coprime, so the three patterns only line up again every few hundred
 * screens and the field never resolves into a grid. They travel at different
 * parallax rates and breathe on different clocks, which is what separates them
 * into near and far rather than one flat sheet of dots.
 *
 * Decorative, dim, and behind every panel: nothing legible is drawn on them,
 * and the brightest sits far below the contrast the text needs.
 */
function Embers({ reduceMotion }: { reduceMotion: boolean }) {
  const light = (
    percentX: number,
    percentY: number,
    radius: number,
    strength: number,
  ) =>
    `radial-gradient(circle ${radius}px at ${percentX}% ${percentY}%, ` +
    `color-mix(in oklab, var(--color-signal) ${strength}%, transparent), transparent 70%)`;

  const groups = [
    {
      rate: 0.14,
      tile: 787,
      className: "opacity-70",
      duration: "9s",
      delay: "0s",
      lights: [
        light(7, 18, 34, 46),
        light(38, 63, 26, 38),
        light(61, 12, 30, 42),
        light(88, 45, 22, 34),
      ],
    },
    {
      rate: 0.29,
      tile: 523,
      className: "opacity-60",
      duration: "13s",
      delay: "-4s",
      lights: [
        light(19, 74, 20, 40),
        light(52, 29, 26, 34),
        light(81, 82, 18, 44),
      ],
    },
    {
      rate: 0.47,
      tile: 331,
      className: "opacity-50",
      duration: "7s",
      delay: "-2.5s",
      lights: [light(28, 41, 14, 52), light(70, 88, 12, 46)],
    },
  ];

  return (
    <>
      {groups.map((group) => (
        <Layer
          key={group.tile}
          rate={group.rate}
          tile={group.tile}
          className={group.className}
          style={{
            backgroundImage: group.lights.join(","),
            backgroundSize: `${group.tile}px 62vh`,
            backgroundRepeat: "repeat",
            filter: "blur(1px)",
            animation: reduceMotion
              ? undefined
              : `ember-breathe ${group.duration} ease-in-out ${group.delay} infinite`,
          }}
        />
      ))}
    </>
  );
}
