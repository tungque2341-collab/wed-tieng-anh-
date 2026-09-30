-- ============================================================
-- schema.sql
-- Học Tiếng Anh Cùng Cô Giáo Trinh — cấu trúc database (Ngày 2)
-- Chạy file này TRƯỚC policies.sql
-- ============================================================

-- ---------- Tiện ích dùng chung ----------

-- Hàm tự cập nhật cột updated_at mỗi khi UPDATE một dòng
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. profiles
-- Mỗi dòng gắn với một người dùng trong auth.users.
-- Giáo viên: có email thật, username = NULL.
-- Học sinh: có username (đăng nhập bằng username), email là email nội bộ.
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('student', 'teacher')),
  username    text,                    -- chỉ học sinh dùng, duy nhất
  full_name   text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- username phải duy nhất, nhưng cho phép nhiều dòng NULL (giáo viên)
create unique index profiles_username_key
  on public.profiles (username)
  where username is not null;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Tự tạo dòng profiles khi có user mới trong auth.users
-- (áp dụng cho cả giáo viên tự đăng ký lẫn học sinh do giáo viên tạo qua Admin API)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'username',
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 2. classes — lớp học, mỗi lớp thuộc một giáo viên
-- ============================================================
create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index classes_teacher_id_idx on public.classes (teacher_id);

create trigger trg_classes_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();


-- ============================================================
-- 3. class_students — học sinh thuộc lớp nào (một học sinh có thể ở nhiều lớp)
-- ============================================================
create table public.class_students (
  class_id    uuid not null references public.classes(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (class_id, student_id)
);

create index class_students_student_id_idx on public.class_students (student_id);


-- ============================================================
-- 4. vocabulary — từ vựng, riêng cho từng giáo viên
-- ============================================================
create table public.vocabulary (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  word        text not null,
  meaning     text not null,
  phonetic    text,
  example     text,
  image_url   text,
  audio_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index vocabulary_teacher_id_idx on public.vocabulary (teacher_id);
create index vocabulary_word_idx on public.vocabulary using gin (to_tsvector('simple', word));

create trigger trg_vocabulary_updated_at
  before update on public.vocabulary
  for each row execute function public.set_updated_at();


-- ============================================================
-- 5. lessons — bài học, riêng cho từng giáo viên
-- ============================================================
create table public.lessons (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index lessons_teacher_id_idx on public.lessons (teacher_id);

create trigger trg_lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();


-- ============================================================
-- 6. lesson_vocabulary — từ vựng thuộc bài học nào
-- ============================================================
create table public.lesson_vocabulary (
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  vocabulary_id  uuid not null references public.vocabulary(id) on delete cascade,
  order_index    int not null default 0,
  primary key (lesson_id, vocabulary_id)
);

create index lesson_vocabulary_vocabulary_id_idx on public.lesson_vocabulary (vocabulary_id);


-- ============================================================
-- 7. lesson_classes — bài học được gán cho lớp nào
-- ============================================================
create table public.lesson_classes (
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (lesson_id, class_id)
);

create index lesson_classes_class_id_idx on public.lesson_classes (class_id);


-- ============================================================
-- 8. learning_progress — tiến độ học từ vựng của từng học sinh
-- ============================================================
create table public.learning_progress (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles(id) on delete cascade,
  vocabulary_id    uuid not null references public.vocabulary(id) on delete cascade,
  status           text not null default 'new' check (status in ('new', 'learning', 'mastered')),
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (student_id, vocabulary_id)
);

create index learning_progress_student_id_idx on public.learning_progress (student_id);
create index learning_progress_vocabulary_id_idx on public.learning_progress (vocabulary_id);

create trigger trg_learning_progress_updated_at
  before update on public.learning_progress
  for each row execute function public.set_updated_at();


-- ============================================================
-- 9. quizzes — quiz gắn với một bài học (và do đó gắn với lớp qua lesson_classes)
-- ============================================================
create table public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  title       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index quizzes_teacher_id_idx on public.quizzes (teacher_id);
create index quizzes_lesson_id_idx on public.quizzes (lesson_id);

create trigger trg_quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();


-- ============================================================
-- 10. quiz_questions
-- ============================================================
create table public.quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  order_index   int not null default 0,
  created_at    timestamptz not null default now()
);

create index quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);


-- ============================================================
-- 11. quiz_answers
-- Lưu ý bảo mật: bảng này chứa đáp án đúng (is_correct).
-- KHÔNG cho học sinh SELECT trực tiếp bảng này (xem policies.sql).
-- Việc hiển thị câu hỏi cho học sinh và chấm điểm sẽ xử lý ở Ngày 22-24.
-- ============================================================
create table public.quiz_answers (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references public.quiz_questions(id) on delete cascade,
  answer_text   text not null,
  is_correct    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index quiz_answers_question_id_idx on public.quiz_answers (question_id);


-- ============================================================
-- 12. quiz_results — kết quả học sinh làm quiz (cho phép làm lại nhiều lần)
-- ============================================================
create table public.quiz_results (
  id               uuid primary key default gen_random_uuid(),
  quiz_id          uuid not null references public.quizzes(id) on delete cascade,
  student_id       uuid not null references public.profiles(id) on delete cascade,
  score            int not null,
  total_questions  int not null,
  completed_at     timestamptz not null default now()
);

create index quiz_results_quiz_id_idx on public.quiz_results (quiz_id);
create index quiz_results_student_id_idx on public.quiz_results (student_id);
