// Result Classification System
// Analyzes player history and save/load patterns to determine personality type

export type ResultType = 'shield' | 'vault' | 'gamble' | 'flow';

export interface ClassificationResult {
  type: ResultType;
  title: string;
  description: string;
  traits: string[];
}

interface AnalysisFactors {
  // Save/Load patterns
  saveCount: number;      // How many times saved (max 2)
  loadCount: number;      // How many times loaded (max 1)
  didLoad: boolean;       // Whether player used load
  
  // Choice patterns
  tookRiskyPath: boolean; // Chose dark path at crossroads
  rushAttack: boolean;    // Chose rush at battle
  tookTreasure: boolean;  // Took treasure items
  
  // History analysis
  totalChoices: number;
  uniqueNodes: number;
}

const RESULT_DATA: Record<ResultType, ClassificationResult> = {
  shield: {
    type: 'shield',
    title: 'Shield - 방패',
    description: '당신은 소중한 것을 지키기 위해 세이브를 사용합니다. 신중하고 보호적인 성향으로, 실패를 두려워하기보다 준비를 중시합니다.',
    traits: ['신중함', '보호 본능', '계획적', '안정 추구'],
  },
  vault: {
    type: 'vault',
    title: 'Vault - 금고',
    description: '당신은 완벽한 순간을 포착하여 저장합니다. 최적의 상태를 보존하려는 욕구가 강하며, 기회를 놓치지 않습니다.',
    traits: ['완벽주의', '기회포착', '전략적', '효율 중시'],
  },
  gamble: {
    type: 'gamble',
    title: 'Gamble - 도박',
    description: '당신은 위험을 감수하며 로드를 망설이지 않습니다. 결과보다 과정을 즐기며, 실패해도 다시 도전합니다.',
    traits: ['모험심', '도전정신', '회복력', '낙관적'],
  },
  flow: {
    type: 'flow',
    title: 'Flow - 흐름',
    description: '당신은 세이브나 로드에 의존하지 않고 자연스럽게 흘러갑니다. 현재의 선택에 충실하며, 결과를 있는 그대로 받아들입니다.',
    traits: ['적응력', '현재 집중', '수용적', '자연스러움'],
  },
};

function analyzeHistory(history: string[]): AnalysisFactors {
  const loadEntries = history.filter(h => h.startsWith('[LOADED:'));
  
  return {
    saveCount: 2 - history.filter(h => h === 'p1_beginning').length, // Rough estimate
    loadCount: loadEntries.length,
    didLoad: loadEntries.length > 0,
    tookRiskyPath: history.includes('p5_treasure'),
    rushAttack: history.some(h => h.includes('rushed')),
    tookTreasure: history.includes('p3_after_victory'),
    totalChoices: history.length,
    uniqueNodes: new Set(history.filter(h => !h.startsWith('['))).size,
  };
}

export function classifyResult(
  history: string[],
  saveRemaining: number,
  loadRemaining: number,
  inventory: string[]
): ClassificationResult {
  const factors = analyzeHistory(history);
  
  // Calculate used resources
  const savesUsed = 2 - saveRemaining;
  const loadsUsed = 1 - loadRemaining;
  
  // Scoring system
  let scores: Record<ResultType, number> = {
    shield: 0,
    vault: 0,
    gamble: 0,
    flow: 0,
  };
  
  // Shield scoring: Used saves defensively, avoided risks
  if (savesUsed >= 1 && !factors.tookRiskyPath) {
    scores.shield += 3;
  }
  if (inventory.includes('trap_used') || inventory.includes('observed')) {
    scores.shield += 2;
  }
  if (!factors.didLoad && savesUsed > 0) {
    scores.shield += 1;
  }
  
  // Vault scoring: Used saves strategically, optimized outcomes
  if (savesUsed === 2) {
    scores.vault += 2;
  }
  if (inventory.includes('gold') || inventory.includes('map')) {
    scores.vault += 2;
  }
  if (factors.tookRiskyPath && savesUsed > 0) {
    scores.vault += 1;
  }
  
  // Gamble scoring: Used load, took risks
  if (loadsUsed > 0) {
    scores.gamble += 3;
  }
  if (factors.tookRiskyPath) {
    scores.gamble += 2;
  }
  if (inventory.includes('rushed')) {
    scores.gamble += 1;
  }
  
  // Flow scoring: Didn't use save/load much
  if (savesUsed === 0) {
    scores.flow += 3;
  }
  if (loadsUsed === 0 && savesUsed <= 1) {
    scores.flow += 2;
  }
  if (!factors.tookRiskyPath && !inventory.includes('trap_used')) {
    scores.flow += 1;
  }
  
  // Find the highest scoring type
  let maxScore = -1;
  let resultType: ResultType = 'flow';
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      resultType = type as ResultType;
    }
  }
  
  return RESULT_DATA[resultType];
}

export function getResultData(type: ResultType): ClassificationResult {
  return RESULT_DATA[type];
}

export function getAllResultTypes(): ResultType[] {
  return ['shield', 'vault', 'gamble', 'flow'];
}

