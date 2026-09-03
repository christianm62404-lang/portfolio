"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { usePointerFine } from "@/hooks/use-media-query";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/**
 * A soft light that follows the pointer across the whole page.
 *
 * It sits above the panels but below the world strip and the header, so it
 * washes over the sections the reader is actually looking at without ever
 * touching the character or the navigation.
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
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[15] overflow-hidden"
    >
      <motion.div
        className="cursor-glow absolute top-0 left-0 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ x: smoothX, y: smoothY, opacity: smoothOpacity }}
      />
    </div>
  );
}
