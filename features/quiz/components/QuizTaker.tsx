"use client";

import { useState, useCallback } from "react";
import { useActionState } from "react";
import { submitQuizAction } from "../actions";

type QuizQuestion = {
  id: string;
  question_text: string;
  order_index: number;
  answers: {
    id: string;
    answer_text: string;
  }[];
};

type Props = {
  quizId: string;
  quizTitle: string;
  questions: QuizQuestion[];
  lessonId: string;
};

export function QuizTaker({ quizId, quizTitle, questions, lessonId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [submitState, submitAction] = useActionState(submitQuizAction, {
    error: null,
    result: null,
  });

  const currentQuestion = questions[currentIndex];
  const progress = currentIndex + 1;
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleAnswerChange = useCallback((questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    if (answeredCount < total) {
      if (!confirm(`Bạn mới trả lời ${answeredCount}/${total} câu. Bạn có chắc chắn muốn nộp bài?`)) {
        return;
      }
    }

    const fd = new FormData();
    fd.set("quiz_id", quizId);
    fd.set("answers", JSON.stringify(answers));
    await submitAction(fd);

    if (!submitState.error) {
      setSubmitted(true);
      setShowResult(true);
    }
  }, [quizId, answers, answeredCount, total, submitAction, submitState.error]);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setShowResult(false);
    setCurrentIndex(0);
  }, []);

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Quiz này chưa có câu hỏi nào.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">{quizTitle}</h1>
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>Câu {progress} / {total}</span>
          <span>Đã trả lời: {answeredCount}/{total}</span>
        </div>
        <div className="mt-2 h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm mb-6">
        <p className="text-lg font-medium text-zinc-900 mb-4">
          Câu {currentQuestion.order_index + 1}: {currentQuestion.question_text}
        </p>

        <div className="space-y-3">
          {currentQuestion.answers.map((answer) => (
            <label
              key={answer.id}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                answers[currentQuestion.id] === answer.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name={`question_${currentQuestion.id}`}
                value={answer.id}
                checked={answers[currentQuestion.id] === answer.id}
                onChange={() => handleAnswerChange(currentQuestion.id, answer.id)}
                className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
              />
              <span className="text-zinc-900">{answer.answer_text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation & Submit */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Câu trước
        </button>

        <div className="flex gap-2">
          {currentIndex < total - 1 ? (
            <button
              onClick={handleNext}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Câu sau →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitState.error !== null && !submitted}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitted ? "Đã nộp" : "Nộp bài"}
            </button>
          )}
        </div>
      </div>

      {submitState.error && (
        <p role="alert" className="mt-4 text-center text-sm text-red-600">
          {submitState.error}
        </p>
      )}

      {/* Result Modal */}
      {showResult && submitState.result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 text-center">Kết quả</h2>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-zinc-900">
                {submitState.result.score} / {submitState.result.total}
              </p>
              <p className="mt-2 text-zinc-600">
                {Math.round((submitState.result.score / submitState.result.total) * 100)}%
              </p>
            </div>

            <div className="mb-6 max-h-60 overflow-y-auto space-y-2">
              {submitState.result.details.map((d, i) => (
                <div
                  key={d.questionId}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    d.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <span className="flex-shrink-0 w-6 text-center">
                    {d.correct ? "✅" : "❌"}
                  </span>
                  <span className="text-sm">Câu {i + 1}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Làm lại
              </button>
              <a
                href={`/student/lessons/${lessonId}`}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
              >
                Về bài học
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}