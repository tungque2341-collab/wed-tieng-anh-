"use client";

import { useState, useCallback } from "react";
import { useActionState } from "react";
import { studyFlashcardAction } from "../actions";
import { PhoneticButton } from "@/components/PhoneticButton";

export type Flashcard = {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  example?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
  progress_status: "new" | "learning" | "mastered" | null;
  last_reviewed_at: string | null;
};

type Props = {
  flashcards: Flashcard[];
  lessonId: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  learning: "Đang học",
  mastered: "Thành thạo",
  null: "Chưa học",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  learning: "bg-yellow-100 text-yellow-800",
  mastered: "bg-green-100 text-green-800",
  null: "bg-zinc-100 text-zinc-600",
};

export function FlashcardViewer({ flashcards, lessonId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const [studyState, studyAction] = useActionState(studyFlashcardAction, {
    error: null,
    newStatus: null,
  });

  const currentCard = flashcards[currentIndex];
  const progress = currentIndex + 1;
  const total = flashcards.length;

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;
      setLastAnswerCorrect(correct);
      const fd = new FormData();
      fd.set("lesson_id", lessonId);
      fd.set("vocabulary_id", currentCard.id);
      fd.set("is_correct", String(correct));
      studyAction(fd);
      setIsFlipped(true);
      setShowResult(true);
    },
    [currentCard, lessonId, studyAction],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
      setShowResult(false);
    }
  }, [currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
      setShowResult(false);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
  }, []);

  if (flashcards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Bài học này chưa có từ vựng nào để học flashcard.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-zinc-600 mb-1">
          <span>Thẻ {progress} / {total}</span>
          <span>
            {currentCard ? STATUS_LABEL[currentCard.progress_status ?? "null"] : ""}
          </span>
        </div>
        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="relative perspective-1000 h-72 cursor-pointer"
        onClick={() => !showResult && setIsFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!showResult) setIsFlipped((f) => !f);
          }
        }}
        aria-label={isFlipped ? "Mặt sau: nghĩa từ vựng" : "Mặt trước: từ vựng"}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Mặt trước - Từ vựng */}
          <div className="absolute w-full h-full backface-hidden rounded-xl border border-zinc-200 bg-white p-8 flex flex-col items-center justify-center shadow-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-zinc-900">{currentCard?.word}</p>
              {currentCard?.phonetic && (
                <PhoneticButton phonetic={currentCard.phonetic} className="mt-2 inline-flex" />
              )}
              <p className="mt-4 text-zinc-500 text-sm">Nhấn hoặc Space để lật thẻ</p>
            </div>
            {currentCard?.progress_status && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    STATUS_COLOR[currentCard.progress_status]
                  }`}
                >
                  {STATUS_LABEL[currentCard.progress_status]}
                </span>
              </div>
            )}
          </div>

          {/* Mặt sau - Nghĩa */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl border border-zinc-200 bg-white p-8 flex flex-col items-center justify-center shadow-sm">
            <div className="text-center">
              <p className="text-2xl font-semibold text-zinc-900 mb-2">{currentCard?.meaning}</p>
              {currentCard?.example && (
                <p className="text-zinc-600 italic text-sm">" {currentCard.example} "</p>
              )}
            </div>
            {currentCard?.progress_status && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    STATUS_COLOR[currentCard.progress_status]
                  }`}
                >
                  {STATUS_LABEL[currentCard.progress_status]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls - hiển thị sau khi đã lật */}
      {showResult && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 max-w-[140px] rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              disabled={studyState.error !== null}
            >
              ❌ Sai
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 max-w-[140px] rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
              disabled={studyState.error !== null}
            >
              ✅ Đúng
            </button>
          </div>

          {studyState.error && (
            <p role="alert" className="text-center text-sm text-red-600">
              {studyState.error}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                ← Thẻ trước
              </button>
            )}
            {currentIndex < total - 1 ? (
              <button
                onClick={handleNext}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Thẻ sau →
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Học lại từ đầu
              </button>
            )}
          </div>
        </div>
      )}

      {!showResult && !isFlipped && (
        <p className="mt-4 text-center text-sm text-zinc-500">
          Nhấn vào thẻ hoặc phím Space để xem nghĩa
        </p>
      )}
    </div>
  );
}