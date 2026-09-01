"use client";

import { applyTheme, nextTheme, readAppliedTheme, storeTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const LABEL: Record<string, string> = {
  system: "Colour theme: following your system. Switch to light.",
  light: "Colour theme: light. Switch to dark.",
  dark: "Colour theme: dark. Follow your system instead.",
};

/**
 * Cycles system → light → dark.
 *
 * Three states rather than two, because a plain toggle gives a visitor no way
 * back to "whatever my computer does" once they have touched it.
 *
 * Which icon and which label show is decided in CSS from `data-theme` (see
 * globals.css), so the server and client render byte-identical markup and the
 * correct icon is already painted before React hydrates.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // No React state: the button's entire appearance comes from `data-theme` via
  // CSS, and the click handler reads that same attribute. Nothing here needs
  // to re-render, so nothing here does.
  const cycle = () => {
    const next = nextTheme(readAppliedTheme());
    applyTheme(next);
    storeTheme(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      title="Change colour theme"
      className={cn(
        "grid size-9 place-items-center border border-line-bright text-ink-dim transition-colors duration-200 hover:border-signal hover:text-signal",
        className,
      )}
    >
      {/* Exactly one of these three is displayed, chosen by CSS. */}
      <span className="sr-only" data-theme-icon="system">
        {LABEL.system}
      </span>
      <span className="sr-only" data-theme-icon="light">
        {LABEL.light}
      </span>
      <span className="sr-only" data-theme-icon="dark">
        {LABEL.dark}
      </span>

      <MonitorIcon />
      <SunIcon />
      <MoonIcon />
    </button>
  );
}

const iconProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
} as const;

function MonitorIcon() {
  return (
    <svg {...iconProps} data-theme-icon="system">
      <rect x="1.6" y="2.6" width="12.8" height="8.8" rx="1.2" />
      <path d="M5.5 14h5M8 11.4V14" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg {...iconProps} data-theme-icon="light">
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1.4v1.4M8 13.2v1.4M14.6 8h-1.4M2.8 8H1.4M12.67 3.33l-.99.99M4.32 11.68l-.99.99M12.67 12.67l-.99-.99M4.32 4.32l-.99-.99" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg {...iconProps} data-theme-icon="dark">
      <path d="M13.6 9.7A5.9 5.9 0 0 1 6.3 2.4a5.9 5.9 0 1 0 7.3 7.3Z" />
    </svg>
  );
}
