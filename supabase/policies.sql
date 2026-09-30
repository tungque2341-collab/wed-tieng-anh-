-- ============================================================
-- policies.sql
-- Row Level Security (RLS) — Ngày 2
-- Chạy SAU schema.sql
--
-- Nguyên tắc: mặc định KHÔNG ai xem/sửa được gì (RLS bật = chặn hết),
-- chỉ mở đúng những gì được liệt kê dưới đây.
--
-- LƯU Ý QUAN TRỌNG VỀ KỸ THUẬT (đã phát hiện khi test thật):
-- Nếu policy của bảng A viết trực tiếp "EXISTS (SELECT 1 FROM B ...)",
-- và policy của bảng B cũng viết ngược lại "EXISTS (SELECT 1 FROM A ...)",
-- Postgres sẽ báo lỗi "infinite recursion detected in policy" vì khi
-- kiểm tra quyền trên A, nó phải kiểm tra quyền trên B, mà kiểm tra
-- quyền trên B lại cần kiểm tra quyền trên A...
--
-- Cách xử lý: tạo các hàm SECURITY DEFINER (hàm chạy với quyền của
-- người tạo hàm — ở đây là chủ sở hữu bảng, nên KHÔNG bị RLS chặn lại
-- khi hàm tự truy vấn bảng bên trong nó). Mọi policy bên dưới chỉ gọi
-- các hàm này thay vì tự viết EXISTS/JOIN trực tiếp lên bảng khác.
-- ============================================================

-- ---------- Hàm tiện ích ----------

-- Role của người đang đăng nhập
create or replace function public.get_my_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Lớp này có phải do giáo viên hiện tại dạy không?
create or replace function public.is_my_class(p_class_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.classes
    where id = p_class_id and teacher_id = auth.uid()
  );
$$;

-- Người hiện tại có phải học sinh của lớp này không?
create or replace function public.is_member_of_class(p_class_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.class_students
    where class_id = p_class_id and student_id = auth.uid()
  );
$$;

-- Học sinh này có đang học lớp nào của giáo viên hiện tại không?
create or replace function public.is_my_student(p_student_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.classes c on c.id = cs.class_id
    where cs.student_id = p_student_id and c.teacher_id = auth.uid()
  );
$$;

-- Bài học này có phải của giáo viên hiện tại không?
create or replace function public.is_my_lesson(p_lesson_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.lessons
    where id = p_lesson_id and teacher_id = auth.uid()
  );
$$;

-- Học sinh hiện tại có được xem bài học này không (bài học đã gán cho lớp của em)?
create or replace function public.can_see_lesson(p_lesson_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_classes lc
    join public.class_students cs on cs.class_id = lc.class_id
    where lc.lesson_id = p_lesson_id and cs.student_id = auth.uid()
  );
$$;

-- Học sinh hiện tại có được xem từ vựng này không (từ vựng nằm trong bài học đã gán cho lớp của em)?
create or replace function public.can_see_vocabulary(p_vocabulary_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_vocabulary lv
    join public.lesson_classes lc on lc.lesson_id = lv.lesson_id
    join public.class_students cs on cs.class_id = lc.class_id
    where lv.vocabulary_id = p_vocabulary_id and cs.student_id = auth.uid()
  );
$$;

-- Quiz này có phải của giáo viên hiện tại không?
create or replace function public.is_my_quiz(p_quiz_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.quizzes
    where id = p_quiz_id and teacher_id = auth.uid()
  );
$$;

-- Câu hỏi này có thuộc quiz của giáo viên hiện tại không?
create or replace function public.is_my_quiz_question(p_question_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = p_question_id and q.teacher_id = auth.uid()
  );
$$;


-- ============================================================
-- 1. profiles
-- ============================================================
alter table public.profiles enable row level security;

