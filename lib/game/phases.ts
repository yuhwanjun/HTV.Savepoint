// Phase System - 페이즈별 스토리보드 관리
// 각 페이즈는 intro → choice → result 구조로 진행됩니다.

export type PhaseStep = "intro" | "choice" | "result";
export type WeaponType = "sword" | "wand" | "bow";
export type PathType = "forest" | "mountain";
export type ChoiceType = WeaponType | PathType;

// 대화 라인 인터페이스
export interface DialogueLine {
  id: string;
  speaker?: string; // 화자 (없으면 나레이션)
  text: string;
  // 조건부 텍스트 (선택에 따라)
  conditionalText?: Record<string, string>;
  // 시스템 지시 (화면 효과 등)
  effect?: "fade_in" | "fade_out" | "ui_hide" | "ui_show" | "whisper";
  // 지연 시간 (ms)
  delay?: number;
}

// 선택지 인터페이스 (범용)
export interface Choice {
  id: string;
  label: string;
  description: string;
}

// 무기 선택지 인터페이스 (하위 호환)
export interface WeaponChoice extends Choice {
  id: WeaponType;
}

// 경로 선택지 인터페이스
export interface PathChoice extends Choice {
  id: PathType;
}

// 페이즈 데이터 인터페이스
export interface PhaseData {
  id: string;
  title: string;
  intro: {
    dialogues: DialogueLine[];
  };
  choice: {
    prompt: string;
    options: Choice[]; // 범용 선택지
  };
  result: {
    // 일반 결과 (로드되지 않은 상태)
    normal: {
      dialogues: DialogueLine[];
      // goodChoice가 설정되는 시점 (선택하지 않은 것 중 랜덤)
      setGoodChoice: boolean;
    };
    // 로드 후 goodChoice 선택 시 결과
    loaded: {
      dialogues: DialogueLine[];
    };
  };
  // 다음 페이즈 ID
  nextPhase?: string;
}

// ===== Phase 1: 대장장이의 무기 선택 =====
export const PHASE_1: PhaseData = {
  id: "phase_1",
  title: "대장간",

  intro: {
    dialogues: [
      {
        id: "intro_0",
        speaker: "대장장이",
        text: "무슨 고민을 그렇게 오래하나?",
        // 어두운 화면에서 대사만 표시
      },
      {
        id: "intro_1",
        speaker: "대장장이",
        text: "얼른 무기를 선택하게, 무투가가 아닌 이상 맨손으로 때려잡기는 쉽지 않을텐데.",
        effect: "fade_in", // 페이드 인과 함께 대사 표시
      },
    ],
  },

  choice: {
    prompt: "어서 무기를 선택하게",
    options: [
      {
        id: "sword",
        label: "칼",
        description: "날이 많이 상해있는 것처럼 보이는 칼",
      },
      {
        id: "wand",
        label: "완드",
        description: "나무가지를 대충 엮어놓은 듯한 완드",
      },
      {
        id: "bow",
        label: "활",
        description: "금방이라도 끊어질 것 처럼 보이는 실이 대충 감긴 듯한 활",
      },
    ],
  },

  result: {
    normal: {
      setGoodChoice: true, // 선택하지 않은 무기 중 하나가 goodChoice로 설정됨
      dialogues: [
        {
          id: "result_0",
          speaker: "대장장이",
          text: "", // 조건부 텍스트로 대체
          conditionalText: {
            sword:
              "날카롭게 벼려진 이 칼과 함께면 귀여운 고블린 정도는 쉽게 두동강 낼 수 있을거야.",
            wand: "어린아이도 파이어볼을 사용하게 만들어 주는 완드야. 대장간에 불을 부칠때 요긴하게 사용했는데 아쉽긴 하군.",
            bow: "엘프도 사가는 활이야. 눈감고 쏴도 머리를 꿰뚫을 수 있을거야.",
          },
        },
        {
          id: "result_1",
          speaker: "대장장이",
          text: "그럼 초심자의 행운이 가득하길.",
        },
        {
          id: "result_2",
          text: "", // 조건부 텍스트로 대체 (선택하지 않은 무기)
          effect: "fade_out", // 페이드 아웃 후 어두운 화면에서 속삭임
          conditionalText: {
            sword:
              "결국 이 칼은 주인을 만나지 못했군, 이렇게 보는 눈이 없어서야...",
            wand: "결국 이 완드는 주인을 만나지 못했군, 이렇게 보는 눈이 없어서야...",
            bow: "결국 이 활은 주인을 만나지 못했군, 이렇게 보는 눈이 없어서야...",
          },
        },
      ],
    },
    loaded: {
      dialogues: [
        {
          id: "loaded_result_0",
          speaker: "대장장이",
          text: "", // 조건부 텍스트로 대체
          conditionalText: {
            sword:
              "이 칼을 알아보다니, 요즘 보기 드문 모험가군. 내 평생에 걸친 걸작이라네, 분명 모험에서 큰일을 해낼거야.",
            wand: "이 완드를 알아보다니, 요즘 보기 드문 모험가군. 내 평생에 걸친 걸작이라네, 분명 모험에서 큰일을 해낼거야.",
            bow: "이 활을 알아보다니, 요즘 보기 드문 모험가군. 내 평생에 걸친 걸작이라네, 분명 모험에서 큰일을 해낼거야.",
          },
        },
        {
          id: "loaded_result_1",
          speaker: "대장장이",
          text: "그럼 초심자의 행운이 가득하길.",
        },
      ],
    },
  },
  nextPhase: "phase_2",
};

