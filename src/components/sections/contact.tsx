"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { MonoLabel, Section, StatusDot } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

/**
 * The closing screen. One clear action, two links, and no form — a form here
 * would only add a failure mode between someone and an email address.
 */
export function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; the mailto link beside it still works.
      setCopied(false);
    }
  };

  return (
    <Section id="contact" className="border-t border-line">
      <Reveal>
        <div className="flex items-center gap-4">
          <MonoLabel className="text-signal">08</MonoLabel>
          <MonoLabel>Contact</MonoLabel>
          <hr className="rule flex-1" />
        </div>

        <h2 className="mt-8 text-[clamp(2.75rem,10vw,7rem)] leading-[0.94] font-semibold tracking-[-0.045em]">
          <span className="block text-gradient-ink">Let&apos;s build</span>
          <span className="block text-signal">something.</span>
        </h2>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-dim sm:text-lg">
          I&apos;m looking for software, embedded, or systems internships for 2026 and
          beyond. If you have something that spans more than one layer of the stack, that
          is the kind of problem I want.
        </p>

        <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-3">
          <ContactTile
            label="Email"
            value={site.email}
            href={`mailto:${site.email}`}
            action={
              <button
                type="button"
                onClick={copyEmail}
                className="mt-4 self-start border border-line-bright px-2.5 py-1 font-mono text-[0.625rem] tracking-wide text-ink-faint transition-colors duration-200 hover:border-signal hover:text-signal"
              >
                {copied ? "Copied" : "Copy address"}
              </button>
            }
          />
          {site.socials.map((social) => (
            <ContactTile
              key={social.label}
              label={social.label}
              value={social.handle}
              href={social.href}
              external
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="flex items-center gap-2">
            <StatusDot />
            <MonoLabel className="text-live">Open to internships</MonoLabel>
          </span>
          <a
            href={site.resumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="label-mono underline decoration-line-bright underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
          >
            Download resume
          </a>
          <MonoLabel>{site.phone}</MonoLabel>
        </div>
      </Reveal>
    </Section>
  );
}

function ContactTile({
  label,
  value,
  href,
  external,
  action,
}: {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col bg-canvas p-6 transition-colors duration-300 hover:bg-panel">
      <MonoLabel>{label}</MonoLabel>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="mt-3 inline-flex items-start gap-2 text-[0.9375rem] leading-snug break-all text-ink transition-colors duration-200 group-hover:text-signal"
      >
        {value}
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className="mt-1.5 shrink-0 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
        >
          <path
            d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      {action}
    </div>
  );
}
