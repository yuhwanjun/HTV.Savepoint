"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/useGameStore";
import { TUTORIAL_STEPS, getTotalTutorialSteps } from "@/lib/game/storyboard";

export default function TutorialPage() {
  const router = useRouter();
  const startGame = useGameStore((state) => state.startGame);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalSteps = getTotalTutorialSteps();
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    setTimeout(() => {
      if (isLastStep) {
        // 마지막 스텝이면 게임 시작
        startGame();
        router.push("/play");
      } else {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
      }
    }, 300);
  };

  const handleSkip = () => {
    startGame();
    router.push("/play");
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]" />

      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--color-accent)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5 mb-8">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-6 bg-[var(--color-accent)]"
                  : index < currentStep
                  ? "w-2 bg-[var(--color-accent)] opacity-60"
                  : "w-2 bg-[var(--color-border)] opacity-40"
              }`}
            />
          ))}
        </div>

        {/* Tutorial card */}
        <div
          className={`panel-angular p-8 transition-all duration-300 ${
            isTransitioning
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Icon */}
          {step.icon && (
            <div className="flex justify-center mb-6">
              <TutorialIcon type={step.icon} />
            </div>
          )}

          {/* Title */}
          {step.title && (
            <h2 className="text-display text-xl font-bold text-[var(--color-text-primary)] text-center mb-4">
              {step.title}
            </h2>
          )}

          {/* Content */}
          <p className="text-[var(--color-text-secondary)] text-sm text-center leading-relaxed whitespace-pre-line">
            {step.content}
          </p>

          {/* Highlight preview */}
          {step.highlight && (
            <div className="mt-6 flex justify-center">
              <HighlightPreview type={step.highlight} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="btn-angular w-full py-4"
          >
            {isLastStep ? "게임 시작" : "다음"}
          </button>

          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="text-[var(--color-text-muted)] text-xs hover:text-[var(--color-text-secondary)] transition-colors"
            >
              건너뛰기
            </button>
          )}
        </div>

        {/* Step counter */}
        <p className="text-center text-[var(--color-text-muted)] text-xs mt-6">
          {currentStep + 1} / {totalSteps}
        </p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-[var(--color-border)] opacity-40" />
      <div className="absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 border-[var(--color-border)] opacity-40" />
      <div className="absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 border-[var(--color-border)] opacity-40" />
      <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-[var(--color-border)] opacity-40" />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-15px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
}

// Tutorial Icon Component
function TutorialIcon({ type }: { type: string }) {
  const iconClass = "w-12 h-12 text-[var(--color-accent)]";

  switch (type) {
    case "save":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    case "load":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      );
    case "choice":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      );
    case "warning":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

// Highlight Preview Component
function HighlightPreview({ type }: { type: string }) {
  switch (type) {
    case "save":
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] border border-green-600/50 rounded">
          <svg
            className="w-4 h-4 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          </svg>
          <span className="text-xs text-[var(--color-text-secondary)]">
            SAVE (2)
          </span>
        </div>
      );
    case "load":
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] border border-blue-500/50 rounded">
          <svg
            className="w-4 h-4 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span className="text-xs text-[var(--color-text-secondary)]">
            LOAD (1)
          </span>
        </div>
      );
    case "choices":
      return (
        <div className="space-y-2">
          <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-secondary)]">
            선택지 A
          </div>
          <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-secondary)]">
            선택지 B
          </div>
        </div>
      );
    default:
      return null;
  }
}
