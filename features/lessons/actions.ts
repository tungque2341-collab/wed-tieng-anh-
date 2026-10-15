"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth/require-teacher";
import { createClient } from "@/lib/supabase/server";
import { createLesson } from "./services/lesson-service";

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
