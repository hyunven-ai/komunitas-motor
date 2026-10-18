"use client";

import * as React from "react";
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Minus,
  Eye,
  Code2,
  Type,
  Image as ImageIcon,
  HelpCircle,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordPressEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function WordPressEditor({
  value,
  onChange,
  placeholder = "Tulis isi lengkap artikel narasi di sini...",
  minHeight = "280px",
}: WordPressEditorProps) {
  const [activeTab, setActiveTab] = React.useState<"visual" | "text" | "preview">("visual");
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const visualRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Sync value to visual editor when switching to visual tab or on initial load
  React.useEffect(() => {
    if (activeTab === "visual" && visualRef.current) {
      if (visualRef.current.innerHTML !== value) {
        visualRef.current.innerHTML = value || "";
      }
    }
  }, [activeTab, value]);

  // Handle changes in Visual Mode
  const handleVisualInput = () => {
    if (visualRef.current) {
      const html = visualRef.current.innerHTML;
      onChange(html);
    }
  };

  // Execute formatting command in Visual Mode
  const executeVisualCommand = (command: string, valueArgument?: string) => {
    if (visualRef.current) {
      visualRef.current.focus();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand(command, false, valueArgument);
      handleVisualInput();
    }
  };

  // Insert tag in Text/HTML Mode
  const insertTextTag = (openTag: string, closeTag: string, placeholderText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || placeholderText;
    const replacement = `${openTag}${selectedText}${closeTag}`;

    const newValue =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + selectedText.length
      );
    }, 10);
  };

  // Formatting dispatchers (works in both Visual and Text modes!)
  const applyH2 = () => {
    if (activeTab === "visual") {
      executeVisualCommand("formatBlock", "<h2>");
    } else {
      insertTextTag("<h2>", "</h2>", "Sub-judul Utama (H2)");
    }
  };

  const applyH3 = () => {
    if (activeTab === "visual") {
      executeVisualCommand("formatBlock", "<h3>");
    } else {
      insertTextTag("<h3>", "</h3>", "Sub-bagian Artikel (H3)");
    }
  };

  const applyParagraph = () => {
    if (activeTab === "visual") {
      executeVisualCommand("formatBlock", "<p>");
    } else {
      insertTextTag("<p>", "</p>", "Paragraf teks biasa");
    }
  };

  const applyBold = () => {
    if (activeTab === "visual") {
      executeVisualCommand("bold");
    } else {
      insertTextTag("<strong>", "</strong>", "Teks Tebal");
    }
  };

  const applyItalic = () => {
    if (activeTab === "visual") {
      executeVisualCommand("italic");
    } else {
      insertTextTag("<em>", "</em>", "Teks Miring");
    }
  };

  const applyUnderline = () => {
    if (activeTab === "visual") {
      executeVisualCommand("underline");
    } else {
      insertTextTag("<u>", "</u>", "Teks Garis Bawah");
    }
  };

  const applyStrike = () => {
    if (activeTab === "visual") {
      executeVisualCommand("strikeThrough");
    } else {
      insertTextTag("<strike>", "</strike>", "Teks Coret");
    }
  };

  const applyBlockquote = () => {
    if (activeTab === "visual") {
      executeVisualCommand("formatBlock", "<blockquote>");
    } else {
      insertTextTag("<blockquote>", "</blockquote>", "Kutipan pernyataan penting...");
    }
  };

  const applyUnorderedList = () => {
    if (activeTab === "visual") {
      executeVisualCommand("insertUnorderedList");
    } else {
      insertTextTag("<ul>\n  <li>", "</li>\n</ul>", "Item daftar");
    }
  };

  const applyOrderedList = () => {
    if (activeTab === "visual") {
      executeVisualCommand("insertOrderedList");
    } else {
      insertTextTag("<ol>\n  <li>", "</li>\n</ol>", "Langkah nomor 1");
    }
  };

  const applyHorizontalRule = () => {
    if (activeTab === "visual") {
      executeVisualCommand("insertHorizontalRule");
    } else {
      insertTextTag("<hr />\n", "");
    }
  };

  const applyLink = () => {
    const url = prompt("Masukkan URL Tautan Web (e.g. https://...):", "https://");
    if (!url) return;

    if (activeTab === "visual") {
      executeVisualCommand("createLink", url);
    } else {
      insertTextTag(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, "</a>", "Teks Tautan");
    }
  };

  const handleInsertInlineImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "news-inline");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        const imgUrl = data.data.url;
        if (activeTab === "visual") {
          executeVisualCommand("insertImage", imgUrl);
        } else {
          insertTextTag(`<img src="${imgUrl}" alt="Foto Artikel" />\n`, "");
        }
      } else {
        alert(data.message || "Gagal mengunggah foto inline.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat mengunggah foto.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0f14] overflow-hidden shadow-2xl space-y-0">
      {/* WORDPRESS TOOLBAR HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-asphalt/80 border-b border-white/10 text-xs">
        {/* Left Controls: Headings & Formatting */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Format Block Picker */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={applyParagraph}
              title="Format Paragraf Normal"
              className="px-2 py-1 rounded text-[11px] font-semibold text-bone hover:text-amber-400 hover:bg-white/10 transition flex items-center gap-1"
            >
              <Type className="h-3 w-3" />
              <span>Paragraf</span>
            </button>

            {/* H2 BUTTON */}
            <button
              type="button"
              onClick={applyH2}
              title="Jadikan Sub-judul H2 (Heading 2)"
              className="px-2.5 py-1 rounded text-xs font-black bg-amber-400/20 text-amber-400 border border-amber-400/40 hover:bg-amber-400 hover:text-charcoal transition flex items-center gap-1"
            >
              <Heading2 className="h-3.5 w-3.5" />
              <span>H2</span>
            </button>

            {/* H3 BUTTON */}
            <button
              type="button"
              onClick={applyH3}
              title="Jadikan Sub-bagian H3 (Heading 3)"
              className="px-2.5 py-1 rounded text-xs font-black bg-white/10 text-bone border border-white/20 hover:bg-white hover:text-charcoal transition flex items-center gap-1"
            >
              <Heading3 className="h-3.5 w-3.5" />
              <span>H3</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          {/* Inline Styles */}
          <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={applyBold}
              title="Tebal (Bold / Ctrl+B)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={applyItalic}
              title="Miring (Italic / Ctrl+I)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={applyUnderline}
              title="Garis Bawah (Underline / Ctrl+U)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={applyStrike}
              title="Coret Teks (Strikethrough)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          {/* Block Elements */}
          <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={applyBlockquote}
              title="Kutipan (Blockquote)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={applyUnorderedList}
              title="Daftar Butir (Bullet List)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={applyOrderedList}
              title="Daftar Nomor (Numbered List)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={applyLink}
              title="Sisipkan Tautan Web"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={applyHorizontalRule}
              title="Garis Pemisah (Horizontal Rule)"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            {/* Inline image upload button */}
            <label
              title="Sisipkan Gambar ke Dalam Artikel"
              className="p-1.5 rounded text-bone hover:text-amber-400 hover:bg-white/10 transition cursor-pointer flex items-center"
            >
              {uploadingImage ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={handleInsertInlineImage}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Controls: Mode Tabs (Visual | Teks / HTML | Pratinjau) */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
              activeTab === "visual"
                ? "bg-amber-400 text-charcoal shadow"
                : "text-bone-muted hover:text-bone"
            }`}
          >
            <span>Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
              activeTab === "text"
                ? "bg-amber-400 text-charcoal shadow"
                : "text-bone-muted hover:text-bone"
            }`}
          >
            <Code2 className="h-3 w-3" />
            <span>Teks (HTML)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
              activeTab === "preview"
                ? "bg-amber-400 text-charcoal shadow"
                : "text-bone-muted hover:text-bone"
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Pratinjau</span>
          </button>
        </div>
      </div>

      {/* EDITOR CANVAS AREA */}
      <div className="relative bg-charcoal">
        {/* MODE 1: VISUAL WYSIWYG EDITOR */}
        {activeTab === "visual" && (
          <div
            ref={visualRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="article-prose p-4 focus:outline-none text-bone overflow-y-auto max-h-[500px] leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-bone-muted/40"
          />
        )}

        {/* MODE 2: RAW TEXT / HTML CODE EDITOR */}
        {activeTab === "text" && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight }}
            placeholder={placeholder}
            className="w-full p-4 font-mono text-xs text-amber-200/90 bg-black/40 focus:outline-none resize-y max-h-[500px] leading-relaxed border-0"
          />
        )}

        {/* MODE 3: LIVE PREVIEW ACCORDING TO FRONTEND ARTICLE DESIGN */}
        {activeTab === "preview" && (
          <div
            style={{ minHeight }}
            className="p-5 max-h-[500px] overflow-y-auto bg-asphalt/50 border-t border-white/5"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-amber-400">
              <Eye className="h-3.5 w-3.5" />
              <span>Tampilan Persis Seperti di Halaman Berita (/news/[slug])</span>
            </div>

            {value ? (
              <div
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <p className="text-bone-muted italic text-xs">Belum ada konten artikel.</p>
            )}
          </div>
        )}
      </div>

      {/* FOOTER HELPER BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-t border-white/5 text-[11px] text-bone-muted">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
          <span>
            Gunakan tombol <strong className="text-amber-400">H2</strong> untuk sub-judul topik utama, dan{" "}
            <strong className="text-bone">H3</strong> untuk sub-bagian artikel.
          </span>
        </div>

        <div className="font-mono text-[10px] text-amber-400/90">
          Mode: <span className="uppercase font-bold">{activeTab}</span>
        </div>
      </div>
    </div>
  );
}
