"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  addQuizQuestionAction,
  updateQuizQuestionAction,
  deleteQuizQuestionAction,
  addQuizAnswerAction,
  updateQuizAnswerAction,
  deleteQuizAnswerAction,
} from "../actions";

type Question = {
  id: string;
  question_text: string;
  order_index: number;
  answers: Answer[];
};

type Answer = {
  id: string;
  answer_text: string;
  is_correct: boolean;
};

type Props = {
  quizId: string;
  initialQuestions: Question[];
};

export function QuizQuestionManager({ quizId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Add question
  const [addState, addAction] = useActionState(addQuizQuestionAction, {
    error: null,
    success: null,
  });

  const handleAddSubmit = (formData: FormData) => {
    formData.set("quiz_id", quizId);
    formData.set("order_index", String(questions.length));
    addAction(formData);
  };

  // Update question
  const [updateState, updateAction] = useActionState(updateQuizQuestionAction, {
    error: null,
    success: null,
  });

  const handleUpdate = (questionId: string, newText: string) => {
    const fd = new FormData();
    fd.set("question_id", questionId);
    fd.set("question_text", newText);
    updateAction(fd);
  };

  // Delete question
  const [deleteState, deleteAction] = useActionState(deleteQuizQuestionAction, {
    error: null,
    success: null,
  });

  const handleDelete = (questionId: string) => {
    if (!confirm("Xóa câu hỏi này? Các đáp án đi kèm cũng sẽ bị xóa.")) return;
    const fd = new FormData();
    fd.set("question_id", questionId);
    fd.set("quiz_id", quizId);
    deleteAction(fd);
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.question_text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = (questionId: string) => {
    handleUpdate(questionId, editText);
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="space-y-4">
      {/* Form thêm câu hỏi */}
      <form action={handleAddSubmit} className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
        <h3 className="font-semibold text-zinc-900">Thêm câu hỏi mới</h3>
        <div>
          <label htmlFor="question_text" className="block text-sm font-medium text-zinc-700 mb-1">
            Nội dung câu hỏi
          </label>
          <input
            type="text"
            id="question_text"
            name="question_text"
            required
            placeholder="Ví dụ: Từ nào có nghĩa là 'hello'?"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        {addState.error && <p role="alert" className="text-sm text-red-600">{addState.error}</p>}
        {addState.success && <p className="text-sm text-green-600">{addState.success}</p>}
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Thêm câu hỏi
        </button>
      </form>

      {/* Danh sách câu hỏi */}
      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-8 text-center text-zinc-500">
          Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên ở trên.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              {editingId === q.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(q.id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-sm font-medium text-zinc-900 flex-1">{q.question_text}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(q)}
                      className="text-sm text-zinc-600 hover:text-zinc-900"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              )}

              {/* Quản lý đáp án cho câu hỏi này */}
              <QuizAnswerManager questionId={q.id} initialAnswers={q.answers} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-component cho quản lý đáp án
function QuizAnswerManager({ questionId, initialAnswers }: { questionId: string; initialAnswers: Answer[] }) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editAnswerText, setEditAnswerText] = useState("");
  const [editIsCorrect, setEditIsCorrect] = useState(false);

  // Add answer
  const [addState, addAction] = useActionState(addQuizAnswerAction, {
    error: null,
    success: null,
  });

  const handleAddAnswer = (formData: FormData) => {
    formData.set("question_id", questionId);
    addAction(formData);
  };

  // Update answer
  const [updateState, updateAction] = useActionState(updateQuizAnswerAction, {
    error: null,
    success: null,
  });

  const handleUpdateAnswer = (answerId: string, text: string, correct: boolean) => {
    const fd = new FormData();
    fd.set("answer_id", answerId);
    fd.set("answer_text", text);
    fd.set("is_correct", String(correct));
    updateAction(fd);
  };

  // Delete answer
  const [deleteState, deleteAction] = useActionState(deleteQuizAnswerAction, {
    error: null,
    success: null,
  });

  const handleDeleteAnswer = (answerId: string) => {
    if (!confirm("Xóa đáp án này?")) return;
    const fd = new FormData();
    fd.set("answer_id", answerId);
    fd.set("question_id", questionId);
    deleteAction(fd);
  };

  const correctCount = answers.filter((a) => a.is_correct).length;

  return (
    <div className="mt-3 ml-4 border-l-2 border-zinc-200 pl-4 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-zinc-700">Đáp án:</span>
        {correctCount === 0 && (
          <span className="text-red-600">⚠ Chưa có đáp án đúng</span>
        )}
        {correctCount > 1 && (
          <span className="text-yellow-600">⚠ Có {correctCount} đáp án đúng</span>
        )}
      </div>

      {/* Form thêm đáp án */}
      <form action={handleAddAnswer} className="flex gap-2">
        <input
          type="hidden"
          name="question_id"
          value={questionId}
        />
        <input
          type="text"
          name="answer_text"
          required
          placeholder="Nội dung đáp án"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <label className="flex items-center gap-1 text-sm text-zinc-700">
          <input type="checkbox" name="is_correct" value="true" className="rounded border-zinc-300" />
          Đúng
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Thêm
        </button>
      </form>

      {addState.error && <p role="alert" className="text-sm text-red-600">{addState.error}</p>}

      {/* Danh sách đáp án */}
      {answers.length === 0 ? (
        <p className="text-sm text-zinc-500 italic">Chưa có đáp án</p>
      ) : (
        <ul className="space-y-1">
          {answers.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              {editingAnswerId === a.id ? (
                <>
                  <input
                    type="text"
                    value={editAnswerText}
                    onChange={(e) => setEditAnswerText(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    autoFocus
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={editIsCorrect}
                      onChange={(e) => setEditIsCorrect(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    Đúng
                  </label>
                  <button
                    onClick={() => handleUpdateAnswer(a.id, editAnswerText, editIsCorrect)}
                    className="text-green-600 hover:text-green-900 text-sm"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditingAnswerId(null);
                      setEditAnswerText("");
                      setEditIsCorrect(false);
                    }}
                    className="text-zinc-600 hover:text-zinc-900 text-sm"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-zinc-900">{a.answer_text}</span>
                  {a.is_correct && (
                    <span className="text-green-600 text-sm font-medium">✓ Đúng</span>
                  )}
                  <button
                    onClick={() => {
                      setEditingAnswerId(a.id);
                      setEditAnswerText(a.answer_text);
                      setEditIsCorrect(a.is_correct);
                    }}
                    className="text-zinc-600 hover:text-zinc-900 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteAnswer(a.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    🗑️
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}