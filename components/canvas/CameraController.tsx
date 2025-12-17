'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  lerpSpeed?: number;
}

export default function CameraController({
  targetPosition,
  targetLookAt,
  lerpSpeed = 2,
}: CameraControllerProps) {
  const { camera } = useThree();
  const targetPosVec = useRef(new THREE.Vector3(...targetPosition));
  const targetLookAtVec = useRef(new THREE.Vector3(...targetLookAt));
  const currentLookAt = useRef(new THREE.Vector3(...targetLookAt));

  // Update targets when props change
  useEffect(() => {
    targetPosVec.current.set(...targetPosition);
    targetLookAtVec.current.set(...targetLookAt);
  }, [targetPosition, targetLookAt]);

  // Smooth interpolation each frame
  useFrame((_, delta) => {
    // Lerp camera position
    camera.position.lerp(targetPosVec.current, 1 - Math.exp(-lerpSpeed * delta));
    
    // Lerp look-at target
    currentLookAt.current.lerp(targetLookAtVec.current, 1 - Math.exp(-lerpSpeed * delta));
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

