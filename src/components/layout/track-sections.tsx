"use client";

import { useEffect } from "react";
import { useHiddenMode } from "@/lib/hidden-mode";
import { useTrackNavigation } from "@/components/layout/track";

/**
 * Chooses which run of panels the track holds.
 *
 * The hidden mode keeps the hero — it is where the photographs are, and a mode
 * with no opening screen starts mid-sentence — then goes straight to the work
 * history, the personal accounts, and how to get in touch. About, Selected
 * work, Lab and Skills are the portfolio's argument for itself, and the mode is
 * not making that argument.
 *
 * Both sets are rendered on the server and handed here as elements, so the
 * choice costs nothing but a swap.
 */
export function TrackSections({
  standard,
  hidden,
}: {
  standard: React.ReactNode;
  hidden: React.ReactNode;
}) {
  const on = useHiddenMode();
  const scrollToSection = useTrackNavigation();

  // The track is far shorter in the mode, so a visitor deep in Skills when it
  // turns on would otherwise be left scrolled past the end of everything.
  useEffect(() => {
    scrollToSection?.("home");
  }, [on, scrollToSection]);

  return <>{on ? hidden : standard}</>;
}
