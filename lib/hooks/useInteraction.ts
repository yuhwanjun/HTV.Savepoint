'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/lib/store/useGameStore';
import { getNode, Choice } from '@/lib/game/nodes';

export function useInteraction() {
  const goToNode = useGameStore((state) => state.goToNode);
  const addToInventory = useGameStore((state) => state.addToInventory);
  const removeFromInventory = useGameStore((state) => state.removeFromInventory);
  const updateInteraction = useGameStore((state) => state.updateInteraction);
  const currentNodeId = useGameStore((state) => state.currentNodeId);

  const handleChoice = useCallback((choice: Choice) => {
    // Update interaction timestamp
    updateInteraction();

    // Apply effects
    if (choice.effect) {
      if (choice.effect.addItem) {
        addToInventory(choice.effect.addItem);
      }
      if (choice.effect.removeItem) {
        removeFromInventory(choice.effect.removeItem);
      }
    }

    // Navigate to next node
    goToNode(choice.nextNodeId);
  }, [goToNode, addToInventory, removeFromInventory, updateInteraction]);

  const handleChance = useCallback(() => {
    updateInteraction();
    
    const node = getNode(currentNodeId);
    if (!node?.chanceOutcomes) return;

    const { success, failure } = node.chanceOutcomes;
    const roll = Math.random();
    
    if (roll < success.probability) {
      // Success!
      if (node.nextNodeId) {
        goToNode(node.nextNodeId);
      }
      return { outcome: 'success', message: success.message };
    } else {
      // Failure
      if (node.nextNodeId) {
        goToNode(node.nextNodeId);
      }
      return { outcome: 'failure', message: failure.message };
    }
  }, [currentNodeId, goToNode, updateInteraction]);

  const handleExplore = useCallback((nextNodeId: string) => {
    updateInteraction();
    goToNode(nextNodeId);
  }, [goToNode, updateInteraction]);

  return {
    handleChoice,
    handleChance,
    handleExplore,
  };
}

