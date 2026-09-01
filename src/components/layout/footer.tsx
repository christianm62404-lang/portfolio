"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { MonoLabel } from "@/components/ui/primitives";

/**
 * A quiet system-status strip. The clock renders only after mount so the
 * server and client markup always match.
 */
export function Footer() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/New_York",
        }).format(new Date()),
      );
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-line px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <MonoLabel>© {new Date().getFullYear()} {site.name}</MonoLabel>
          <MonoLabel>
            {site.location} · <span suppressHydrationWarning>{time ?? "--:--:--"}</span> ET
          </MonoLabel>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <MonoLabel>Next.js · TypeScript · Tailwind</MonoLabel>
          <a
            href="#home"
            className="label-mono transition-colors hover:text-signal"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
