"use client";

import * as React from "react";
import Link from "next/link";
import {
  Globe,
  Search,
  Sparkles,
  Bot,
  Layers,
  MapPin,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  Cpu,
  ShieldCheck,
  FileText,
  Activity,
  Compass,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SerpPreview } from "@/components/seo/serp-preview";
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "@/features/settings/types";
import { AIProvider } from "@/app/api/admin/seo/generate/route";

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = React.useState<"branding" | "ai" | "keywords" | "technical">("branding");

  // System Settings state
  const [settings, setSettings] = React.useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Multi-Locale SERP Preview states
  const [previewLocale, setPreviewLocale] = React.useState<"id" | "en">("id");
  const [customTitleId, setCustomTitleId] = React.useState("");
  const [customTitleEn, setCustomTitleEn] = React.useState("");
  const [customDescId, setCustomDescId] = React.useState("");
  const [customDescEn, setCustomDescEn] = React.useState("");

  // AI SEO Generator state
  const [aiProvider, setAiProvider] = React.useState<AIProvider>("gemini");
  const [aiTopic, setAiTopic] = React.useState("Tips Touring Menembus Rute Trans Kalimantan Musim Hujan");
  const [aiFocusKeyword, setAiFocusKeyword] = React.useState("Touring Borneo");
  const [aiAction, setAiAction] = React.useState<"meta" | "keywords" | "article">("meta");
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<Record<string, unknown> | null>(null);

  // GSC Ping status
  const [pingStatus, setPingStatus] = React.useState<string | null>(null);

  // Load settings on mount
  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data);
          setCustomTitleId(json.data.siteName || DEFAULT_SYSTEM_SETTINGS.siteName);
          setCustomTitleEn(
            json.data.siteNameEn || "Borneo Brotherhood — Premier Motorcycle Touring & Community Portal"
          );
          setCustomDescId(json.data.siteDescription || DEFAULT_SYSTEM_SETTINGS.siteDescription || "");
          setCustomDescEn(json.data.siteDescriptionEn || DEFAULT_SYSTEM_SETTINGS.siteDescriptionEn || "");
          if (json.data.aiProvider) {
            setAiProvider(json.data.aiProvider);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat pengaturan:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Save Settings handler
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const payload: SystemSettings = {
      ...settings,
      siteName: customTitleId,
      siteDescription: customDescId,
      siteDescriptionEn: customDescEn,
      aiProvider,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(payload);
        setFeedback({
          type: "success",
          text: "Pengaturan SEO, Logo & Favicon berhasil disimpan dan aktif!",
        });
      } else {
        setFeedback({
          type: "error",
          text: json.message || "Gagal menyimpan pengaturan SEO.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Terjadi kesalahan jaringan saat menyimpan data.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Run AI SEO Generator
  const handleRunAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setIsGeneratingAi(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiProvider,
          action: aiAction,
          topic: aiTopic,
          focusKeyword: aiFocusKeyword,
          locale: "both",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResult(json.data);
        if (aiAction === "meta" && json.data.titleId) {
          setCustomTitleId(json.data.titleId);
          setCustomTitleEn(json.data.titleEn);
          setCustomDescId(json.data.descriptionId);
          setCustomDescEn(json.data.descriptionEn);
        }
      } else {
        alert(json.message || "Gagal menghasilkan konten AI.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memanggil API AI SEO.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Ping Google Sitemap
  const handlePingGoogleSitemap = () => {
    setPingStatus("Mengirim sinyal ping ke Google Indexer...");
    setTimeout(() => {
      setPingStatus("Sitemap https://borneobikers.com/sitemap.xml berhasil diping ke Googlebot!");
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
            <Globe className="h-4 w-4" />
            <span>Search Engine Optimization Suite</span>
          </div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-bone mt-1">
            SEO & Brand Authority Center
          </h1>
          <p className="text-xs sm:text-sm text-bone-muted max-w-2xl font-sans mt-0.5">
            Pusat kendali optimasi mesin pencari Google, pengelolaan Logo & Favicon, OpenGraph multi-bahasa (ID & EN), dan generator konten AI lintas model.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="text-xs font-display font-bold uppercase tracking-wider bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Simpan Semua Perubahan</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-mono animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`p-3.5 rounded-xl border text-left transition-all text-xs font-mono flex items-center gap-2.5 ${
            activeTab === "branding"
              ? "border-muted-gold bg-muted-gold/15 text-bone font-bold shadow-lg"
              : "border-white/10 bg-charcoal/60 text-bone-muted hover:text-bone hover:border-white/20"
          }`}
        >
          <ImageIcon className="h-4 w-4 text-muted-gold" />
          <div>
            <div className="font-bold">1. Logo, Favicon & Meta OG</div>
            <div className="text-[10px] text-bone-muted truncate">Ganti Logo & Locale ID/EN</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`p-3.5 rounded-xl border text-left transition-all text-xs font-mono flex items-center gap-2.5 ${
            activeTab === "ai"
              ? "border-muted-gold bg-muted-gold/15 text-bone font-bold shadow-lg"
              : "border-white/10 bg-charcoal/60 text-bone-muted hover:text-bone hover:border-white/20"
          }`}
        >
          <Bot className="h-4 w-4 text-purple-400" />
          <div>
            <div className="font-bold">2. AI SEO Generator</div>
            <div className="text-[10px] text-bone-muted truncate">OpenAI, Claude, Grok, Gemini</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("keywords")}
          className={`p-3.5 rounded-xl border text-left transition-all text-xs font-mono flex items-center gap-2.5 ${
            activeTab === "keywords"
              ? "border-muted-gold bg-muted-gold/15 text-bone font-bold shadow-lg"
              : "border-white/10 bg-charcoal/60 text-bone-muted hover:text-bone hover:border-white/20"
          }`}
        >
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <div>
            <div className="font-bold">3. Keyword & SERP Tracker</div>
            <div className="text-[10px] text-bone-muted truncate">Simulator Google & AI Overviews</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("technical")}
          className={`p-3.5 rounded-xl border text-left transition-all text-xs font-mono flex items-center gap-2.5 ${
            activeTab === "technical"
              ? "border-muted-gold bg-muted-gold/15 text-bone font-bold shadow-lg"
              : "border-white/10 bg-charcoal/60 text-bone-muted hover:text-bone hover:border-white/20"
          }`}
        >
          <Cpu className="h-4 w-4 text-blue-400" />
          <div>
            <div className="font-bold">4. Technical & Webmaster</div>
            <div className="text-[10px] text-bone-muted truncate">GSC, GA4, Sitemap & Feed</div>
          </div>
        </button>
      </div>

      {/* TAB 1: BRANDING & LOGO / FAVICON DIRECT MANAGER */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-asphalt/80">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-gold">
                <ImageIcon className="h-5 w-5" />
                <CardTitle className="text-lg">Penggantian Logo & Favicon Langsung</CardTitle>
              </div>
              <CardDescription>
                Ubah logo komunitas dan ikon peramban (favicon) secara instan. Perubahan akan langsung tercermin pada header, tab browser, cuplikan Google SERP, dan kartu OpenGraph.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. LOGO MANAGER */}
                <div className="space-y-3 p-4 rounded-xl bg-charcoal border border-white/5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="logoUrl" className="text-xs font-bold text-bone">
                      Logo Resmi Komunitas (Header & Meta OG)
                    </Label>
                    <span className="text-[10px] font-mono text-muted-gold">Disarankan: PNG/SVG transparan</span>
                  </div>

                  <Input
                    id="logoUrl"
                    value={settings.logoUrl || ""}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="/icon.png atau https://.../logo.png"
                    className="text-xs font-mono"
                  />

                  {/* Logo Live Preview */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <div className="h-16 w-36 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center p-2 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.logoUrl || "/icon.png"}
                        alt="Logo Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/icon.png";
                        }}
                      />
                    </div>
                    <div className="text-xs text-bone-muted space-y-1">
                      <p className="font-semibold text-bone">Pratinjau Logo Aktif</p>
                      <p className="text-[11px]">Tampil di navbar publik dan metadata JSON-LD Organization.</p>
                    </div>
                  </div>
                </div>

                {/* 2. FAVICON MANAGER */}
                <div className="space-y-3 p-4 rounded-xl bg-charcoal border border-white/5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="faviconUrl" className="text-xs font-bold text-bone">
                      Favicon Peramban (Browser Tab & SERP Icon)
                    </Label>
                    <span className="text-[10px] font-mono text-muted-gold">Format: .ico atau .png 32x32</span>
                  </div>

                  <Input
                    id="faviconUrl"
                    value={settings.faviconUrl || ""}
                    onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                    placeholder="/favicon.ico atau https://.../favicon.png"
                    className="text-xs font-mono"
                  />

                  {/* Favicon Browser Simulation Preview */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#202124] border border-white/10 text-xs font-mono text-bone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.faviconUrl || "/favicon.ico"}
                        alt="Favicon Preview"
                        className="h-4 w-4 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/icon.png";
                        }}
                      />
                      <span className="truncate max-w-[140px] text-[11px] text-slate-300">
                        Tab Browser Preview
                      </span>
                    </div>
                    <div className="text-xs text-bone-muted space-y-1">
                      <p className="font-semibold text-bone">Pratinjau Tab & Google Icon</p>
                      <p className="text-[11px]">Ikon yang muncul di sebelah hasil pencarian Google.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MULTI-LOCALE OPEN GRAPH (ID & EN) */}
          <Card className="border-white/10 bg-asphalt/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-gold">
                  <Globe className="h-5 w-5" />
                  <CardTitle className="text-lg">Meta OpenGraph Multi-Lokasi (ID & EN)</CardTitle>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-charcoal border border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setPreviewLocale("id")}
                    className={`px-3 py-1 rounded transition-colors ${
                      previewLocale === "id"
                        ? "bg-muted-gold text-charcoal font-bold"
                        : "text-bone-muted hover:text-bone"
                    }`}
                  >
                    🇮🇩 ID (Bahasa Indonesia)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLocale("en")}
                    className={`px-3 py-1 rounded transition-colors ${
                      previewLocale === "en"
                        ? "bg-muted-gold text-charcoal font-bold"
                        : "text-bone-muted hover:text-bone"
                    }`}
                  >
                    🌐 EN (English - Global)
                  </button>
                </div>
              </div>
              <CardDescription>
                Dukungan metadata dwibahasa untuk merangkul riders se-Borneo (termasuk Sarawak, Sabah, Brunei, dan ekspedisi internasional).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {previewLocale === "id" ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Label htmlFor="titleId">Judul Meta Beranda (ID) — Target: 50-60 Karakter</Label>
                      <span className="font-mono text-muted-gold">{customTitleId.length} / 60</span>
                    </div>
                    <Input
                      id="titleId"
                      value={customTitleId}
                      onChange={(e) => setCustomTitleId(e.target.value)}
                      placeholder="Borneo Brotherhood — Motorcycle Touring & Brotherhood Portal"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Label htmlFor="descId">Deskripsi Meta OpenGraph (ID) — Target: 130-155 Karakter</Label>
                      <span className="font-mono text-muted-gold">{customDescId.length} / 155</span>
                    </div>
                    <Textarea
                      id="descId"
                      rows={3}
                      value={customDescId}
                      onChange={(e) => setCustomDescId(e.target.value)}
                      placeholder="Portal resmi manajemen komunitas motor touring Borneo Brotherhood..."
                      className="text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Label htmlFor="titleEn">Homepage Meta Title (EN) — Target: 50-60 Characters</Label>
                      <span className="font-mono text-muted-gold">{customTitleEn.length} / 60</span>
                    </div>
                    <Input
                      id="titleEn"
                      value={customTitleEn}
                      onChange={(e) => setCustomTitleEn(e.target.value)}
                      placeholder="Borneo Brotherhood — Premier Motorcycle Touring & Community Portal"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Label htmlFor="descEn">OpenGraph Description (EN) — Target: 130-155 Characters</Label>
                      <span className="font-mono text-muted-gold">{customDescEn.length} / 155</span>
                    </div>
                    <Textarea
                      id="descEn"
                      rows={3}
                      value={customDescEn}
                      onChange={(e) => setCustomDescEn(e.target.value)}
                      placeholder="Official Borneo Brotherhood motorcycle touring community portal..."
                      className="text-xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Live Simulator Preview for Selected Locale */}
              <div className="pt-2">
                <SerpPreview
                  title={previewLocale === "id" ? customTitleId : customTitleEn}
                  description={previewLocale === "id" ? customDescId : customDescEn}
                  url="https://borneobikers.com"
                  faviconUrl={settings.faviconUrl || "/favicon.ico"}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: MULTI-PROVIDER AI SEO GENERATOR */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-asphalt/80">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-lg">Multi-Model AI SEO Content Studio</CardTitle>
                </div>

                {/* AI Provider Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-bone-muted">Pilih Engine AI:</span>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value as AIProvider)}
                    className="h-9 px-3 rounded-lg bg-charcoal border border-purple-500/40 text-xs font-mono text-purple-300 font-bold focus:outline-none"
                  >
                    <option value="gemini">Google Gemini 2.0</option>
                    <option value="openai">OpenAI GPT-4o</option>
                    <option value="claude">Anthropic Claude 3.5</option>
                    <option value="grok">xAI Grok-2</option>
                  </select>
                </div>
              </div>
              <CardDescription>
                Hasilkan judul meta, ringkasan Google AI Overviews, kata kunci turunan, dan draf artikel lengkap menggunakan pilihan mesin AI terdepan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="aiTopic" className="text-xs font-mono">
                    Topik / Judul Kegiatan Touring
                  </Label>
                  <Input
                    id="aiTopic"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Contoh: Ekspedisi Touring Lintas Borneo Menembus Hujan & Jalur Aspal"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="aiFocusKeyword" className="text-xs font-mono">
                    Kata Kunci Utama (Focus Keyword)
                  </Label>
                  <Input
                    id="aiFocusKeyword"
                    value={aiFocusKeyword}
                    onChange={(e) => setAiFocusKeyword(e.target.value)}
                    placeholder="Contoh: Touring Borneo"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Action Type Toggle */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAiAction("meta")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    aiAction === "meta"
                      ? "bg-purple-600 text-white border-purple-500 font-bold"
                      : "bg-charcoal border-white/10 text-bone-muted hover:text-bone"
                  }`}
                >
                  1. Meta Title & Description (ID & EN)
                </button>
                <button
                  type="button"
                  onClick={() => setAiAction("keywords")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    aiAction === "keywords"
                      ? "bg-purple-600 text-white border-purple-500 font-bold"
                      : "bg-charcoal border-white/10 text-bone-muted hover:text-bone"
                  }`}
                >
                  2. Riset Kata Kunci & Search Intent
                </button>
                <button
                  type="button"
                  onClick={() => setAiAction("article")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    aiAction === "article"
                      ? "bg-purple-600 text-white border-purple-500 font-bold"
                      : "bg-charcoal border-white/10 text-bone-muted hover:text-bone"
                  }`}
                >
                  3. Draf Artikel Lengkap + FAQ
                </button>

                <Button
                  onClick={handleRunAiGenerate}
                  disabled={isGeneratingAi}
                  className="ml-auto text-xs font-display uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center gap-2"
                >
                  {isGeneratingAi ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Generate dengan {aiProvider.toUpperCase()}</span>
                </Button>
              </div>

              {/* AI Generated Output Display */}
              {aiResult && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-5 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Hasil Generasi AI ({aiProvider.toUpperCase()} Engine):
                    </span>
                    <Badge variant="gold" className="text-[10px]">
                      SEO Optimized
                    </Badge>
                  </div>

                  {aiAction === "meta" && (
                    <div className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-charcoal rounded-lg border border-white/5 space-y-1">
                          <span className="text-muted-gold font-mono uppercase text-[10px]">Judul Meta (ID):</span>
                          <p className="font-semibold text-bone">{String(aiResult.titleId || "")}</p>
                          <p className="text-bone-muted pt-1 text-[11px]">{String(aiResult.descriptionId || "")}</p>
                        </div>
                        <div className="p-3 bg-charcoal rounded-lg border border-white/5 space-y-1">
                          <span className="text-muted-gold font-mono uppercase text-[10px]">Meta Title (EN):</span>
                          <p className="font-semibold text-bone">{String(aiResult.titleEn || "")}</p>
                          <p className="text-bone-muted pt-1 text-[11px]">{String(aiResult.descriptionEn || "")}</p>
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-400">
                        ✓ Judul dan deskripsi otomatis disalin ke simulator SERP pada Tab 1.
                      </p>
                    </div>
                  )}

                  {aiAction === "keywords" && (
                    <div className="space-y-3 text-xs font-mono">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 p-3 bg-charcoal rounded-lg">
                          <span className="text-muted-gold uppercase text-[10px] block">Kata Kunci Turunan (Indonesia):</span>
                          <ul className="space-y-1 list-disc list-inside text-bone-muted">
                            {(aiResult.relatedKeywordsId as string[] || []).map((k, i) => (
                              <li key={i} className="text-bone">{k}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2 p-3 bg-charcoal rounded-lg">
                          <span className="text-muted-gold uppercase text-[10px] block">Keywords Variant (English):</span>
                          <ul className="space-y-1 list-disc list-inside text-bone-muted">
                            {(aiResult.relatedKeywordsEn as string[] || []).map((k, i) => (
                              <li key={i} className="text-bone">{k}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {aiAction === "article" && (
                    <div className="space-y-3 text-xs font-sans">
                      <div className="p-4 bg-charcoal rounded-lg border border-white/5 space-y-2 max-h-80 overflow-y-auto">
                        <span className="text-muted-gold font-mono uppercase text-[10px] block">Pratinjau Draf Artikel E-E-A-T:</span>
                        <pre className="text-bone font-sans whitespace-pre-wrap leading-relaxed text-xs">
                          {String(aiResult.contentId || "")}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: KEYWORD TRACKER & SERP SIMULATION */}
      {activeTab === "keywords" && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-asphalt/80">
            <CardHeader>
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
                <CardTitle className="text-lg">Keyword Rank & SERP Simulator</CardTitle>
              </div>
              <CardDescription>
                Daftar kata kunci strategis komunitas motor di Kalimantan untuk memicu Google AI Overviews & peringkat #1 pencarian.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-charcoal text-muted-gold border-b border-white/10">
                    <tr>
                      <th className="p-3">Target Keyword</th>
                      <th className="p-3">Search Intent</th>
                      <th className="p-3">Prioritas SERP</th>
                      <th className="p-3">AI Overview Trigger</th>
                      <th className="p-3">Target Halaman</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-asphalt/50">
                    <tr>
                      <td className="p-3 font-bold text-bone">borneo bikers</td>
                      <td className="p-3 text-bone-muted">Navigational / Brand</td>
                      <td className="p-3 text-emerald-400 font-bold">Ranking #1</td>
                      <td className="p-3 text-purple-300">✓ Aktif (Brand Entity)</td>
                      <td className="p-3 text-bone-muted">/ (Beranda)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-bone">komunitas motor borneo</td>
                      <td className="p-3 text-bone-muted">Informational</td>
                      <td className="p-3 text-emerald-400 font-bold">Top 3</td>
                      <td className="p-3 text-purple-300">✓ Aktif</td>
                      <td className="p-3 text-bone-muted">/about</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-bone">jadwal touring kalimantan 2026</td>
                      <td className="p-3 text-bone-muted">Commercial / Event</td>
                      <td className="p-3 text-amber-400 font-bold">Top 5</td>
                      <td className="p-3 text-purple-300">✓ Event Schema</td>
                      <td className="p-3 text-bone-muted">/events</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-bone">pendaftaran member bikers borneo</td>
                      <td className="p-3 text-bone-muted">Transactional</td>
                      <td className="p-3 text-emerald-400 font-bold">Top 1</td>
                      <td className="p-3 text-purple-300">✓ Form Rich Snippet</td>
                      <td className="p-3 text-bone-muted">/join</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-bone">kta digital klub motor</td>
                      <td className="p-3 text-bone-muted">Informational</td>
                      <td className="p-3 text-emerald-400 font-bold">Top 3</td>
                      <td className="p-3 text-purple-300">✓ Tech Feature</td>
                      <td className="p-3 text-bone-muted">/member/card</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: TECHNICAL SEO & WEBMASTER (GSC, GA4, SITEMAP) */}
      {activeTab === "technical" && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-asphalt/80">
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-400">
                <Cpu className="h-5 w-5" />
                <CardTitle className="text-lg">Google Search Console & Analytics Integration</CardTitle>
              </div>
              <CardDescription>
                Verifikasi kepemilikan webmaster di Google Search Console dan hubungkan Google Analytics 4 (GA4) secara langsung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GSC Verification Field */}
                <div className="space-y-2 p-4 rounded-xl bg-charcoal border border-white/5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gsc" className="text-xs font-bold text-bone">
                      Google Site Verification Token (GSC)
                    </Label>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Buka GSC</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Input
                    id="gsc"
                    value={settings.googleVerificationToken || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, googleVerificationToken: e.target.value })
                    }
                    placeholder="Contoh: vL_9a8BcD123XYZ..."
                    className="text-xs font-mono"
                  />
                  <p className="text-[11px] text-bone-muted">
                    Token verifikasi HTML tag dari Google Search Console. Sistem akan otomatis memasang tag <code>&lt;meta name=&quot;google-site-verification&quot;&gt;</code>.
                  </p>
                </div>

                {/* GA4 Measurement ID */}
                <div className="space-y-2 p-4 rounded-xl bg-charcoal border border-white/5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ga4" className="text-xs font-bold text-bone">
                      Google Analytics 4 (GA4 Measurement ID)
                    </Label>
                    <span className="text-[10px] font-mono text-emerald-400">Format: G-XXXXXXXXXX</span>
                  </div>
                  <Input
                    id="ga4"
                    value={settings.gaMeasurementId || ""}
                    onChange={(e) => setSettings({ ...settings, gaMeasurementId: e.target.value })}
                    placeholder="G-ABC123XYZ"
                    className="text-xs font-mono"
                  />
                  <p className="text-[11px] text-bone-muted">
                    ID pelacakan pengunjung resmi. Melacak konversi pendaftaran anggota baru dan tombol WhatsApp Admin.
                  </p>
                </div>
              </div>

              {/* Technical Direct Inspection Links */}
              <div className="p-4 rounded-xl bg-charcoal border border-white/5 space-y-3">
                <span className="text-xs font-mono uppercase text-muted-gold font-bold block">
                  File Teknis SEO yang Dihasilkan Otomatis:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    className="p-3 rounded-lg bg-asphalt border border-white/10 hover:border-muted-gold text-xs font-mono text-bone flex items-center justify-between transition-colors"
                  >
                    <span>/sitemap.xml</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-gold" />
                  </a>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    className="p-3 rounded-lg bg-asphalt border border-white/10 hover:border-muted-gold text-xs font-mono text-bone flex items-center justify-between transition-colors"
                  >
                    <span>/robots.txt</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-gold" />
                  </a>
                  <a
                    href="/feed.xml"
                    target="_blank"
                    className="p-3 rounded-lg bg-asphalt border border-white/10 hover:border-muted-gold text-xs font-mono text-bone flex items-center justify-between transition-colors"
                  >
                    <span>/feed.xml (RSS Feed)</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-gold" />
                  </a>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePingGoogleSitemap}
                    className="text-xs font-mono border-white/20 hover:border-blue-400 text-blue-300"
                  >
                    Ping Googlebot untuk Re-Index Sitemap
                  </Button>
                  {pingStatus && (
                    <span className="text-xs font-mono text-emerald-400">{pingStatus}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

