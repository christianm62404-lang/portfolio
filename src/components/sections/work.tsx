import { projects } from "@/content/projects";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { ProjectCard } from "@/components/projects/project-card";

export function Work() {
  return (
    <Section id="work" className="border-t border-line">
      <SectionHeading
        index="02"
        eyebrow="Selected work"
        title="Things I built, and what each one cost me"
        lede="Professional work, coursework, and one project that is entirely mine. They do not look alike because they were not alike — a service topology and a microcontroller are different problems, and the page should say so."
        meta={[
          { label: "Entries", value: String(projects.length).padStart(2, "0") },
          { label: "Treatments", value: String(new Set(projects.map((p) => p.visual)).size).padStart(2, "0") },
          { label: "Layers spanned", value: `${new Set(projects.flatMap((p) => p.layers)).size} / 5` },
        ]}
      />

      <div className="mt-16 space-y-16 md:mt-20 md:space-y-24">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} flip={index % 2 === 1} />
        ))}
      </div>
    </Section>
  );
}
