/** Khớp với bảng public.vocabulary (xem supabase/schema.sql) */
export type Vocabulary = {
  id: string;
  teacher_id: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  example: string | null;
  image_url: string | null;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
};

/** Dữ liệu cần để tạo một từ vựng mới */
export type NewVocabulary = {
  word: string;
  meaning: string;
  phonetic?: string | null;
  example?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
};

/** Dữ liệu cho phép sửa (tất cả đều tùy chọn) */
export type VocabularyUpdate = Partial<NewVocabulary>;
