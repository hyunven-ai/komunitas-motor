"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ------------------------------------------------------------------
 * MOTION CONFIG & TYPES
 * ------------------------------------------------------------------
 */
export type AnimationDirection = "up" | "down" | "left" | "right" | "zoom" | "none";

interface MotionBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  distance?: number; // pixels to travel (default 24px)
}

/**
 * Hook to detect viewport intersection for Scroll Reveal
 */
export function useScrollReveal({
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px",
  once = true,
}: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
} = {}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already in viewport on mount (e.g. above fold)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      if (once) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

/**
 * ------------------------------------------------------------------
 * 1. FADE IN + SLIDE UP COMPONENT
 * ------------------------------------------------------------------
 * Smoothly transitions opacity from 0 to 1 with an upward slide.
 * Can trigger either on scroll into viewport (default) or immediately on mount.
 */
interface FadeInSlideUpProps extends MotionBaseProps {
  direction?: AnimationDirection;
  trigger?: "scroll" | "mount";
}

export function FadeInSlideUp({
  children,
  className,
  delay = 0,
  duration = 700,
  distance = 24,
  direction = "up",
  trigger = "scroll",
  style,
  ...props
}: FadeInSlideUpProps) {
  const { ref, isVisible: isScrollVisible } = useScrollReveal({
    threshold: 0.1,
    rootMargin: "0px 0px -30px 0px",
  });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if (trigger === "mount") {
      const timer = setTimeout(() => setIsMounted(true), 20);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const active = trigger === "mount" ? isMounted : isScrollVisible;

  // Compute transform offset based on direction
  const getTransform = () => {
    if (active) return "translate3d(0, 0, 0) scale(1)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, -${distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      case "zoom":
        return "scale(0.95)";
      case "none":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transform: getTransform(),
        opacity: active ? 1 : 0,
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Premium silky Apple/Nike easing
        transitionDelay: `${delay}ms`,
      }}
      className={cn("will-change-[transform,opacity]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ------------------------------------------------------------------
 * 2. STAGGER ANIMATION SYSTEM (CONTAINER & ITEMS)
 * ------------------------------------------------------------------
 * Cascades child animations sequentially with an automated delay step.
 * Ideal for card grids, lists, sponsor logos, and committee member rosters.
 */
interface StaggerContextType {
  staggerDelay: number;
  baseDelay: number;
  duration: number;
  distance: number;
  direction: AnimationDirection;
  isVisible: boolean;
}

const StaggerContext = React.createContext<StaggerContextType>({
  staggerDelay: 90,
  baseDelay: 0,
  duration: 650,
  distance: 20,
  direction: "up",
  isVisible: false,
});

interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number; // Delay between consecutive items (ms)
  baseDelay?: number; // Initial delay before the first item starts (ms)
  duration?: number; // Duration of each item transition (ms)
  distance?: number; // Vertical/horizontal travel distance (px)
  direction?: AnimationDirection;
  className?: string;
  threshold?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 90,
  baseDelay = 0,
  duration = 650,
  distance = 20,
  direction = "up",
  className,
  threshold = 0.1,
  ...props
}: StaggerContainerProps) {
  const { ref, isVisible } = useScrollReveal({
    threshold,
    rootMargin: "0px 0px -40px 0px",
  });

  const contextValue = React.useMemo(
    () => ({
      staggerDelay,
      baseDelay,
      duration,
      distance,
      direction,
      isVisible,
    }),
    [staggerDelay, baseDelay, duration, distance, direction, isVisible]
  );

  return (
    <StaggerContext.Provider value={contextValue}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
}

interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  index: number;
  className?: string;
  customDelay?: number;
}

export function StaggerItem({
  children,
  index,
  className,
  customDelay,
  style,
  ...props
}: StaggerItemProps) {
  const { staggerDelay, baseDelay, duration, distance, direction, isVisible } =
    React.useContext(StaggerContext);

  const totalDelay = customDelay ?? baseDelay + index * staggerDelay;

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, -${distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      case "zoom":
        return "scale(0.94)";
      case "none":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      style={{
        ...style,
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${totalDelay}ms`,
      }}
      className={cn("will-change-[transform,opacity]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ------------------------------------------------------------------
 * 3. SCROLL REVEAL COMPONENT
 * ------------------------------------------------------------------
 * Standalone viewport-triggered reveal with directional physics.
 */
interface ScrollRevealProps extends MotionBaseProps {
  direction?: AnimationDirection;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 750,
  distance = 28,
  direction = "up",
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px",
  once = true,
  style,
  ...props
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, rootMargin, once });

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, -${distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      case "zoom":
        return "scale(0.92)";
      case "none":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
      className={cn("will-change-[transform,opacity]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

