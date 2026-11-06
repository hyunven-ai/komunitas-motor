"use client";

import * as React from "react";
import { ScrollReveal, type AnimationDirection } from "./motion";

export * from "./motion";

interface SectionRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "down" | "none" | "left" | "right" | "zoom";
}

/**
 * SectionReveal
 * Lightweight, hardware-accelerated scroll-reveal animation component.
 * Uses native IntersectionObserver to animate each section smoothly into view
 * as the user scrolls, keeping pages responsive, snappy, and lightweight.
 */
export function SectionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  ...props
}: SectionRevealProps) {
  return (
    <ScrollReveal
      delay={delay}
      direction={direction as AnimationDirection}
      className={className}
      {...props}
    >
      {children}
    </ScrollReveal>
  );
}
