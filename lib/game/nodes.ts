// Scene Node Types
export type NodeType = 'explore' | 'choice' | 'chance' | 'ending';

export interface Choice {
  id: string;
  label: string;
  nextNodeId: string;
  effect?: {
    addItem?: string;
    removeItem?: string;
  };
}

export interface SceneNode {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  allowSave: boolean;
  allowLoad: boolean;
  pointCloudPath?: string;
  choices?: Choice[];
  nextNodeId?: string;
  // Chance node specific
  chanceOutcomes?: {
    success: { probability: number; nextNodeId: string; message: string };
    failure: { probability: number; nextNodeId: string; message: string };
  };
}

// Phase 1: Beginning - Weapon Select
const p1_beginning: SceneNode = {
  id: 'p1_beginning',
  type: 'choice',
  title: '시작의 선택',
  description: '당신 앞에 세 개의 무기가 놓여 있습니다. 흐릿한 기억 속에서 하나를 선택하세요.',
  allowSave: true,
  allowLoad: false,
  choices: [
    {
      id: 'sword',
      label: '검 - 직접적인 힘',
      nextNodeId: 'p2_before_battle',
      effect: { addItem: 'sword' },
    },
    {
      id: 'bow',
      label: '활 - 신중한 거리',
      nextNodeId: 'p2_before_battle',
      effect: { addItem: 'bow' },
    },
    {
      id: 'staff',
      label: '지팡이 - 불확실한 마법',
      nextNodeId: 'p2_before_battle',
      effect: { addItem: 'staff' },
    },
  ],
};

// Phase 2: Before Battle - Preparation Choice
const p2_before_battle: SceneNode = {
  id: 'p2_before_battle',
  type: 'choice',
  title: '전투 직전',
  description: '적의 기척이 느껴집니다. 어떻게 대응하시겠습니까?',
  allowSave: true,
  allowLoad: false,
  choices: [
    {
      id: 'prepare',
      label: '준비 - 함정을 설치한다',
      nextNodeId: 'p3_after_victory',
      effect: { addItem: 'trap_used' },
    },
    {
      id: 'rush',
      label: '돌격 - 기습 공격한다',
      nextNodeId: 'p3_after_victory',
      effect: { addItem: 'rushed' },
    },
    {
      id: 'hide',
      label: '은신 - 지켜본다',
      nextNodeId: 'p3_after_victory',
      effect: { addItem: 'observed' },
    },
  ],
};

// Phase 3: After Victory - Looting
const p3_after_victory: SceneNode = {
  id: 'p3_after_victory',
  type: 'explore',
  title: '승리 이후',
  description: '전투가 끝났습니다. 주변을 살펴보니 여러 물건들이 보입니다.',
  allowSave: true,
  allowLoad: false,
  choices: [
    {
      id: 'gold',
      label: '금화 주머니를 챙긴다',
      nextNodeId: 'p4_crossroads',
      effect: { addItem: 'gold' },
    },
    {
      id: 'map',
      label: '낡은 지도를 집는다',
      nextNodeId: 'p4_crossroads',
      effect: { addItem: 'map' },
    },
    {
      id: 'nothing',
      label: '아무것도 가져가지 않는다',
      nextNodeId: 'p4_crossroads',
    },
  ],
};

// Phase 4: Crossroads - Critical Decision
const p4_crossroads: SceneNode = {
  id: 'p4_crossroads',
  type: 'choice',
  title: '갈림길',
  description: '두 갈래 길이 나타났습니다. 한쪽에서는 빛이, 다른 쪽에서는 어둠이 느껴집니다.',
  allowSave: false,
  allowLoad: true, // Load is allowed here!
  choices: [
    {
      id: 'light',
      label: '빛의 길 - 안전하지만 평범한',
      nextNodeId: 'p6_result',
    },
    {
      id: 'dark',
      label: '어둠의 길 - 위험하지만 보상이 있는',
      nextNodeId: 'p5_treasure',
    },
  ],
};

// Phase 5: Treasure - Random Chance
const p5_treasure: SceneNode = {
  id: 'p5_treasure',
  type: 'chance',
  title: '보물의 방',
  description: '당신은 고대의 보물 상자를 발견했습니다. 열어보시겠습니까?',
  allowSave: false,
  allowLoad: false,
  chanceOutcomes: {
    success: {
      probability: 0.5,
      nextNodeId: 'p6_result',
      message: '찬란한 보물을 획득했습니다!',
    },
    failure: {
      probability: 0.5,
      nextNodeId: 'p6_result',
      message: '함정이었습니다... 하지만 살아남았습니다.',
    },
  },
  nextNodeId: 'p6_result',
};

// Phase 6: Result - Ending
const p6_result: SceneNode = {
  id: 'p6_result',
  type: 'ending',
  title: '여정의 끝',
  description: '당신의 선택들이 모여 하나의 이야기가 되었습니다.',
  allowSave: false,
  allowLoad: false,
};

// Export all nodes as a map
export const SCENE_NODES: Record<string, SceneNode> = {
  p1_beginning,
  p2_before_battle,
  p3_after_victory,
  p4_crossroads,
  p5_treasure,
  p6_result,
};

// Helper functions
export const getNode = (nodeId: string): SceneNode | undefined => {
  return SCENE_NODES[nodeId];
};

export const getNodeList = (): SceneNode[] => {
  return Object.values(SCENE_NODES);
};

export const isEndingNode = (nodeId: string): boolean => {
  const node = getNode(nodeId);
  return node?.type === 'ending';
};

export const canSaveAtNode = (nodeId: string): boolean => {
  const node = getNode(nodeId);
  return node?.allowSave ?? false;
};

export const canLoadAtNode = (nodeId: string): boolean => {
  const node = getNode(nodeId);
  return node?.allowLoad ?? false;
};

