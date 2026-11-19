"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PhoneticButton } from "@/components/PhoneticButton";
import { saveFallingWordsScoreAction } from "../actions";

type FallingWord = {
  id: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  audio_url: string | null;
};

type FallingItem = {
  id: string;
  word: FallingWord;
  x: number;
  y: number;
  speed: number;
  targetMeaning: string;
  options: string[];
};

type Props = {
  words: FallingWord[];
  lessonId: string;
  onComplete?: () => void;
};

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const WORD_WIDTH = 140;
const WORD_HEIGHT = 50;

export function FallingWordsGame({ words, lessonId, onComplete }: Props) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "paused" | "ended">("ready");
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [wordsCorrect, setWordsCorrect] = useState(0);
  const [wordsTotal, setWordsTotal] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showWordMeaning, setShowWordMeaning] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number | null>(null);
  const gameStartTimeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Tạo options cho từ hiện tại (1 đúng + 3 sai ngẫu nhiên)
  const generateOptions = useCallback((correctMeaning: string, allWords: FallingWord[]) => {
    const otherMeanings = allWords
      .filter((w) => w.meaning !== correctMeaning)
      .map((w) => w.meaning);

    const shuffled = [...otherMeanings].sort(() => Math.random() - 0.5);
    const wrongOptions = shuffled.slice(0, 3);
    const options = [correctMeaning, ...wrongOptions].sort(() => Math.random() - 0.5);
    return options;
  }, []);

  // Spawn từ mới
  const spawnWord = useCallback(() => {
    setFallingItems((prev) => {
      if (currentWordIndex >= words.length) return prev;

      const word = words[currentWordIndex];
      const options = generateOptions(word.meaning, words);
      const x = Math.random() * (GAME_WIDTH - WORD_WIDTH);

      const newItem: FallingItem = {
        id: `falling-${word.id}-${Date.now()}`,
        word,
        x,
        y: -WORD_HEIGHT,
        speed: 0.8 + Math.random() * 0.5 + currentWordIndex * 0.02, // Tăng tốc độ dần
        targetMeaning: word.meaning,
        options,
      };

      setCurrentWordIndex((i) => i + 1);
      setWordsTotal((t) => t + 1);
      return [...prev, newItem];
    });
  }, [words, currentWordIndex, generateOptions]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== "playing") return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setFallingItems((prev) => {
      const updated = prev.map((item) => ({
        ...item,
        y: item.y + item.speed * deltaTime,
      }));

      // Kiểm tra từ chạm đáy
      const hitBottom = updated.filter((item) => item.y > GAME_HEIGHT);
      if (hitBottom.length > 0) {
        // Kết thúc game
        setGameState("ended");
        return [];
      }

      return updated;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  // Bắt đầu spawn từ
  const startSpawning = useCallback(() => {
    spawnWord(); // Spawn từ đầu tiên ngay
    spawnTimerRef.current = window.setInterval(() => {
      if (gameState === "playing") {
        spawnWord();
      }
    }, 3000); // Spawn từ mới mỗi 3 giây
  }, [spawnWord, gameState]);

  // Xử lý chọn đáp án
  const handleSelectOption = useCallback((itemId: string, option: string) => {
    const item = fallingItems.find((i) => i.id === itemId);
    if (!item || showFeedback) return;

    const isCorrect = option === item.targetMeaning;
    setSelectedOption(option);
    setShowFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((s) => s + 10);
      setWordsCorrect((c) => c + 1);
    }

    // Xóa từ sau 1 giây
    setTimeout(() => {
      setFallingItems((prev) => prev.filter((i) => i.id !== itemId));
      setShowFeedback(null);
      setSelectedOption(null);
    }, 1000);
  }, [fallingItems, showFeedback]);

  // Bắt đầu game
  const handleStart = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setWordsCorrect(0);
    setWordsTotal(0);
    setCurrentWordIndex(0);
    setFallingItems([]);
    gameStartTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    startSpawning();
  }, [gameLoop, startSpawning]);

  // Tạm dừng/tiếp tục
  const handlePause = useCallback(() => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"));
  }, []);

  // Kết thúc game sớm
  const handleEndGame = useCallback(async () => {
    setGameState("ended");
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);

    const durationSeconds = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);

    // Lưu điểm
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("lesson_id", lessonId);
    formData.set("score", score.toString());
    formData.set("words_correct", wordsCorrect.toString());
    formData.set("words_total", wordsTotal.toString());
    formData.set("duration_seconds", durationSeconds.toString());

    const result = await saveFallingWordsScoreAction(formData);
    if (result.error) {
      setError(result.error);
    }
    setIsSubmitting(false);
    onComplete?.();
  }, [lessonId, score, wordsCorrect, wordsTotal, onComplete]);

  // Chơi lại
  const handleRestart = useCallback(() => {
    setGameState("ready");
    setScore(0);
    setWordsCorrect(0);
    setWordsTotal(0);
    setCurrentWordIndex(0);
    setFallingItems([]);
    setShowFeedback(null);
    setSelectedOption(null);
    setError(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  // Hiển thị từ hiện tại để nghe phát âm
  const currentWord = words[currentWordIndex > 0 ? currentWordIndex - 1 : 0];

  if (words.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Không có từ vựng nào có phát âm để chơi game.</p>
        <p className="mt-1 text-sm text-zinc-400">Hãy thêm audio hoặc phonetic cho từ vựng.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Game Rơi Từ</h1>
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>Điểm: <span className="font-bold text-zinc-900">{score}</span></span>
          <span>Đúng: {wordsCorrect}/{wordsTotal}</span>
          <span>Từ còn lại: {words.length - currentWordIndex}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative rounded-xl border border-zinc-200 bg-white overflow-hidden mb-6">
        <div
          ref={canvasRef}
          className="relative w-full aspect-[3/2] bg-gradient-to-b from-blue-50 to-white"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Falling Words */}
          {fallingItems.map((item) => (
            <div
              key={item.id}
              className="absolute px-3 py-1 rounded-lg bg-white border-2 shadow-lg transition-all duration-100 cursor-pointer select-none"
              style={{
                left: item.x,
                top: item.y,
                borderColor: showFeedback === "correct" && selectedOption === item.targetMeaning ? "green" :
                           showFeedback === "wrong" && selectedOption !== item.targetMeaning ? "red" : "zinc-300",
                transform: `translateZ(0)`,
                zIndex: 10,
              }}
              onClick={() => handleSelectOption(item.id, item.targetMeaning)}
            >
              <div className="font-bold text-zinc-900 text-sm whitespace-nowrap">{item.word.word}</div>
              {item.word.phonetic && (
                <div className="text-xs text-zinc-500 font-mono">/{item.word.phonetic}/</div>
              )}
            </div>
          ))}

          {/* Options Panel - hiển thị khi click vào từ */}
          {showWordMeaning && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 shadow-lg z-20">
              <p className="mb-2 font-medium text-zinc-900">Chọn nghĩa đúng:</p>
              <div className="grid grid-cols-2 gap-2">
                {fallingItems.find((i) => i.word.meaning === showWordMeaning)?.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(
                      fallingItems.find((i) => i.word.meaning === showWordMeaning)?.id ?? "",
                      opt
                    )}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showFeedback === "correct" && opt === showWordMeaning
                        ? "bg-green-100 text-green-800"
                        : showFeedback === "wrong" && opt !== showWordMeaning
                          ? "bg-red-100 text-red-800"
                          : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    }`}
                    disabled={!!showFeedback}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50">
              <div className={`text-4xl font-bold ${showFeedback === "correct" ? "text-green-500" : "text-red-500"}`}>
                {showFeedback === "correct" ? "✅ Chính xác!" : "❌ Sai rồi!"}
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === "ended" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-40 p-4">
              <h2 className="text-3xl font-bold mb-4">Trò chơi kết thúc!</h2>
              <div className="text-center mb-6">
                <p className="text-5xl font-bold mb-2">{score}</p>
                <p className="text-xl">{wordsCorrect} / {wordsTotal} từ đúng</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRestart}
                  className="rounded-lg bg-white px-6 py-3 font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  Chơi lại
                </button>
                <button
                  onClick={onComplete}
                  className="rounded-lg bg-zinc-800 px-6 py-3 font-medium text-white hover:bg-zinc-700"
                >
                  Về bài học
                </button>
              </div>
            </div>
          )}

          {/* Ready Overlay */}
          {gameState === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 p-4 text-center">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Game Rơi Từ</h2>
              <p className="text-zinc-600 mb-6 max-w-md">
                Các từ sẽ rơi từ trên xuống. Click vào từ và chọn nghĩa đúng trước khi chúng chạm đáy!
                Càng chơi lâu càng nhanh. Hãy cố gắng đạt điểm cao nhất nhé!
              </p>
              <button
                onClick={handleStart}
                className="rounded-lg bg-zinc-900 px-8 py-3 text-lg font-medium text-white hover:bg-zinc-800"
              >
                Bắt đầu chơi
              </button>
            </div>
          )}

          {/* Paused Overlay */}
          {gameState === "paused" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20 p-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Tạm dừng</h2>
              <button
                onClick={handlePause}
                className="rounded-lg bg-white px-8 py-3 text-lg font-medium text-zinc-900 hover:bg-zinc-100"
              >
                Tiếp tục
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Word Audio */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Từ hiện tại:</p>
            <p className="text-xl font-bold text-zinc-900">{currentWord?.word ?? "—"}</p>
            {currentWord?.phonetic && (
              <p className="text-sm text-zinc-500 font-mono">/{currentWord.phonetic}/</p>
            )}
          </div>
          <PhoneticButton
            text={currentWord?.word ?? ""}
            phonetic={currentWord?.phonetic}
            audioUrl={currentWord?.audio_url}
            className="text-xl px-4 py-2"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}