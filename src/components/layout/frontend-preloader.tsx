"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Gauge, Shield, Zap, Sparkles } from "lucide-react";

export function FrontendPreloader() {
  const pathname = usePathname();
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(12);
  const [routeTransitioning, setRouteTransitioning] = useState(false);

  // Initial page entrance ignition animation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 5;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setInitialLoading(false);
        }, 400);
      } else {
        setProgress(current);
      }
    }, 65);

    return () => clearInterval(interval);
  }, []);

  // Top progress bar on route changes
  useEffect(() => {
    setRouteTransitioning(true);
    const timer = setTimeout(() => {
      setRouteTransitioning(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* 1. TOP ROUTE PROGRESS BAR (Triggered on page transitions) */}
      <div
        className={`fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none transition-opacity duration-300 ${
          routeTransitioning ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-all ease-out ${
            routeTransitioning ? "w-full duration-400" : "w-0 duration-100"
          }`}
        />
      </div>

      {/* 2. INITIAL ENTRY TACHOMETER COCKPIT SPLASH PRELOADER */}
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0D14] transition-all duration-700 ease-in-out ${
          initialLoading
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Ambient Cosmic Radial Glows */}
        <div className="absolute w-96 h-96 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-sky-500/10 blur-[80px] pointer-events-none" />

        {/* Tachometer Assembly */}
        <div className="relative flex flex-col items-center">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
            {/* Outer Rotating Dash Ring */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/20 border-t-indigo-400 border-r-indigo-500/80 animate-spin [animation-duration:2.5s]" />
            <div className="absolute inset-2 rounded-full border border-sky-400/30 border-b-sky-300 border-l-transparent animate-spin [animation-duration:1.8s] [animation-direction:reverse]" />

            {/* SVG Tachometer Ring */}
            <svg
              className="absolute inset-0 w-full h-full text-indigo-500/40 animate-spin [animation-duration:15s]"
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

            {/* Shield Center Dial */}
            <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-[#141828] to-[#0A0D16] border border-indigo-500/40 shadow-[0_0_35px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-400/15 to-transparent animate-[scanner-line_2s_ease-in-out_infinite]" />
              
              <Shield className="w-9 h-9 sm:w-10 sm:h-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.9)] animate-pulse" />
              
              {/* Odometer Progress Count */}
              <div className="mt-1 flex items-baseline justify-center gap-0.5 w-16">
                <span className="font-mono text-base sm:text-lg font-extrabold text-white tracking-wider tabular-nums inline-block w-8 text-right">
                  {progress}
                </span>
                <span className="font-mono text-[10px] text-indigo-400 font-bold">
                  %
                </span>
              </div>
            </div>

            {/* Orbiting Needle Light */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${(progress / 100) * 360}deg)` }}
            >
              <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_14px_#38bdf8] mx-auto -translate-y-1.5" />
            </div>
          </div>

          {/* Telemetry Brand Label */}
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.25)]">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-sky-200 to-indigo-300">
                IGNITION SEQUENCE ACTIVE
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-56 sm:w-64 h-1.5 rounded-full bg-[#131724] border border-white/10 overflow-hidden relative my-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-sky-400 to-indigo-400 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              BROTHERHOOD MOTORCYCLE COMMUNITY • GPS READY
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
