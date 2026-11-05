"use client";

import * as React from "react";

const COMMON_EMOJIS = ["🔥", "🏍️", "⚡", "🤝", "👍", "❤️", "🏁", "🚀", "😂", "👏", "🎯", "🛡️"];

export function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}) {
  return (
    <div className="p-2 bg-[#12141C] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      <div className="text-[10px] font-bold tracking-wider text-bone-muted uppercase px-1 mb-1.5">
        Reaksi Cepat
      </div>
      <div className="grid grid-cols-6 gap-1 w-56">
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelect(emoji);
              if (onClose) onClose();
            }}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-lg transition-transform hover:scale-125 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

