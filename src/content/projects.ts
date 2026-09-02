import type { Project } from "@/types/content";

/**
 * Work, ordered by how much it says about how I build.
 *
 * Two of these are professional projects at Intrastack Solutions. Their
 * descriptions stay at the architectural level on purpose — no internal
 * implementation details, schemas, or client information appear here.
 *
 * To add a project: append an entry, give it a `visual` from ProjectVisual,
 * and — if it needs a new treatment — add a case in components/visuals.
 */
export const projects: Project[] = [
  {
    slug: "dragon-pos",
    index: "01",
    name: "Dragon POS / CRM",
    kicker: "Enterprise retail management platform",
    context: "Intrastack Solutions",
    role: "Developer intern — CRM and customer-service side",
    period: "2026 — Present",
    summary:
      "A cloud-oriented point-of-sale and CRM platform built as a set of cooperating services rather than a single application. I work on the customer side of it.",
    layers: ["software", "systems"],
    stack: [
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Redis",
      "Kafka",
      "JWT + refresh tokens",
      "Docker",
      "GitHub Actions",
    ],
    challenge:
      "A Customer Profile Service where every read and write is tenant-aware. Soft deletion so history survives, and GDPR-oriented deletion that genuinely removes a person — two requirements pulling opposite ways in one data model.",
    outcome:
      "Customer CRUD and lookup endpoints running inside the wider service architecture, built to the platform's REST conventions and reviewed by the team before merge.",
    learned:
      "That multi-tenancy is not a filter you remember to add — it belongs in the layer underneath the queries, because anywhere it is optional is eventually where it gets forgotten.",
    visual: "topology",
    note: "Described at an architectural level. No proprietary implementation details are shown.",
  },
  {
    slug: "bidops-ai",
    index: "02",
    name: "BidOps AI",
    kicker: "AI-powered proposal management platform",
    context: "Intrastack Solutions",
    role: "Front-end track lead",
    period: "2026 — Present",
    summary:
      "An enterprise platform for managing proposal and document workflows. I lead the front-end track: the application shell, the authentication flows, and the proposal workspace.",
    layers: ["software", "ai", "systems"],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "TanStack Query",
      "React Hook Form",
      "Zod",
      "Supabase SSR auth",
      "Vitest",
    ],
    challenge:
      "Role-based access control that holds at every layer. A hidden nav link is not access control — the route, the middleware, and the server-side session all have to agree, and I found and closed gaps where they did not.",
    outcome:
      "An application shell with protected routes, server-side session handling, schema-validated forms, and a Vitest suite covering the authentication paths.",
    learned:
      "Front-end engineering is mostly about trust boundaries. The interface is the last place a permission decision should be made, not the first.",
    visual: "appshell",
    note: "Described at an architectural level. No proprietary implementation details are shown.",
  },
  {
    slug: "msp430",
    index: "03",
    name: "MSP430 Sensing Prototype",
    kicker: "Embedded hardware / software integration",
    context: "Embedded systems coursework and lab work",
    role: "Firmware and hardware",
    period: "University project",
    summary:
      "A microcontroller prototype that reads the physical world and reacts to it: ultrasonic distance in, LCD and MOSFET-switched output out, with everything in between running on a 16-bit MCU.",
    layers: ["hardware", "embedded"],
    stack: [
      "MSP430FR6989",
      "MSP430G2553",
      "C",
      "ADC",
      "PWM",
      "Timers",
      "UART",
      "I2C",
      "GPIO",
      "Ultrasonic sensor",
      "MOSFET switching",
    ],
    challenge:
      "Timing. An ultrasonic echo is measured in microseconds, the LCD wants writing slowly, and the PWM cannot stutter while either happens. Sharing one timer subsystem meant thinking in interrupts, not sequential code.",
    outcome:
      "A working prototype: distance sensed and displayed live, an ADC-read potentiometer driving PWM duty cycle, and a MOSFET switching a load the MCU could not drive directly.",
    learned:
      "On a microcontroller you can see your own bugs. An oscilloscope shows you the mistake in the signal, which is a very different debugging experience from reading a stack trace.",
    visual: "board",
  },
  {
    slug: "timetrack",
    index: "04",
    name: "TimeTrack",
    kicker: "Workforce management & time tracking",
    context: "Team project — deployed at markstevens.tech",
    role: "Front-end and mobile developer",
    summary:
      "An application for scheduling, time tracking, task management, and productivity reporting, built by a team. I worked on the front end and the mobile side, building the interfaces people actually schedule and log their time in.",
    layers: ["software"],
    stack: ["React", "TypeScript", "REST APIs", "Git"],
    challenge:
      "Planned time and actual time are not the same thing, and most trackers conflate them. Keeping scheduled blocks and logged entries distinct in the interface — on a phone screen as well as a desktop one — is what makes the difference visible.",
    outcome:
      "Scheduling and logging views across web and mobile, consuming the platform's APIs, deployed and reachable rather than sitting in a repository.",
    learned:
      "Working on one part of a shared codebase means the contract with everyone else is the thing to get right. The interface can only be as clear as the data it is handed.",
    visual: "schedule",
    links: [{ label: "Visit markstevens.tech", href: "https://markstevens.tech" }],
  },
];
