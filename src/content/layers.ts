import type { Layer, LayerId } from "@/types/content";

/**
 * The site's organising metaphor: a portfolio as a system with five layers.
 * Order matters — it is rendered top-to-bottom as a signal path.
 */
export const layers: Layer[] = [
  {
    id: "hardware",
    index: "L0",
    name: "Hardware",
    tagline: "Volts and physics",
    blurb:
      "Analog circuits, transistor amplifiers, and filters — where a design meets physics and stops being an abstraction.",
    signals: ["Analog circuits", "Amplifiers", "Filters", "LTspice", "Digital logic"],
  },
  {
    id: "embedded",
    index: "L1",
    name: "Embedded",
    tagline: "Where code touches the world",
    blurb:
      "Microcontroller firmware driving real peripherals: timers, interrupts, and buses that have to meet deadlines.",
    signals: ["MSP430", "ADC", "PWM", "UART", "I2C", "Timers"],
  },
  {
    id: "software",
    index: "L2",
    name: "Software",
    tagline: "Structure and interfaces",
    blurb:
      "Typed application code — components, state, and the contracts between a front end and the services behind it.",
    signals: ["TypeScript", "React", "Next.js", "C", "C++", "Java", "Python"],
  },
  {
    id: "ai",
    index: "L3",
    name: "Machine Learning",
    tagline: "Inference from data",
    blurb:
      "Classification, regression, and clustering — plus the evaluation discipline that tells you whether a model is real.",
    signals: ["Classification", "Regression", "Clustering", "Evaluation"],
  },
  {
    id: "systems",
    index: "L4",
    name: "Systems",
    tagline: "Services that stay up",
    blurb:
      "Databases, APIs, authentication, and the deployment path — the parts that decide whether software survives contact with users.",
    signals: ["PostgreSQL", "REST APIs", "Auth / RBAC", "Docker", "CI"],
  },
];

export const layerById = Object.fromEntries(
  layers.map((layer) => [layer.id, layer]),
) as Record<LayerId, Layer>;

