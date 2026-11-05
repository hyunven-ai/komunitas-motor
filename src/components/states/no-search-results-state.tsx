"use client";

import * as React from "react";
import {
  SearchX,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  findTypoCorrection,
  COMMUNITY_KEYWORDS,
  type TypoSuggestionResult,
} from "@/lib/states/fuzzy-search";
import { cn } from "@/lib/utils";

export interface NoSearchResultsProps {
  /** The user's original search keyword */
  query: string;
  /** Callback when user accepts the typo correction or picks a suggestion */
  onSelectSuggestion: (newQuery: string) => void;
  /** Optional custom suggestions list */
  customSuggestions?: string[];
  /** Optional dictionary for custom domains (e.g. news, events, members) */
  dictionary?: string[];
  /** Optional reset/clear search callback */
  onClear?: () => void;
  className?: string;
}

export function NoSearchResultsState({
  query,
  onSelectSuggestion,
  customSuggestions,
  dictionary = COMMUNITY_KEYWORDS,
  onClear,
  className,
}: NoSearchResultsProps) {
  const [liveInput, setLiveInput] = React.useState(query);

  // Compute typo correction and suggestions
  const typoResult: TypoSuggestionResult = React.useMemo(() => {
    return findTypoCorrection(query, dictionary);
  }, [query, dictionary]);

  const suggestions =
    customSuggestions && customSuggestions.length > 0
      ? customSuggestions
      : typoResult.suggestedKeywords;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveInput.trim()) {
      onSelectSuggestion(liveInput.trim());
    }
  };

  return (
    <div
      role="region"
      aria-label="Hasil Pencarian Tidak Ditemukan"
      className={cn(
        "rounded-2xl border border-white/10 bg-asphalt/85 backdrop-blur-md p-6 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden",
        className
      )}
    >
      {/* Background motif */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Icon Badge */}
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-charcoal border border-white/10 text-bone-muted shadow-inner">
          <SearchX className="h-7 w-7 stroke-[1.75]" />
        </div>
        <span className="text-[10px] font-mono tracking-widest uppercase text-muted-gold font-bold">
          HASIL TIDAK DITEMUKAN
        </span>
        <h3 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-bone">
          Tidak Ada Data yang Cocok
        </h3>
        <p className="text-xs sm:text-sm text-bone-muted max-w-md font-sans">
          Pencarian untuk kata kunci{" "}
          <span className="text-bone font-mono font-bold bg-charcoal px-2 py-0.5 rounded border border-white/10">
            &ldquo;{query}&rdquo;
          </span>{" "}
          tidak menghasilkan dokumen atau agenda yang terdaftar.
        </p>
      </div>

      {/* TYPO CORRECTION SECTION: "fix the typo for them" */}
      {typoResult.hasTypo && typoResult.suggestedQuery && (
        <div className="max-w-md mx-auto rounded-xl bg-gradient-to-r from-muted-gold/15 via-charcoal to-muted-gold/15 border border-muted-gold/30 p-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-muted-gold font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Koreksi Ketikan Otomatis:</span>
          </div>
          <p className="text-sm text-bone font-sans">
            Apakah maksud Anda:{" "}
            <button
              type="button"
              onClick={() => onSelectSuggestion(typoResult.suggestedQuery!)}
              className="font-bold text-muted-gold underline decoration-2 underline-offset-4 hover:text-white transition-colors"
            >
              &ldquo;{typoResult.suggestedQuery}&rdquo;
            </button>
            ?
          </p>
          <div className="pt-1">
            <Button
              type="button"
              onClick={() => onSelectSuggestion(typoResult.suggestedQuery!)}
              className="text-xs font-display uppercase tracking-wider py-2 px-4 bg-muted-gold hover:bg-muted-gold-hover text-charcoal font-bold shadow-md"
            >
              <span>Cari &ldquo;{typoResult.suggestedQuery}&rdquo; Sekarang</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* SUGGEST A NEXT SEARCH SECTION: "suggest a next search" */}
      <div className="max-w-lg mx-auto space-y-3 pt-2">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-bone-muted uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5 text-muted-gold" />
          <span>Saran Kata Kunci Populer Komunitas:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="px-3 py-1.5 rounded-lg bg-charcoal border border-white/10 hover:border-muted-gold text-xs font-mono text-bone hover:text-muted-gold transition-all duration-200 flex items-center gap-1.5 group shadow-sm"
            >
              <Compass className="h-3 w-3 text-bone-muted group-hover:text-muted-gold" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick In-Place Search Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bone-muted" />
          <Input
            value={liveInput}
            onChange={(e) => setLiveInput(e.target.value)}
            placeholder="Coba kata kunci lain..."
            className="pl-9 text-xs"
          />
        </div>
        <Button
          type="submit"
          className="px-4 text-xs font-display uppercase tracking-wider bg-charcoal border border-white/20 hover:border-muted-gold text-bone"
        >
          Cari
        </Button>
        {onClear && (
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="px-3 text-xs font-mono text-bone-muted hover:text-bone border-white/10"
          >
            Reset
          </Button>
        )}
      </form>
    </div>
  );
}

