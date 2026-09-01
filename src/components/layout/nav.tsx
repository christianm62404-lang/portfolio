"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navItems, site } from "@/content/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { MonoLabel, StatusDot } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const sectionIds = navItems.map((item) => item.id);

export function Nav() {
  const [condensed, setCondensed] = useState(false);
  const active = useActiveSection(sectionIds);
  const reduceMotion = useMotionPreference();

  useEffect(() => {
    // A single passive listener with a rAF guard: the header state is derived
    // from scroll position but never blocks the scroll itself.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setCondensed(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[var(--ease-out-expo)]",
        condensed ? "py-2.5" : "py-4",
      )}
    >
      {/* A separate backdrop layer so the bar can fade in without the
          content above it inheriting a transition. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 border-b bg-canvas/80 backdrop-blur-xl transition-opacity duration-400 ease-[var(--ease-out-expo)]",
          condensed ? "border-line opacity-100" : "border-transparent opacity-0",
        )}
      />

      <div className="relative mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <a
          href="#home"
          className="group flex items-center gap-3"
          aria-label={`${site.name} — back to top`}
        >
          <span
            className={cn(
              "grid place-items-center border border-line-bright font-mono text-[0.6875rem] font-medium tracking-[0.08em] transition-all duration-500 ease-[var(--ease-out-expo)]",
              condensed ? "size-8" : "size-9",
              "group-hover:border-signal group-hover:text-signal",
            )}
          >
            {site.initials}
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-sm font-medium tracking-tight">{site.name}</span>
            <span className="label-mono mt-1.5 normal-case tracking-[0.14em]">
              Computer Engineering
            </span>
          </span>
        </a>

        {/* Desktop navigation. The pill behind the active item is a shared
            layout element, so it slides between items instead of fading. */}
        <nav
          aria-label="Section navigation"
          className={cn(
            "hidden items-center gap-1 rounded-full border px-1.5 py-1.5 transition-all duration-500 ease-[var(--ease-out-expo)] md:flex",
            condensed ? "border-line" : "border-transparent",
          )}
        >
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-colors duration-200",
                  isActive ? "text-ink" : "text-ink-faint hover:text-ink-dim",
                )}
              >
                {isActive && !reduceMotion ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border border-line-bright bg-panel-2"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                ) : null}
                {isActive && reduceMotion ? (
                  <span className="absolute inset-0 rounded-full border border-line-bright bg-panel-2" />
                ) : null}
                <span className="relative">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <AnimatePresence initial={false}>
            {!condensed ? (
              <motion.span
                key="status"
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: 8 }}
                transition={{ duration: 0.3 }}
                className="hidden items-center gap-2 pr-2 lg:flex"
              >
                <StatusDot />
                <MonoLabel>Open to internships</MonoLabel>
              </motion.span>
            ) : null}
          </AnimatePresence>

          <ThemeToggle />

          <ButtonLink
            href={site.resumePath}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Resume
            <ArrowUpRight />
          </ButtonLink>

          <MobileMenu active={active} />
        </div>
      </div>
    </header>
  );
}

function ArrowUpRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden focusable="false">
      <path
        d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
