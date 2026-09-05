"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { notePortraitTap, useHiddenMode } from "@/lib/hidden-mode";
import { cn } from "@/lib/utils";

/** How long each of the hidden mode's photographs is held. */
const SLIDE_MS = 4200;

/**
 * Headshot with a designed fallback.
 *
 * The portrait file is supplied by the site owner. Until it exists the
 * component renders a monogram plate rather than a broken image, so the page
 * is never in an unfinished-looking state.
 */
export function Portrait({
  src,
  hidden = [],
  className,
  priority = false,
}: {
  /** Resolved on the server, so a missing file never causes a failed request. */
  src: string | null;
  /** The hidden mode's photographs, if any were found. */
  hidden?: string[];
  className?: string;
  /** Set for the hero portrait, which is the largest-contentful paint. */
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const hiddenMode = useHiddenMode();
  const [slide, setSlide] = useState(0);

  const showing = hiddenMode && hidden.length > 0;

  // The set is a rotation rather than a single swap: three photographs replace
  // one, and showing them in turn is the only way all three are ever seen.
  useEffect(() => {
    if (!showing || hidden.length < 2) return;
    const timer = setInterval(
      () => setSlide((current) => (current + 1) % hidden.length),
      SLIDE_MS,
    );
    return () => clearInterval(timer);
  }, [showing, hidden.length]);

  return (
    <div
      // The first half of the hidden mode's sequence is counted here. It is a
      // pointer handler on a decorative element rather than a button: there is
      // nothing to announce, and nothing a keyboard visitor is missing, since
      // the sequence has a keyboard half of its own.
      data-unlock="portrait"
      onPointerDown={notePortraitTap}
      className={cn(
        // Square rather than 4:5: a head-and-shoulders crop sits well in it,
        // and a circular headshot is not clipped at the sides.
        "relative aspect-square overflow-hidden border border-line bg-panel-2",
        className,
      )}
    >
      {showing ? (
        // Every photograph is stacked and cross-faded rather than swapped, so
        // the frame never shows a gap while the next one decodes.
        hidden.map((photo, index) => (
          <Image
            key={photo}
            src={photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 18rem, 62vw"
            className={cn(
              // Anchored to the top: these are phone portraits in a square
              // frame, and centring them crops the top of the head off.
              "object-cover object-top transition-opacity duration-700 ease-[var(--ease-out-expo)]",
              index === slide % hidden.length ? "opacity-100" : "opacity-0",
            )}
          />
        ))
      ) : failed || !src ? (
        // Reads as a monogram plate rather than a failed image: this is the
        // hero, so it has to look chosen while the photo is pending.
        <div className="grid-field absolute inset-0 grid place-items-center">
          <span className="font-display text-[clamp(3.5rem,11vw,6rem)] font-semibold tracking-tight text-ink-faint/75">
            {site.initials}
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt={`Portrait of ${site.name}`}
          fill
          sizes="(min-width: 1024px) 26rem, (min-width: 640px) 18rem, 62vw"
          // Rendered ~10% taller than the frame and anchored to the top, so
          // the soft band along the bottom edge of the source photo is cropped
          // out. Overriding the height that `fill` sets inline needs the
          // important modifier.
          className="h-[110%]! object-cover object-top grayscale-[0.15] transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] hover:scale-[1.02] hover:grayscale-0"
          onError={() => setFailed(true)}
          priority={priority}
        />
      )}

      {/* Corner registration marks — a quiet engineering-drawing motif. */}
      <span aria-hidden className="pointer-events-none absolute inset-0">
        {(
          [
            "left-2 top-2 border-l border-t",
            "right-2 top-2 border-r border-t",
            "left-2 bottom-2 border-l border-b",
            "right-2 bottom-2 border-r border-b",
          ] as const
        ).map((position) => (
          <span
            key={position}
            className={cn("absolute size-3 border-ink/25", position)}
          />
        ))}
      </span>
    </div>
  );
}
