/**
 * Frequency-response maths for the electronics visual.
 *
 * These are the standard transfer functions, evaluated honestly rather than
 * drawn as a decorative curve: the plot moves because the maths moves.
 */

export type FilterKind = "lowpass" | "highpass" | "bandpass";

export interface FilterResponse {
  /** Magnitude in decibels. */
  magnitudeDb: number;
  /** Phase in degrees. */
  phaseDeg: number;
}

const RAD_TO_DEG = 180 / Math.PI;

/**
 * First-order RC responses and a second-order RLC band-pass, evaluated at `f`.
 *
 * lowpass  H(jw) = 1 / (1 + j w/wc)
 * highpass H(jw) = (j w/wc) / (1 + j w/wc)
 * bandpass H(jw) = (jw/Q wc) / (1 - (w/wc)^2 + jw/(Q wc))   [series RLC]
 */
export function evaluateFilter(
  kind: FilterKind,
  frequencyHz: number,
  cutoffHz: number,
  q = 1 / Math.SQRT2,
): FilterResponse {
  const ratio = frequencyHz / cutoffHz;

  if (kind === "lowpass") {
    const magnitude = 1 / Math.sqrt(1 + ratio * ratio);
    return { magnitudeDb: 20 * Math.log10(magnitude), phaseDeg: -Math.atan(ratio) * RAD_TO_DEG };
  }

  if (kind === "highpass") {
    const magnitude = ratio / Math.sqrt(1 + ratio * ratio);
    return {
      magnitudeDb: 20 * Math.log10(Math.max(magnitude, 1e-9)),
      phaseDeg: (Math.PI / 2 - Math.atan(ratio)) * RAD_TO_DEG,
    };
  }

  // Series RLC band-pass, normalised so the peak sits at the centre frequency.
  const real = 1 - ratio * ratio;
  const imag = ratio / q;
  const magnitude = imag / Math.sqrt(real * real + imag * imag);
  const phase = (Math.PI / 2 - Math.atan2(imag, real)) * RAD_TO_DEG;
  return { magnitudeDb: 20 * Math.log10(Math.max(magnitude, 1e-9)), phaseDeg: phase };
}

/** Logarithmically spaced sample points across a decade range. */
export function logSweep(startHz: number, endHz: number, points: number): number[] {
  const start = Math.log10(startHz);
  const end = Math.log10(endHz);
  return Array.from({ length: points }, (_, i) => 10 ** (start + ((end - start) * i) / (points - 1)));
}

/** Component values implied by a chosen cutoff, so the readout is real. */
export function rcFromCutoff(cutoffHz: number, capacitanceFarads = 100e-9) {
  const resistance = 1 / (2 * Math.PI * cutoffHz * capacitanceFarads);
  return { resistanceOhms: resistance, capacitanceFarads };
}

export const formatOhms = (ohms: number) =>
  ohms >= 1e6
    ? `${(ohms / 1e6).toFixed(2)} MΩ`
    : ohms >= 1e3
      ? `${(ohms / 1e3).toFixed(2)} kΩ`
      : `${ohms.toFixed(0)} Ω`;
