import { findHiddenPortraits, findPortrait } from "@/lib/portrait";
import { readSpriteManifest } from "@/lib/sprite";
import { TrackProvider, TrackViewport } from "@/components/layout/track";
import { Nav } from "@/components/layout/nav";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Backdrop } from "@/components/world/backdrop";
import { World } from "@/components/world/world";
import { UnlockWatcher } from "@/components/world/unlock-watcher";
import { LedRail } from "@/components/world/led-rail";
import { TrackSections } from "@/components/layout/track-sections";
import { Personal } from "@/components/sections/personal";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Labs } from "@/components/sections/labs";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";

/**
 * One page that runs sideways.
 *
 * Sections are panels laid into a single horizontal track, and a character
 * walks along the bottom of the screen in whichever direction the track is
 * travelling. The header, the progress bar, and the world strip sit outside
 * the scrolling element but inside its provider, so they can read its state
 * without moving with it.
 *
 * The portrait and the character's frames are resolved from the filesystem
 * here, because the components that use them are client components.
 */
export default function Home() {
  const portraitSrc = findPortrait();
  const hiddenPortraits = findHiddenPortraits();
  const sprites = readSpriteManifest();

  return (
    <TrackProvider>
      <Backdrop />
      <ScrollProgress />
      <Nav />
      <LedRail />
      <TrackViewport>
        <TrackSections
          standard={
            <>
              <Hero
                portraitSrc={portraitSrc}
                hiddenPortrait={hiddenPortraits.home}
              />
              <About />
              <Work />
              <Labs />
              <Skills />
              <Experience />
              <Contact />
            </>
          }
          hidden={
            <>
              <Hero
                portraitSrc={portraitSrc}
                hiddenPortrait={hiddenPortraits.home}
              />
              <Experience />
              <Personal photo={hiddenPortraits.personal} />
              <Contact photo={hiddenPortraits.contact} />
            </>
          }
        />
      </TrackViewport>
      <World manifest={sprites} />
      <UnlockWatcher />
    </TrackProvider>
  );
}
