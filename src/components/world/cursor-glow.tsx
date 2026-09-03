"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { usePointerFine } from "@/hooks/use-media-query";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { cn } from "@/lib/utils";

/**
 * A soft light that follows the pointer across the whole page.
 *
 * It is drawn in two halves, because neither position alone works. Behind the
 * sections the light can be bright — nothing legible sits on it — but a frame's
 * frosted panel washes it out to about a third, and the frame is where the
 * cursor usually is. Over the sections it survives the panel, but every bit of
 * alpha there veils the text it crosses. So: a strong layer underneath that
 * blooms in the gaps between frames, and a quiet one on top whose ceiling is
 * set by the faintest text on the site rather than by taste.
 *
 * Like the hero's spotlight, the position is held in motion values rather than
 * React state: the pointer fires dozens of events a second and not one of them
 * should re-render anything. The spring is deliberately loose — the light
 * arrives a beat after the cursor, which is what makes it read as a light in
 * the room rather than a shape stuck to the pointer.
 *
 * Rendered only where a pointer can genuinely hover, and never under reduced
 * motion. On a touch screen there is no cursor to follow, and a light chasing
 * the last tap would be noise.
 */
export function CursorGlow() {
  const canHover = usePointerFine();
  const reduceMotion = useMotionPreference();
  const enabled = canHover && !reduceMotion;

  // Off-screen until the pointer is first seen, so the glow never flashes in
  // the top-left corner on load.
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const opacity = useMotionValue(0);

  const smoothX = useSpring(x, { stiffness: 220, damping: 30, mass: 0.5 });
  const smoothY = useSpring(y, { stiffness: 220, damping: 30, mass: 0.5 });
  const smoothOpacity = useSpring(opacity, {
    stiffness: 90,
    damping: 24,
    mass: 0.5,
  });

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let next: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!next) return;
      x.set(next.x);
      y.set(next.y);
      opacity.set(1);
    };

    const handleMove = (event: PointerEvent) => {
      next = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // Fade out whenever the pointer is no longer over the page — leaving the
    // window, or the window losing focus — so the light does not sit stranded
    // wherever the cursor happened to exit.
    const handleOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) opacity.set(0);
    };
    const handleBlur = () => opacity.set(0);

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerout", handleOut);
    window.addEventListener("blur", handleBlur);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerout", handleOut);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, x, y, opacity]);

  if (!enabled) return null;

  return (
    <>
      {[
        { key: "under", z: "z-[5]", tone: "cursor-glow-under" },
        { key: "over", z: "z-[15]", tone: "cursor-glow-over" },
      ].map((layer) => (
        <div
          key={layer.key}
          aria-hidden
          className={cn(
            "pointer-events-none fixed inset-0 overflow-hidden",
            layer.z,
          )}
        >
          <motion.div
            className={cn(
              "cursor-glow absolute top-0 left-0 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full",
              layer.tone,
            )}
            style={{ x: smoothX, y: smoothY, opacity: smoothOpacity }}
          />
        </div>
      ))}
    </>
  );
}
