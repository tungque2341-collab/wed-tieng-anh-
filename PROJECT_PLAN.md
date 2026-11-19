# Kế hoạch 30 ngày - Học Tiếng Anh Cùng Cô Giáo Trinh

## ✅ Đã hoàn thành (Ngày 1-16)
| Ngày | Tính năng | Trạng thái |
|------|-----------|------------|
| 1-2 | Khởi tạo Next.js + Supabase + SQL Schema + RLS | ✅ |
| 3-4 | Auth cơ bản (đăng ký GV, đăng nhập/đăng xuất) | ✅ |
| 5-6 | Middleware phân quyền, GV tạo tài khoản HS | ✅ |
| 7 | Service layer vocabulary (CRUD) | ✅ |
| 8 | Trang hiển thị danh sách từ vựng | ✅ |
| 9 | Thêm từ vựng qua giao diện | ✅ |
| 10 | Sửa/Xóa từ vựng inline | ✅ |
| 11 | Tìm kiếm & Sắp xếp từ vựng | ✅ |
| 12 | Import hàng loạt từ vựng | ✅ |
| 13 | Quản lý lớp học + fix RLS profiles | ✅ |
| 14 | Tạo & Hiển thị bài học | ✅ |
| 15 | Thêm/Xóa từ vựng trong bài học | ✅ |
| 16 | Gán bài cho lớp + Trang học sinh xem bài | ✅ |

## 🔄 Cần triển khai (Ngày 17-30)

### Giai đoạn 4: Học tập cốt lõi cho Học sinh (Ngày 17-24)
| Ngày | Tính năng | Mô tả | Files cần tạo |
|------|-----------|-------|---------------|
| 17 | **Flashcard** - Xem flashcard | Học sinh lật thẻ từ vựng trong bài học | services/flashcard-service.ts, actions.ts, components/FlashcardViewer.tsx, app/student/lessons/[id]/flashcard/page.tsx |
| 18 | **Flashcard** - Chế độ học (Spaced Repetition) | Cập nhật learning_progress, thuật toán SM-2 đơn giản | services/progress-service.ts, actions.ts, components/FlashcardStudy.tsx |
| 19 | **Phát âm (TTS)** | Text-to-Speech cho từ vựng (Web Speech API) | hooks/useSpeech.ts, components/PhoneticButton.tsx |
| 20 | **Quiz** - GV tạo Quiz | CRUD Quiz, Questions, Answers (UI cho GV) | services/quiz-service.ts, actions.ts, components/CreateQuizForm.tsx, QuizList.tsx, app/teacher/lessons/[id]/quiz/page.tsx |
| 21 | **Quiz** - GV quản lý câu hỏi | Thêm/sửa/xóa câu hỏi & đáp án cho quiz | components/QuizQuestionManager.tsx, QuizAnswerManager.tsx |
| 22 | **Quiz** - HS làm Quiz (Phần 1) | Hiển thị câu hỏi, chọn đáp án, submit | services/quiz-taking-service.ts, actions.ts, components/QuizTaker.tsx, app/student/lessons/[id]/quiz/page.tsx |
| 23 | **Quiz** - HS làm Quiz (Phần 2) | Chấm điểm server-side, lưu quiz_results, hiển thị kết quả | components/QuizResult.tsx |
| 24 | **Quiz** - Xem lại & Làm lại | Lịch sử làm bài, xem đáp án đúng/sau khi nộp | components/QuizHistory.tsx |

### Giai đoạn 5: Tính năng bổ sung (Ngày 25-27)
| Ngày | Tính năng | Mô tả | Files cần tạo |
|------|-----------|-------|---------------|
| 25 | **Đánh vần (Spelling)** | Nghe từ -> gõ chính tả, kiểm tra chính xác | services/spelling-service.ts, components/SpellingGame.tsx, app/student/lessons/[id]/spelling/page.tsx |
| 26 | **Game rơi từ** | Game đơn giản: từ rơi, chọn nghĩa đúng | components/FallingWordsGame.tsx, app/student/lessons/[id]/game/page.tsx |
| 27 | **Tiến độ học tập (Progress)** | Dashboard HS: từ đã học, đang học, thành thạo; biểu đồ | services/progress-service.ts (mở rộng), components/ProgressDashboard.tsx, app/student/progress/page.tsx |

### Giai đoạn 6: Dashboard & Hoàn thiện (Ngày 28-30)
| Ngày | Tính năng | Mô tả | Files cần tạo |
|------|-----------|-------|---------------|
| 28 | **Dashboard Giáo viên** | Thống kê: số lớp, HS, từ vựng, bài học, quiz, hoạt động gần đây | services/dashboard-service.ts, components/TeacherDashboard.tsx, app/teacher/page.tsx (cập nhật) |
| 29 | **Dashboard Học sinh** | Thống kê cá nhân, streak, từ vựng yếu, bài học gán | components/StudentDashboard.tsx, app/student/page.tsx (cập nhật) |
| 30 | **Hoàn thiện & Deploy** | Test end-to-end, fix bug, tối ưu, Vercel deploy, README | - |

## Cấu trúc Database đã sẵn (schema.sql)
- ✅ profiles, classes, class_students
- ✅ vocabulary, lessons, lesson_vocabulary, lesson_classes
- ✅ learning_progress (cho flashcard/spaced repetition)
- ✅ quizzes, quiz_questions, quiz_answers, quiz_results
- ❌ Cần thêm: spelling_attempts (nếu muốn lưu lịch sử đánh vần)

## RLS Policies đã sẵn (policies.sql)
- ✅ Tất cả bảng core đã có policy
- ✅ quiz_answers: KHÔNG cho HS SELECT (chứa is_correct)
- ❌ Cần thêm policy cho spelling_attempts (nếu tạo bảng mới)

## Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS + Storage)
- Vercel deploy
- Web Speech API cho TTS (miễn phí, không cần API key)