import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { getNode } from "@/lib/game/nodes";
import { WeaponType, PhaseStep } from "@/lib/game/phases";

// Types
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

export interface Snapshot {
  id: string;
  nodeId: string;
  nodeTitle: string;
  camera: CameraState;
  inventory: string[];
  history: string[];
  timestamp: number;
}

export interface GameState {
  // Session
  runId: string;
  isPlaying: boolean;

  // Game Progress
  currentNodeId: string;
  inventory: string[];
  history: string[];

  // Save/Load Resources (세션당 각각 1회)
  saveRemaining: number;
  loadRemaining: number;
  savedSnapshots: Snapshot[];

  // Load State Tracking (로드 상태 추적)
  hasLoaded: boolean; // 현재 세션에서 로드가 실행되었는지
  loadedAtNodeId: string | null; // 로드가 실행된 페이즈 ID
  isInLoadedState: boolean; // 현재 로드된 상태에서 플레이 중인지

  // Phase System (페이즈 진행 상태)
  currentPhaseStep: PhaseStep; // 현재 페이즈 단계 (intro/choice/result)
  dialogueIndex: number; // 현재 대화 인덱스
  selectedWeapon: WeaponType | null; // 선택한 무기
  goodChoice: WeaponType | null; // "좋은 선택"으로 설정된 무기 (로드 후 보상용)

  // Camera (to be synced with Three.js)
  camera: CameraState;

  // Last interaction timestamp (for idle detection)
  lastInteraction: number;
}

export interface GameActions {
  // Game Control
  startGame: () => void;
  resetGame: () => void;

  // Navigation
  goToNode: (nodeId: string) => void;

  // Inventory
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;

  // Save/Load
  saveGame: () => boolean;
  loadGame: (snapshotId: string) => boolean;

  // Camera
  setCamera: (camera: CameraState) => void;

  // Interaction
  updateInteraction: () => void;

  // Phase System
  setPhaseStep: (step: PhaseStep) => void;
  nextDialogue: () => void;
  setDialogueIndex: (index: number) => void;
  selectWeapon: (weapon: WeaponType) => void;
  setGoodChoice: (weapon: WeaponType) => void;
}

