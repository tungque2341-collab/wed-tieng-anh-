"use client";

import { useState, useCallback, useEffect } from "react";
import { PhoneticButton } from "@/components/PhoneticButton";
import { saveSpellingAttemptAction } from "../actions";

type SpellingWord = {
  id: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  audio_url: string | null;
};

type Props = {
  words: SpellingWord[];
  lessonId: string;
  onComplete?: () => void;
};

export function SpellingGame({ words, lessonId, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(1);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const currentWord = words[currentIndex];
  const progress = currentIndex + 1;
  const total = words.length;
  const isWordCompleted = completedWords.has(currentWord.id);

  const checkAnswer = useCallback(() => {
    const correct = userAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
  }, [userAnswer, currentWord.word]);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const correct = userAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();

    const formData = new FormData();
    formData.set("vocabulary_id", currentWord.id);
    formData.set("lesson_id", lessonId);
    formData.set("is_correct", correct.toString());
    formData.set("user_answer", userAnswer.trim());
    formData.set("attempts", attempts.toString());

    const result = await saveSpellingAttemptAction(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsCorrect(correct);
    setShowResult(true);
    setCompletedWords((prev) => new Set(prev).add(currentWord.id));
    setIsSubmitting(false);
  }, [currentWord, lessonId, userAnswer, attempts]);

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer("");
      setAttempts(1);
      setIsCorrect(null);
      setShowResult(false);
    } else {
      onComplete?.();
    }
  }, [currentIndex, total, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setUserAnswer("");
      setAttempts(1);
      setIsCorrect(null);
      setShowResult(false);
    }
  }, [currentIndex]);

  const handleRetry = useCallback(() => {
    setUserAnswer("");
    setAttempts((a) => a + 1);
    setIsCorrect(null);
    setShowResult(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!showResult) {
          handleSubmit();
        } else if (isCorrect) {
          handleNext();
        } else {
          handleRetry();
        }
      }
    },
    [showResult, isCorrect, handleSubmit, handleNext, handleRetry],
  );

  // Tự động focus input khi chuyển câu
  useEffect(() => {
    const input = document.getElementById("spelling-input");
    input?.focus();
  }, [currentIndex, showResult, isCorrect]);

  if (words.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Không có từ vựng nào có phát âm để tập đánh vần.</p>
        <p className="mt-1 text-sm text-zinc-400">Hãy thêm audio hoặc phonetic cho từ vựng.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Đánh vần</h1>
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>Từ {progress} / {total}</span>
          <span>Đã hoàn thành: {completedWords.size}/{total}</span>
        </div>
        <div className="mt-2 h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Word Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm mb-6">
        {/* Meaning hint */}
        <div className="mb-6 p-4 rounded-lg bg-zinc-50">
          <p className="text-sm text-zinc-600">Nghĩa:</p>
          <p className="mt-1 text-lg font-medium text-zinc-900">{currentWord.meaning}</p>
          {currentWord.phonetic && (
            <p className="mt-1 text-sm text-zinc-500 font-mono">/{currentWord.phonetic}/</p>
          )}
        </div>

        {/* Audio button */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <PhoneticButton
            phonetic={currentWord.phonetic ?? undefined}
            className="text-2xl px-6 py-3"
            aria-label={`Nghe phát âm từ ${currentWord.word}`}
          />
        </div>

        {/* Input */}
        <div className="max-w-md mx-auto">
          <label htmlFor="spelling-input" className="sr-only">
            Nhập từ tiếng Anh
          </label>
          <input
            id="spelling-input"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult && isCorrect === true}
            autoComplete="off"
            spellCheck={false}
            className={`w-full text-center text-2xl font-mono px-4 py-3 rounded-lg border transition-colors ${
              showResult
                ? isCorrect
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-red-500 bg-red-50 text-red-800"
                : "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
            }`}
            placeholder="Nhập từ tiếng Anh..."
            autoFocus
          />

          {error && (
            <p role="alert" className="mt-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          {!showResult && (
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim() || isSubmitting}
              className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang kiểm tra..." : "Kiểm tra"}
            </button>
          )}

          {showResult && !isCorrect && (
            <div className="mt-4 space-y-2">
              <p className="text-center text-red-600 font-medium">
                Sai rồi! Đáp án đúng: <span className="font-mono text-lg">{currentWord.word}</span>
              </p>
              <p className="text-center text-sm text-zinc-600">
                Bạn đã nhập: <span className="font-mono">{userAnswer}</span>
              </p>
              <button
                onClick={handleRetry}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Thử lại (lần {attempts + 1})
              </button>
            </div>
          )}

          {showResult && isCorrect && (
            <div className="mt-4 space-y-2">
              <p className="text-center text-green-600 font-medium text-lg">✅ Chính xác!</p>
              {currentIndex < total - 1 ? (
                <button
                  onClick={handleNext}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Từ tiếp theo →
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Hoàn thành bài tập
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Từ trước
        </button>

        <div className="flex gap-2">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setUserAnswer("");
                setAttempts(1);
                setIsCorrect(null);
                setShowResult(false);
              }}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                i === currentIndex
                  ? "bg-zinc-900 text-white"
                  : completedWords.has(words[i].id)
                    ? "bg-green-100 text-green-800"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
              aria-label={`Từ ${i + 1}`}
              aria-current={i === currentIndex ? "true" : "false"}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === total - 1}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Từ sau →
        </button>
      </div>
    </div>
  );
}