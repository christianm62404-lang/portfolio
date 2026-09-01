"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MonoLabel } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  assignClusters,
  boundaryPoints,
  confusionMatrix,
  crossEntropyLoss,
  gradientStep,
  initialCentroids,
  makeClassificationSet,
  makeClusterSet,
  metricsFrom,
  predictProbability,
  updateCentroids,
  type Centroid,
  type LinearModel,
} from "@/lib/ml";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const VIEW = 240;
const PAD = 16;
const DOMAIN = 1.35;
const STEPS_PER_FRAME = 3;
const MAX_STEPS = 480;
const LEARNING_RATE = 1.4;

const toPx = (value: number) => PAD + ((value + DOMAIN) / (2 * DOMAIN)) * (VIEW - PAD * 2);

const START_MODEL: LinearModel = { w1: -0.9, w2: 1.4, b: 0.55 };

type Mode = "classify" | "cluster";

/**
 * Machine learning shown as work rather than as a claim.
 *
 * Classify runs batch gradient descent on logistic regression in the browser:
 * the boundary moves because the weights move, the loss is the real
 * cross-entropy, and the confusion matrix is recomputed from the current
 * model's predictions on every step. Cluster runs Lloyd's algorithm one
 * iteration at a time so the centroids can be watched converging.
 */
