import { MonoLabel } from "@/components/ui/primitives";

/**
 * A deployed site, shown as a browser frame with an abstract wireframe inside.
 * Deliberately not a fabricated screenshot — the link is the real artefact.
 */
export function SiteFrameVisual({ url }: { url: string }) {
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <figure className="flex h-full w-full flex-col bg-panel-2 p-4 sm:p-6">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <MonoLabel>Deployed</MonoLabel>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-live" />
          <MonoLabel className="text-live">live</MonoLabel>
        </span>
      </figcaption>

      <div className="flex flex-1 flex-col border border-line bg-void">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <span aria-hidden className="flex gap-1">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-1.5 rounded-full bg-line-bright" />
            ))}
          </span>
          <span className="ml-1 flex-1 truncate border border-line px-2 py-1 font-mono text-[0.625rem] text-ink-dim">
            {host}
          </span>
        </div>

        <div aria-hidden className="flex flex-1 flex-col gap-2 p-4">
          <div className="h-2 w-1/3 bg-line-bright" />
          <div className="h-6 w-3/4 bg-line" />
          <div className="h-1.5 w-2/3 bg-line/70" />
          <div className="mt-auto grid grid-cols-3 gap-2">
            {[0, 1, 2].map((card) => (
              <div key={card} className="h-10 border border-line" />
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
