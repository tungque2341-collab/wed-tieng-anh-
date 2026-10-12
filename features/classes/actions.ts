"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth/require-teacher";
import { createClient } from "@/lib/supabase/server";
import {
  addStudentToClass,
  createClass,
  removeStudentFromClass,
} from "./services/class-service";

export type CreateClassState = {
  error: string | null;
  success: boolean;
};

export async function createClassAction(
  _prevState: CreateClassState,
  formData: FormData,
): Promise<CreateClassState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error, success: false };

  const { error } = await createClass(
    supabase,
    check.teacherId,
    String(formData.get("name") ?? ""),
  );

  if (error) return { error, success: false };

  revalidatePath("/teacher/classes");
  return { error: null, success: true };
}

export type ClassMembershipState = {
  error: string | null;
};

export async function addStudentToClassAction(
  _prevState: ClassMembershipState,
  formData: FormData,
): Promise<ClassMembershipState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error };

  const classId = String(formData.get("class_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!classId || !studentId) return { error: "Thiếu thông tin." };

  // RLS (Ngày 2) đảm bảo chỉ thêm được vào lớp do chính giáo viên này dạy.
  const { error } = await addStudentToClass(supabase, classId, studentId);
  if (error) return { error };

  revalidatePath(`/teacher/classes/${classId}`);
  return { error: null };
}

export async function removeStudentFromClassAction(
  _prevState: ClassMembershipState,
  formData: FormData,
): Promise<ClassMembershipState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error };

  const classId = String(formData.get("class_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!classId || !studentId) return { error: "Thiếu thông tin." };

  const { error } = await removeStudentFromClass(supabase, classId, studentId);
  if (error) return { error };

  revalidatePath(`/teacher/classes/${classId}`);
  return { error: null };
}
