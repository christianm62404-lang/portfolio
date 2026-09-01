"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Whether motion should be suppressed.
 *
 * Built on the same hydration-safe media query hook as everything else, so it
 * can be branched on during render: components render their animated form on
 * the server and their static form immediately after hydration. For someone
 * who has asked for reduced motion, the practical effect is that content
 * appears rather than animates.
 *
 * The CSS in globals.css handles the same preference for anything animated
 * without JavaScript; this covers the parts Motion drives.
 */
export const useMotionPreference = () => useMediaQuery("(prefers-reduced-motion: reduce)");
