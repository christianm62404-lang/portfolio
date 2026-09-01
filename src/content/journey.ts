import type { JourneyStage } from "@/types/content";

/**
 * Broad stages, not dates. The point is that the breadth was cumulative —
 * each stage is the previous one asked at a different level of abstraction.
 */
export const journey: JourneyStage[] = [
  {
    id: "curiosity",
    marker: "Start",
    title: "Wanting to know how it worked",
    layer: "hardware",
    body: "Before any of it was a major, it was the same question asked about whatever was nearby: what is actually happening inside this thing, and why does it do that and not something else?",
  },
  {
    id: "electronics",
    marker: "Stage 01",
    title: "Electronics",
    layer: "hardware",
    body: "Transistors, biasing, amplifiers, filters. Analysing a circuit on paper, simulating it in LTspice, then building it and finding out which of my assumptions were wrong.",
  },
  {
    id: "programming",
    marker: "Stage 02",
    title: "Programming",
    layer: "software",
    body: "Java first, then C. Learning that a program is a system with its own structure, and that the difference between code that works and code you can change is not a small one.",
  },
  {
    id: "embedded",
    marker: "Stage 03",
    title: "Embedded systems",
    layer: "embedded",
    body: "The two halves met. MSP430 firmware where a mistake in a timer register shows up as a sensor reading that is quietly wrong — the first time debugging meant reasoning about hardware and software at once.",
  },
  {
    id: "cs",
    marker: "Stage 04",
    title: "Computer architecture & CS",
    layer: "embedded",
    body: "Verilog, MIPS assembly, computer architecture. Following the abstraction all the way down until the layer between a line of C and a voltage on a wire stopped being a mystery.",
  },
  {
    id: "ml",
    marker: "Stage 05",
    title: "Machine learning",
    layer: "ai",
    body: "Classification, regression, clustering — and the evaluation side that matters more. A confusion matrix is a more honest description of a model than its accuracy is.",
  },
  {
    id: "swe",
    marker: "Stage 06",
    title: "Software engineering",
    layer: "software",
    body: "Working on real applications with other people: typed front ends, code review, tests, and the discovery that most of engineering is communication and constraint.",
  },
  {
    id: "systems",
    marker: "Now",
    title: "Full-stack & cloud systems",
    layer: "systems",
    body: "Multi-service platforms — databases, queues, caches, authentication, and deployment. Which is, in the end, the same question as the first one, asked about something much larger.",
  },
];
