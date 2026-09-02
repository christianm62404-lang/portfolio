import type { SpriteManifest } from "@/lib/sprite";
import { Layer } from "@/components/world/layer";
import { Character } from "@/components/world/character";

/**
 * The ground the character walks on, and the character himself.
 *
 * Two separate fixed elements: the ground band is clipped, because its
 * repeating layers rely on being cut off at the edges, while the character is
 * not — he is taller than the band and would lose his head to it.
 */
export function World({ manifest }: { manifest: SpriteManifest }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-[var(--world-h)] overflow-hidden"
      >
        {/* Fades the panels out behind the ground rather than letting text run
            under the character's feet. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, var(--color-canvas) 38%, var(--color-canvas) 100%)",
          }}
        />

        <div
          className="absolute inset-x-0 bottom-[var(--ground-offset)] h-px"
          style={{ background: "var(--color-line-bright)" }}
        />
        <Layer
          rate={1}
          tile={120}
          className="top-auto bottom-[calc(var(--ground-offset)-10px)] h-2.5 opacity-80"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-line-bright) 0 1px, transparent 1px 24px)",
          }}
        />
        <Layer
          rate={1}
          tile={120}
          className="top-auto bottom-[calc(var(--ground-offset)-18px)] h-4.5 opacity-90"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-signal) 0 1px, transparent 1px 120px)",
          }}
        />
      </div>

      {/* Unclipped, so the full sprite is always visible however tall it is. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[calc(var(--ground-offset)+var(--character-h))]"
      >
        <Character manifest={manifest} />
      </div>
    </>
  );
}
