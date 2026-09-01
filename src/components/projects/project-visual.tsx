import type { Project } from "@/types/content";
import { TopologyVisual } from "@/components/visuals/topology";
import { AppShellVisual } from "@/components/visuals/app-shell";
import { BoardVisual } from "@/components/visuals/board";
import { ScheduleVisual } from "@/components/visuals/schedule";
import { SiteFrameVisual } from "@/components/visuals/site-frame";

/**
 * Maps a project to its visual treatment.
 *
 * Each project renders through a different component on purpose: an
 * architecture diagram, an application shell, an instrument panel, a data
 * plot, a browser frame. Adding a treatment means adding a case here and a
 * value to ProjectVisual — nothing else changes.
 */
export function ProjectVisualSwitch({ project }: { project: Project }) {
  switch (project.visual) {
    case "topology":
      return <TopologyVisual />;
    case "appshell":
      return <AppShellVisual />;
    case "board":
      return <BoardVisual />;
    case "schedule":
      return <ScheduleVisual />;
    case "site":
      return <SiteFrameVisual url={project.links?.[0]?.href ?? "https://example.com"} />;
    default:
      return null;
  }
}
