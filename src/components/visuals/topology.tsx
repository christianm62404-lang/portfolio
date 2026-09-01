"use client";

import { MonoLabel } from "@/components/ui/primitives";
import { useMotionPreference } from "@/hooks/use-motion-preference";

interface Node {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  /** The node this project's work lives in. */
  focus?: boolean;
}

const H = 34;

const nodes: Node[] = [
  { id: "pos", label: "POS Client", x: 154, y: 12, w: 112 },
  { id: "gateway", label: "API Gateway", sub: "JWT · refresh", x: 140, y: 76, w: 140 },
  { id: "auth", label: "Auth", sub: "OAuth2 · MFA", x: 12, y: 142, w: 116 },
  { id: "profile", label: "Customer Profile", sub: "tenant-aware", x: 144, y: 142, w: 132, focus: true },
  { id: "orders", label: "Orders", x: 292, y: 142, w: 116 },
  { id: "pg", label: "PostgreSQL", sub: "Prisma", x: 12, y: 208, w: 116 },
  { id: "redis", label: "Redis", x: 144, y: 208, w: 132 },
  { id: "kafka", label: "Kafka", x: 292, y: 208, w: 116 },
];

const centre = (node: Node) => ({ x: node.x + node.w / 2, y: node.y + H / 2 });
const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

/** Orthogonal connector: down, across, down — the routing of a real diagram. */
function elbow(from: Node, to: Node) {
  const a = centre(from);
  const b = centre(to);
  const midY = (from.y + H + to.y) / 2;
  return `M ${a.x} ${from.y + H} V ${midY} H ${b.x} V ${to.y}`;
}

const edges: Array<[string, string]> = [
  ["pos", "gateway"],
  ["gateway", "auth"],
  ["gateway", "profile"],
  ["gateway", "orders"],
  ["auth", "pg"],
  ["profile", "pg"],
  ["profile", "redis"],
  ["orders", "kafka"],
];

/** The request path the pulse follows, highlighting the service I work on. */
const REQUEST_PATH = `${elbow(byId.pos, byId.gateway)} ${elbow(byId.gateway, byId.profile)} ${elbow(byId.profile, byId.pg)}`;

/**
 * Dragon POS is a set of cooperating services, so its visual is a topology
 * rather than a screenshot. The pulse traces one request from the client
 * through the gateway into the customer profile service and down to Postgres.
 */
export function TopologyVisual() {
  const reduceMotion = useMotionPreference();

  return (
    <figure className="relative h-full w-full bg-panel-2 p-4 sm:p-6">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <MonoLabel>Service topology</MonoLabel>
        <MonoLabel className="text-signal">req · customer lookup</MonoLabel>
      </figcaption>

      <svg
        viewBox="0 0 420 254"
        className="h-auto w-full"
        role="img"
        aria-label="Service topology diagram: a POS client calls an API gateway, which routes to auth, customer profile, and orders services, backed by PostgreSQL, Redis, and Kafka."
      >
        <defs>
          <pattern id="topo-grid" width="21" height="21" patternUnits="userSpaceOnUse">
            <path d="M21 0H0V21" fill="none" stroke="var(--color-line)" strokeWidth="0.5" opacity="0.55" />
          </pattern>
        </defs>
        <rect width="420" height="254" fill="url(#topo-grid)" />

        <g fill="none" stroke="var(--color-line-bright)" strokeWidth="1">
          {edges.map(([from, to]) => (
            <path key={`${from}-${to}`} d={elbow(byId[from], byId[to])} />
          ))}
        </g>

        {/* Active request path, drawn over the idle edges. */}
        <path
          d={REQUEST_PATH}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="1.25"
          opacity="0.5"
        />

        {!reduceMotion ? (
          <circle r="3" fill="var(--color-signal)">
            <animateMotion dur="4.2s" repeatCount="indefinite" path={REQUEST_PATH} />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.08;0.92;1"
              dur="4.2s"
              repeatCount="indefinite"
            />
          </circle>
        ) : null}

        {nodes.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={H}
              rx="2"
              fill={node.focus ? "color-mix(in oklab, var(--color-signal) 12%, var(--color-void))" : "var(--color-void)"}
              stroke={node.focus ? "var(--color-signal)" : "var(--color-line-bright)"}
              strokeWidth="1"
            />
            <text
              x={node.x + node.w / 2}
              y={node.sub ? node.y + 15 : node.y + 21}
              textAnchor="middle"
              fontSize="9.5"
              letterSpacing="0.04em"
              fill={node.focus ? "var(--color-signal)" : "var(--color-ink-dim)"}
            >
              {node.label}
            </text>
            {node.sub ? (
              <text
                x={node.x + node.w / 2}
                y={node.y + 26}
                textAnchor="middle"
                fontSize="7"
                letterSpacing="0.08em"
                fill="var(--color-ink-faint)"
              >
                {node.sub}
              </text>
            ) : null}
          </g>
        ))}
      </svg>

      <p className="mt-3 flex items-center gap-2 text-[0.6875rem] text-ink-faint">
        <span aria-hidden className="inline-block size-2 border border-signal bg-signal/25" />
        Highlighted: the service I work on.
      </p>
    </figure>
  );
}