export function MlLab() {
  const [mode, setMode] = useState<Mode>("classify");

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        {(
          [
            { id: "classify", label: "Classification" },
            { id: "cluster", label: "Clustering" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={mode === option.id}
            onClick={() => setMode(option.id)}
            className={cn(
              "border px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide transition-colors duration-200",
              mode === option.id
                ? "border-signal bg-signal/12 text-signal"
                : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === "classify" ? <ClassifyPanel /> : <ClusterPanel />}
    </div>
  );
}

/* ------------------------------ classification ----------------------------- */

function ClassifyPanel() {
  const data = useMemo(() => makeClassificationSet(), []);
  const [model, setModel] = useState<LinearModel>(START_MODEL);
  const [steps, setSteps] = useState(0);
  const [running, setRunning] = useState(false);
  const reduceMotion = useMotionPreference();

  // The training loop reads and writes through refs so a frame never depends
  // on state that React has not committed yet.
  const modelRef = useRef(model);
  const stepsRef = useRef(0);
  const frameRef = useRef(0);

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    setRunning(false);
  }, []);

  const train = useCallback(() => {
    if (running) {
      stop();
      return;
    }
    setRunning(true);

    const tick = () => {
      let next = modelRef.current;
      const batch = reduceMotion ? MAX_STEPS : STEPS_PER_FRAME;

      for (let i = 0; i < batch && stepsRef.current < MAX_STEPS; i += 1) {
        next = gradientStep(next, data, LEARNING_RATE);
        stepsRef.current += 1;
      }

      modelRef.current = next;
      setModel(next);
      setSteps(stepsRef.current);

      if (stepsRef.current >= MAX_STEPS) {
        frameRef.current = 0;
        setRunning(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [data, reduceMotion, running, stop]);

  const reset = useCallback(() => {
    stop();
    modelRef.current = START_MODEL;
    stepsRef.current = 0;
    setModel(START_MODEL);
    setSteps(0);
  }, [stop]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const loss = crossEntropyLoss(model, data);
  const matrix = confusionMatrix(model, data);
  const metrics = metricsFrom(matrix);
  const boundary = boundaryPoints(model, -DOMAIN, DOMAIN);

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-start">
      <div>
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="h-auto w-full border border-line bg-canvas"
          role="img"
          aria-label={`Scatter plot of two classes with the current decision boundary after ${steps} gradient descent steps. Accuracy ${(metrics.accuracy * 100).toFixed(1)} percent.`}
        >
          <defs>
            <clipPath id="ml-clip">
              <rect x={PAD} y={PAD} width={VIEW - PAD * 2} height={VIEW - PAD * 2} />
            </clipPath>
          </defs>

          <g stroke="var(--color-line)" strokeWidth="0.5">
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={`v${fraction}`}
                x1={PAD + fraction * (VIEW - PAD * 2)}
                y1={PAD}
                x2={PAD + fraction * (VIEW - PAD * 2)}
                y2={VIEW - PAD}
              />
            ))}
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={`h${fraction}`}
                x1={PAD}
                y1={PAD + fraction * (VIEW - PAD * 2)}
                x2={VIEW - PAD}
                y2={PAD + fraction * (VIEW - PAD * 2)}
              />
            ))}
          </g>
          <rect
            x={PAD}
            y={PAD}
            width={VIEW - PAD * 2}
            height={VIEW - PAD * 2}
            fill="none"
            stroke="var(--color-line-bright)"
            strokeWidth="0.75"
          />

          {boundary ? (
            <line
              x1={toPx(boundary.x1)}
              y1={VIEW - toPx(boundary.y1)}
              x2={toPx(boundary.x2)}
              y2={VIEW - toPx(boundary.y2)}
              stroke="var(--color-signal)"
              strokeWidth="1.5"
              clipPath="url(#ml-clip)"
            />
          ) : null}

          {data.map((point, index) => {
            const correct = (predictProbability(model, point) >= 0.5 ? 1 : 0) === point.label;
            return (
              <circle
                key={index}
                cx={toPx(point.x)}
                cy={VIEW - toPx(point.y)}
                r={2.6}
                fill={point.label === 1 ? "var(--color-ink)" : "none"}
                stroke={correct ? "var(--color-ink-dim)" : "var(--color-signal)"}
                strokeWidth={correct ? 0.9 : 1.4}
                opacity={correct ? 0.8 : 1}
              />
            );
          })}
        </svg>

        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.625rem] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-1.5 rounded-full bg-ink" /> class 1
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-1.5 rounded-full border border-ink-dim" /> class 0
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-1.5 rounded-full border-[1.5px] border-signal" />{" "}
            misclassified
          </span>
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={running ? "outline" : "signal"} onClick={train}>
            {running ? "Pause" : steps >= MAX_STEPS ? "Converged" : "Train"}
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset
          </Button>
          <MonoLabel className="ml-auto">
            step {String(steps).padStart(3, "0")} / {MAX_STEPS}
          </MonoLabel>
        </div>

        <div className="mt-4 h-1 w-full bg-line">
          <div
            className="h-full bg-signal transition-[width] duration-150 ease-linear"
            style={{ width: `${(steps / MAX_STEPS) * 100}%` }}
          />
        </div>

        {/* Confusion matrix */}
        <div className="mt-6">
          <MonoLabel>Confusion matrix</MonoLabel>
          <div className="mt-2.5 grid grid-cols-[auto_1fr_1fr] gap-px border border-line bg-line text-center">
            <span className="bg-panel-2 px-2 py-2" />
            <span className="bg-panel-2 px-2 py-2 font-mono text-[0.625rem] text-ink-faint">
              pred 1
            </span>
            <span className="bg-panel-2 px-2 py-2 font-mono text-[0.625rem] text-ink-faint">
              pred 0
            </span>

            <span className="bg-panel-2 px-2 py-3 font-mono text-[0.625rem] text-ink-faint">
              act 1
            </span>
            <MatrixCell value={matrix.truePositive} good />
            <MatrixCell value={matrix.falseNegative} />

            <span className="bg-panel-2 px-2 py-3 font-mono text-[0.625rem] text-ink-faint">
              act 0
            </span>
            <MatrixCell value={matrix.falsePositive} />
            <MatrixCell value={matrix.trueNegative} good />
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {[
            { label: "Accuracy", value: metrics.accuracy },
            { label: "Precision", value: metrics.precision },
            { label: "Recall", value: metrics.recall },
            { label: "F1", value: metrics.f1 },
          ].map((metric) => (
            <div key={metric.label}>
              <dt>
                <MonoLabel>{metric.label}</MonoLabel>
              </dt>
              <dd className="mt-1 font-mono text-sm text-ink tabular-nums">
                {metric.value.toFixed(3)}
              </dd>
            </div>
          ))}
          <div>
            <dt>
              <MonoLabel>Loss</MonoLabel>
            </dt>
            <dd className="mt-1 font-mono text-sm text-signal tabular-nums">{loss.toFixed(4)}</dd>
          </div>
        </dl>

        <p className="mt-5 text-[0.6875rem] leading-relaxed text-ink-faint">
          Logistic regression, batch gradient descent on cross-entropy loss, learning rate{" "}
          {LEARNING_RATE}. The classes overlap on purpose — a dataset that separates
          perfectly makes precision and recall meaningless.
        </p>
      </div>
    </div>
  );
}