// ===== Phase 2: 갈림길 =====
export const PHASE_2: PhaseData = {
  id: "phase_2",
  title: "갈림길",

  intro: {
    dialogues: [
      {
        id: "intro_0",
        text: "대장간을 나서니 마을 끝에 두 갈래 길이 보인다.",
        // 어두운 화면에서 시작
      },
      {
        id: "intro_1",
        text: "어디로 가야 할지 고민하던 찰나, 길가에 앉아있던 노인이 말을 건넨다.",
        effect: "fade_in",
      },
      {
        id: "intro_2",
        speaker: "노인",
        text: "젊은이, 어디로 갈 생각인가?",
      },
      {
        id: "intro_3",
        speaker: "노인",
        text: "숲길은 빠르지만 위험하고, 산길은 험하지만 보상이 크다네.",
      },
    ],
  },

  choice: {
    prompt: "어떤 길을 선택하겠는가?",
    options: [
      {
        id: "forest",
        label: "숲길",
        description:
          "울창한 나무들 사이로 희미하게 보이는 오솔길. 빠르지만 무언가 도사리고 있는 듯하다.",
      },
      {
        id: "mountain",
        label: "산길",
        description:
          "가파른 경사가 이어지는 험준한 길. 꼭대기에서 무언가 빛나는 것 같다.",
      },
    ],
  },

  result: {
    normal: {
      setGoodChoice: true,
      dialogues: [
        {
          id: "result_0",
          speaker: "노인",
          text: "",
          conditionalText: {
            forest:
              "숲길이라... 용기가 대단하군. 숲속의 정령들이 자네를 시험할 것이네.",
            mountain:
              "산길이라... 야망이 있군. 산꼭대기의 보물이 자네를 기다리고 있을 것이야.",
          },
        },
        {
          id: "result_1",
          speaker: "노인",
          text: "행운을 빌겠네, 젊은이.",
        },
        {
          id: "result_2",
          text: "",
          effect: "fade_out",
          conditionalText: {
            forest:
              "저 숲에는... 아, 그것을 선택하지 않다니... 기회를 놓쳤군...",
            mountain:
              "저 산에는... 아, 그것을 선택하지 않다니... 기회를 놓쳤군...",
          },
        },
      ],
    },
    loaded: {
      dialogues: [
        {
          id: "loaded_result_0",
          speaker: "노인",
          text: "",
          conditionalText: {
            forest: "오호, 숲의 비밀을 아는가? 정령의 축복이 함께할 것이네.",
            mountain:
              "오호, 산의 비밀을 아는가? 고대의 보물이 자네를 알아볼 것이네.",
          },
        },
        {
          id: "loaded_result_1",
          speaker: "노인",
          text: "자네는 분명 특별한 운명을 타고났군. 가거라, 젊은이.",
        },
      ],
    },
  },
  nextPhase: "phase_3",
};

