"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { skillGroups } from "@/content/skills";
import { layerById } from "@/content/layers";
import { MonoLabel, Panel, SectionHeading } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/**
 * Skills as a tab set rather than a list of logos or a wall of bars.
 *
 * Implements the WAI-ARIA tabs pattern properly: one tab stop for the whole
 * list, arrow keys move between tabs, Home and End jump to the ends, and each
 * panel is labelled by its tab. That behaviour is the point — this section is
 * partly here to show that the interaction was built, not assembled.
 */
export function Skills() {
  const [activeId, setActiveId] = useState(skillGroups[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useMotionPreference();

  const activeIndex = skillGroups.findIndex((group) => group.id === activeId);
  const active = skillGroups[activeIndex];
  const layer = layerById[active.layer];

  const focusTab = (index: number) => {
    const bounded = (index + skillGroups.length) % skillGroups.length;
    setActiveId(skillGroups[bounded].id);
    tabRefs.current[bounded]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowDown: activeIndex + 1,
      ArrowRight: activeIndex + 1,
      ArrowUp: activeIndex - 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: skillGroups.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    focusTab(keys[event.key]);
  };

  return (
    <Panel id="skills">
      <SectionHeading
        index="04"
        eyebrow="Skills"
        title="Grouped by where they sit in the stack"
        lede="Not by how good I claim to be at them. A percentage next to a language name has never told anyone anything true."
        meta={[
          { label: "Groups", value: String(skillGroups.length).padStart(2, "0") },
          {
            label: "Entries",
            value: String(skillGroups.reduce((total, group) => total + group.items.length, 0)),
          },
          { label: "Rating bars", value: "0" },
        ]}
      />

      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="Skill categories"
        onKeyDown={onKeyDown}
        className="col col-xs flex flex-col gap-1"
      >
        {skillGroups.map((group, index) => {
          const isActive = group.id === activeId;
          return (
            <button
              key={group.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`skills-tab-${group.id}`}
              aria-selected={isActive}
              aria-controls={`skills-panel-${group.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(group.id)}
              className={cn(
                "group relative flex w-full shrink-0 items-center gap-3 border px-4 py-3 text-left transition-colors duration-300",
                isActive
                  ? "border-line-bright bg-panel-2 text-ink"
                  : "border-transparent text-ink-faint hover:border-line hover:text-ink-dim",
              )}
            >
              <MonoLabel className={isActive ? "text-signal" : undefined}>
                {group.index}
              </MonoLabel>
              <span className="text-sm font-medium tracking-tight">{group.name}</span>
              <span
                aria-hidden
                className={cn(
                  "ml-auto font-mono text-[0.625rem] transition-colors",
                  isActive ? "text-signal" : "text-ink-faint/60",
                )}
              >
                {group.items.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`skills-panel-${active.id}`}
        aria-labelledby={`skills-tab-${active.id}`}
        tabIndex={0}
        className="col col-xl border border-line bg-panel p-6 outline-offset-2"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-5">
          <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{active.name}</h3>
          <MonoLabel className="text-signal">
            {layer.index} · {layer.name}
          </MonoLabel>
        </div>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-dim">
          {active.description}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={active.id}
            className="mt-7 flex flex-wrap gap-2"
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit={reduceMotion ? undefined : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.022 } },
            }}
          >
            {active.items.map((item) => (
              <motion.li
                key={item}
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="border border-line bg-canvas px-3 py-2 text-[0.8125rem] text-ink-dim transition-colors duration-200 hover:border-signal/50 hover:text-ink"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
      </AnimatePresence>
      </div>
    </Panel>
  );
}
