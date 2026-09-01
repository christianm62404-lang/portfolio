import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Maps a value from one numeric range onto another. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);

/** Deterministic PRNG so generated datasets and layouts are stable across renders. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller transform, for normally distributed sample data. */
export function gaussian(random: () => number, mean = 0, stdDev = 1) {
  const u = Math.max(random(), Number.EPSILON);
  const v = random();
  return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const formatHz = (hz: number) =>
  hz >= 1_000_000
    ? `${(hz / 1_000_000).toFixed(hz >= 10_000_000 ? 0 : 1)} MHz`
    : hz >= 1000
      ? `${(hz / 1000).toFixed(hz >= 10_000 ? 0 : 1)} kHz`
      : `${hz.toFixed(0)} Hz`;
