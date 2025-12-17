'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, ReactNode } from 'react';

interface SceneContainerProps {
  children: ReactNode;
}

export default function SceneContainer({ children }: SceneContainerProps) {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.4} />
          
          {/* Main directional light */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            color="#fdf8f6"
          />
          
          {/* Accent point light */}
          <pointLight
            position={[-3, 2, 4]}
            intensity={0.5}
            color="#d2bab0"
          />

          {/* Scene content */}
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}

