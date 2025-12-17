'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store/useGameStore';

export default function IntroPage() {
  const router = useRouter();
  const startGame = useGameStore((state) => state.startGame);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStart = () => {
    setIsAnimating(true);
    startGame();
    setTimeout(() => {
      router.push('/play');
    }, 500);
  };

  // Particle animation for intro
  useEffect(() => {
    // Add entry animation class
    document.body.classList.add('intro-active');
    return () => {
      document.body.classList.remove('intro-active');
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]" />

      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--color-accent)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.3,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div 
        className={`relative z-10 text-center px-8 ${isAnimating ? 'animate-fade-out' : 'animate-fade-in'}`}
      >
        {/* Title */}
        <h1 className="text-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4 tracking-widest">
          SAVE POINT
        </h1>

        {/* Subtitle */}
        <p className="text-[var(--color-text-secondary)] text-sm md:text-base mb-2 tracking-wider">
          Interactive Point Cloud Experience
        </p>

        {/* Decorative line */}
        <div className="w-24 h-px bg-[var(--color-border)] mx-auto my-8" />

        {/* Description */}
        <p className="text-[var(--color-text-muted)] text-xs md:text-sm max-w-xs mx-auto mb-12 leading-relaxed">
          당신의 선택이 기억이 됩니다.
          <br />
          세이브와 로드, 그 순간들이 당신을 정의합니다.
        </p>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isAnimating}
          className="btn-angular text-lg px-8 py-4"
        >
          시작하기
        </button>

        {/* Instructions */}
        <div className="mt-12 space-y-2">
          <p className="text-[var(--color-text-muted)] text-xs tracking-wider">
            SAVE × 2 | LOAD × 1
          </p>
          <p className="text-[var(--color-text-muted)] text-xs opacity-60">
            신중하게 사용하세요
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[var(--color-border)] opacity-50" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-[var(--color-border)] opacity-50" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-[var(--color-border)] opacity-50" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[var(--color-border)] opacity-50" />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        .animate-fade-out {
          animation: fadeOut 0.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}