// ===== Phase 3: 전투 =====
export const PHASE_3: PhaseData = {
  id: "phase_3",
  title: "전투",

  intro: {
    dialogues: [
      {
        id: "intro_0",
        text: "길을 따라 걷던 중, 갑자기 수풀 사이에서 무언가가 튀어나온다.",
      },
      {
        id: "intro_1",
        text: "고블린이다! 무기를 들어야 한다.",
        effect: "fade_in",
      },
      {
        id: "intro_2",
        speaker: "고블린",
        text: "끼익! 인간이다!",
      },
    ],
  },

  choice: {
    prompt: "어떻게 대응할 것인가?",
    options: [
      {
        id: "attack",
        label: "공격",
        description: "무기를 휘둘러 고블린을 공격한다.",
      },
      {
        id: "defend",
        label: "방어",
        description: "방어 자세를 취하고 상대의 빈틈을 노린다.",
      },
    ],
  },

  result: {
    normal: {
      setGoodChoice: true,
      dialogues: [
        {
          id: "result_0",
          text: "",
          conditionalText: {
            attack:
              "고블린을 향해 무기를 휘둘렀다. 고블린이 비명을 지르며 쓰러진다.",
            defend:
              "고블린의 공격을 막아내고 반격했다. 고블린이 비틀거리며 물러난다.",
          },
        },
        {
          id: "result_1",
          text: "전투가 끝났다. 하지만 더 나은 방법이 있었을지도...",
        },
        {
          id: "result_2",
          text: "",
          effect: "fade_out",
          conditionalText: {
            attack: "그때 그 순간... 방어했더라면 어땠을까...",
            defend: "그때 그 순간... 공격했더라면 어땠을까...",
          },
        },
      ],
    },
    loaded: {
      dialogues: [
        {
          id: "loaded_result_0",
          text: "",
          conditionalText: {
            attack:
              "이번엔 확실히 알고 있었다. 완벽한 일격이 고블린을 쓰러뜨린다.",
            defend:
              "이번엔 확실히 알고 있었다. 완벽한 반격이 고블린을 제압한다.",
          },
        },
        {
          id: "loaded_result_1",
          text: "과거의 기억이 승리를 이끌었다.",
        },
      ],
    },
  },
  nextPhase: "phase_4",
};

// ===== Phase 4: 퍼즐 =====
export const PHASE_4: PhaseData = {
  id: "phase_4",
  title: "퍼즐",

  intro: {
    dialogues: [
      {
        id: "intro_0",
        text: "길 끝에 오래된 문이 나타났다. 문에는 수수께끼가 적혀있다.",
      },
      {
        id: "intro_1",
        text: '"나는 입은 있으나 말하지 못하고, 눈은 있으나 보지 못한다. 나는 무엇인가?"',
        effect: "fade_in",
      },
    ],
  },

  choice: {
    prompt: "답을 선택하라",
    options: [
      {
        id: "fish",
        label: "물고기",
        description: "입과 눈이 있지만 말하거나 보지 못하는 물고기.",
      },
      {
        id: "statue",
        label: "석상",
        description: "조각된 입과 눈이 있지만 기능하지 않는 석상.",
      },
    ],
  },

  result: {
    normal: {
      setGoodChoice: true,
      dialogues: [
        {
          id: "result_0",
          text: "",
          conditionalText: {
            fish: "문이 천천히 열린다. 정답이었다.",
            statue: "문이 천천히 열린다. 정답이었다.",
          },
        },
        {
          id: "result_1",
          text: "하지만 다른 답도 있었던 것 같은 느낌이 든다...",
        },
        {
          id: "result_2",
          text: "",
          effect: "fade_out",
          conditionalText: {
            fish: "석상도 답이 될 수 있었을까...",
            statue: "물고기도 답이 될 수 있었을까...",
          },
        },
      ],
    },
    loaded: {
      dialogues: [
        {
          id: "loaded_result_0",
          text: "",
          conditionalText: {
            fish: "이미 알고 있던 답이었다. 문이 활짝 열리며 빛이 쏟아진다.",
            statue: "이미 알고 있던 답이었다. 문이 활짝 열리며 빛이 쏟아진다.",
          },
        },
        {
          id: "loaded_result_1",
          text: "기억 속의 지혜가 길을 열었다.",
        },
      ],
    },
  },
  nextPhase: "phase_5",
};

