"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  commitHiddenMode,
  endTransition,
  framesFor,
  useModeTransition,
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
 * The way in and out of the hidden mode: the character puts a hand over the
 * lens, and whichever site is being left changes behind it. He reaches out and
 * smoulders on the way in, and waves on the way out — one overlay, two sets of
 * frames, so the timing cannot drift between the two.
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
  const { playing, target } = useModeTransition();
  const reduceMotion = useMotionPreference();
  // Each direction has its own art: the reach going in, the wave coming out.
  const frames = framesFor(target);
  const [frame, setFrame] = useState(-1);
  const [lifting, setLifting] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;

    if (reduceMotion) {
      commitHiddenMode(target);
      endTransition();
      return;
    }

    let cancelled = false;
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, run: () => void) =>
      timers.push(setTimeout(run, ms));

    const play = () => {
      if (cancelled) return;

      // One frame per animation frame, advancing only when the current one has
      // had its time — never by more than a step. Timing each frame with its
      // own setTimeout looked equivalent and was not: when the main thread
      // stalls, several fire in the same tick, React batches them, and the
      // frames in between are never painted. Measured, that dropped one or two
      // of the eight on most runs. This stretches under load instead of
      // skipping, which for a sequence this short is the better trade — the
      // order is the point of it.
      let index = 0;
      let shownAt = performance.now();
      setFrame(0);

      const tick = () => {
        if (cancelled) return;
        const now = performance.now();
        // The first frame fades on, so it is held longer than the rest —
        // otherwise it is still arriving when the second one cuts over it.
        const due = index === 0 ? FIRST_MS : FRAME_MS;
        if (now - shownAt < due) {
          raf = requestAnimationFrame(tick);
          return;
        }

        index += 1;
        shownAt = now;

        if (index < frames.length) {
          setFrame(index);
          raf = requestAnimationFrame(tick);
          return;
        }

        // Past the last frame: the hand and the veil cover everything, which is
        // the one instant the change can be made without anyone seeing it.
        commitHiddenMode(target);
        at(HOLD_MS, () => setLifting(true));
        at(HOLD_MS + SLIDE_MS, () => {
          setFrame(-1);
          setLifting(false);
          endTransition();
        });
      };

      raf = requestAnimationFrame(tick);
    };

    // Decode first, then play — with a cap, so a slow connection delays the
    // transition rather than withholding it.
    //
    // The wait is on the elements actually mounted, not on the file paths.
    // Fetching /sprite/a3.png into the cache does nothing for an <Image> that
    // requests /_next/image?url=... instead: the first play still decoded as it
    // went, and dropped a frame doing it.
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      play();
    };
    at(PRELOAD_CAP_MS, start);
    const images = [...(overlay.current?.querySelectorAll("img") ?? [])];
    Promise.all(
      images.map((image) => image.decode().catch(() => undefined)),
    ).then(start);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      for (const timer of timers) clearTimeout(timer);
    };
  }, [playing, target, frames, reduceMotion]);

  if (!playing || reduceMotion) return null;

  return (
    <div
      ref={overlay}
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
        style={{
          opacity:
            frame < 0
              ? 0
              : Math.min(1, 0.22 + (frame / (frames.length - 1)) * 0.78),
        }}
      />

      {/* Every frame is stacked and only the current one shown, so a frame is
          never swapped in undecoded — the same trick the walk cycle uses. */}
      {frames.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vh"
          // Every frame eager, not just the first: they are the whole
          // animation, and one that arrives late is a frame that never shows.
          priority
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
