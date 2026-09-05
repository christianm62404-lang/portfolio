"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTravelDirection } from "@/components/layout/track";
import { useHiddenMode } from "@/lib/hidden-mode";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import {
  HIDDEN_ROLES,
  type SpriteManifest,
  type SpriteRole,
} from "@/lib/sprite";
import { cn } from "@/lib/utils";

/** Milliseconds per frame. Slow enough to read as steps, not a flicker. */
const FRAME_MS = 135;

/** In the hidden mode: how long he holds the smoulder, and the raised brow. */
const SMOULDER_MS = 7_000;
const EYEBROW_MS = 3_000;

/**
 * The walk cycles, as pairs of [role, mirrored].
 *
 * Each is stride, pass, opposite stride, pass — the standard four-frame walk,
 * where the standing profile doubles as the passing position. When a
 * left-facing frame has not been supplied, its right-facing twin is used
 * mirrored, which is how sprite sheets have always handled this.
 */
type Frame = { role: SpriteRole; mirror?: boolean };

const WALK_RIGHT: Frame[] = [
  { role: "rightRight" },
  { role: "faceRight" },
  { role: "rightLeft" },
  { role: "faceRight" },
];

const WALK_LEFT: Frame[] = [
  { role: "leftRight" },
  { role: "faceLeft" },
  { role: "leftLeft" },
  { role: "faceLeft" },
];

/**
 * The hidden mode's walk: eight frames rather than four.
 *
 * Each stride is held on the wide pose, eased through the narrow one and back
 * out to the wide again before passing — so a step reads as a step being taken
 * rather than as two positions alternating, which is what the four-frame cycle
 * can only suggest.
 */
const HIDDEN_WALK_RIGHT: Frame[] = [
  { role: "rightRightSS" },
  { role: "rightRightS" },
  { role: "rightRightSS" },
  { role: "faceRightS" },
  { role: "rightLeftSS" },
  { role: "rightLeftS" },
  { role: "rightLeftSS" },
  { role: "faceRightS" },
];

const HIDDEN_WALK_LEFT: Frame[] = [
  { role: "leftLeftSS" },
  { role: "leftLeftS" },
  { role: "leftLeftSS" },
  { role: "faceLeftS" },
  { role: "leftRightSS" },
  { role: "leftRightS" },
  { role: "leftRightSS" },
  { role: "faceLeftS" },
];

/** Right-facing stand-ins for left-facing roles, used when art is missing. */
const MIRROR_OF: Partial<Record<SpriteRole, SpriteRole>> = {
  faceLeft: "faceRight",
  leftLeft: "rightRight",
  leftRight: "rightLeft",
  faceLeftS: "faceRightS",
  leftLeftS: "rightRightS",
  leftLeftSS: "rightRightSS",
  leftRightS: "rightLeftS",
  leftRightSS: "rightLeftSS",
};

function resolve(frame: Frame, manifest: SpriteManifest) {
  const direct = manifest[frame.role];
  if (direct) return { src: direct, mirror: Boolean(frame.mirror) };

  const fallbackRole = MIRROR_OF[frame.role];
  const fallback = fallbackRole ? manifest[fallbackRole] : undefined;
  if (fallback) return { src: fallback, mirror: !frame.mirror };

  return null;
}

/**
 * The traveller.
 *
 * Fixed to the bottom of the viewport, facing the way the page is moving:
 * still when the track is still, walking right when it travels right, left
 * when it travels left. The cycle is driven by an interval rather than by
 * scroll distance so the pace stays even whether the visitor is flicking a
 * trackpad or holding an arrow key.
 */
export function Character({ manifest }: { manifest: SpriteManifest }) {
  const direction = useTravelDirection();
  const reduceMotion = useMotionPreference();
  const hidden = useHiddenMode();
  const [step, setStep] = useState(0);
  const [brow, setBrow] = useState(false);
  const [browBelongsTo, setBrowBelongsTo] = useState(false);

  const walking = direction !== 0 && !reduceMotion;
  const resting = hidden && direction === 0;

  // Drop the raised brow the moment he starts or stops moving, so the next
  // spell of stillness begins on the smoulder rather than resuming wherever
  // the last one was interrupted. Adjusting state during render is React's
  // own answer to "reset this when that changes" — doing it in an effect
  // would paint the stale frame first and then correct it.
  if (browBelongsTo !== resting) {
    setBrowBelongsTo(resting);
    setBrow(false);
  }

  // The brow flick, on its own clock: seven seconds of stillness, three
  // seconds raised, and back. The effect is keyed on `resting`, so any step
  // he takes tears the timer down and the count starts again from the moment
  // he next stands still — which is what "seven seconds without moving"
  // means, rather than seven seconds of wall clock.
  useEffect(() => {
    if (!resting) return;
    let raise: ReturnType<typeof setTimeout>;
    let lower: ReturnType<typeof setTimeout>;
    const schedule = () => {
      raise = setTimeout(() => {
        setBrow(true);
        lower = setTimeout(() => {
          setBrow(false);
          schedule();
        }, EYEBROW_MS);
      }, SMOULDER_MS);
    };
    schedule();
    return () => {
      clearTimeout(raise);
      clearTimeout(lower);
    };
  }, [resting]);

  // Restarting on each change of direction means a walk always begins on the
  // first frame of its cycle rather than wherever the previous one left off.
  useEffect(() => {
    if (!walking) return;
    let count = 0;
    const first = requestAnimationFrame(() => setStep(0));
    const timer = setInterval(() => {
      count += 1;
      setStep(count);
    }, FRAME_MS);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(timer);
    };
  }, [walking, direction]);

  if (Object.keys(manifest).length === 0) return null;

  const cycle = hidden
    ? direction === 1
      ? HIDDEN_WALK_RIGHT
      : HIDDEN_WALK_LEFT
    : direction === 1
      ? WALK_RIGHT
      : WALK_LEFT;
  const standing: Frame = resting
    ? { role: brow ? "smolderEyebrow" : "smolder" }
    : { role: "forward" };
  // Facing without walking — which is where reduced motion leaves him — uses
  // the same profile the mode's cycle passes through, so he does not change
  // character the moment the animation is switched off.
  const facing: Frame = hidden
    ? { role: direction === 1 ? "faceRightS" : "faceLeftS" }
    : { role: direction === 1 ? "faceRight" : "faceLeft" };
  const frame: Frame = walking
    ? cycle[step % cycle.length]
    : direction === 0
      ? standing
      : facing;

  const resolved =
    resolve(frame, manifest) ?? resolve({ role: "forward" }, manifest);
  if (!resolved) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-[var(--ground-offset)] left-1/2 h-[var(--character-h)] w-[calc(var(--character-h)*0.62)] -translate-x-1/2"
    >
      {/* Every frame is stacked in the same box and only the active one is
          shown, so the browser decodes each sprite once and the walk never
          flashes an undecoded frame. */}
      {Object.entries(manifest)
        .filter(([role]) =>
          hidden
            ? true
            : !HIDDEN_ROLES.includes(role as (typeof HIDDEN_ROLES)[number]),
        )
        .map(([role, src]) => {
          const isActive = src === resolved.src;
          return (
            <Image
              key={role}
              src={src}
              alt=""
              fill
              sizes="240px"
              priority={role === "forward"}
              className={cn(
                "object-contain object-bottom [image-rendering:pixelated]",
                isActive ? "opacity-100" : "opacity-0",
                isActive && resolved.mirror && "-scale-x-100",
              )}
            />
          );
        })}
    </div>
  );
}