// ===== Phase 5: 보상 =====
export const PHASE_5: PhaseData = {
  id: "phase_5",
  title: "보상",

  intro: {
    dialogues: [
      {
        id: "intro_0",
        text: "문 너머로 들어서니 보물이 가득한 방이 나타났다.",
      },
      {
        id: "intro_1",
        text: "두 개의 보물 상자가 눈에 들어온다.",
        effect: "fade_in",
      },
      {
        id: "intro_2",
        speaker: "???",
        text: "하나만 가져갈 수 있다...",
      },
    ],
  },

  choice: {
    prompt: "어떤 보물을 선택할 것인가?",
    options: [
      {
        id: "gold",
        label: "황금 상자",
        description:
          "화려하게 빛나는 황금 상자. 안에 무엇이 들었을지 궁금하다.",
      },
      {
        id: "wooden",
        label: "나무 상자",
        description: "낡고 초라한 나무 상자. 하지만 묘한 끌림이 느껴진다.",
      },
    ],
  },

  result: {
    normal: {
      setGoodChoice: true,
      dialogues: [
        {
          id: "result_0",
          text: "",
          conditionalText: {
            gold: "황금 상자를 열자 금화가 쏟아져 나왔다. 부자가 된 기분이다.",
            wooden:
              "나무 상자를 열자 오래된 지도가 나왔다. 새로운 모험의 시작이다.",
          },
        },
        {
          id: "result_1",
          text: "모험이 끝났다. 하지만 다른 선택을 했다면...",
        },
        {
          id: "result_2",
          text: "",
          effect: "fade_out",
          conditionalText: {
            gold: "저 나무 상자에는 뭐가 들어있었을까...",
            wooden: "저 황금 상자에는 뭐가 들어있었을까...",
          },
        },
      ],
    },
    loaded: {
      dialogues: [
        {
          id: "loaded_result_0",
          text: "",
          conditionalText: {
            gold: "이번엔 확신을 가지고 황금 상자를 선택했다. 진정한 부를 얻었다.",
            wooden:
              "이번엔 확신을 가지고 나무 상자를 선택했다. 전설의 지도를 손에 넣었다.",
          },
        },
        {
          id: "loaded_result_1",
          text: "과거의 경험이 최선의 선택을 이끌었다. 진정한 엔딩.",
        },
      ],
    },
  },
  // 마지막 페이즈 - nextPhase 없음
};

// 모든 페이즈 맵
export const PHASES: Record<string, PhaseData> = {
  phase_1: PHASE_1,
  phase_2: PHASE_2,
  phase_3: PHASE_3,
  phase_4: PHASE_4,
  phase_5: PHASE_5,
};

// 헬퍼 함수들
export const getPhase = (phaseId: string): PhaseData | undefined => {
  return PHASES[phaseId];
};

// 무기 이름 가져오기 (한글)
export const getWeaponName = (weaponId: WeaponType): string => {
  const names: Record<WeaponType, string> = {
    sword: "칼",
    wand: "완드",
    bow: "활",
  };
  return names[weaponId];
};

// 경로 이름 가져오기 (한글)
export const getPathName = (pathId: PathType): string => {
  const names: Record<PathType, string> = {
    forest: "숲길",
    mountain: "산길",
  };
  return names[pathId];
};

// goodChoice 선택 함수 (선택하지 않은 무기 중 랜덤) - Phase 1용
export const selectGoodChoice = (selectedWeapon: WeaponType): WeaponType => {
  const allWeapons: WeaponType[] = ["sword", "wand", "bow"];
  const remainingWeapons = allWeapons.filter((w) => w !== selectedWeapon);
  const randomIndex = Math.floor(Math.random() * remainingWeapons.length);
  return remainingWeapons[randomIndex];
};

// 범용 goodChoice 선택 함수 (선택하지 않은 옵션 중 랜덤)
export const selectGoodChoiceFromOptions = (
  selectedId: string,
  allOptions: Choice[]
): string => {
  const remainingOptions = allOptions.filter((opt) => opt.id !== selectedId);
  const randomIndex = Math.floor(Math.random() * remainingOptions.length);
  return remainingOptions[randomIndex].id;
};

// 조건부 텍스트 가져오기
export const getConditionalText = (
  dialogue: DialogueLine,
  weaponId: WeaponType
): string => {
  if (dialogue.conditionalText && dialogue.conditionalText[weaponId]) {
    return dialogue.conditionalText[weaponId];
  }
  return dialogue.text;
};
