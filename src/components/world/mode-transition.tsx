"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ENTRY_FRAMES,
  commitHiddenMode,
  endEntry,
  useEntryPhase,
} from "@/lib/hidden-mode";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { cn } from "@/lib/utils";

/** Milliseconds a frame is held. Six of them after the first. */
const FRAME_MS = 115;
/** The first frame arrives rather than cuts, so it is held long enough to. */
const FIRST_MS = 430;
const FIRST_FADE_MS = 330;
/** How long the covered screen is held before the hand comes away. */
const HOLD_MS = 240;
/** And how long it takes to slide off. */
const SLIDE_MS = 520;
/** Longest wait for the art to decode before playing regardless. */
const PRELOAD_CAP_MS = 1500;

/**
 * The way into the hidden mode: the character reaches out and puts a hand over
 * the lens, and the site changes behind it.
 *
 * The swap is committed on the last frame, when the hand and the veil together
 * cover everything — so nothing is ever seen changing, which is the whole point
 * of covering the lens. The overlay then lifts on the mode already in place.
 *
 * The frames are decoded before the first one is shown. They are large, and a
 * sequence that stutters on its first play is worse than one that starts a beat
 * late; the wait is capped so a slow connection delays the entrance rather than
 * withholding it.
 *
 * Under reduced motion there is no sequence at all — the mode simply applies.
 */
export function ModeTransition() {
  const phase = useEntryPhase();
  const reduceMotion = useMotionPreference();
  const [frame, setFrame] = useState(-1);
  const [lifting, setLifting] = useState(false);

  useEffect(() => {
    if (phase !== "entering") return;

    if (reduceMotion) {
      commitHiddenMode(true);
      endEntry();
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, run: () => void) =>
      timers.push(setTimeout(run, ms));

    const play = () => {
      if (cancelled) return;
      // The first frame fades on, so it gets a longer hold than the rest —
      // otherwise it is still arriving when the second one cuts over it.
      ENTRY_FRAMES.forEach((_, index) =>
        at(index === 0 ? 0 : FIRST_MS + (index - 1) * FRAME_MS, () =>
          setFrame(index),
        ),
      );

      const covered = FIRST_MS + (ENTRY_FRAMES.length - 1) * FRAME_MS;
      // On the last frame the hand and the veil are opaque; this is the one
      // instant the change can be made without anyone seeing it happen.
      at(covered, () => commitHiddenMode(true));
      at(covered + HOLD_MS, () => setLifting(true));
      at(covered + HOLD_MS + SLIDE_MS, () => {
        setFrame(-1);
        setLifting(false);
        endEntry();
      });
    };

    // Decode first, then play — with a cap, so a slow connection delays the
    // entrance rather than withholding it.
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      play();
    };
    at(PRELOAD_CAP_MS, start);
    Promise.all(
      ENTRY_FRAMES.map(
        (src) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = src;
          }),
      ),
    ).then(start);

    return () => {
      cancelled = true;
      for (const timer of timers) clearTimeout(timer);
    };
  }, [phase, reduceMotion]);

  if (phase !== "entering" || reduceMotion) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[90] grid place-items-center overflow-hidden",
        // The hand does not fade away, it comes down off the screen and takes
        // the dark with it, so the mode is revealed from the top — the header
        // and its new red rail first.
        "transition-transform ease-[var(--ease-out-expo)] will-change-transform",
        lifting ? "translate-y-full" : "translate-y-0",
      )}
      style={{ transitionDuration: `${SLIDE_MS}ms` }}
    >
      {/* The dark closing in behind him. It reaches the mode's own ground
          colour on the last frame, so hand and veil together leave nothing of
          the old palette showing at the moment of the swap. */}
      <div
        className="absolute inset-0 bg-[#050506] transition-opacity duration-150 ease-linear"
        style={{ opacity: frame < 0 ? 0 : Math.min(1, 0.22 + frame * 0.14) }}
      />

      {/* Every frame is stacked and only the current one shown, so a frame is
          never swapped in undecoded — the same trick the walk cycle uses. */}
      {ENTRY_FRAMES.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vh"
          priority={index === 0}
          className={cn(
            "object-contain [image-rendering:pixelated]",
            // Only the first one fades; the rest cut, because that is what
            // makes the middle of the sequence read as animation rather than
            // as a slideshow.
            index === 0 && "transition-opacity ease-out",
            index === frame ? "opacity-100" : "opacity-0",
          )}
          style={
            index === 0
              ? { transitionDuration: `${FIRST_FADE_MS}ms` }
              : undefined
          }
        />
      ))}
    </div>
  );
}
