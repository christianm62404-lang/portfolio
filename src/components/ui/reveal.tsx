"use client";

import * as React from "react";
import { motion, type Variants } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const variants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Scroll-triggered reveal. Animates once, never on the way back up, and
 * collapses to a plain element when the user prefers reduced motion — the
 * content is identical either way, only the entrance differs.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article" | "section";
}) {
  const reduceMotion = useMotionPreference();
  const Component = motion[as];

  if (reduceMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={variants}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}

/**
 * Staggers direct children on entry. Children must be <RevealItem>, which
 * reads the parent's animation state rather than observing separately.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol";
}) {
  const reduceMotion = useMotionPreference();
  const Component = motion[as];

  if (reduceMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduceMotion = useMotionPreference();
  const Component = motion[as];

  if (reduceMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      variants={variants}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}

