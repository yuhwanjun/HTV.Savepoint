"use client";

import { useCallback } from "react";
import {
  useGameStore,
  useSaveLoadResources,
  usePhaseState,
} from "@/lib/store/useGameStore";
import { canSaveAtNode, canLoadAtNode } from "@/lib/game/nodes";

export function useSaveLoad() {
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const currentNodeId = useGameStore((state) => state.currentNodeId);
  const { saveRemaining, loadRemaining, savedSnapshots } =
    useSaveLoadResources();
  const { currentPhaseStep } = usePhaseState();

  // Check if save is allowed at current node
  // choice 단계에서는 항상 저장 가능
  const canSave =
    (currentPhaseStep === "choice" || canSaveAtNode(currentNodeId)) &&
    saveRemaining > 0;

  // Check if load is allowed at current node
  // choice 단계에서는 항상 로드 가능
  const canLoad =
    (currentPhaseStep === "choice" || canLoadAtNode(currentNodeId)) &&
    loadRemaining > 0 &&
    savedSnapshots.length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return false;
    return saveGame();
  }, [canSave, saveGame]);

  const handleLoad = useCallback(
    (snapshotId: string) => {
      if (!canLoad) return false;
      return loadGame(snapshotId);
    },
    [canLoad, loadGame]
  );

  return {
    canSave,
    canLoad,
    saveRemaining,
    loadRemaining,
    savedSnapshots,
    handleSave,
    handleLoad,
  };
}
