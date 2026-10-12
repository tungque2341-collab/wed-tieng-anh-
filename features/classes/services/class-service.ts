import type { SupabaseClient } from "@supabase/supabase-js";

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type SchoolClass = {
  id: string;
  teacher_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type StudentProfile = {
  id: string;
  username: string | null;
  full_name: string;
};

/** Lấy danh sách lớp của giáo viên đang đăng nhập (RLS tự lọc) */
export async function listClasses(
  supabase: SupabaseClient,
): Promise<ServiceResult<SchoolClass[]>> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as SchoolClass[], error: null };
}

/** Lấy 1 lớp theo id (null nếu không có hoặc không có quyền xem) */
export async function getClassById(
  supabase: SupabaseClient,
  id: string,
): Promise<ServiceResult<SchoolClass | null>> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as SchoolClass | null, error: null };
}

export async function createClass(
  supabase: SupabaseClient,
  teacherId: string,
  name: string,
): Promise<ServiceResult<SchoolClass>> {
  const trimmed = name.trim();
  if (!trimmed) return { data: null, error: "Tên lớp không được để trống." };

  const { data, error } = await supabase
    .from("classes")
    .insert({ teacher_id: teacherId, name: trimmed })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SchoolClass, error: null };
}

/**
 * Toàn bộ học sinh do giáo viên này tạo (dùng cột `created_by`,
 * Ngày 13) — bất kể đã ở lớp nào hay chưa.
 */
export async function listMyStudents(
  supabase: SupabaseClient,
  teacherId: string,
): Promise<ServiceResult<StudentProfile[]>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .eq("role", "student")
    .eq("created_by", teacherId)
    .order("full_name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as StudentProfile[], error: null };
}

/** Học sinh đang ở trong 1 lớp cụ thể */
export async function listStudentsInClass(
  supabase: SupabaseClient,
  classId: string,
): Promise<ServiceResult<StudentProfile[]>> {
  const { data, error } = await supabase
    .from("class_students")
    .select("profiles(id, username, full_name)")
    .eq("class_id", classId);

  if (error) return { data: null, error: error.message };

  const students = (data as unknown as { profiles: StudentProfile }[])
    .map((row) => row.profiles)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  return { data: students, error: null };
}

export async function addStudentToClass(
  supabase: SupabaseClient,
  classId: string,
  studentId: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase
    .from("class_students")
    .insert({ class_id: classId, student_id: studentId });

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "Học sinh này đã ở trong lớp rồi." };
    }
    return { data: null, error: error.message };
  }
  return { data: true, error: null };
}

export async function removeStudentFromClass(
  supabase: SupabaseClient,
  classId: string,
  studentId: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
