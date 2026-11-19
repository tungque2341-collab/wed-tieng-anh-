"use client";

import { useState } from "react";

type Props = {
  phonetic: string;
  className?: string;
};

/**
 * Nút hiển thị phiên âm và phát âm (Text-to-Speech).
 * Dùng Web Speech API (trình duyệt hỗ trợ sẵn, không cần API key).
 */
export function PhoneticButton({ phonetic, className = "" }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ("speechSynthesis" in window) {
      // Hủy phát âm đang chạy (nếu có)
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(phonetic);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      type="button"
      onClick={speak}
      disabled={isSpeaking}
      className={`inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 transition-colors disabled:opacity-50 ${className}`}
      aria-label={`Phát âm: ${phonetic}`}
    >
      <span className="relative">
        <svg
          className={`w-4 h-4 ${isSpeaking ? "text-green-600 animate-pulse" : "text-zinc-500"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      </span>
      <span className="font-mono">{phonetic}</span>
    </button>
  );
}