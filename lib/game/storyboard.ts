// Tutorial Storyboard
// 튜토리얼 스텝들을 객체 형식으로 관리합니다.
// 내용 편집이 필요하면 이 파일만 수정하세요.

export interface TutorialStep {
  id: string;
  title?: string;
  content: string;
  // 강조할 UI 요소 (옵션)
  highlight?: "save" | "load" | "choices" | "inventory" | null;
  // 이미지나 아이콘 (옵션)
  icon?: "save" | "load" | "choice" | "warning" | "info" | null;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "세이브 포인트에 오신 것을 환영합니다",
    content:
      "이곳은 기억과 선택의 공간입니다.\n당신의 모든 결정이 하나의 이야기가 됩니다.",
    icon: "info",
  },
  {
    id: "choices",
    title: "선택의 순간",
    content:
      "앞으로 여러 갈림길을 마주하게 됩니다.\n각 선택은 되돌릴 수 없으며, 당신의 여정을 결정짓습니다.",
    icon: "choice",
    highlight: "choices",
  },
  {
    id: "save-intro",
    title: "SAVE 시스템",
    content:
      "특별한 순간, 당신은 현재 상태를 저장할 수 있습니다.\n총 2번의 세이브 기회가 주어집니다.",
    icon: "save",
    highlight: "save",
  },
  {
    id: "save-warning",
    title: "세이브의 제약",
    content:
      "세이브는 아무 때나 할 수 없습니다.\n특정 장면에서만 세이브가 허용됩니다.\n신중하게 사용하세요.",
    icon: "warning",
    highlight: "save",
  },
  {
    id: "load-intro",
    title: "LOAD 시스템",
    content:
      "위기의 순간, 저장된 지점으로 돌아갈 수 있습니다.\n단, 로드는 단 1번만 가능합니다.",
    icon: "load",
    highlight: "load",
  },
  {
    id: "load-warning",
    title: "로드의 제약",
    content:
      "로드 역시 특정 장면에서만 가능합니다.\n정말 필요한 순간을 위해 아껴두세요.",
    icon: "warning",
    highlight: "load",
  },
  {
    id: "result",
    title: "여정의 끝",
    content:
      "모든 선택이 끝나면 당신만의 결과가 도출됩니다.\n세이브와 로드를 어떻게 사용했는지가\n당신을 정의합니다.",
    icon: "info",
  },
  {
    id: "ready",
    title: "준비되셨나요?",
    content:
      "이제 당신의 이야기를 시작합니다.\n현명하게 선택하고, 신중하게 저장하세요.",
    icon: "info",
  },
];

// 튜토리얼 스텝 가져오기
export const getTutorialStep = (index: number): TutorialStep | undefined => {
  return TUTORIAL_STEPS[index];
};

// 총 스텝 수
export const getTotalTutorialSteps = (): number => {
  return TUTORIAL_STEPS.length;
};

// ID로 스텝 찾기
export const getTutorialStepById = (id: string): TutorialStep | undefined => {
  return TUTORIAL_STEPS.find((step) => step.id === id);
};
