"use client";

import Image from "next/image";
import { useHiddenMode } from "@/lib/hidden-mode";
import { cn } from "@/lib/utils";

/**
 * One of the hidden mode's photographs, standing as a column of its own.
 *
 * Renders nothing at all outside the mode, and nothing when the file it was
 * pointed at is absent — so a section can ask for one unconditionally and get
 * its ordinary layout back when there is nothing to show.
 *
 * The registration marks match the hero portrait's, because this is the same
 * motif appearing again further along rather than a second idea.
 */
export function HiddenPhoto({
  src,
  className,
}: {
  src?: string | null;
  className?: string;
}) {
  const hidden = useHiddenMode();
  if (!hidden || !src) return null;

  return (
    <div className={cn("col col-xs", className)}>
      <div className="relative aspect-square overflow-hidden border border-line bg-panel-2">
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1024px) 19.5rem, 84vw"
          // Anchored to the top: phone portraits in a square frame, and
          // centring them crops the head off.
          className="object-cover object-top"
        />

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
    </div>
  );
}
