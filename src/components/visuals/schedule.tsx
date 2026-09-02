"use client";

import { useState } from "react";
import { MonoLabel } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** Illustrative sample data — the point is the shape of the model, not the hours. */
const week = [
  { day: "Mon", planned: 6, actual: 6.5 },
  { day: "Tue", planned: 8, actual: 6.0 },
  { day: "Wed", planned: 5, actual: 7.25 },
  { day: "Thu", planned: 8, actual: 8.0 },
  { day: "Fri", planned: 4, actual: 2.75 },
];

const MAX_HOURS = 9;

/**
 * In TimeTrack a scheduled block and a logged entry are different entities. So the visual shows both, on the same axis:
 * the outline is what was planned, the fill is what actually happened, and
 * the gap between them is the report the schema makes trivial.
 */
export function ScheduleVisual() {
  const [focused, setFocused] = useState<string | null>(null);
  const plannedTotal = week.reduce((sum, day) => sum + day.planned, 0);
  const actualTotal = week.reduce((sum, day) => sum + day.actual, 0);
  const variance = actualTotal - plannedTotal;

  return (
    <figure className="flex h-full w-full flex-col bg-panel-2 p-4 sm:p-6">
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <MonoLabel>Planned vs. logged</MonoLabel>
        <MonoLabel className="text-ink-faint">sample week</MonoLabel>
      </figcaption>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {week.map((entry) => {
          const isFocused = focused === entry.day;
          const delta = entry.actual - entry.planned;
          return (
            <div
              key={entry.day}
              onPointerEnter={() => setFocused(entry.day)}
              onPointerLeave={() => setFocused(null)}
              className="group grid grid-cols-[2.25rem_1fr_3.5rem] items-center gap-3"
            >
              <MonoLabel className={cn("transition-colors", isFocused && "text-ink")}>
                {entry.day}
              </MonoLabel>

              <div className="relative h-6">
                {/* Scheduled block — an outline, because it is an intention. */}
                <div
                  className="absolute inset-y-0 left-0 border border-dashed border-line-bright"
                  style={{ width: `${(entry.planned / MAX_HOURS) * 100}%` }}
                />
                {/* Logged entry — filled, because it is a fact. */}
                <div
                  className={cn(
                    "absolute inset-y-1 left-0 transition-[background-color,width] duration-500 ease-[var(--ease-out-expo)]",
                    isFocused ? "bg-signal" : "bg-signal/55",
                  )}
                  style={{ width: `${(entry.actual / MAX_HOURS) * 100}%` }}
                />
              </div>

              <span
                className={cn(
                  "text-right font-mono text-[0.6875rem] transition-colors",
                  delta < 0 ? "text-ink-faint" : "text-live/80",
                )}
              >
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(2)}h
              </span>
            </div>
          );
        })}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-px border-t border-line pt-4">
        {[
          { label: "Scheduled", value: `${plannedTotal.toFixed(1)}h` },
          { label: "Logged", value: `${actualTotal.toFixed(1)}h` },
          { label: "Variance", value: `${variance >= 0 ? "+" : ""}${variance.toFixed(2)}h` },
        ].map((stat) => (
          <div key={stat.label}>
            <dt>
              <MonoLabel>{stat.label}</MonoLabel>
            </dt>
            <dd className="mt-1.5 font-display text-xl font-medium tracking-tight">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
