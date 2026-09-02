/**
 * Content model for the site.
 *
 * Everything the visitor reads lives in `src/content` as typed data, never
 * inline in a component. Adding a project, a role, a skill group, or a
 * timeline stage is a data edit — the rendering layer adapts on its own.
 */

/** The five layers of the stack. Used as the site's recurring organising idea. */
export type LayerId = "hardware" | "embedded" | "software" | "ai" | "systems";

export interface Layer {
  id: LayerId;
  index: string;
  name: string;
  /** Two or three words shown under the layer name in the hero and diagram. */
  tagline: string;
  /** One sentence, first person, describing what this layer means in practice. */
  blurb: string;
  /** Representative technologies. Kept short — this is a signature, not an inventory. */
  signals: string[];
}

/** Determines which visual treatment a project renders with. */
export type ProjectVisual = "topology" | "appshell" | "schedule" | "board";

export interface ProjectLink {
  label: string;
  href: string;
  /** Marks a link the owner still needs to fill in, so it renders as disabled. */
  pending?: boolean;
}

export interface Project {
  slug: string;
  index: string;
  name: string;
  /** Short line under the title, e.g. the product category. */
  kicker: string;
  /** Where the work happened. */
  context: string;
  /** Personal contribution — stated plainly, never inflated. */
  role: string;
  /** Omitted where a real date range is not known — the card drops the row. */
  period?: string;
  /** One or two sentences that would make sense to a non-specialist. */
  summary: string;
  /** The layers this project touches; drives the system diagram links. */
  layers: LayerId[];
  stack: string[];
  /**
   * The three fields below are optional on purpose. When a project's details
   * are not yet written up, the card omits the block entirely rather than
   * rendering an empty placeholder.
   */
  /** The genuinely hard part. */
  challenge?: string;
  /** What shipped or what the work produced. Never invented metrics. */
  outcome?: string;
  /** What the work changed about how the author thinks. */
  learned?: string;
  visual: ProjectVisual;
  links?: ProjectLink[];
  /** Optional caveat rendered as a small note, e.g. for proprietary work. */
  note?: string;
}

export interface SkillGroup {
  id: string;
  index: string;
  name: string;
  layer: LayerId;
  /** One line explaining how these fit together. */
  description: string;
  items: string[];
}

export interface ExperienceRole {
  id: string;
  company: string;
  title: string;
  location: string;
  period: string;
  current: boolean;
  summary: string;
  highlights: string[];
  stack?: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  credential: string;
  period: string;
  current: boolean;
  detail?: string;
}



export interface CertificationEntry {
  name: string;
}