const generateRunId = () =>
  `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const generateSnapshotId = () =>
  `save_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const initialState: GameState = {
  runId: "",
  isPlaying: false,
  currentNodeId: "phase_1",
  inventory: [],
  history: [],
  saveRemaining: 1, // 세션당 1회
  loadRemaining: 1, // 세션당 1회
  savedSnapshots: [],
  hasLoaded: false,
  loadedAtNodeId: null,
  isInLoadedState: false,
  // Phase System
  currentPhaseStep: "intro",
  dialogueIndex: 0,
  selectedWeapon: null,
  goodChoice: null,
  camera: {
    position: [0, 0, 5],
    target: [0, 0, 0],
  },
  lastInteraction: Date.now(),
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startGame: () => {
        set({
          runId: generateRunId(),
          isPlaying: true,
          currentNodeId: "phase_1",
          inventory: [],
          history: ["phase_1"],
          saveRemaining: 1, // 세션당 1회
          loadRemaining: 1, // 세션당 1회
          savedSnapshots: [],
          hasLoaded: false,
          loadedAtNodeId: null,
          isInLoadedState: false,
          // Phase System 초기화
          currentPhaseStep: "intro",
          dialogueIndex: 0,
          selectedWeapon: null,
          // goodChoice는 유지 (로드 후에도 같은 값 사용)
          camera: {
            position: [0, 0, 5],
            target: [0, 0, 0],
          },
          lastInteraction: Date.now(),
        });
      },

      resetGame: () => {
        set({
          ...initialState,
          lastInteraction: Date.now(),
        });
      },

      goToNode: (nodeId: string) => {
        const { history } = get();
        set({
          currentNodeId: nodeId,
          history: [...history, nodeId],
          lastInteraction: Date.now(),
          // 새로운 페이즈로 이동 시 상태 초기화
          currentPhaseStep: "intro",
          dialogueIndex: 0,
          selectedWeapon: null,
        });
      },

      addToInventory: (item: string) => {
        const { inventory } = get();
        if (!inventory.includes(item)) {
          set({
            inventory: [...inventory, item],
            lastInteraction: Date.now(),
          });
        }
      },

      removeFromInventory: (item: string) => {
        const { inventory } = get();
        set({
          inventory: inventory.filter((i) => i !== item),
          lastInteraction: Date.now(),
        });
      },

      saveGame: () => {
        const {
          saveRemaining,
          currentNodeId,
          camera,
          inventory,
          history,
          savedSnapshots,
        } = get();

        if (saveRemaining <= 0) {
          return false;
        }

        const node = getNode(currentNodeId);
        const snapshot: Snapshot = {
          id: generateSnapshotId(),
          nodeId: currentNodeId,
          nodeTitle: node?.title || currentNodeId,
          camera: { ...camera },
          inventory: [...inventory],
          history: [...history],
          timestamp: Date.now(),
        };

        set({
          savedSnapshots: [...savedSnapshots, snapshot],
          saveRemaining: saveRemaining - 1,
          lastInteraction: Date.now(),
        });

        return true;
      },

      loadGame: (snapshotId: string) => {
        const { loadRemaining, savedSnapshots } = get();

        if (loadRemaining <= 0) {
          return false;
        }

        const snapshot = savedSnapshots.find((s) => s.id === snapshotId);
        if (!snapshot) {
          return false;
        }

        set({
          currentNodeId: snapshot.nodeId,
          camera: { ...snapshot.camera },
          inventory: [...snapshot.inventory],
          history: [...snapshot.history, `[LOADED:${snapshot.nodeId}]`],
          loadRemaining: loadRemaining - 1,
          // 로드 상태 추적
          hasLoaded: true,
          loadedAtNodeId: snapshot.nodeId,
          isInLoadedState: true,
          lastInteraction: Date.now(),
        });

        return true;
      },

      setCamera: (camera: CameraState) => {
        set({ camera });
      },

      updateInteraction: () => {
        set({ lastInteraction: Date.now() });
      },

      // Phase System Actions
      setPhaseStep: (step: PhaseStep) => {
        set({
          currentPhaseStep: step,
          dialogueIndex: 0,
          lastInteraction: Date.now(),
        });
      },

      nextDialogue: () => {
        const { dialogueIndex } = get();
        set({
          dialogueIndex: dialogueIndex + 1,
          lastInteraction: Date.now(),
        });
      },

      setDialogueIndex: (index: number) => {
        set({
          dialogueIndex: index,
          lastInteraction: Date.now(),
        });
      },

      selectWeapon: (weapon: WeaponType) => {
        set({
          selectedWeapon: weapon,
          lastInteraction: Date.now(),
        });
      },

      setGoodChoice: (weapon: WeaponType) => {
        set({
          goodChoice: weapon,
          lastInteraction: Date.now(),
        });
      },
    }),
    {
      name: "save-point-game",
      partialize: (state) => ({
        runId: state.runId,
        isPlaying: state.isPlaying,
        currentNodeId: state.currentNodeId,
        inventory: state.inventory,
        history: state.history,
        saveRemaining: state.saveRemaining,
        loadRemaining: state.loadRemaining,
        savedSnapshots: state.savedSnapshots,
        hasLoaded: state.hasLoaded,
        loadedAtNodeId: state.loadedAtNodeId,
        isInLoadedState: state.isInLoadedState,
        // Phase System
        currentPhaseStep: state.currentPhaseStep,
        dialogueIndex: state.dialogueIndex,
        selectedWeapon: state.selectedWeapon,
        goodChoice: state.goodChoice,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentNode = () =>
  useGameStore((state) => state.currentNodeId);
export const useInventory = () => useGameStore((state) => state.inventory);
export const useSaveLoadResources = () =>
  useGameStore(
    useShallow((state) => ({
      saveRemaining: state.saveRemaining,
      loadRemaining: state.loadRemaining,
      savedSnapshots: state.savedSnapshots,
    }))
  );
export const useIsPlaying = () => useGameStore((state) => state.isPlaying);

// Load state hooks (로드 상태 추적)
export const useLoadState = () =>
  useGameStore(
    useShallow((state) => ({
      hasLoaded: state.hasLoaded,
      loadedAtNodeId: state.loadedAtNodeId,
      isInLoadedState: state.isInLoadedState,
    }))
  );

// Phase system hooks
export const usePhaseState = () =>
  useGameStore(
    useShallow((state) => ({
      currentPhaseStep: state.currentPhaseStep,
      dialogueIndex: state.dialogueIndex,
      selectedWeapon: state.selectedWeapon,
      goodChoice: state.goodChoice,
    }))
  );
