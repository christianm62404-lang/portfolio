"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMotionValue, type MotionValue } from "motion/react";

/** -1 travelling left, 1 travelling right, 0 at rest. */
export type TravelDirection = -1 | 0 | 1;

/** How long the track must be still before the traveller is considered idle. */
const IDLE_MS = 130;
/** Pixels per second while an arrow key is held. */
const KEY_SPEED = 1100;

interface DirectionStore {
  subscribe: (listener: () => void) => () => void;
  get: () => TravelDirection;
  set: (value: TravelDirection) => void;
}

function createDirectionStore(): DirectionStore {
  let value: TravelDirection = 0;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get: () => value,
    set(next) {
      if (next === value) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
  };
}

interface TrackContextValue {
  ref: React.RefObject<HTMLDivElement | null>;
  direction: DirectionStore;
  progress: MotionValue<number>;
  /** Raw horizontal offset in pixels, for parallax. */
  scrollX: MotionValue<number>;
  scrollToSection: (id: string) => void;
}

const TrackContext = createContext<TrackContextValue | null>(null);

/**
 * Reads the current travel direction without re-rendering on every scroll
 * event: the snapshot is a single number, so a subscriber only re-renders
 * when the direction actually flips.
 */
export function useTravelDirection(): TravelDirection {
  const context = useContext(TrackContext);
  const subscribe = useCallback(
    (listener: () => void) => context?.direction.subscribe(listener) ?? (() => {}),
    [context],
  );
  return useSyncExternalStore(
    subscribe,
    () => context?.direction.get() ?? 0,
    () => 0,
  );
}

/** Horizontal read position, 0 to 1, as a motion value — never React state. */
export function useTrackProgress() {
  return useContext(TrackContext)?.progress;
}

/** Horizontal offset in pixels, as a motion value. */
export function useTrackScrollX() {
  return useContext(TrackContext)?.scrollX;
}

export function useTrackNavigation() {
  return useContext(TrackContext)?.scrollToSection;
}

/** Elements that own the arrow keys themselves and must not be hijacked. */
const KEY_CONSUMERS =
  'input, textarea, select, [contenteditable="true"], [role="tablist"], [role="tab"], [role="radiogroup"], [role="slider"]';

/**
 * The site scrolls sideways.
 *
 * One fixed, full-viewport flex row that panels are laid into. It owns three
 * input paths — the wheel, the arrow keys, and the scrollbar itself — and
 * publishes the resulting travel direction so the character at the bottom of
 * the screen can walk the right way.
 *
 * A vertical wheel is mapped onto the horizontal axis, because that is what a
 * trackpad and a mouse actually produce; without it the site would only be
 * reachable by dragging the scrollbar.
 */
export function TrackProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const scrollX = useMotionValue(0);
  const direction = useMemo(() => createDirectionStore(), []);

  const scrollToSection = useCallback((id: string) => {
    const track = ref.current;
    const target = document.getElementById(id);
    if (!track || !target) return;
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  // Publish position and direction.
  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    let previous = track.scrollLeft;
    let idle: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      const current = track.scrollLeft;
      const delta = current - previous;
      previous = current;

      const span = track.scrollWidth - track.clientWidth;
      progress.set(span > 0 ? current / span : 0);
      scrollX.set(current);

      if (Math.abs(delta) > 0.5) direction.set(delta > 0 ? 1 : -1);
      clearTimeout(idle);
      idle = setTimeout(() => direction.set(0), IDLE_MS);
    };

    onScroll();
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(idle);
      track.removeEventListener("scroll", onScroll);
    };
  }, [direction, progress, scrollX]);

  // Wheel — vertical or horizontal — drives the horizontal axis.
  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom

      // A panel or column that can still scroll vertically under the pointer
      // keeps the event. Without this, a stacked panel on a narrow window
      // could never be read past its first screen.
      const target = event.target as HTMLElement | null;
      const scroller = target?.closest?.(".panel, .col") as HTMLElement | null;
      if (scroller && scroller.scrollHeight - scroller.clientHeight > 1) {
        const room = scroller.scrollHeight - scroller.clientHeight;
        const goingUp = event.deltaY < 0;
        if ((goingUp && scroller.scrollTop > 0) || (!goingUp && scroller.scrollTop < room - 1)) {
          return;
        }
      }

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      event.preventDefault();
      track.scrollLeft += delta;
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, []);

  // Held arrow keys move at a constant speed, which is what makes the walk
  // cycle read as walking rather than as a series of jumps.
  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    const held = new Set<string>();
    let frame = 0;
    let previousTime = 0;

    const step = (time: number) => {
      const elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      const travel =
        (held.has("ArrowRight") ? 1 : 0) - (held.has("ArrowLeft") ? 1 : 0);
      if (travel !== 0) track.scrollLeft += travel * KEY_SPEED * elapsed;
      frame = held.size > 0 ? requestAnimationFrame(step) : 0;
      if (!frame) previousTime = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      // Sliders and the skills tab list bind the arrow keys themselves.
      if (target?.closest?.(KEY_CONSUMERS)) return;
      event.preventDefault();
      held.add(event.key);
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onKeyUp = (event: KeyboardEvent) => held.delete(event.key);
    const onBlur = () => held.clear();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const value = useMemo<TrackContextValue>(
    () => ({ ref, direction, progress, scrollX, scrollToSection }),
    [direction, progress, scrollX, scrollToSection],
  );

  return <TrackContext.Provider value={value}>{children}</TrackContext.Provider>;
}

/**
 * The scrolling element itself. Kept separate from the provider so the header,
 * the progress bar, and the world strip can sit outside the thing that
 * scrolls while still reading its state.
 */
export function TrackViewport({ children }: { children: ReactNode }) {
  const context = useContext(TrackContext);
  return (
    <div
      ref={context?.ref}
      id="track"
      className="track fixed inset-0 flex items-stretch overflow-x-auto overflow-y-hidden"
    >
      {children}
    </div>
  );
}

/** The scrolling element, for observers that need it as their root. */
export function useTrackElement() {
  return useContext(TrackContext)?.ref;
}

export { TrackContext };
