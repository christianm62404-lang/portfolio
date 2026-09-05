"use client";

import { useCallback, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { runWipe } from "@/lib/theme";

/**
 * A mode you have to find.
 *
 * Turning it on repaints the accents red, swaps the character's resting frame
 * for the smoulder, and shows a different set of photographs in the hero. It is
 * deliberately undiscoverable by accident: nothing on the page advertises it,
 * and nothing about the ordinary reading path stumbles into it.
 *
 * The state lives on the document as `data-mode`, the same way the theme lives
 * on `data-theme`, so the palette override is a plain CSS selector and the
 * whole repaint rides the same view transition the theme switch uses.
 *
 * It is not persisted. A mode nobody can see the entrance to is a poor thing to
 * restore on a later visit, when the visitor has no idea why the site is red.
 */

export const MODE_ATTRIBUTE = "data-mode";
export const HIDDEN_MODE = "matthew";

/** How many times the photo has to be hit before the second stage listens. */
const PORTRAIT_TAPS = 5;
/** And how many times the monogram has to be hit to finish it, on touch. */
const MONOGRAM_TAPS = 5;
/** The word to type, on a keyboard. */
const WORD = "matthew";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function isHiddenMode() {
  return document.documentElement.getAttribute(MODE_ATTRIBUTE) === HIDDEN_MODE;
}

/**
 * Applies the mode with no ceremony, behind whatever is covering the screen.
 *
 * Flushed, so the sprite and the photographs have actually re-rendered by the
 * time this returns: a caller hiding the swap behind a hand or a wipe has only
 * that instant to make it, and a re-render React has merely scheduled is not
 * in it.
 */
export function commitHiddenMode(on: boolean) {
  if (on === isHiddenMode()) return;
  const root = document.documentElement;
  if (on) root.setAttribute(MODE_ATTRIBUTE, HIDDEN_MODE);
  else root.removeAttribute(MODE_ATTRIBUTE);
  flushSync(emit);
}

export function setHiddenMode(on: boolean) {
  if (on === isHiddenMode()) return;

  // Going in, the character reaches out and puts a hand over the lens; the
  // swap happens behind it. Coming out stays the diagonal wipe — leaving
  // should be a quiet way back to the ordinary site, not a second performance.
  if (on) {
    beginEntry();
    return;
  }

  runWipe(() => commitHiddenMode(false));
}

/* ------------------------------- the entrance ------------------------------ */

/** Frames of the entrance, in order. There is no t5; the art skips it. */
export const ENTRY_FRAMES = ["t1", "t2", "t3", "t4", "t6", "t7", "t8"].map(
  (name) => `/sprite/${name}.png`,
);

type EntryPhase = "idle" | "entering";
let entryPhase: EntryPhase = "idle";
const phaseListeners = new Set<Listener>();

function emitPhase() {
  for (const listener of phaseListeners) listener();
}

function beginEntry() {
  if (entryPhase !== "idle") return;
  entryPhase = "entering";
  emitPhase();
}

/** Called by the overlay once it has finished playing and faded away. */
export function endEntry() {
  entryPhase = "idle";
  emitPhase();
}

/** Whether the entrance is playing, safe to branch on during render. */
export function useEntryPhase() {
  const subscribe = useCallback((onChange: Listener) => {
    phaseListeners.add(onChange);
    return () => {
      phaseListeners.delete(onChange);
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => entryPhase,
    () => "idle" as const,
  );
}

/**
 * Whether the mode is on, safe to branch on during render.
 *
 * `useSyncExternalStore` with a `false` server snapshot: React uses that while
 * hydrating so both renders agree, then re-renders with the real value on the
 * commit straight after. Reading the attribute directly inside render would
 * mismatch instead.
 */
export function useHiddenMode() {
  const subscribe = useCallback((onChange: Listener) => {
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  return useSyncExternalStore(subscribe, isHiddenMode, () => false);
}

/* --------------------------------- unlock --------------------------------- */

/**
 * The unlock is two stages, and the first has to be finished before the second
 * is listened to at all — so the word cannot be typed first, and neither half
 * on its own does anything.
 *
 * "Consecutive" is taken literally: any pointer landing somewhere other than
 * the thing being counted puts that counter back to zero, as does any key that
 * is not the next letter of the word. Otherwise five clicks spread across a
 * long visit would eventually unlock it by accident, which is the opposite of
 * hidden.
 */
let portraitTaps = 0;
let monogramTaps = 0;
let typed = "";

function reset() {
  portraitTaps = 0;
  monogramTaps = 0;
  typed = "";
}

/** Call from the hero portrait's own pointer handler. */
export function notePortraitTap() {
  if (isHiddenMode()) return;
  // The second stage has already been reached; more taps on the photo neither
  // help nor hurt.
  if (portraitTaps >= PORTRAIT_TAPS) return;
  portraitTaps += 1;
}

/** Call from the monogram in the header. Only the touch path uses it. */
export function noteMonogramTap() {
  if (isHiddenMode()) return;
  if (portraitTaps < PORTRAIT_TAPS) return;
  monogramTaps += 1;
  if (monogramTaps >= MONOGRAM_TAPS) {
    reset();
    setHiddenMode(true);
  }
}

/**
 * Installs the listeners the two stages need: the keyboard half of the desktop
 * sequence, and the "consecutive" rule for both. Mounted once.
 */
export function watchForUnlock() {
  const onPointerDown = (event: PointerEvent) => {
    const target = event.target as Element | null;
    // A tap on either counted element is handled by that element's own
    // handler; anything else breaks the run.
    if (target?.closest("[data-unlock='portrait']")) return;
    if (target?.closest("[data-unlock='monogram']")) return;
    reset();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (isHiddenMode()) return;
    if (portraitTaps < PORTRAIT_TAPS) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    // Someone typing into a field is writing, not unlocking.
    const target = event.target as Element | null;
    if (target?.closest("input, textarea, select, [contenteditable='true']"))
      return;
    if (event.key.length !== 1) return;

    const next = `${typed}${event.key.toLowerCase()}`;
    // Keep the longest tail of what has been typed that is still a prefix of
    // the word, so a stumble mid-word does not force the visitor back to the
    // start of the whole sequence.
    typed = "";
    for (let start = 0; start < next.length; start += 1) {
      const tail = next.slice(start);
      if (WORD.startsWith(tail)) {
        typed = tail;
        break;
      }
    }

    if (typed === WORD) {
      reset();
      setHiddenMode(true);
    }
  };

  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("pointerdown", onPointerDown, true);
    window.removeEventListener("keydown", onKeyDown);
  };
}
