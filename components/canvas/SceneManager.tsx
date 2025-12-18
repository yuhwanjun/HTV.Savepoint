"use client";

import { useCurrentNode } from "@/lib/store/useGameStore";
import { getNode } from "@/lib/game/nodes";
import PointCloudModel from "./PointCloudModel";
import CameraController from "./CameraController";

// Camera positions for each phase
const CAMERA_CONFIGS: Record<
  string,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  p1_beginning: { position: [0, 0, 6], target: [0, 0, 0] },
  p2_before_battle: { position: [2, 1, 5], target: [0, 0, 0] },
  p3_after_victory: { position: [-1, 0.5, 4], target: [0, 0, 0] },
  p4_crossroads: { position: [0, 2, 5], target: [0, 0, 0] },
  p5_treasure: { position: [0, -1, 4], target: [0, 0.5, 0] },
  p6_result: { position: [0, 0, 8], target: [0, 0, 0] },
};

export default function SceneManager() {
  const currentNodeId = useCurrentNode();
  const node = getNode(currentNodeId);

  const cameraConfig =
    CAMERA_CONFIGS[currentNodeId] || CAMERA_CONFIGS.p1_beginning;

  if (!node) {
    return null;
  }

  return (
    <>
      {/* Camera with smooth transitions */}
      <CameraController
        targetPosition={cameraConfig.position}
        targetLookAt={cameraConfig.target}
      />

      {/* Point Cloud or Placeholder based on node */}
      <PointCloudModel nodeId={currentNodeId} nodeType={node.type} />

      {/* Background particles for atmosphere */}
      <BackgroundParticles />
    </>
  );
}

// Atmospheric background particles
function BackgroundParticles() {
  const count = 200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#6d5549"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}
