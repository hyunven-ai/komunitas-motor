import React from "react";
import { Gauge, Shield, Zap, Activity } from "lucide-react";

interface BikerLoaderProps {
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg" | "fullscreen";
}

export function BikerLoader({
  label = "INITIALIZING SYSTEM",
  sublabel = "ENGINE READY • GPS TELEMETRY LOCKED",
  size = "md",
}: BikerLoaderProps) {
  const isFullscreen = size === "fullscreen";

  const content = (
    <div className="relative flex flex-col items-center justify-center p-8 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-red-600/15 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute w-44 h-44 rounded-full bg-red-500/10 blur-2xl pointer-events-none animate-pulse" />

      {/* Main Tachometer / Cockpit Loader Assembly */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        {/* Outer Orbital Ring 1 - Smooth Spin */}
        <div className="absolute inset-0 rounded-full border border-red-500/20 border-t-red-500 border-r-red-500/60 animate-spin [animation-duration:3s]" />
        
        {/* Outer Orbital Ring 2 - Reverse Spin with Dash */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-rose-500/80 border-l-red-500/50 animate-spin [animation-duration:2s] [animation-direction:reverse]" />

        {/* Tachometer Tick Ring (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full text-red-500/30 animate-spin [animation-duration:12s]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />
        </svg>

        {/* Inner Tachometer Segment Ring */}
        <svg
          className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] text-rose-400/40 animate-spin [animation-duration:6s] [animation-direction:reverse]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 14"
          />
        </svg>

        {/* Center Glowing Cockpit Shield */}
        <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-[#181114] to-[#0A0D14] border border-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.25)] flex flex-col items-center justify-center group overflow-hidden">
          {/* Subtle scanning light bar */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-[scanner-line_2.5s_ease-in-out_infinite]" />
          
          {/* Center Icon */}
          <div className="relative flex items-center justify-center">
            <Shield className="w-8 h-8 sm:w-9 sm:h-9 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse" />
            <Activity className="absolute w-4 h-4 text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
          </div>

          <div className="mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] font-mono tracking-widest text-red-300 font-semibold uppercase">
              LIVE
            </span>
          </div>
        </div>

        {/* Orbiting Satellite Particle */}
        <div className="absolute inset-0 animate-spin [animation-duration:2.4s]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] mx-auto -translate-y-1" />
        </div>
      </div>

      {/* Telemetry & Loading Status */}
      <div className="mt-8 flex flex-col items-center text-center max-w-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 backdrop-blur-md mb-2 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
          <Zap className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-rose-200 to-red-300">
            {label}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-48 sm:w-60 h-1.5 rounded-full bg-[#131724] border border-white/10 overflow-hidden relative my-2">
          <div className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 animate-[progress-glow_1.8s_ease-in-out_infinite] w-full origin-left" />
        </div>

        <p className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
          {sublabel}
        </p>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D14]/95 backdrop-blur-xl">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-20">
      {content}
    </div>
  );
}
