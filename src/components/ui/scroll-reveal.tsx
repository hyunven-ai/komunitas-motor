"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-up" | "fade-in";
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  className = "",
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    // Check if element is already in viewport
    const rect = element.getBoundingClientRect();
    if (rect.top <= window.innerHeight) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px 80px 0px",
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold]);

  const getAnimationStyles = () => {
    const baseTransition = `transition-all ease-[cubic-bezier(0.16,1,0.3,1)]`;
    const transitionTiming = `duration-[${duration}ms]`;

    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return "opacity-0 translate-y-10 scale-[0.98]";
        case "fade-down":
          return "opacity-0 -translate-y-10";
        case "fade-left":
          return "opacity-0 translate-x-12";
        case "fade-right":
          return "opacity-0 -translate-x-12";
        case "scale-up":
          return "opacity-0 scale-90";
        case "fade-in":
        default:
          return "opacity-0";
      }
    }

    return "opacity-100 translate-y-0 translate-x-0 scale-100";
  };

  return (
    <div
      ref={elementRef}
      className={`${getAnimationStyles()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionProperty: "opacity, transform, filter",
        willChange: "opacity, transform",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
