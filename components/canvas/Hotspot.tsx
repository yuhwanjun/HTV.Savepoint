'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HotspotProps {
  position: [number, number, number];
  onClick: () => void;
  label?: string;
  size?: number;
  color?: string;
}

export default function Hotspot({
  position,
  onClick,
  size = 0.5,
  color = '#d2bab0',
}: HotspotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Animation state
  useFrame((state) => {
    if (meshRef.current) {
      // Hover scale animation
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      
      // Pulse animation
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      if (hovered) {
        meshRef.current.scale.multiplyScalar(pulse);
      }
      
      // Click feedback
      if (clicked) {
        meshRef.current.scale.multiplyScalar(0.9);
      }
    }
  });

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 150);
    onClick();
  };

  return (
    <group position={position}>
      {/* Invisible click area */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer ring indicator */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.4, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow particles */}
      <HotspotParticles color={color} size={size} active={hovered} />
    </group>
  );
}

// Particle effect for hotspot
function HotspotParticles({ color, size, active }: { color: string; size: number; active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 50;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = size * 0.8;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <points ref={pointsRef}>
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
        color={color}
        transparent
        opacity={active ? 0.8 : 0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

