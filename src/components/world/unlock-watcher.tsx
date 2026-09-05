"use client";

import { useEffect } from "react";
import { watchForUnlock } from "@/lib/hidden-mode";

/**
 * Installs the document-level half of the hidden mode's unlock sequence: the
 * word typed on a keyboard, and the rule that a pointer landing anywhere else
 * breaks a run of taps.
 *
 * Its own element counters live on the photo and the monogram; this only exists
 * because those two listeners have to be on the document rather than on any one
 * component, and something has to own them. Renders nothing.
 */
export function UnlockWatcher() {
  useEffect(() => watchForUnlock(), []);
  return null;
}
