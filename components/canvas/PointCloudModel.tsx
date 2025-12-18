"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NodeType } from "@/lib/game/nodes";

interface PointCloudModelProps {
  nodeId: string;
  nodeType: NodeType;
  pointCloudPath?: string;
}

// Color palette for different node types
const NODE_COLORS: Record<NodeType, string> = {
  choice: "#d2bab0", // Warm accent
  explore: "#7eb87e", // Green for exploration
  chance: "#e6b84d", // Gold for treasure/chance
  ending: "#7eb8d4", // Blue for ending
};

// Placeholder shapes for each phase
const PHASE_SHAPES: Record<
  string,
  "sphere" | "cube" | "torus" | "cone" | "diamond"
> = {
  p1_beginning: "sphere",
  p2_before_battle: "cube",
  p3_after_victory: "torus",
  p4_crossroads: "diamond",
  p5_treasure: "cone",
  p6_result: "sphere",
};

export default function PointCloudModel({
  nodeId,
  nodeType,
  pointCloudPath,
}: PointCloudModelProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // If we have a real point cloud path, load it (future implementation)
  // For now, use placeholder geometry

  const shape = PHASE_SHAPES[nodeId] || "sphere";
  const color = NODE_COLORS[nodeType];

  const { positions, colors } = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Generate position based on shape
      let x, y, z;

      switch (shape) {
        case "sphere": {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 1.5 * Math.cbrt(Math.random());
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
          break;
        }
        case "cube": {
          x = (Math.random() - 0.5) * 2.5;
          y = (Math.random() - 0.5) * 2.5;
          z = (Math.random() - 0.5) * 2.5;
          break;
        }
        case "torus": {
          const u = Math.random() * Math.PI * 2;
          const v = Math.random() * Math.PI * 2;
          const R = 1.2;
          const r = 0.5;
          x = (R + r * Math.cos(v)) * Math.cos(u);
          y = (R + r * Math.cos(v)) * Math.sin(u);
          z = r * Math.sin(v);
          break;
        }
        case "cone": {
          const h = Math.random() * 2;
          const angle = Math.random() * Math.PI * 2;
          const radius = (2 - h) * 0.6;
          x = Math.cos(angle) * radius;
          y = h - 1;
          z = Math.sin(angle) * radius;
          break;
        }
        case "diamond": {
          const t = Math.random() * 2 - 1;
          const angle = Math.random() * Math.PI * 2;
          const radius = (1 - Math.abs(t)) * 1.5;
          x = Math.cos(angle) * radius;
          y = t * 1.5;
          z = Math.sin(angle) * radius;
          break;
        }
        default: {
          x = (Math.random() - 0.5) * 3;
          y = (Math.random() - 0.5) * 3;
          z = (Math.random() - 0.5) * 3;
        }
      }

      // Add some noise for that "memory-like" effect
      const noise = 0.1;
      pos[i * 3] = x + (Math.random() - 0.5) * noise;
      pos[i * 3 + 1] = y + (Math.random() - 0.5) * noise;
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * noise;

      // Color variation
      const colorVariation = 0.2;
      col[i * 3] = baseColor.r + (Math.random() - 0.5) * colorVariation;
      col[i * 3 + 1] = baseColor.g + (Math.random() - 0.5) * colorVariation;
      col[i * 3 + 2] = baseColor.b + (Math.random() - 0.5) * colorVariation;
    }

    return { positions: pos, colors: col };
  }, [shape, color]);

  // Gentle rotation animation
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1;

      // Subtle floating motion
      pointsRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
