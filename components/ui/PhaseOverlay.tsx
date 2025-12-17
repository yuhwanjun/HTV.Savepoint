'use client';

import { useState, useEffect } from 'react';
import { useCurrentNode } from '@/lib/store/useGameStore';
import { getNode, Choice, isEndingNode } from '@/lib/game/nodes';
import { useInteraction } from '@/lib/hooks/useInteraction';

export default function PhaseOverlay() {
  const currentNodeId = useCurrentNode();
  const node = getNode(currentNodeId);
  const { handleChoice, handleChance } = useInteraction();
  
  const [chanceResult, setChanceResult] = useState<{ outcome: string; message: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset animation state when node changes
  useEffect(() => {
    setIsAnimating(true);
    setChanceResult(null);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentNodeId]);

  if (!node || isEndingNode(currentNodeId)) {
    return null;
  }

  const onChoiceSelect = (choice: Choice) => {
    handleChoice(choice);
  };

  const onChanceRoll = () => {
    const result = handleChance();
    if (result) {
      setChanceResult(result);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
      {/* Phase Info Panel */}
      <div 
        className={`panel-angular mx-6 mb-24 p-6 pointer-events-auto ${isAnimating ? 'animate-slide-up opacity-0' : 'opacity-100'}`}
        style={{ animationFillMode: 'forwards' }}
      >
        {/* Title */}
        <h2 className="text-display text-xl font-bold text-[var(--color-text-primary)] mb-2">
          {node.title}
        </h2>

        {/* Description */}
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6">
          {node.description}
        </p>

        {/* Choices / Actions */}
        {node.type === 'choice' || node.type === 'explore' ? (
          <div className="space-y-3">
            {node.choices?.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => onChoiceSelect(choice)}
                className={`w-full btn-angular text-left delay-${(index + 1) * 100}`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                {choice.label}
              </button>
            ))}
          </div>
        ) : node.type === 'chance' ? (
          <div className="space-y-4">
            {chanceResult ? (
              <div 
                className={`p-4 border ${
                  chanceResult.outcome === 'success' 
                    ? 'border-green-600 bg-green-900/20' 
                    : 'border-red-600 bg-red-900/20'
                }`}
              >
                <p className="text-[var(--color-text-primary)]">{chanceResult.message}</p>
              </div>
            ) : (
              <button
                onClick={onChanceRoll}
                className="w-full btn-angular"
              >
                상자 열기
              </button>
            )}
            
            {chanceResult && node.nextNodeId && (
              <button
                onClick={() => handleChoice({ id: 'continue', label: '계속', nextNodeId: node.nextNodeId! })}
                className="w-full btn-angular"
              >
                계속 진행
              </button>
            )}
          </div>
        ) : null}

        {/* Save/Load Indicator */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
          <span className={`text-xs uppercase tracking-wider ${node.allowSave ? 'text-green-500' : 'text-[var(--color-text-muted)]'}`}>
            {node.allowSave ? '● SAVE 가능' : '○ SAVE 불가'}
          </span>
          <span className={`text-xs uppercase tracking-wider ${node.allowLoad ? 'text-blue-400' : 'text-[var(--color-text-muted)]'}`}>
            {node.allowLoad ? '● LOAD 가능' : '○ LOAD 불가'}
          </span>
        </div>
      </div>
    </div>
  );
}

