import type { NewVocabulary } from "@/types/vocabulary";

/**
 * Phân tích văn bản nhập nhiều từ cùng lúc. Mỗi dòng 1 từ, các trường
 * ngăn cách bởi dấu "|" theo thứ tự: từ | nghĩa | phiên âm | ví dụ
 * (phiên âm và ví dụ không bắt buộc). Dòng trống bị bỏ qua.
 *
 * Hàm thuần (không gọi Supabase, không đụng DOM) để dễ test độc lập.
 */
export type ParsedLine =
  | { ok: true; value: NewVocabulary }
  | { ok: false; lineNumber: number; raw: string; error: string };

export function parseBulkVocabularyInput(text: string): ParsedLine[] {
  const lines = text.split("\n");
  const results: ParsedLine[] = [];

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return; // bỏ qua dòng trống

    const parts = line.split("|").map((part) => part.trim());
    const [word, meaning, phonetic, example] = parts;

    if (!word || !meaning) {
      results.push({
        ok: false,
        lineNumber: index + 1,
        raw: rawLine,
        error: 'Thiếu từ hoặc nghĩa (cần dạng "từ | nghĩa").',
      });
      return;
    }

    results.push({
      ok: true,
      value: {
        word,
        meaning,
        phonetic: phonetic || null,
        example: example || null,
      },
    });
  });

  return results;
}
