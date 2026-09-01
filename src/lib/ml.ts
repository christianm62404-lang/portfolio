/**
 * A small, honest machine-learning implementation used by the ML visual.
 *
 * Everything here runs in the browser on a deterministic synthetic dataset:
 * logistic regression trained by batch gradient descent, k-means by Lloyd's
 * algorithm, and the standard evaluation metrics computed from the resulting
 * confusion matrix. Nothing is precomputed or faked — the numbers on screen
 * are the numbers these functions return.
 */

import { gaussian, mulberry32 } from "@/lib/utils";

export interface Point {
  x: number;
  y: number;
  /** Ground-truth class, 0 or 1. */
  label: 0 | 1;
}

/** Weights for a 2-feature logistic model: w1*x + w2*y + b. */
export interface LinearModel {
  w1: number;
  w2: number;
  b: number;
}

export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface Metrics extends ConfusionMatrix {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

/**
 * Two overlapping Gaussian clusters. The overlap is intentional: a dataset a
 * model separates perfectly makes the evaluation metrics meaningless.
 */
export function makeClassificationSet(seed = 7, perClass = 45): Point[] {
  const random = mulberry32(seed);
  const points: Point[] = [];
  for (let i = 0; i < perClass; i += 1) {
    points.push({ x: gaussian(random, -0.42, 0.3), y: gaussian(random, -0.3, 0.32), label: 0 });
    points.push({ x: gaussian(random, 0.42, 0.3), y: gaussian(random, 0.3, 0.32), label: 1 });
  }
  return points;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export const predictProbability = (model: LinearModel, point: Pick<Point, "x" | "y">) =>
  sigmoid(model.w1 * point.x + model.w2 * point.y + model.b);

/** One batch gradient-descent step on binary cross-entropy loss. */
export function gradientStep(model: LinearModel, data: Point[], learningRate: number): LinearModel {
  let dW1 = 0;
  let dW2 = 0;
  let dB = 0;

  for (const point of data) {
    const error = predictProbability(model, point) - point.label;
    dW1 += error * point.x;
    dW2 += error * point.y;
    dB += error;
  }

  const n = data.length || 1;
  return {
    w1: model.w1 - (learningRate * dW1) / n,
    w2: model.w2 - (learningRate * dW2) / n,
    b: model.b - (learningRate * dB) / n,
  };
}

/** Mean binary cross-entropy, so the loss curve is the real objective. */
export function crossEntropyLoss(model: LinearModel, data: Point[]): number {
  if (data.length === 0) return 0;
  let total = 0;
  for (const point of data) {
    const p = Math.min(Math.max(predictProbability(model, point), 1e-9), 1 - 1e-9);
    total += -(point.label * Math.log(p) + (1 - point.label) * Math.log(1 - p));
  }
  return total / data.length;
}

export function confusionMatrix(model: LinearModel, data: Point[], threshold = 0.5): ConfusionMatrix {
  const matrix: ConfusionMatrix = {
    truePositive: 0,
    falsePositive: 0,
    trueNegative: 0,
    falseNegative: 0,
  };

  for (const point of data) {
    const predicted = predictProbability(model, point) >= threshold ? 1 : 0;
    if (predicted === 1 && point.label === 1) matrix.truePositive += 1;
    else if (predicted === 1 && point.label === 0) matrix.falsePositive += 1;
    else if (predicted === 0 && point.label === 0) matrix.trueNegative += 1;
    else matrix.falseNegative += 1;
  }

  return matrix;
}

export function metricsFrom(matrix: ConfusionMatrix): Metrics {
  const { truePositive, falsePositive, trueNegative, falseNegative } = matrix;
  const total = truePositive + falsePositive + trueNegative + falseNegative;
  const precision = truePositive + falsePositive === 0 ? 0 : truePositive / (truePositive + falsePositive);
  const recall = truePositive + falseNegative === 0 ? 0 : truePositive / (truePositive + falseNegative);
  return {
    ...matrix,
    accuracy: total === 0 ? 0 : (truePositive + trueNegative) / total,
    precision,
    recall,
    f1: precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall),
  };
}

/**
 * The decision boundary is where w1*x + w2*y + b = 0. Returned as the two
 * endpoints of that line across the given x-range, or null when the model is
 * still degenerate (w2 ≈ 0 makes the line vertical/undefined in this form).
 */
export function boundaryPoints(model: LinearModel, xMin: number, xMax: number) {
  if (Math.abs(model.w2) < 1e-6) return null;
  const yAt = (x: number) => -(model.w1 * x + model.b) / model.w2;
  return { x1: xMin, y1: yAt(xMin), x2: xMax, y2: yAt(xMax) };
}

/* ------------------------------- clustering ------------------------------- */

export interface Centroid {
  x: number;
  y: number;
}

export function makeClusterSet(seed = 21, k = 3, perCluster = 26) {
  const random = mulberry32(seed);
  const centres = [
    { x: -0.5, y: 0.42 },
    { x: 0.52, y: 0.3 },
    { x: 0.02, y: -0.5 },
  ].slice(0, k);

  return centres.flatMap((centre) =>
    Array.from({ length: perCluster }, () => ({
      x: gaussian(random, centre.x, 0.19),
      y: gaussian(random, centre.y, 0.19),
    })),
  );
}

export const initialCentroids = (k = 3): Centroid[] =>
  Array.from({ length: k }, (_, i) => ({
    // Deliberately poor initial placement so the first iterations visibly move.
    x: -0.62 + i * 0.12,
    y: 0.62 - i * 0.16,
  }));

export function assignClusters(points: Centroid[], centroids: Centroid[]): number[] {
  return points.map((point) => {
    let best = 0;
    let bestDistance = Infinity;
    centroids.forEach((centroid, index) => {
      const distance = (point.x - centroid.x) ** 2 + (point.y - centroid.y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return best;
  });
}

/** One Lloyd's-algorithm update. Empty clusters keep their previous centroid. */
export function updateCentroids(
  points: Centroid[],
  assignments: number[],
  centroids: Centroid[],
): Centroid[] {
  return centroids.map((centroid, index) => {
    const members = points.filter((_, i) => assignments[i] === index);
    if (members.length === 0) return centroid;
    return {
      x: members.reduce((sum, p) => sum + p.x, 0) / members.length,
      y: members.reduce((sum, p) => sum + p.y, 0) / members.length,
    };
  });
}
