"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/useGameStore";
import { classifyResult, ClassificationResult } from "@/lib/game/classify";

export default function ResultPage() {
  const router = useRouter();
  const history = useGameStore((state) => state.history);
  const inventory = useGameStore((state) => state.inventory);
  const saveRemaining = useGameStore((state) => state.saveRemaining);
  const loadRemaining = useGameStore((state) => state.loadRemaining);
  const resetGame = useGameStore((state) => state.resetGame);

  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Calculate result
    const classification = classifyResult(
      history,
      saveRemaining,
      loadRemaining,
      inventory
    );
    setResult(classification);

    // Reveal animation
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [history, saveRemaining, loadRemaining, inventory]);

  const handleRestart = () => {
    resetGame();
    router.push("/");
  };

  if (!result) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[var(--color-text-muted)] animate-pulse">
          분석 중...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-secondary)]" />

      {/* Result Content */}
      <div
        className={`relative z-10 text-center max-w-md mx-auto transition-all duration-1000 ${
          isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Type Icon */}
        <div className="mb-6">
          <ResultIcon type={result.type} />
        </div>

        {/* Result Title */}
        <h1 className="text-display text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2 tracking-wider">
          {result.title}
        </h1>

        {/* Decorative line */}
        <div className="w-16 h-px bg-[var(--color-accent)] mx-auto my-6" />

        {/* Description */}
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8">
          {result.description}
        </p>

        {/* Traits */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {result.traits.map((trait, index) => (
            <span
              key={trait}
              className="px-3 py-1 text-xs uppercase tracking-wider bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
              style={{
                clipPath:
                  "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                animationDelay: `${(index + 1) * 0.2}s`,
              }}
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="panel-angular p-4 mb-8 text-left">
          <h3 className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            여정 기록
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">
                세이브 사용:
              </span>
              <span className="text-[var(--color-text-primary)]">
                {2 - saveRemaining}회
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">로드 사용:</span>
              <span className="text-[var(--color-text-primary)]">
                {1 - loadRemaining}회
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">선택 횟수:</span>
              <span className="text-[var(--color-text-primary)]">
                {history.length}회
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">
                획득 아이템:
              </span>
              <span className="text-[var(--color-text-primary)]">
                {inventory.length}개
              </span>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <button onClick={handleRestart} className="btn-angular">
          다시 시작하기
        </button>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[var(--color-border)] opacity-50" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-[var(--color-border)] opacity-50" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-[var(--color-border)] opacity-50" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[var(--color-border)] opacity-50" />
    </div>
  );
}

// Result type icons
function ResultIcon({ type }: { type: string }) {
  const iconClass = "w-16 h-16 mx-auto text-[var(--color-accent)]";

  switch (type) {
    case "shield":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "vault":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M7 8V6a5 5 0 0110 0v2" />
          <circle cx="12" cy="14" r="2" />
        </svg>
      );
    case "gamble":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
            transform="rotate(45 12 12)"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "flow":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.063 17.5 2 12 2z" />
          <circle cx="7.5" cy="10" r="1.5" fill="currentColor" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
          <circle cx="16.5" cy="10" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
