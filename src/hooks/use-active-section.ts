"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks which panel is currently occupying the reading position.
 *
 * The site scrolls sideways, so the observer's root is the track and the band
 * is a vertical slice near the left of it — the equivalent of "just below the
 * top" on a page that scrolls down. Using IntersectionObserver rather than a
 * scroll listener means it costs nothing while the track is still and stays
 * accurate through a fast flick.
 */
export function useActiveSection(
  ids: readonly string[],
  root?: RefObject<HTMLElement | null>,
  fallback = ids[0],
) {
  const [active, setActive] = useState<string>(fallback);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (visible.size === 0) return;

        // Prefer the panel furthest left among those in the band — the one the
        // visitor has most recently walked into.
        const winner = ids.find((id) => visible.has(id));
        if (winner) setActive(winner);
      },
      {
        root: root?.current ?? null,
        rootMargin: "0px -55% 0px -12%",
        threshold: [0, 0.15, 0.5, 1],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids, root]);

  return active;
}
