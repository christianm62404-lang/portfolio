import type { SpriteManifest } from "@/lib/sprite";
import { Parallax } from "@/components/world/parallax";
import { Character } from "@/components/world/character";

/**
 * The band along the bottom of the viewport: the parallax world and the
 * character walking through it. Fixed above the track, and inert — nothing
 * here is interactive, so none of it takes pointer events or focus.
 */
export function World({ manifest }: { manifest: SpriteManifest }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[var(--world-h)] overflow-hidden"
    >
      {/* Fades the panels out behind the world rather than letting text run
          under the character's feet. Painted first so the parallax and the
          character sit on top of it. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--color-canvas) 34%, var(--color-canvas) 100%)",
        }}
      />
      <Parallax />
      <Character manifest={manifest} />
    </div>
  );
}
