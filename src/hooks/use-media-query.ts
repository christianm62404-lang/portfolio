"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query state that is safe to branch on during render.
 *
 * `useSyncExternalStore` is the right primitive here: React uses the server
 * snapshot (always `false`) while hydrating, so the two renders agree, then
 * re-renders with the real value on the commit straight after. Branching on a
 * media query read directly inside render would mismatch instead.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True on pointer devices that can genuinely hover — gates cursor effects. */
export const usePointerFine = () => useMediaQuery("(hover: hover) and (pointer: fine)");
