import type { Principle } from "@/types/content";

/** How I work. Written to sound like a person, not a careers page. */
export const principles: Principle[] = [
  {
    index: "01",
    title: "Understand the system",
    body: "I would rather know why a tool works than memorise its API. Treating a framework as a black box is fine until it breaks, and then it is the only thing that matters.",
  },
  {
    index: "02",
    title: "Build the thing",
    body: "I learn by making something real and finding out where my mental model was wrong. Reading about interrupt handling taught me less than one afternoon of a timer firing when I did not expect it.",
  },
  {
    index: "03",
    title: "Debug across layers",
    body: "The interesting bugs live at boundaries — between firmware and a peripheral, a client and an API, a schema and the query on top of it. I like the ones where the cause is a layer away from the symptom.",
  },
  {
    index: "04",
    title: "Let the halves talk",
    body: "Hardware taught me about timing, constraints, and failure modes. Software taught me about abstraction and structure. Each one makes me better at the other, which is why I have not picked a side.",
  },
  {
    index: "05",
    title: "Keep the range growing",
    body: "The list of things I can work on is longer than it was last year. I intend for that to stay true, and I pick projects that make it true.",
  },
];
