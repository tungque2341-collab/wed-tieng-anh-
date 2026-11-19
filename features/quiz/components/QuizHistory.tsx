"use client";

import { useState } from "react";
import Link from "next/link";

type QuizHistoryItem = {
  id: string;
  quiz_id: string;
  quiz_title: string;
  lesson_title: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

type Props = {
  history: QuizHistoryItem[];
  lessonId?: string;
};

export function QuizHistory({ history, lessonId }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Chưa có lịch sử làm quiz nào.</p>
        <p className="mt-1 text-sm text-zinc-400">Hãy làm quiz đầu tiên của bạn!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-3">
      {history.map((item) => {
        const percentage = Math.round((item.score / item.total_questions) * 100);
        const isPassed = percentage >= 60;
        const date = new Date(item.completed_at).toLocaleString("vi-VN");

        return (
          <div
            key={item.id}
            className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-zinc-50 transition-colors"
              aria-expanded={expandedId === item.id}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 truncate">{item.quiz_title}</p>
                <p className="text-sm text-zinc-500">{item.lesson_title} • {date}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${
                    isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {percentage}%
                </div>
                <span className="text-zinc-400">▼</span>
              </div>
            </button>

            {expandedId === item.id && (
              <div className="border-t border-zinc-200 px-4 py-4 bg-zinc-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-white">
                    <p className="text-2xl font-bold text-zinc-900">{item.score}</p>
                    <p className="text-xs text-zinc-500">Đúng</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white">
                    <p className="text-2xl font-bold text-zinc-900">
                      {item.total_questions - item.score}
                    </p>
                    <p className="text-xs text-zinc-500">Sai</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/student/quiz/${item.quiz_id}`}
                    className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Làm lại
                  </Link>
                  {lessonId && (
                    <Link
                      href={`/student/lessons/${lessonId}/quiz`}
                      className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Về danh sách quiz
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}