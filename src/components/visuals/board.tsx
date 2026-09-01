"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MonoLabel } from "@/components/ui/primitives";
import { clamp, mapRange } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const ADC_MAX = 4095; // MSP430FR6989 ADC12 — 12-bit conversion result.
const PWM_CYCLES = 6;

/** HC-SR04: echo pulse width in microseconds for a given distance. */
const echoMicroseconds = (distanceCm: number) => distanceCm * 58.0;

/** Square wave across the plot width, high for `duty` of each period. */
function pwmPath(duty: number, width: number, height: number, cycles = PWM_CYCLES) {
  const period = width / cycles;
  const top = 3;
  const bottom = height - 3;
  let d = `M 0 ${bottom}`;
  for (let i = 0; i < cycles; i += 1) {
    const x0 = i * period;
    const xRise = x0;
    const xFall = x0 + period * duty;
    d += ` L ${xRise} ${top} L ${xFall} ${top} L ${xFall} ${bottom} L ${x0 + period} ${bottom}`;
  }
  return d;
}

/**
 * The embedded project gets an instrument, not a card.
 *
 * The potentiometer is a real control: its ADC value sets the PWM duty cycle,
 * which drives the waveform and the LED brightness, exactly as it does on the
 * board. The distance figure comes from a simulated ultrasonic reading, and
 * the echo time beside it is the genuine HC-SR04 relationship.
 */
