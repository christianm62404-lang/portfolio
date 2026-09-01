import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Labs } from "@/components/sections/labs";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Journey } from "@/components/sections/journey";
import { Principles } from "@/components/sections/principles";
import { Contact } from "@/components/sections/contact";

/**
 * One page, composed of independent sections.
 *
 * Each section owns its own data and its own client boundary, so the page
 * itself stays a server component and only the genuinely interactive pieces
 * ship JavaScript.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Labs />
      <Skills />
      <Experience />
      <Journey />
      <Principles />
      <Contact />
    </>
  );
}
