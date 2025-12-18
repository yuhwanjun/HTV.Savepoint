"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useGameStore,
  usePhaseState,
  useLoadState,
} from "@/lib/store/useGameStore";
import {
  getPhase,
  getConditionalText,
  selectGoodChoice,
  WeaponType,
  DialogueLine,
} from "@/lib/game/phases";

export default function PhaseOverlay() {
  const currentNodeId = useGameStore((state) => state.currentNodeId);
  const { currentPhaseStep, dialogueIndex, selectedWeapon, goodChoice } =
    usePhaseState();
  const { isInLoadedState } = useLoadState();

  const setPhaseStep = useGameStore((state) => state.setPhaseStep);
  const nextDialogue = useGameStore((state) => state.nextDialogue);
  const selectWeaponAction = useGameStore((state) => state.selectWeapon);
  const setGoodChoice = useGameStore((state) => state.setGoodChoice);
  const addToInventory = useGameStore((state) => state.addToInventory);
  const goToNode = useGameStore((state) => state.goToNode);

  // 현재 선택 중인 무기 (확정 전)
  const [hoveredWeapon, setHoveredWeapon] = useState<WeaponType | null>(null);

  // 화면 효과 상태
  const [isFading, setIsFading] = useState(false); // 기본은 밝은 상태
  const [showBlackScreen, setShowBlackScreen] = useState(true); // 초기 검은 화면
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [isWhisper, setIsWhisper] = useState(false);

  const phase = getPhase(currentNodeId);

  // 디버깅용
  console.log(
    "PhaseOverlay - currentNodeId:",
    currentNodeId,
    "phase:",
    phase,
    "currentPhaseStep:",
    currentPhaseStep,
    "dialogueIndex:",
    dialogueIndex,
    "showBlackScreen:",
    showBlackScreen
  );

  // 페이즈 시작 시 검은 화면에서 시작 (fade_in 효과가 있는 대사까지 유지)
  useEffect(() => {
    if (currentPhaseStep === "intro" && dialogueIndex === 0) {
      // 인트로 시작 시 항상 검은 화면에서 시작
      setShowBlackScreen(true);
    }
  }, [currentNodeId, currentPhaseStep]);

  // 현재 대화 가져오기
  const getCurrentDialogues = useCallback((): DialogueLine[] => {
    if (!phase) return [];

    switch (currentPhaseStep) {
      case "intro":
        return phase.intro.dialogues;
      case "result":
        // 로드된 상태에서 goodChoice를 선택했는지 확인
        if (
          isInLoadedState &&
          selectedWeapon &&
          goodChoice &&
          selectedWeapon === goodChoice
        ) {
          return phase.result.loaded.dialogues;
        }
        return phase.result.normal.dialogues;
      default:
        return [];
    }
  }, [phase, currentPhaseStep, isInLoadedState, selectedWeapon, goodChoice]);

  const dialogues = getCurrentDialogues();
  const currentDialogue = dialogues[dialogueIndex];

  // 대화가 나타날 때 fade_out 효과만 처리 (fade_in은 클릭 시 처리)
  useEffect(() => {
    if (!currentDialogue) return;

    // fade_out 효과가 있는 대화가 나타나면 페이드 아웃
    if (currentDialogue.effect === "fade_out") {
      setShowBlackScreen(true);
    }
  }, [currentDialogue, dialogueIndex]);

  // 대화 클릭 핸들러
  const handleDialogueClick = useCallback(() => {
    if (!phase || !currentDialogue) return;

    // 효과 처리
    if (currentDialogue.effect === "ui_hide") {
      setIsUIHidden(true);
    } else if (currentDialogue.effect === "ui_show") {
      setIsUIHidden(false);
    } else if (currentDialogue.effect === "whisper") {
      setIsWhisper(true);
    }

    // 다음 대화 확인
    const nextDialogueData = dialogues[dialogueIndex + 1];

    // 다음 대화가 fade_in 효과를 가지고 있으면, 먼저 페이드인 후 대화 전환
    if (nextDialogueData?.effect === "fade_in") {
      setShowBlackScreen(false); // 페이드 인 시작
      // 페이드 인 완료 후 다음 대화로
      setTimeout(() => {
        if (dialogueIndex < dialogues.length - 1) {
          nextDialogue();
        }
      }, 1500); // 페이드 인 duration과 맞춤
      return;
    }

    // 다음 대화가 fade_out 효과를 가지고 있으면, 먼저 페이드아웃 후 대화 전환
    if (nextDialogueData?.effect === "fade_out") {
      setShowBlackScreen(true); // 페이드 아웃 시작
      // 페이드 아웃 완료 후 다음 대화로
      setTimeout(() => {
        if (dialogueIndex < dialogues.length - 1) {
          nextDialogue();
        }
      }, 1000); // 페이드 아웃 duration과 맞춤
      return;
    }

    // 다음 대화로
    if (dialogueIndex < dialogues.length - 1) {
      nextDialogue();
    } else {
      // 대화 끝 - 다음 단계로
      if (currentPhaseStep === "intro") {
        setPhaseStep("choice");
        setIsUIHidden(false);
      } else if (currentPhaseStep === "result") {
        // 다음 페이즈로 이동
        setShowBlackScreen(true);
        setTimeout(() => {
          if (phase.nextPhase) {
            goToNode(phase.nextPhase);
          } else {
            // 마지막 페이즈인 경우 엔딩으로
            goToNode("ending");
          }
        }, 1000);
      }
    }
  }, [
    phase,
    currentDialogue,
    dialogueIndex,
    dialogues,
    currentPhaseStep,
    nextDialogue,
    setPhaseStep,
    goToNode,
  ]);

  // 무기 선택 확정
  const handleWeaponConfirm = useCallback(() => {
    if (!hoveredWeapon || !phase) return;

    // 무기 선택 저장
    selectWeaponAction(hoveredWeapon);
    addToInventory(hoveredWeapon);

    // 로드되지 않은 상태에서만 goodChoice 설정
    if (!isInLoadedState && !goodChoice) {
      const newGoodChoice = selectGoodChoice(hoveredWeapon);
      setGoodChoice(newGoodChoice);
    }

    // result 단계로 이동
    setPhaseStep("result");
    setIsWhisper(false);
  }, [
    hoveredWeapon,
    phase,
    selectWeaponAction,
    addToInventory,
    isInLoadedState,
    goodChoice,
    setGoodChoice,
    setPhaseStep,
  ]);

  // 대화 텍스트 가져오기 (조건부 텍스트 처리)
  const getDialogueText = useCallback(
    (dialogue: DialogueLine): string => {
      if (!dialogue) return "";

      // result 단계에서 선택한 무기에 따른 텍스트
      if (
        currentPhaseStep === "result" &&
        selectedWeapon &&
        dialogue.conditionalText
      ) {
        // 마지막 대사 (whisper)는 선택하지 않은 무기에 대한 것
        if (dialogue.effect === "whisper" && goodChoice) {
          return dialogue.conditionalText[goodChoice] || dialogue.text;
        }
        return dialogue.conditionalText[selectedWeapon] || dialogue.text;
      }

      return getConditionalText(dialogue, selectedWeapon || "sword");
    },
    [currentPhaseStep, selectedWeapon, goodChoice]
  );

  if (!phase) return null;

  // 페이즈 번호 추출 (phase_1 -> 1)
  const phaseNumber = currentNodeId.replace("phase_", "");

  return (
    <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
      {/* 상단 중앙 - 현재 페이즈 표시 (항상 보임, 페이드 오버레이 위) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="px-4 py-2 bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)] backdrop-blur-sm">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest text-center">
            <span className="text-[var(--color-accent)] font-mono">
              #{phaseNumber}
            </span>
            <span className="mx-2">·</span>
            <span>{phase.title}</span>
          </p>
        </div>
      </div>

      {/* Fade overlay (검은 화면 효과) */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-1000 pointer-events-none ${
          showBlackScreen || isFading ? "opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: showBlackScreen || isFading ? 10 : -1 }}
      />

      {/* Dialogue / Choice Panel (항상 하단에 표시) */}
      {!isUIHidden && (
        <div
          className="panel-angular mx-6 mb-24 p-6 pointer-events-auto transition-opacity duration-500"
          style={{ zIndex: 20 }}
        >
          {/* Intro & Result: Dialogue */}
          {(currentPhaseStep === "intro" || currentPhaseStep === "result") &&
            currentDialogue && (
              <button
                key={`dialogue-${dialogueIndex}`}
                onClick={handleDialogueClick}
                className="cursor-pointer min-h-[100px] w-full text-left bg-transparent border-none animate-dialogueFadeIn"
                aria-label={`${
                  currentDialogue.speaker || "내레이션"
                }: ${getDialogueText(currentDialogue)} - 클릭하여 계속`}
              >
                {/* Speaker */}
                {currentDialogue.speaker && (
                  <div className="text-sm text-[var(--color-accent)] mb-2 font-medium">
                    {currentDialogue.speaker}
                  </div>
                )}
                {/* Text */}
                <p
                  className={`text-[var(--color-text-primary)] leading-relaxed ${
                    isWhisper ||
                    currentDialogue.effect === "whisper" ||
                    currentDialogue.effect === "fade_out"
                      ? "text-sm italic text-[var(--color-text-muted)] opacity-70"
                      : "text-base"
                  }`}
                >
                  {getDialogueText(currentDialogue)}
                </p>
                {/* Click hint */}
                <div className="text-xs text-[var(--color-text-muted)] mt-4 text-right animate-pulse">
                  클릭하여 계속...
                </div>
              </button>
            )}

          {/* Choice: Weapon Selection */}
          {currentPhaseStep === "choice" && (
            <div className="animate-dialogueFadeIn">
              {/* Prompt */}
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                {phase.choice.prompt}
              </p>

              {/* Choice Options Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {phase.choice.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setHoveredWeapon(option.id as WeaponType)}
                    className={`p-4 border transition-all duration-200 text-center ${
                      hoveredWeapon === option.id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                        : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                    }`}
                    style={{
                      clipPath:
                        "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                    }}
                  >
                    <div className="text-lg font-bold text-[var(--color-text-primary)]">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Option Description */}
              {hoveredWeapon && (
                <div
                  key={hoveredWeapon}
                  className="p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] mb-4 animate-dialogueFadeIn"
                >
                  <p className="text-sm text-[var(--color-text-secondary)] italic">
                    "
                    {
                      phase.choice.options.find((opt) => opt.id === hoveredWeapon)
                        ?.description
                    }
                    "
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleWeaponConfirm}
                disabled={!hoveredWeapon}
                className={`w-full btn-angular ${
                  hoveredWeapon ? "" : "opacity-50 cursor-not-allowed"
                }`}
              >
                결정
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loaded State Indicator */}
      {isInLoadedState && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-900/30 border border-blue-500/50 text-blue-300 text-xs rounded">
          과거의 기억이 떠오른다...
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