export function BoardVisual() {
  const [adc, setAdc] = useState(2260);
  const [distanceCm, setDistanceCm] = useState(42.5);
  const sliderId = useId();
  const reduceMotion = useMotionPreference();
  const figureRef = useRef<HTMLElement>(null);

  const duty = adc / ADC_MAX;
  const dutyPercent = Math.round(duty * 100);

  useEffect(() => {
    // The sensor loop only runs while the visual is on screen, and not at all
    // when the visitor has asked for reduced motion.
    const element = figureRef.current;
    if (!element || reduceMotion) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        setDistanceCm((previous) =>
          clamp(previous + (Math.random() - 0.5) * 9, 6, 118),
        );
      }, 900);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.15 },
    );
    observer.observe(element);

    return () => {
      stop();
      observer.disconnect();
    };
  }, [reduceMotion]);

  const wave = useMemo(() => pwmPath(duty, 300, 44), [duty]);
  const ledGlow = 0.12 + duty * 0.88;

  return (
    <figure ref={figureRef} className="flex h-full w-full flex-col bg-panel-2 p-4 sm:p-6">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <MonoLabel>MSP430FR6989 · prototype</MonoLabel>
        <MonoLabel className="text-signal">running</MonoLabel>
      </figcaption>

      <svg
        viewBox="0 0 420 214"
        className="h-auto w-full"
        role="img"
        aria-label="Schematic: an ultrasonic sensor and potentiometer feed an MSP430 microcontroller, which drives an I2C LCD and a MOSFET-switched LED."
      >
        <defs>
          <radialGradient id="led-glow">
            <stop offset="0%" stopColor="var(--color-signal)" stopOpacity={ledGlow} />
            <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Traces */}
        <g fill="none" stroke="var(--color-line-bright)" strokeWidth="1">
          <path d="M118 44 H136 V80 H150" />
          <path d="M118 58 H128 V96 H150" />
          <path d="M118 170 H136 V128 H150" />
          <path d="M270 80 H288 V54" />
          <path d="M270 112 H300 V158" />
          <path d="M270 128 H292 V172" />
        </g>

        {/* Ultrasonic sensor */}
        <Block x={10} y={26} w={108} h={46} title="HC-SR04" sub="ultrasonic" />
        <PinLabel x={124} y={41} text="TRIG" />
        <PinLabel x={124} y={55} text="ECHO" />

        {/* Potentiometer */}
        <Block x={10} y={150} w={108} h={40} title="POT" sub="10 kΩ" />
        <PinLabel x={124} y={164} text="A0 / ADC" />

        {/* MCU */}
        <rect
          x={150}
          y={60}
          width={120}
          height={92}
          rx="2"
          fill="var(--color-void)"
          stroke="var(--color-signal)"
          strokeWidth="1.1"
        />
        <text x={210} y={100} textAnchor="middle" fontSize="10" fill="var(--color-signal)">
          MSP430
        </text>
        <text x={210} y={113} textAnchor="middle" fontSize="7.5" fill="var(--color-ink-faint)">
          FR6989
        </text>
        {/* Pin ticks */}
        <g stroke="var(--color-line-bright)" strokeWidth="1">
          {[72, 84, 96, 108, 120, 132, 144].map((y) => (
            <path key={`l${y}`} d={`M144 ${y} H150`} />
          ))}
          {[72, 84, 96, 108, 120, 132, 144].map((y) => (
            <path key={`r${y}`} d={`M270 ${y} H276`} />
          ))}
        </g>

        {/* MOSFET + LED */}
        <Block x={288} y={26} w={120} h={44} title="MOSFET → LED" sub="P1.0 · PWM" />
        <circle cx={348} cy={48} r={26} fill="url(#led-glow)" />
        <circle
          cx={348}
          cy={48}
          r={4.5}
          fill="var(--color-signal)"
          opacity={0.25 + duty * 0.75}
        />

        {/* LCD over I2C */}
        <Block x={288} y={146} w={120} h={46} title="LCD" sub="I2C · SDA/SCL" />
        <PinLabel x={276} y={109} text="SDA" />
        <PinLabel x={276} y={125} text="SCL" />
      </svg>

      {/* Instrument strip */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="border border-line bg-void px-3 py-2.5">
          <div className="flex items-baseline justify-between">
            <MonoLabel>PWM · P1.0</MonoLabel>
            <span className="font-mono text-[0.6875rem] text-signal">{dutyPercent}% duty</span>
          </div>
          <svg viewBox="0 0 300 44" className="mt-2 h-11 w-full" aria-hidden>
            <path d="M0 22 H300" stroke="var(--color-line)" strokeWidth="0.75" strokeDasharray="2 3" />
            <path
              d={wave}
              fill="none"
              stroke="var(--color-signal)"
              strokeWidth="1.5"
              strokeLinejoin="miter"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Character-LCD readout */}
        <div className="flex flex-col justify-center border border-line bg-[#0b1410] px-3 py-2.5 font-mono text-[0.6875rem] leading-relaxed text-live/90">
          <span>DIST {distanceCm.toFixed(1).padStart(5)} cm</span>
          <span>DUTY {String(dutyPercent).padStart(5)} %</span>
          <span className="text-live/55">
            ECHO {Math.round(echoMicroseconds(distanceCm)).toString().padStart(5)} us
          </span>
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={sliderId} className="label-mono">
          Potentiometer → ADC{" "}
          <span className="text-ink-dim normal-case">
            ({adc} / {ADC_MAX} ·{" "}
            {mapRange(adc, 0, ADC_MAX, 0, 3.3).toFixed(2)} V)
          </span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={ADC_MAX}
          value={adc}
          onChange={(event) => setAdc(Number(event.target.value))}
          className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-[var(--color-signal)] outline-offset-4"
        />
      </div>
    </figure>
  );
}

function Block({
  x,
  y,
  w,
  h,
  title,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
        fill="var(--color-void)"
        stroke="var(--color-line-bright)"
        strokeWidth="1"
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 1 : y + h / 2 + 3}
        textAnchor="middle"
        fontSize="9"
        fill="var(--color-ink-dim)"
      >
        {title}
      </text>
      {sub ? (
        <text
          x={x + w / 2}
          y={y + h / 2 + 11}
          textAnchor="middle"
          fontSize="7"
          fill="var(--color-ink-faint)"
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function PinLabel({
  x,
  y,
  text,
  anchor = "start",
}: {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "end";
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="6.5" letterSpacing="0.1em" fill="var(--color-ink-faint)">
      {text}
    </text>
  );
}
