import { skillGroups } from "@/content/skills";
import { MonoLabel, Section, SectionHeading, Tag } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { BodePlot } from "@/components/visuals/bode-plot";
import { MlLab } from "@/components/visuals/ml-lab";

const electronics = skillGroups.find((group) => group.id === "electronics");
const ml = skillGroups.find((group) => group.id === "ml");

/**
 * Electronics and machine learning are coursework and study rather than
 * shipped products, so they get a different treatment from Work: two live
 * instruments the visitor can operate, with the underlying topics listed
 * beside them instead of claimed as projects.
 */
export function Labs() {
  return (
    <Section id="labs" className="border-t border-line">
      <SectionHeading
        index="03"
        eyebrow="Lab"
        title="The parts I study, running"
        lede="Neither of these is a product. They are the two subjects I keep going back to, built here as working instruments — the maths behind both is in the repository, and the numbers on screen come out of it."
        meta={[
          { label: "Instruments", value: "02" },
          { label: "Computation", value: "client-side" },
          { label: "Source", value: "lib/signal, lib/ml" },
        ]}
      />

      <div className="mt-16 space-y-16 md:space-y-24">
        <LabPanel
          index="A"
          title="Electronics"
          caption="Frequency response"
          description="Analog design analysed on paper, verified in LTspice, then built. Filters and amplifiers are where a transfer function stops being algebra and starts being a component you have to choose."
          topics={electronics?.items ?? []}
        >
          <BodePlot />
        </LabPanel>

        <LabPanel
          index="B"
          title="Machine learning"
          caption="Training & evaluation"
          description="The mathematics first: gradient descent, decision boundaries, and the evaluation discipline that decides whether a model is worth anything. Accuracy on its own is a number that hides things."
          topics={ml?.items ?? []}
        >
          <MlLab />
        </LabPanel>
      </div>
    </Section>
  );
}

function LabPanel({
  index,
  title,
  caption,
  description,
  topics,
  children,
}: {
  index: string;
  title: string;
  caption: string;
  description: string;
  topics: string[];
  children: React.ReactNode;
}) {
  return (
    <Reveal as="article" className="grid gap-8 border-t border-line pt-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
      <header>
        <div className="flex items-center gap-4">
          <MonoLabel className="text-signal">{index}</MonoLabel>
          <MonoLabel>{caption}</MonoLabel>
        </div>
        <h3 className="mt-4 text-[clamp(1.6rem,3.4vw,2.25rem)] leading-tight font-semibold">
          {title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">{description}</p>
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {topics.map((topic) => (
            <li key={topic}>
              <Tag>{topic}</Tag>
            </li>
          ))}
        </ul>
      </header>

      <div className="border border-line bg-panel p-4 sm:p-6">{children}</div>
    </Reveal>
  );
}
