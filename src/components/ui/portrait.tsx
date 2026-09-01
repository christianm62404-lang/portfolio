"use client";

import { useState } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Headshot with a designed fallback.
 *
 * The portrait file is supplied by the site owner. Until it exists the
 * component renders a monogram plate rather than a broken image, so the page
 * is never in an unfinished-looking state.
 */
export function Portrait({
  src,
  className,
}: {
  /** Resolved on the server, so a missing file never causes a failed request. */
  src: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-4/5 overflow-hidden border border-line bg-panel-2",
        className,
      )}
    >
      {failed || !src ? (
        <div className="grid-field absolute inset-0 grid place-items-center">
          <span className="font-display text-[clamp(3rem,9vw,5rem)] font-semibold tracking-tight text-line-bright">
            {site.initials}
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt={`Portrait of ${site.name}`}
          fill
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 40vw, 70vw"
          className="object-cover object-center grayscale-[0.15] transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] hover:scale-[1.02] hover:grayscale-0"
          onError={() => setFailed(true)}
          priority={false}
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
          <span key={position} className={cn("absolute size-3 border-ink/25", position)} />
        ))}
      </span>
    </div>
  );
}