function MatrixCell({ value, good = false }: { value: number; good?: boolean }) {
  return (
    <span
      className={cn(
        "bg-canvas px-2 py-3 font-mono text-sm tabular-nums transition-colors duration-200",
        good ? "text-ink" : value > 0 ? "text-signal" : "text-ink-faint",
      )}
    >
      {value}
    </span>
  );
}

/* -------------------------------- clustering ------------------------------- */

const CLUSTER_COLORS = ["var(--color-signal)", "var(--color-live)", "var(--color-ink-dim)"];

function ClusterPanel() {
  const points = useMemo(() => makeClusterSet(), []);
  const [centroids, setCentroids] = useState<Centroid[]>(() => initialCentroids());
  const [iteration, setIteration] = useState(0);

  const assignments = useMemo(() => assignClusters(points, centroids), [points, centroids]);

  const step = () => {
    setCentroids((current) => updateCentroids(points, assignClusters(points, current), current));
    setIteration((value) => value + 1);
  };

  const reset = () => {
    setCentroids(initialCentroids());
    setIteration(0);
  };

  const inertia = points.reduce((sum, point, index) => {
    const centroid = centroids[assignments[index]];
    return sum + (point.x - centroid.x) ** 2 + (point.y - centroid.y) ** 2;
  }, 0);

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-start">
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="h-auto w-full border border-line bg-canvas"
        role="img"
        aria-label={`K-means clustering with three centroids after ${iteration} iterations. Within-cluster sum of squares is ${inertia.toFixed(2)}.`}
      >
        <rect
          x={PAD}
          y={PAD}
          width={VIEW - PAD * 2}
          height={VIEW - PAD * 2}
          fill="none"
          stroke="var(--color-line-bright)"
          strokeWidth="0.75"
        />

        {/* Membership lines make the assignment step visible. */}
        <g strokeWidth="0.4" opacity="0.35">
          {points.map((point, index) => {
            const centroid = centroids[assignments[index]];
            return (
              <line
                key={index}
                x1={toPx(point.x)}
                y1={VIEW - toPx(point.y)}
                x2={toPx(centroid.x)}
                y2={VIEW - toPx(centroid.y)}
                stroke={CLUSTER_COLORS[assignments[index]]}
              />
            );
          })}
        </g>

        {points.map((point, index) => (
          <circle
            key={index}
            cx={toPx(point.x)}
            cy={VIEW - toPx(point.y)}
            r={2.4}
            fill={CLUSTER_COLORS[assignments[index]]}
            opacity="0.85"
          />
        ))}

        {centroids.map((centroid, index) => (
          <g key={index}>
            <circle
              cx={toPx(centroid.x)}
              cy={VIEW - toPx(centroid.y)}
              r={6}
              fill="var(--color-canvas)"
              stroke={CLUSTER_COLORS[index]}
              strokeWidth="1.5"
            />
            <path
              d={`M ${toPx(centroid.x) - 3} ${VIEW - toPx(centroid.y)} H ${toPx(centroid.x) + 3} M ${toPx(centroid.x)} ${VIEW - toPx(centroid.y) - 3} V ${VIEW - toPx(centroid.y) + 3}`}
              stroke={CLUSTER_COLORS[index]}
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="signal" onClick={step}>
            Iterate
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset
          </Button>
          <MonoLabel className="ml-auto">iter {String(iteration).padStart(2, "0")}</MonoLabel>
        </div>

        <dl className="mt-6 space-y-4">
          <div>
            <dt>
              <MonoLabel>k</MonoLabel>
            </dt>
            <dd className="mt-1 font-mono text-sm text-ink">3</dd>
          </div>
          <div>
            <dt>
              <MonoLabel>Within-cluster sum of squares</MonoLabel>
            </dt>
            <dd className="mt-1 font-mono text-sm text-signal tabular-nums">
              {inertia.toFixed(3)}
            </dd>
          </div>
        </dl>

        <p className="mt-5 text-[0.6875rem] leading-relaxed text-ink-faint">
          Lloyd&apos;s algorithm, one iteration per press: assign every point to its nearest
          centroid, then move each centroid to the mean of its members. The centroids start
          badly placed so the first few moves are worth watching, and the inertia falls
          monotonically until it stops changing.
        </p>
      </div>
    </div>
  );
}
