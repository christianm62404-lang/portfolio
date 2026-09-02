import type { CertificationEntry, EducationEntry, ExperienceRole } from "@/types/content";

export const experience: ExperienceRole[] = [
  {
    id: "intrastack",
    company: "Intrastack Solutions",
    title: "Developer Intern",
    location: "Orlando, FL",
    period: "Feb 2026 — Present",
    current: true,
    summary:
      "Enterprise software and AI-driven web applications alongside the engineering team, across both the retail management and proposal management platforms.",
    highlights: [
      "Lead the front-end track on BidOps AI: application shell, auth flows, and the proposal workspace.",
      "Work the CRM side of the Dragon POS platform, including a tenant-aware customer profile service.",
      "Identified and helped close authentication and access-control gaps, not only shipped features.",
      "Organise work in an Agile team, with debugging, testing, and code review as routine.",
    ],
    stack: ["TypeScript", "React", "Next.js", "NestJS", "PostgreSQL", "REST APIs", "Supabase Auth", "RBAC"],
  },
  {
    id: "haan",
    company: "Haan Coffee",
    title: "Cafe Operations Worker",
    location: "Orlando, FL",
    period: "May 2023 — Present",
    current: true,
    summary:
      "Front-of-house and operations in a high-volume cafe — worked alongside a full course load and the internship.",
    highlights: [
      "Handle orders, preparation, stocking, and equipment during peak service.",
      "The kind of job that teaches you to keep a queue moving and to stay precise when it is busy.",
    ],
  },
];

export const education: EducationEntry[] = [
  {
    id: "ucf",
    institution: "University of Central Florida",
    credential: "B.S. Computer Engineering",
    period: "2023 — 2027",
    current: true,
    detail: "Expected graduation May 2027. Orlando, FL.",
  },
  {
    id: "uf",
    institution: "University of Florida",
    credential: "Computer Engineering",
    period: "2022 — 2023",
    current: false,
  },
  {
    id: "sfc",
    institution: "Santa Fe College",
    credential: "Computer Engineering",
    period: "2022 — 2023",
    current: false,
  },
];

export const certifications: CertificationEntry[] = [
  { name: "Database Foundations" },
  { name: "Relational Databases Essential Training" },
  { name: "Python Programming with Data Analysis" },
  { name: "Excel Boot Camp" },
];
