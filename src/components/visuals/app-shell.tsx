"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MonoLabel } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

type Role = "viewer" | "editor" | "admin";

const ROLE_RANK: Record<Role, number> = { viewer: 1, editor: 2, admin: 3 };
const ROLES: Role[] = ["viewer", "editor", "admin"];

const routes: Array<{ path: string; label: string; requires: Role }> = [
  { path: "/dashboard", label: "Dashboard", requires: "viewer" },
  { path: "/proposals", label: "Proposals", requires: "viewer" },
  { path: "/workspace", label: "Proposal workspace", requires: "editor" },
  { path: "/analytics", label: "Analytics", requires: "editor" },
  { path: "/admin/users", label: "User management", requires: "admin" },
  { path: "/admin/settings", label: "Org settings", requires: "admin" },
];

const canAccess = (role: Role, required: Role) => ROLE_RANK[role] >= ROLE_RANK[required];

/**
 * BidOps AI is an application, so its visual is an application — a reduced
 * app shell wired to the same rule the real one enforces.
 *
 * Changing the role re-evaluates every route. This is the point the project
 * write-up makes: authorisation is a property of the route, not a decision
 * the interface makes about what to render.
 */
export function AppShellVisual() {
  const [role, setRole] = useState<Role>("editor");
  const reduceMotion = useMotionPreference();
  const groupId = useId();
  const allowed = routes.filter((route) => canAccess(role, route.requires));
  const blocked = routes.length - allowed.length;

  return (
    <figure className="flex h-full w-full flex-col bg-panel-2 p-4 sm:p-6">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <MonoLabel>Access control — live</MonoLabel>
        <MonoLabel className={blocked > 0 ? "text-signal" : "text-live"}>
          {blocked > 0 ? `${blocked} route${blocked === 1 ? "" : "s"} blocked` : "all routes open"}
        </MonoLabel>
      </figcaption>

      <div className="mb-4 flex items-center gap-2" role="radiogroup" aria-labelledby={groupId}>
        <span id={groupId} className="label-mono mr-1">
          Session role
        </span>
        {ROLES.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={role === option}
            onClick={() => setRole(option)}
            className={cn(
              "border px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide transition-colors duration-200",
              role === option
                ? "border-signal bg-signal/12 text-signal"
                : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Reduced app shell: rail, top bar, content. */}
      <div className="flex min-h-0 flex-1 overflow-hidden border border-line bg-void">
        <nav
          aria-label="Application routes"
          className="w-[42%] shrink-0 border-r border-line p-2 sm:w-[46%] sm:p-3"
        >
          <ul className="space-y-0.5">
            {routes.map((route) => {
              const open = canAccess(role, route.requires);
              return (
                <li key={route.path}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xs px-2 py-1.5 transition-colors duration-300",
                      open ? "text-ink-dim" : "text-ink-faint/55",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-1 shrink-0 rounded-full transition-colors duration-300",
                        open ? "bg-live" : "bg-line-bright",
                      )}
                    />
                    <span className="truncate font-mono text-[0.6875rem] tracking-tight">
                      {route.path}
                    </span>
                    {!open ? (
                      <LockIcon className="ml-auto size-2.5 shrink-0 text-ink-faint/70" />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="font-mono text-[0.625rem] tracking-wide text-ink-faint">
              session.role = &ldquo;{role}&rdquo;
            </span>
            <span className="size-4 rounded-full border border-line-bright" aria-hidden />
          </div>

          <div className="relative flex-1 p-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={role}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2"
              >
                {allowed.slice(0, 4).map((route, index) => (
                  <div
                    key={route.path}
                    className="border border-line bg-panel px-2.5 py-2"
                    style={{ opacity: 1 - index * 0.16 }}
                  >
                    <div className="h-1 w-1/3 bg-line-bright" />
                    <div className="mt-1.5 h-1 w-2/3 bg-line" />
                    <span className="sr-only">{route.label} panel</span>
                  </div>
                ))}
                {blocked > 0 ? (
                  <p className="pt-1 font-mono text-[0.625rem] leading-relaxed text-signal/80">
                    middleware → 403
                    <br />
                    <span className="text-ink-faint">
                      redirect(&quot;/unauthorized&quot;)
                    </span>
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-ink-faint">
        Hiding a link is not access control. Try the roles — the routes change, and so
        does what the server would allow.
      </p>
    </figure>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 12" fill="none" className={className} aria-hidden focusable="false">
      <rect x="0.6" y="4.6" width="8.8" height="6.8" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M2.8 4.6V3a2.2 2.2 0 0 1 4.4 0v1.6" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
