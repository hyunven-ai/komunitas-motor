"use client";

import * as React from "react";
import Link from "next/link";
import { gsap } from "gsap";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "@/features/sliders/types";

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const activeSlides = React.useMemo(() => {
    return slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  }, [slides]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isAudioActive, setIsAudioActive] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const isPausedRef = React.useRef(false);
  isPausedRef.current = isPaused;

  const orderRef = React.useRef<number[]>([]);
  const isAnimatingRef = React.useRef(false);
  const detailsEvenRef = React.useRef(true);
  const autoPlayTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize or synchronize order array when slides change
  React.useEffect(() => {
    orderRef.current = activeSlides.map((_, i) => i);
  }, [activeSlides]);

  // Main GSAP Layout & Lifecycle
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const totalSlides = activeSlides.length;
    if (totalSlides === 0) return;

    const ease = "sine.inOut";
    let isMounted = true;

    // Helper functions to get elements by ID
    const getCard = (i: number) => container.querySelector(`#tc-card-${i}`) as HTMLElement | null;
    const getCardContent = (i: number) => container.querySelector(`#tc-content-${i}`) as HTMLElement | null;
    const getSlideItem = (i: number) => container.querySelector(`#tc-slide-item-${i}`) as HTMLElement | null;

    // Compute dimensions based on container size
    const getLayoutConfig = () => {
      const width = container.offsetWidth || window.innerWidth;
      const height = container.offsetHeight || window.innerHeight;

      const isMobile = width < 768;
      const cardWidth = isMobile ? 140 : width < 1200 ? 180 : 210;
      const cardHeight = isMobile ? 220 : width < 1200 ? 280 : 320;
      const gap = isMobile ? 16 : 28;
      const offsetTop = isMobile ? height - cardHeight - 70 : height - cardHeight - 110;
      const offsetLeft = isMobile
        ? Math.max(width - 320, 20)
        : Math.max(width - (cardWidth + gap) * 3 - 60, width * 0.44);

      return { width, height, cardWidth, cardHeight, gap, offsetTop, offsetLeft, isMobile };
    };

    // Initialize layout positions
    const initLayout = () => {
      const config = getLayoutConfig();
      const order = orderRef.current;
      if (order.length === 0) return;

      const [active, ...rest] = order;
      const detailsActive = detailsEvenRef.current ? "#tc-details-even" : "#tc-details-odd";
      const detailsInactive = detailsEvenRef.current ? "#tc-details-odd" : "#tc-details-even";

      // 1. Initial full-screen active card
      const activeCard = getCard(active);
      if (activeCard) {
        gsap.set(activeCard, {
          x: 0,
          y: 0,
          width: config.width,
          height: config.height,
          borderRadius: 0,
          scale: 1,
          zIndex: 10,
          opacity: 1,
        });
      }

      // Hide content of active card (shown in details)
      const activeContent = getCardContent(active);
      if (activeContent) {
        gsap.set(activeContent, { opacity: 0 });
      }

      // 2. Initial preview cards on the right
      rest.forEach((slideIdx, index) => {
        const card = getCard(slideIdx);
        const content = getCardContent(slideIdx);
        const xPos = config.offsetLeft + index * (config.cardWidth + config.gap);

        if (card) {
          gsap.set(card, {
            x: xPos,
            y: config.offsetTop,
            width: config.cardWidth,
            height: config.cardHeight,
            borderRadius: 16,
            scale: 1,
            zIndex: 25,
            opacity: 1,
          });
        }

        if (content) {
          gsap.set(content, {
            x: xPos,
            y: config.offsetTop + config.cardHeight - 95,
            opacity: 1,
            zIndex: 30,
          });
        }

        const slideItem = getSlideItem(slideIdx);
        if (slideItem) {
          gsap.set(slideItem, { x: (index + 1) * 40 });
        }
      });

      const activeSlideItem = getSlideItem(active);
      if (activeSlideItem) {
        gsap.set(activeSlideItem, { x: 0 });
      }

      // 3. Set text details for initial slide
      const initialSlideData = activeSlides[active];
      const activeDetailsEl = container.querySelector(detailsActive) as HTMLElement | null;
      const inactiveDetailsEl = container.querySelector(detailsInactive) as HTMLElement | null;

      if (activeDetailsEl && initialSlideData) {
        const placeEl = activeDetailsEl.querySelector(".tc-place") as HTMLElement | null;
        const title1El = activeDetailsEl.querySelector(".tc-title-1") as HTMLElement | null;
        const title2El = activeDetailsEl.querySelector(".tc-title-2") as HTMLElement | null;
        const descEl = activeDetailsEl.querySelector(".tc-desc") as HTMLElement | null;
        const ctaEl = activeDetailsEl.querySelector(".tc-cta") as HTMLElement | null;

        if (placeEl) placeEl.textContent = initialSlideData.location || "Borneo Brotherhood";
        if (title1El) title1El.textContent = initialSlideData.headlinePart1;
        if (title2El) title2El.textContent = initialSlideData.headlineGold;
        if (descEl) descEl.textContent = initialSlideData.subtitle;

        gsap.set(activeDetailsEl, { opacity: 1, zIndex: 35 });
        gsap.set([placeEl, title1El, title2El, descEl, ctaEl], { y: 0, opacity: 1 });
      }

      if (inactiveDetailsEl) {
        gsap.set(inactiveDetailsEl, { opacity: 0, zIndex: 12 });
      }

      // Progress bar fill
      gsap.set(container.querySelector(".tc-progress-foreground"), {
        width: `${((active + 1) / totalSlides) * 100}%`,
      });
    };

    // The iconic "Cards Opening" transition step
    const step = (direction = 1) => {
      if (isAnimatingRef.current || !isMounted) return;
      isAnimatingRef.current = true;

      const config = getLayoutConfig();
      const order = orderRef.current;

      if (direction === 1) {
        // Next: rotate front card to back
        order.push(order.shift()!);
      } else {
        // Prev: rotate back card to front
        order.unshift(order.pop()!);
      }

      detailsEvenRef.current = !detailsEvenRef.current;
      const detailsActive = detailsEvenRef.current ? "#tc-details-even" : "#tc-details-odd";
      const detailsInactive = detailsEvenRef.current ? "#tc-details-odd" : "#tc-details-even";

      const [active, ...rest] = order;
      const prv = direction === 1 ? rest[rest.length - 1] : active;
      const incomingSlideData = activeSlides[active];

      const activeDetailsEl = container.querySelector(detailsActive) as HTMLElement | null;
      const inactiveDetailsEl = container.querySelector(detailsInactive) as HTMLElement | null;

      // 1. Update text for incoming slide
      if (activeDetailsEl && incomingSlideData) {
        const placeEl = activeDetailsEl.querySelector(".tc-place") as HTMLElement | null;
        const title1El = activeDetailsEl.querySelector(".tc-title-1") as HTMLElement | null;
        const title2El = activeDetailsEl.querySelector(".tc-title-2") as HTMLElement | null;
        const descEl = activeDetailsEl.querySelector(".tc-desc") as HTMLElement | null;
        const ctaEl = activeDetailsEl.querySelector(".tc-cta") as HTMLElement | null;

        if (placeEl) placeEl.textContent = incomingSlideData.location || "Borneo Brotherhood";
        if (title1El) title1El.textContent = incomingSlideData.headlinePart1;
        if (title2El) title2El.textContent = incomingSlideData.headlineGold;
        if (descEl) descEl.textContent = incomingSlideData.subtitle;

        // Reset positions below baseline before animating in
        gsap.set(activeDetailsEl, { opacity: 1, zIndex: 35 });
        gsap.set([placeEl, title1El, title2El, descEl, ctaEl], { y: 60, opacity: 0 });

        // Staggered slide-in animation matching the video
        gsap.to(placeEl, { y: 0, opacity: 1, delay: 0.1, duration: 0.7, ease });
        gsap.to(title1El, { y: 0, opacity: 1, delay: 0.15, duration: 0.7, ease });
        gsap.to(title2El, { y: 0, opacity: 1, delay: 0.18, duration: 0.7, ease });
        gsap.to(descEl, { y: 0, opacity: 1, delay: 0.28, duration: 0.6, ease });
        gsap.to(ctaEl, { y: 0, opacity: 1, delay: 0.35, duration: 0.6, ease });
      }

      // Hide inactive details
      if (inactiveDetailsEl) {
        gsap.to(inactiveDetailsEl, {
          opacity: 0,
          duration: 0.3,
          ease,
          onComplete: () => {
            gsap.set(inactiveDetailsEl, { zIndex: 12 });
          },
        });
      }

      // 2. Animate previously active card: zoom out into background
      const prvCard = getCard(prv);
      if (prvCard) {
        gsap.set(prvCard, { zIndex: 10 });
        gsap.to(prvCard, { scale: 1.35, duration: 1.1, ease });
      }

      // 3. Hide active card's small preview content
      const activeContent = getCardContent(active);
      if (activeContent) {
        gsap.to(activeContent, {
          y: config.offsetTop + config.cardHeight,
          opacity: 0,
          duration: 0.35,
          ease,
        });
      }

      // 4. Update progress bar
      gsap.to(container.querySelector(".tc-progress-foreground"), {
        width: `${((active + 1) / totalSlides) * 100}%`,
        duration: 0.8,
        ease,
      });

      // 5. Update number counter
      const activeSlideItem = getSlideItem(active);
      const prvSlideItem = getSlideItem(prv);
      if (activeSlideItem) gsap.to(activeSlideItem, { x: 0, duration: 0.7, ease });
      if (prvSlideItem) gsap.to(prvSlideItem, { x: -40, duration: 0.7, ease });

      // 6. THE CORE OPENING EFFECT: Active card expands to 100% full-screen
      const activeCard = getCard(active);
      if (activeCard) {
        gsap.set(activeCard, { zIndex: 20 });
        gsap.to(activeCard, {
          x: 0,
          y: 0,
          width: config.width,
          height: config.height,
          borderRadius: 0,
          duration: 0.85,
          ease,
          onComplete: () => {
            if (!isMounted) return;

            // Reset previously active card to the end of the preview stack
            const xNew = config.offsetLeft + (rest.length - 1) * (config.cardWidth + config.gap);
            if (prvCard) {
              gsap.set(prvCard, {
                x: xNew,
                y: config.offsetTop,
                width: config.cardWidth,
                height: config.cardHeight,
                zIndex: 25,
                borderRadius: 16,
                scale: 1,
              });
            }

            const prvContent = getCardContent(prv);
            if (prvContent) {
              gsap.set(prvContent, {
                x: xNew,
                y: config.offsetTop + config.cardHeight - 95,
                opacity: 1,
                zIndex: 30,
              });
            }

            const prvItem = getSlideItem(prv);
            if (prvItem) {
              gsap.set(prvItem, { x: rest.length * 40 });
            }

            isAnimatingRef.current = false;
          },
        });
      }

      // 7. Shift remaining preview cards leftward to their new slots
      rest.forEach((slideIdx, index) => {
        if (slideIdx !== prv) {
          const card = getCard(slideIdx);
          const content = getCardContent(slideIdx);
          const slideItem = getSlideItem(slideIdx);
          const xNew = config.offsetLeft + index * (config.cardWidth + config.gap);

          if (card) {
            gsap.set(card, { zIndex: 25 });
            gsap.to(card, {
              x: xNew,
              y: config.offsetTop,
              width: config.cardWidth,
              height: config.cardHeight,
              duration: 0.75,
              ease,
              delay: 0.08 * (index + 1),
            });
          }

          if (content) {
            gsap.to(content, {
              x: xNew,
              y: config.offsetTop + config.cardHeight - 95,
              opacity: 1,
              zIndex: 30,
              duration: 0.75,
              ease,
              delay: 0.08 * (index + 1),
            });
          }

          if (slideItem) {
            gsap.to(slideItem, {
              x: (index + 1) * 40,
              duration: 0.7,
              ease,
            });
          }
        }
      });
    };

    // Card click: advance until target card is opened
    const handleCardClick = (targetIndex: number) => {
      if (isAnimatingRef.current) return;
      const currentActive = orderRef.current[0];
      if (currentActive === targetIndex) return;

      step(1);
    };

    // Attach step & card clicks to window or container listeners
    (container as any).__tcStep = step;
    (container as any).__tcCardClick = handleCardClick;

    // Run initial setup
    initLayout();

    // Auto-play interval
    const startAutoPlay = () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = setInterval(() => {
        if (!isPausedRef.current && !isAnimatingRef.current) {
          step(1);
        }
      }, 7000);
    };

    startAutoPlay();

    // Responsive resize handler
    const handleResize = () => {
      initLayout();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeSlides]);

  const handleNext = () => {
    const container = containerRef.current;
    if (container && (container as any).__tcStep) {
      (container as any).__tcStep(1);
    }
  };

  const handlePrev = () => {
    const container = containerRef.current;
    if (container && (container as any).__tcStep) {
      (container as any).__tcStep(-1);
    }
  };

  const onCardClicked = (idx: number) => {
    const container = containerRef.current;
    if (container && (container as any).__tcCardClick) {
      (container as any).__tcCardClick(idx);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#07080C] min-h-[640px] h-[85vh] lg:h-[88vh] lg:min-h-[680px] lg:max-h-[900px] flex flex-col justify-between select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 1. TOP PROGRESS INDICATOR BAR (SEEN IN VIDEO) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-50">
        <div className="tc-progress-foreground h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400 w-1/6 transition-all" />
      </div>

      {/* 2. ABSOLUTE CARDS LAYER (OPENING EFFECT ENGINE) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            id={`tc-card-${index}`}
            onClick={() => onCardClicked(index)}
            className="absolute left-0 top-0 bg-center bg-cover shadow-2xl overflow-hidden cursor-pointer pointer-events-auto border border-white/15 hover:border-red-500/70 group"
            style={{
              backgroundImage: `url(${slide.bgUrl})`,
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.85)",
            }}
          >
            {/* Dark contrast vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          </div>
        ))}

        {/* Floating Card Contents (Shown only on small cards) */}
        {activeSlides.map((slide, index) => (
          <div
            key={`content-${slide.id}`}
            id={`tc-content-${index}`}
            onClick={() => onCardClicked(index)}
            className="absolute left-0 top-0 pl-4 pr-3 pointer-events-auto cursor-pointer z-30 select-none"
          >
            <div className="w-6 h-1 rounded-full bg-red-500 mb-2" />
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 truncate max-w-[170px]">
              {slide.location}
            </div>
            <div className="text-sm font-display font-black text-white leading-tight uppercase line-clamp-2 drop-shadow-md">
              {slide.headlinePart1} {slide.headlineGold}
            </div>
          </div>
        ))}
      </div>

      {/* 3. DUAL DETAILS LAYER: #tc-details-even & #tc-details-odd FOR FLAWLESS CROSS-FADE */}
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-6 z-35 w-full flex-1 flex flex-col justify-center pointer-events-none">
        {["even", "odd"].map((type) => (
          <div
            key={type}
            id={`tc-details-${type}`}
            className="absolute max-w-2xl flex flex-col justify-center space-y-4 sm:space-y-6 pointer-events-auto"
            style={{ opacity: 0 }}
          >
            {/* Location with accent line */}
            <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-neutral-300 uppercase">
              <span className="h-0.5 w-6 bg-red-500 rounded-full" />
              <span className="tc-place font-semibold text-white tracking-wider">
                Borneo Brotherhood Destination
              </span>
            </div>

            {/* Giant Bold Dramatic Headline */}
            <div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-display font-black uppercase tracking-tight text-white leading-[0.95] drop-shadow-2xl">
                <span className="tc-title-1 block">DESTINASI</span>
                <span className="tc-title-2 block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-400">
                  NUSANTARA
                </span>
              </h1>
            </div>

            {/* Descriptive Paragraph */}
            <p className="tc-desc text-xs sm:text-sm md:text-base text-neutral-300/90 leading-relaxed max-w-xl font-sans drop-shadow">
              Menembus bentang alam eksotis dengan formasi konvoi selang-seling yang disiplin dan aman.
            </p>

            {/* Action Row */}
            <div className="tc-cta flex items-center gap-4 pt-2 sm:pt-4">
              {/* Sound / Ambient Toggle Button */}
              <button
                onClick={() => setIsAudioActive(!isAudioActive)}
                className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
                  isAudioActive
                    ? "border-amber-400/80 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    : "border-white/20 bg-black/40 text-neutral-400 hover:text-white hover:border-white/40"
                }`}
                title={isAudioActive ? "Matikan Efek Suara" : "Aktifkan Efek Suara"}
                aria-label="Sound Toggle"
              >
                {isAudioActive ? (
                  <div className="flex items-center gap-0.5">
                    <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                    <span className="w-0.5 h-4 bg-amber-300 animate-pulse delay-75" />
                    <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-150" />
                  </div>
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>

              {/* Discover Location Glowing Pill Button */}
              <Link href="/events">
                <button className="relative group px-6 py-3 rounded-full border border-white/25 hover:border-red-500 bg-white/5 hover:bg-red-600/20 backdrop-blur-md text-white text-xs font-display font-bold uppercase tracking-wider shadow-lg flex items-center gap-2.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95">
                  <span>DISCOVER LOCATION</span>
                  <ArrowRight className="h-4 w-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 4. BOTTOM PAGINATION & SLIDE NUMBERS */}
      <div className="relative z-40 w-full border-t border-white/10 bg-[#07080C]/85 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
          {/* Navigation Arrows (< >) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="h-9 w-9 rounded-full border border-white/20 bg-black/50 hover:bg-red-600/30 hover:border-red-500 text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-md"
              aria-label="Previous Slide"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="h-9 w-9 rounded-full border border-white/20 bg-black/50 hover:bg-red-600/30 hover:border-red-500 text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-md"
              aria-label="Next Slide"
              title="Slide Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Sub progress bar */}
          <div className="flex-1 max-w-md mx-4 hidden sm:flex items-center gap-3">
            <div className="h-[2px] w-full bg-white/15 rounded-full overflow-hidden relative">
              <div className="tc-progress-foreground h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            </div>
          </div>

          {/* Sliding Slide Numbers (matching original GSAP item structure) */}
          <div className="relative w-10 h-7 overflow-hidden flex items-center justify-center font-mono font-bold text-red-400 text-sm">
            {activeSlides.map((_, index) => (
              <div
                key={`slide-num-${index}`}
                id={`tc-slide-item-${index}`}
                className="absolute inset-0 flex items-center justify-center"
              >
                0{index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