create policy "profiles_select"
  on public.profiles for select
  using (
    id = auth.uid()
    or (public.get_my_role() = 'teacher' and public.is_my_student(id))
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Không có policy INSERT / DELETE cho client:
-- tài khoản được tạo qua trigger handle_new_user() (khi giáo viên dùng
-- Supabase Admin API để tạo học sinh, chạy phía server bằng service_role key).


-- ============================================================
-- 2. classes
-- ============================================================
alter table public.classes enable row level security;

create policy "classes_select"
  on public.classes for select
  using (teacher_id = auth.uid() or public.is_member_of_class(id));

create policy "classes_insert"
  on public.classes for insert
  with check (teacher_id = auth.uid() and public.get_my_role() = 'teacher');

create policy "classes_update"
  on public.classes for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "classes_delete"
  on public.classes for delete
  using (teacher_id = auth.uid());


-- ============================================================
-- 3. class_students
-- ============================================================
alter table public.class_students enable row level security;

create policy "class_students_select"
  on public.class_students for select
  using (student_id = auth.uid() or public.is_my_class(class_id));

create policy "class_students_insert"
  on public.class_students for insert
  with check (public.is_my_class(class_id));

create policy "class_students_delete"
  on public.class_students for delete
  using (public.is_my_class(class_id));


-- ============================================================
-- 4. vocabulary
-- ============================================================
alter table public.vocabulary enable row level security;

create policy "vocabulary_select"
  on public.vocabulary for select
  using (teacher_id = auth.uid() or public.can_see_vocabulary(id));

create policy "vocabulary_insert"
  on public.vocabulary for insert
  with check (teacher_id = auth.uid() and public.get_my_role() = 'teacher');

create policy "vocabulary_update"
  on public.vocabulary for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "vocabulary_delete"
  on public.vocabulary for delete
  using (teacher_id = auth.uid());


-- ============================================================
-- 5. lessons
-- ============================================================
alter table public.lessons enable row level security;

create policy "lessons_select"
  on public.lessons for select
  using (teacher_id = auth.uid() or public.can_see_lesson(id));

create policy "lessons_insert"
  on public.lessons for insert
  with check (teacher_id = auth.uid() and public.get_my_role() = 'teacher');

create policy "lessons_update"
  on public.lessons for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "lessons_delete"
  on public.lessons for delete
  using (teacher_id = auth.uid());


-- ============================================================
-- 6. lesson_vocabulary
-- ============================================================
alter table public.lesson_vocabulary enable row level security;

create policy "lesson_vocabulary_select"
  on public.lesson_vocabulary for select
  using (public.is_my_lesson(lesson_id) or public.can_see_lesson(lesson_id));

create policy "lesson_vocabulary_insert"
  on public.lesson_vocabulary for insert
  with check (public.is_my_lesson(lesson_id));

create policy "lesson_vocabulary_delete"
  on public.lesson_vocabulary for delete
  using (public.is_my_lesson(lesson_id));


-- ============================================================
-- 7. lesson_classes
-- ============================================================
alter table public.lesson_classes enable row level security;

create policy "lesson_classes_select"
  on public.lesson_classes for select
  using (public.is_my_lesson(lesson_id) or public.is_member_of_class(class_id));

create policy "lesson_classes_insert"
  on public.lesson_classes for insert
  with check (public.is_my_lesson(lesson_id));

create policy "lesson_classes_delete"
  on public.lesson_classes for delete
  using (public.is_my_lesson(lesson_id));


-- ============================================================
-- 8. learning_progress
-- ============================================================
alter table public.learning_progress enable row level security;

create policy "learning_progress_select"
  on public.learning_progress for select
  using (student_id = auth.uid() or public.is_my_student(student_id));

create policy "learning_progress_insert"
  on public.learning_progress for insert
  with check (student_id = auth.uid());

create policy "learning_progress_update"
  on public.learning_progress for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());


-- ============================================================
-- 9. quizzes
-- ============================================================
alter table public.quizzes enable row level security;

create policy "quizzes_select"
  on public.quizzes for select
  using (teacher_id = auth.uid() or public.can_see_lesson(lesson_id));

create policy "quizzes_insert"
  on public.quizzes for insert
  with check (teacher_id = auth.uid() and public.get_my_role() = 'teacher');

create policy "quizzes_update"
  on public.quizzes for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "quizzes_delete"
  on public.quizzes for delete
  using (teacher_id = auth.uid());


-- ============================================================
-- 10. quiz_questions
-- Học sinh làm quiz: đọc câu hỏi thông qua Server Action / Route Handler
-- ở Ngày 22-23, KHÔNG query bảng này trực tiếp từ client bằng anon key,
-- nên tạm thời chỉ mở SELECT cho giáo viên (chủ sở hữu quiz).
-- ============================================================
alter table public.quiz_questions enable row level security;

create policy "quiz_questions_select_teacher"
  on public.quiz_questions for select
  using (public.is_my_quiz(quiz_id));

create policy "quiz_questions_insert"
  on public.quiz_questions for insert
  with check (public.is_my_quiz(quiz_id));

create policy "quiz_questions_update"
  on public.quiz_questions for update
  using (public.is_my_quiz(quiz_id));

create policy "quiz_questions_delete"
  on public.quiz_questions for delete
  using (public.is_my_quiz(quiz_id));


-- ============================================================
-- 11. quiz_answers
-- QUAN TRỌNG: KHÔNG cấp quyền SELECT cho học sinh ở đây, vì bảng này
-- chứa cột is_correct (đáp án đúng). Nếu học sinh SELECT được bảng này,
-- các em có thể nhìn thấy đáp án trước khi làm bài.
-- Việc hiển thị câu hỏi + chấm điểm cho học sinh sẽ dùng Server Action
-- (chạy phía server, không lộ is_correct ra client) — thiết kế chi tiết
-- ở Ngày 22-24. Ở đây chỉ mở quyền cho giáo viên.
-- ============================================================
alter table public.quiz_answers enable row level security;

create policy "quiz_answers_select_teacher"
  on public.quiz_answers for select
  using (public.is_my_quiz_question(question_id));

create policy "quiz_answers_insert"
  on public.quiz_answers for insert
  with check (public.is_my_quiz_question(question_id));

create policy "quiz_answers_update"
  on public.quiz_answers for update
  using (public.is_my_quiz_question(question_id));

create policy "quiz_answers_delete"
  on public.quiz_answers for delete
  using (public.is_my_quiz_question(question_id));


-- ============================================================
-- 12. quiz_results
-- ============================================================
alter table public.quiz_results enable row level security;

create policy "quiz_results_select"
  on public.quiz_results for select
  using (student_id = auth.uid() or public.is_my_quiz(quiz_id));

create policy "quiz_results_insert"
  on public.quiz_results for insert
  with check (student_id = auth.uid());

-- Không có policy UPDATE / DELETE: kết quả một lần làm bài không sửa được,
-- học sinh làm lại thì tạo dòng quiz_results mới.
