"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGameStore,
  useIsPlaying,
  useCurrentNode,
} from "@/lib/store/useGameStore";
import { isEndingNode } from "@/lib/game/nodes";
import HUD from "@/components/ui/HUD";
import PhaseOverlay from "@/components/ui/PhaseOverlay";
import IdleTimer from "@/components/ui/IdleTimer";

// Dynamic import for Three.js components (client-side only)
const SceneContainer = dynamic(
  () => import("@/components/canvas/SceneContainer"),
  { ssr: false }
);

const SceneManager = dynamic(() => import("@/components/canvas/SceneManager"), {
  ssr: false,
});

export default function PlayPage() {
  const router = useRouter();
  const isPlaying = useIsPlaying();
  const currentNodeId = useCurrentNode();
  const startGame = useGameStore((state) => state.startGame);

  // Redirect to intro if not playing
  useEffect(() => {
    if (!isPlaying) {
      // Try to start game if accessed directly
      const stored = localStorage.getItem("save-point-game");
      if (!stored) {
        router.push("/");
      }
    }
  }, [isPlaying, router]);

  // Redirect to result when reaching ending node
  useEffect(() => {
    if (isEndingNode(currentNodeId)) {
      router.push("/result");
    }
  }, [currentNodeId, router]);

  // Handle direct access without game state
  if (!isPlaying) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)] mb-4">
            게임을 시작해주세요
          </p>
          <button
            onClick={() => {
              startGame();
            }}
            className="btn-angular"
          >
            게임 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas Layer */}
      <SceneContainer>
        <SceneManager />
      </SceneContainer>

      {/* UI Layer */}
      <div className="ui-layer">
        {/* Phase Overlay (choices, descriptions) */}
        <PhaseOverlay />

        {/* HUD (save/load buttons, inventory) */}
        <HUD />
      </div>

      {/* Idle Timer */}
      <IdleTimer timeoutSeconds={60} warningSeconds={10} />
    </div>
  );
}
