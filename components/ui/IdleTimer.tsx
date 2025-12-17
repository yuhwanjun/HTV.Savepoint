'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/useGameStore';

interface IdleTimerProps {
  timeoutSeconds?: number;
  warningSeconds?: number;
}

export default function IdleTimer({ 
  timeoutSeconds = 60, 
  warningSeconds = 10 
}: IdleTimerProps) {
  const router = useRouter();
  const resetGame = useGameStore((state) => state.resetGame);
  const updateInteraction = useGameStore((state) => state.updateInteraction);
  const lastInteraction = useGameStore((state) => state.lastInteraction);
  
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setShowWarning(false);
    setCountdown(warningSeconds);
    
    // Set warning timer
    timerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(warningSeconds);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Reset game and redirect
            if (countdownRef.current) clearInterval(countdownRef.current);
            resetGame();
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, (timeoutSeconds - warningSeconds) * 1000);
  }, [timeoutSeconds, warningSeconds, resetGame, router]);

  // Handle user interactions
  useEffect(() => {
    const handleInteraction = () => {
      updateInteraction();
      resetTimer();
    };

    // Listen for various interaction events
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    // Initial timer start
    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer, updateInteraction]);

  // Dismiss warning on any interaction
  const handleDismiss = () => {
    updateInteraction();
    resetTimer();
  };

  if (!showWarning) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={handleDismiss}
    >
      <div className="panel-angular p-8 text-center animate-slide-up">
        <h3 className="text-display text-xl text-[var(--color-text-primary)] mb-4">
          아직 계신가요?
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {countdown}초 후 초기 화면으로 돌아갑니다
        </p>
        <div className="w-full h-1 bg-[var(--color-bg-tertiary)] overflow-hidden">
          <div 
            className="h-full bg-[var(--color-accent)] transition-all duration-1000"
            style={{ width: `${(countdown / warningSeconds) * 100}%` }}
          />
        </div>
        <button
          onClick={handleDismiss}
          className="btn-angular mt-6"
        >
          계속하기
        </button>
      </div>
    </div>
  );
}

