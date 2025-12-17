'use client';

import { useCallback } from 'react';
import { useGameStore, useSaveLoadResources } from '@/lib/store/useGameStore';
import { canSaveAtNode, canLoadAtNode } from '@/lib/game/nodes';

export function useSaveLoad() {
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const currentNodeId = useGameStore((state) => state.currentNodeId);
  const { saveRemaining, loadRemaining, hasSavedSnapshot } = useSaveLoadResources();

  // Check if save is allowed at current node
  const canSave = canSaveAtNode(currentNodeId) && saveRemaining > 0;
  
  // Check if load is allowed at current node
  const canLoad = canLoadAtNode(currentNodeId) && loadRemaining > 0 && hasSavedSnapshot;

  const handleSave = useCallback(() => {
    if (!canSave) return false;
    return saveGame();
  }, [canSave, saveGame]);

  const handleLoad = useCallback(() => {
    if (!canLoad) return false;
    return loadGame();
  }, [canLoad, loadGame]);

  return {
    canSave,
    canLoad,
    saveRemaining,
    loadRemaining,
    hasSavedSnapshot,
    handleSave,
    handleLoad,
  };
}

