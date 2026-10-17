"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth/require-teacher";
import { createClient } from "@/lib/supabase/server";
import {
  addVocabularyToLesson,
  createLesson,
  removeVocabularyFromLesson,
} from "./services/lesson-service";

export type CreateLessonState = {
  error: string | null;
  success: boolean;
};

export async function createLessonAction(
  _prevState: CreateLessonState,
  formData: FormData,
): Promise<CreateLessonState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error, success: false };

  const { error } = await createLesson(supabase, check.teacherId, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  if (error) return { error, success: false };

  revalidatePath("/teacher/lessons");
  return { error: null, success: true };
}

export type LessonVocabularyState = {
  error: string | null;
};

export async function addVocabularyToLessonAction(
  _prevState: LessonVocabularyState,
  formData: FormData,
): Promise<LessonVocabularyState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error };

  const lessonId = String(formData.get("lesson_id") ?? "");
  const vocabularyId = String(formData.get("vocabulary_id") ?? "");
  if (!lessonId || !vocabularyId) return { error: "Thiếu thông tin." };

  // RLS (Ngày 2) đảm bảo chỉ thêm được vào bài học do chính giáo viên
  // này tạo.
  const { error } = await addVocabularyToLesson(supabase, lessonId, vocabularyId);
  if (error) return { error };

  revalidatePath(`/teacher/lessons/${lessonId}`);
  return { error: null };
}

export async function removeVocabularyFromLessonAction(
  _prevState: LessonVocabularyState,
  formData: FormData,
): Promise<LessonVocabularyState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error };

  const lessonId = String(formData.get("lesson_id") ?? "");
  const vocabularyId = String(formData.get("vocabulary_id") ?? "");
  if (!lessonId || !vocabularyId) return { error: "Thiếu thông tin." };

  const { error } = await removeVocabularyFromLesson(supabase, lessonId, vocabularyId);
  if (error) return { error };

  revalidatePath(`/teacher/lessons/${lessonId}`);
  return { error: null };
}
