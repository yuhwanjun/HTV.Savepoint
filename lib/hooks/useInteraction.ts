"use client";

import { useCallback } from "react";
import { useGameStore } from "@/lib/store/useGameStore";
import {
  getNode,
  Choice,
  getChoiceNextNode,
  getChoiceEffect,
  getChanceOutcomes,
} from "@/lib/game/nodes";

export function useInteraction() {
  const goToNode = useGameStore((state) => state.goToNode);
  const addToInventory = useGameStore((state) => state.addToInventory);
  const removeFromInventory = useGameStore(
    (state) => state.removeFromInventory
  );
  const updateInteraction = useGameStore((state) => state.updateInteraction);
  const currentNodeId = useGameStore((state) => state.currentNodeId);

  // 로드 상태 추적
  const isInLoadedState = useGameStore((state) => state.isInLoadedState);

  const handleChoice = useCallback(
    (choice: Choice) => {
      // Update interaction timestamp
      updateInteraction();

      // 로드 상태에 따라 다른 효과 적용
      const effect = getChoiceEffect(choice, isInLoadedState);
      if (effect) {
        if (effect.addItem) {
          addToInventory(effect.addItem);
        }
        if (effect.removeItem) {
          removeFromInventory(effect.removeItem);
        }
      }

      // 로드 상태에 따라 다른 노드로 이동
      const nextNodeId = getChoiceNextNode(choice, isInLoadedState);
      goToNode(nextNodeId);
    },
    [
      goToNode,
      addToInventory,
      removeFromInventory,
      updateInteraction,
      isInLoadedState,
    ]
  );

  const handleChance = useCallback(() => {
    updateInteraction();

    const node = getNode(currentNodeId);
    if (!node) return;

    // 로드 상태에 따라 다른 확률 결과 사용
    const outcomes = getChanceOutcomes(node, isInLoadedState);
    if (!outcomes) return;

    const { success, failure } = outcomes;
    const roll = Math.random();

    if (roll < success.probability) {
      // Success!
      if (node.nextNodeId) {
        goToNode(node.nextNodeId);
      }
      return { outcome: "success", message: success.message };
    } else {
      // Failure
      if (node.nextNodeId) {
        goToNode(node.nextNodeId);
      }
      return { outcome: "failure", message: failure.message };
    }
  }, [currentNodeId, goToNode, updateInteraction, isInLoadedState]);

  const handleExplore = useCallback(
    (nextNodeId: string) => {
      updateInteraction();
      goToNode(nextNodeId);
    },
    [goToNode, updateInteraction]
  );

  return {
    handleChoice,
    handleChance,
    handleExplore,
    isInLoadedState, // 로드 상태 노출
  };
}
