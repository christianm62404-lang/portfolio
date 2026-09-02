"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTravelDirection } from "@/components/layout/track";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import type { SpriteManifest, SpriteRole } from "@/lib/sprite";
import { cn } from "@/lib/utils";

/** Milliseconds per frame. Slow enough to read as steps, not a flicker. */
const FRAME_MS = 135;

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

/** Right-facing stand-ins for left-facing roles, used when art is missing. */
const MIRROR_OF: Partial<Record<SpriteRole, SpriteRole>> = {
  faceLeft: "faceRight",
  leftLeft: "rightRight",
  leftRight: "rightLeft",
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
  const [step, setStep] = useState(0);

  const walking = direction !== 0 && !reduceMotion;

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

  const cycle = direction === 1 ? WALK_RIGHT : WALK_LEFT;
  const frame: Frame = walking
    ? cycle[step % cycle.length]
    : direction === 0
      ? { role: "forward" }
      : direction === 1
        ? { role: "faceRight" }
        : { role: "faceLeft" };

  const resolved = resolve(frame, manifest) ?? resolve({ role: "forward" }, manifest);
  if (!resolved) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-[var(--ground-offset)] left-1/2 z-20 h-[var(--character-h)] w-[var(--character-h)] -translate-x-1/2"
    >
      {/* Every frame is stacked in the same box and only the active one is
          shown, so the browser decodes each sprite once and the walk never
          flashes an undecoded frame. */}
      {Object.entries(manifest).map(([role, src]) => {
        const isActive = src === resolved.src;
        return (
          <Image
            key={role}
            src={src}
            alt=""
            fill
            sizes="220px"
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
