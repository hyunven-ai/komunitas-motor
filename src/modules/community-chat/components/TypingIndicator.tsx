"use client";

import * as React from "react";

export function TypingIndicator({ label }: { label: string | null }) {
  if (!label) return <div className="h-5" />;

  return (
    <div className="h-5 flex items-center gap-2 text-xs text-bone-muted/80 px-2 animate-in fade-in duration-200">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-bounce" />
      </div>
      <span className="truncate italic text-[11px] font-medium">{label}</span>
    </div>
  );
}

