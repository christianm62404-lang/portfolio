import { skillGroups } from "@/content/skills";
import { MonoLabel, Panel, SectionHeading, Tag } from "@/components/ui/primitives";
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
    <Panel id="labs">
      <SectionHeading
        index="03"
        eyebrow="Lab"
        title="The parts I study, running"
        lede="Neither is a product. They are the two subjects I keep going back to, built here as working instruments — the numbers on screen come out of the maths in the repository."
        meta={[
          { label: "Instruments", value: "02" },
          { label: "Computation", value: "client-side" },
          { label: "Source", value: "lib/signal, lib/ml" },
        ]}
      />

      <LabPanel
        index="A"
        title="Electronics"
        caption="Frequency response"
        description="Analog design analysed on paper, verified in LTspice, then built. Filters are where a transfer function stops being algebra and starts being a component you have to choose."
        topics={electronics?.items ?? []}
      >
        <BodePlot />
      </LabPanel>

      <LabPanel
        index="B"
        title="Machine learning"
        caption="Training & evaluation"
        description="The mathematics first: gradient descent, decision boundaries, and the evaluation discipline that decides whether a model is worth anything. Accuracy alone is a number that hides things."
        topics={ml?.items ?? []}
      >
        <MlLab />
      </LabPanel>
    </Panel>
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
    <>
      <Reveal className="col col-xs border-l border-line pl-8">
        <div className="flex items-center gap-3">
          <MonoLabel className="text-signal">{index}</MonoLabel>
          <MonoLabel>{caption}</MonoLabel>
        </div>
        <h3 className="mt-3 text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-semibold">
          {title}
        </h3>
        <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-dim">{description}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {topics.map((topic) => (
            <li key={topic}>
              <Tag>{topic}</Tag>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.06} className="col col-xl">
        <div className="border border-line bg-panel p-5 sm:p-6">{children}</div>
      </Reveal>
    </>
  );
}
