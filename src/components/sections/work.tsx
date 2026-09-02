import { projects } from "@/content/projects";
import { Panel, SectionHeading } from "@/components/ui/primitives";
import { ProjectCard } from "@/components/projects/project-card";

export function Work() {
  return (
    <Panel id="work">
      <SectionHeading
        index="02"
        eyebrow="Selected work"
        title="Things I built, and what each one cost me"
        lede="They do not look alike because they were not alike — a service topology and a microcontroller are different problems, and the page should say so."
        meta={[
          { label: "Entries", value: String(projects.length).padStart(2, "0") },
          {
            label: "Treatments",
            value: String(new Set(projects.map((project) => project.visual)).size).padStart(2, "0"),
          },
          {
            label: "Layers spanned",
            value: `${new Set(projects.flatMap((project) => project.layers)).size} / 5`,
          },
        ]}
      />

      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </Panel>
  );
}
