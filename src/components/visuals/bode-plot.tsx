"use client";

import { useId, useMemo, useState } from "react";
import { MonoLabel } from "@/components/ui/primitives";
import { evaluateFilter, formatOhms, logSweep, rcFromCutoff, type FilterKind } from "@/lib/signal";
import { cn, formatHz } from "@/lib/utils";

const F_MIN = 10;
const F_MAX = 10_000_000;
const DB_MAX = 12;
const DB_MIN = -60;

const W = 440;
const H = 196;
const PAD = { top: 10, right: 32, bottom: 24, left: 32 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const LOG_MIN = Math.log10(F_MIN);
const LOG_MAX = Math.log10(F_MAX);

const xFor = (hz: number) => PAD.left + ((Math.log10(hz) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * PLOT_W;
const yForDb = (db: number) => PAD.top + ((DB_MAX - db) / (DB_MAX - DB_MIN)) * PLOT_H;
const yForPhase = (deg: number) => PAD.top + ((90 - deg) / 180) * PLOT_H;

const decades = [10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000];
const dbLines = [0, -20, -40, -60];

const kinds: Array<{ id: FilterKind; label: string; slope: string }> = [
  { id: "lowpass", label: "Low-pass", slope: "−20 dB/dec" },
  { id: "highpass", label: "High-pass", slope: "+20 dB/dec" },
  { id: "bandpass", label: "Band-pass", slope: "±20 dB/dec" },
];

/**
 * Frequency response, computed rather than drawn.
 *
 * The curve comes straight from the transfer function in lib/signal.ts, and
 * the component values in the readout are the ones that would actually give
 * the selected cutoff with a 100 nF capacitor. Moving the slider moves the
 * maths, not a decorative path.
 */
export function BodePlot() {
  const [kind, setKind] = useState<FilterKind>("lowpass");
  const [cutoffExponent, setCutoffExponent] = useState(3.7); // ≈ 5 kHz
  const [showPhase, setShowPhase] = useState(true);
  const sliderId = useId();

  const cutoff = 10 ** cutoffExponent;
  const q = kind === "bandpass" ? 4 : 1 / Math.SQRT2;

  const { magnitudePath, phasePath, cutoffDb } = useMemo(() => {
    const points = logSweep(F_MIN, F_MAX, 240);
    const responses = points.map((hz) => evaluateFilter(kind, hz, cutoff, q));

    const toPath = (mapper: (index: number) => number) =>
      points
        .map((hz, index) => `${index === 0 ? "M" : "L"} ${xFor(hz).toFixed(2)} ${mapper(index).toFixed(2)}`)
        .join(" ");

    return {
      magnitudePath: toPath((i) => yForDb(Math.max(responses[i].magnitudeDb, DB_MIN - 4))),
      phasePath: toPath((i) => yForPhase(responses[i].phaseDeg)),
      cutoffDb: evaluateFilter(kind, cutoff, cutoff, q).magnitudeDb,
    };
  }, [kind, cutoff, q]);

  const { resistanceOhms, capacitanceFarads } = rcFromCutoff(cutoff);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {kinds.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={kind === option.id}
            onClick={() => setKind(option.id)}
            className={cn(
              "border px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide transition-colors duration-200",
              kind === option.id
                ? "border-signal bg-signal/12 text-signal"
                : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim",
            )}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={showPhase}
          onClick={() => setShowPhase((value) => !value)}
          className={cn(
            "ml-auto border px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide transition-colors duration-200",
            showPhase
              ? "border-line-bright text-ink-dim"
              : "border-line text-ink-faint hover:text-ink-dim",
          )}
        >
          Phase {showPhase ? "on" : "off"}
        </button>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Bode magnitude plot for a ${kind} filter with a cutoff at ${formatHz(cutoff)}. Magnitude at the cutoff is ${cutoffDb.toFixed(1)} decibels.`}
      >
        {/* Decade grid */}
        <g stroke="var(--color-line)" strokeWidth="0.75">
          {decades.map((hz) => (
            <line key={hz} x1={xFor(hz)} y1={PAD.top} x2={xFor(hz)} y2={PAD.top + PLOT_H} />
          ))}
          {dbLines.map((db) => (
            <line
              key={db}
              x1={PAD.left}
              y1={yForDb(db)}
              x2={PAD.left + PLOT_W}
              y2={yForDb(db)}
              strokeDasharray={db === 0 ? undefined : "2 4"}
            />
          ))}
        </g>

        {/* −3 dB reference */}
        <line
          x1={PAD.left}
          y1={yForDb(-3)}
          x2={PAD.left + PLOT_W}
          y2={yForDb(-3)}
          stroke="var(--color-line-bright)"
          strokeWidth="0.75"
          strokeDasharray="1 3"
        />
        <text x={PAD.left + PLOT_W + 4} y={yForDb(-3) + 3} fontSize="7" fill="var(--color-ink-faint)">
          −3
        </text>

        {/* Cutoff marker */}
        <line
          x1={xFor(cutoff)}
          y1={PAD.top}
          x2={xFor(cutoff)}
          y2={PAD.top + PLOT_H}
          stroke="var(--color-signal)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.7"
        />
        <circle cx={xFor(cutoff)} cy={yForDb(cutoffDb)} r="3" fill="var(--color-signal)" />

        {showPhase ? (
          <path
            d={phasePath}
            fill="none"
            stroke="var(--color-ink-faint)"
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        <path
          d={magnitudePath}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="1.75"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Axes */}
        <g fontSize="7" fill="var(--color-ink-faint)">
          {decades.map((hz) => (
            <text key={hz} x={xFor(hz)} y={H - 10} textAnchor="middle">
              {formatHz(hz)}
            </text>
          ))}
          {dbLines.map((db) => (
            <text key={db} x={PAD.left - 6} y={yForDb(db) + 3} textAnchor="end">
              {db}
            </text>
          ))}
          <text x={PAD.left - 6} y={PAD.top + 6} textAnchor="end">
            dB
          </text>
        </g>
      </svg>

      <div className="mt-3">
        <label htmlFor={sliderId} className="label-mono">
          Cutoff frequency{" "}
          <span className="text-signal normal-case">{formatHz(cutoff)}</span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={2}
          max={5}
          step={0.01}
          value={cutoffExponent}
          onChange={(event) => setCutoffExponent(Number(event.target.value))}
          className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-[var(--color-signal)] outline-offset-4"
        />
      </div>

      <dl className="mt-4 grid grid-cols-4 gap-3 border-t border-line pt-3">
        {[
          { label: "R", value: formatOhms(resistanceOhms) },
          { label: "C", value: `${(capacitanceFarads * 1e9).toFixed(0)} nF` },
          { label: "Q", value: q.toFixed(2) },
          {
            label: "|H| at fc",
            value: `${cutoffDb.toFixed(1)} dB`,
          },
        ].map((item) => (
          <div key={item.label}>
            <dt>
              <MonoLabel>{item.label}</MonoLabel>
            </dt>
            <dd className="mt-1.5 font-mono text-sm text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-ink-faint">
        Component values solved from{" "}
        <span className="text-ink-dim">fc = 1 / (2πRC)</span> for a{" "}
        {(capacitanceFarads * 1e9).toFixed(0)} nF capacitor — the curve is evaluated from
        the transfer function, not traced. A decade past the cutoff the response is{" "}
        <span className="text-ink-dim">
          {evaluateFilter(kind, cutoff * 10, cutoff, q).magnitudeDb.toFixed(1)} dB
        </span>
        .
      </p>
    </div>
  );
}
