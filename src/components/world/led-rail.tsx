"use client";

import { useHiddenMode } from "@/lib/hidden-mode";

/**
 * A strip of red LEDs running the width of the page, just under the header.
 *
 * Only in the hidden mode, and only decorative: it sits above the header's own
 * backdrop so the light reads as mounted on the underside of the bar, and it
 * takes no pointer events, so nothing beneath it becomes unclickable.
 */
export function LedRail() {
  const hidden = useHiddenMode();
  if (!hidden) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-[var(--header-h)] z-40"
    >
      <div className="led-rail h-2.5 w-full" />
      <div className="led-glow h-16 w-full" />
    </div>
  );
}
