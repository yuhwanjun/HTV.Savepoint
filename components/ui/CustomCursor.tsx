'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        !!target.closest('button') ||
        !!target.closest('a') ||
        target.style.cursor === 'pointer' ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer ring */}
        <div
          className="absolute rounded-full border-2 border-[var(--color-accent)] transition-all duration-150"
          style={{
            width: isPointer ? 48 : 32,
            height: isPointer ? 48 : 32,
            transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
            opacity: 0.8,
          }}
        />
        
        {/* Inner dot */}
        <div
          className="absolute rounded-full bg-[var(--color-text-primary)] transition-all duration-100"
          style={{
            width: isClicking ? 12 : 8,
            height: isClicking ? 12 : 8,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Pointer indicator */}
        {isPointer && (
          <div
            className="absolute w-3 h-3 border-r-2 border-b-2 border-[var(--color-accent)]"
            style={{
              transform: 'translate(8px, 8px) rotate(-45deg)',
            }}
          />
        )}
      </div>
    </>
  );
}

