"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  FolderOpen,
  CalendarX,
  Users,
  SearchX,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "gold" | "outline" | "danger";
}

export interface EmptyStateProps {
  /** Short, high-impact heading */
  title: string;
  /** EXACT reason: Say why it is empty */
  reason: string;
  /** EXACT next step: ONE primary actionable next step */
  action: EmptyStateAction;
  /** Optional secondary subtle link (e.g. contact admin or browse another tab) */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Icon to render in header */
  icon?: LucideIcon;
  /** Visual variant tone */
  tone?: "default" | "warning" | "neutral";
  className?: string;
}

const DEFAULT_ICONS: Record<string, LucideIcon> = {
  default: FolderOpen,
  warning: CalendarX,
  neutral: Compass,
};

export function EmptyState({
  title,
  reason,
  action,
  secondaryAction,
  icon,
  tone = "default",
  className,
}: EmptyStateProps) {
  const IconComponent = icon || DEFAULT_ICONS[tone] || FolderOpen;
  const ActionIcon = action.icon || ArrowRight;

  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        "relative rounded-2xl border border-white/10 bg-asphalt/80 backdrop-blur-md p-8 sm:p-12 text-center overflow-hidden shadow-2xl transition-all",
        tone === "warning" && "border-amber-500/30 bg-asphalt/90",
        className
      )}
    >
      {/* Background ambient gradient accent */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center space-y-5">
        {/* Tactical Badge & Icon Assembly */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-charcoal border border-white/15 shadow-inner text-muted-gold group">
          <div className="absolute inset-0 rounded-2xl bg-muted-gold/10 animate-pulse" />
          <IconComponent className="h-8 w-8 relative z-10 stroke-[1.75]" />
        </div>

        {/* Text Group: Title and "Why it is empty" */}
        <div className="space-y-2 text-center">
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted-gold font-bold">
            Status: Kosong / Nihil
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-bone">
            {title}
          </h3>
          {/* Explicit reason why it is empty */}
          <div className="rounded-lg bg-charcoal/70 border border-white/5 p-3.5 mt-2">
            <p className="text-xs sm:text-sm text-bone-muted leading-relaxed font-sans">
              <strong className="text-bone block mb-0.5 font-medium">
                Penyebab:
              </strong>
              {reason}
            </p>
          </div>
        </div>

        {/* The ONE next step */}
        <div className="w-full pt-2 flex flex-col items-center space-y-3">
          {action.href ? (
            <Link href={action.href} className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto px-6 py-5 font-display font-bold uppercase tracking-wider text-xs bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg hover:shadow-red-900/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{action.label}</span>
                <ActionIcon className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className="w-full sm:w-auto px-6 py-5 font-display font-bold uppercase tracking-wider text-xs bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg hover:shadow-red-900/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{action.label}</span>
              <ActionIcon className="h-4 w-4" />
            </Button>
          )}

          {secondaryAction && (
            <div>
              {secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="text-xs text-bone-muted hover:text-bone underline underline-offset-4 font-mono transition-colors"
                >
                  {secondaryAction.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="text-xs text-bone-muted hover:text-bone underline underline-offset-4 font-mono transition-colors"
                >
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

