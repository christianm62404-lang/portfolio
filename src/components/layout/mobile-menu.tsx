"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { navItems, site } from "@/content/site";
import { MonoLabel, StatusDot } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/**
 * Mobile navigation as a full-height sheet.
 *
 * Radix Dialog handles focus trapping, scroll locking, escape-to-close, and
 * the aria wiring; the animation is layered on top with AnimatePresence so the
 * exit transition can finish before unmount.
 */
export function MobileMenu({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useMotionPreference();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center border border-line-bright text-ink transition-colors duration-200 hover:border-signal hover:text-signal md:hidden"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="flex w-4 flex-col gap-[5px]">
            <span
              className={cn(
                "block h-px w-full bg-current transition-transform duration-300 ease-[var(--ease-out-expo)]",
                open && "translate-y-[3px] rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-px w-full bg-current transition-transform duration-300 ease-[var(--ease-out-expo)]",
                open && "-translate-y-[3px] -rotate-45",
              )}
            />
          </span>
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-canvas/85 backdrop-blur-sm md:hidden"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.24 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount aria-label="Site navigation">
              <motion.div
                className="fixed inset-x-0 top-0 z-50 border-b border-line bg-panel px-5 pt-24 pb-8 md:hidden"
                initial={reduceMotion ? false : { y: "-100%" }}
                animate={{ y: 0 }}
                exit={reduceMotion ? undefined : { y: "-100%" }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* The trigger sits under the sheet once it opens, so the
                    sheet carries its own close control in the same position. */}
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="absolute top-[1.125rem] right-5 grid size-10 place-items-center border border-line-bright text-ink transition-colors duration-200 hover:border-signal hover:text-signal"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M2 2L12 12M12 2L2 12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </Dialog.Close>

                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Jump to a section of the portfolio.
                </Dialog.Description>

                <nav>
                  <ul className="flex flex-col">
                    {navItems.map((item, index) => (
                      <li key={item.id} className="border-b border-line last:border-0">
                        <a
                          href={`#${item.id}`}
                          onClick={() => setOpen(false)}
                          aria-current={active === item.id ? "true" : undefined}
                          className={cn(
                            "flex items-baseline gap-4 py-4 text-2xl font-medium tracking-tight transition-colors",
                            active === item.id ? "text-signal" : "text-ink",
                          )}
                        >
                          <MonoLabel
                            className={active === item.id ? "text-signal" : undefined}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </MonoLabel>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6">
                  <a
                    href={site.resumePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center border border-line-bright text-sm font-medium transition-colors hover:border-signal hover:text-signal"
                  >
                    Resume
                  </a>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <StatusDot />
                      <MonoLabel>Open to internships</MonoLabel>
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
