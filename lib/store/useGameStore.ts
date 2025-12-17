import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// Types
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

export interface Snapshot {
  nodeId: string;
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
  
  // Save/Load Resources
  saveRemaining: number;
  loadRemaining: number;
  savedSnapshot: Snapshot | null;
  
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
  loadGame: () => boolean;
  
  // Camera
  setCamera: (camera: CameraState) => void;
  
  // Interaction
  updateInteraction: () => void;
}

const generateRunId = () => `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const initialState: GameState = {
  runId: '',
  isPlaying: false,
  currentNodeId: 'p1_beginning',
  inventory: [],
  history: [],
  saveRemaining: 2,
  loadRemaining: 1,
  savedSnapshot: null,
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
          currentNodeId: 'p1_beginning',
          inventory: [],
          history: ['p1_beginning'],
          saveRemaining: 2,
          loadRemaining: 1,
          savedSnapshot: null,
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
        const { saveRemaining, currentNodeId, camera, inventory, history } = get();
        
        if (saveRemaining <= 0) {
          return false;
        }

        const snapshot: Snapshot = {
          nodeId: currentNodeId,
          camera: { ...camera },
          inventory: [...inventory],
          history: [...history],
          timestamp: Date.now(),
        };

        set({
          savedSnapshot: snapshot,
          saveRemaining: saveRemaining - 1,
          lastInteraction: Date.now(),
        });

        return true;
      },

      loadGame: () => {
        const { loadRemaining, savedSnapshot } = get();
        
        if (loadRemaining <= 0 || !savedSnapshot) {
          return false;
        }

        set({
          currentNodeId: savedSnapshot.nodeId,
          camera: { ...savedSnapshot.camera },
          inventory: [...savedSnapshot.inventory],
          history: [...savedSnapshot.history, `[LOADED:${savedSnapshot.nodeId}]`],
          loadRemaining: loadRemaining - 1,
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
    }),
    {
      name: 'save-point-game',
      partialize: (state) => ({
        runId: state.runId,
        isPlaying: state.isPlaying,
        currentNodeId: state.currentNodeId,
        inventory: state.inventory,
        history: state.history,
        saveRemaining: state.saveRemaining,
        loadRemaining: state.loadRemaining,
        savedSnapshot: state.savedSnapshot,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentNode = () => useGameStore((state) => state.currentNodeId);
export const useInventory = () => useGameStore((state) => state.inventory);
export const useSaveLoadResources = () => useGameStore(
  useShallow((state) => ({
    saveRemaining: state.saveRemaining,
    loadRemaining: state.loadRemaining,
    hasSavedSnapshot: state.savedSnapshot !== null,
  }))
);
export const useIsPlaying = () => useGameStore((state) => state.isPlaying);

