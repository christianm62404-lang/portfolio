"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section is currently occupying the reading position.
 *
 * Uses a rootMargin band near the top of the viewport rather than a scroll
 * listener, so it costs nothing while idle and stays accurate on fast scrolls.
 */
export function useActiveSection(ids: readonly string[], fallback = ids[0]) {
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

        // Prefer the section highest on the page among those in the band.
        const winner = ids.find((id) => visible.has(id));
        if (winner) setActive(winner);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
