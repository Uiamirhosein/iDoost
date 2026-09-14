import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Zap, Sparkles } from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';

interface FloatingXpFlyerProps {
  amount: number;
  startX?: number;
  startY?: number;
  onComplete: () => void;
}

export const FloatingXpFlyer: React.FC<FloatingXpFlyerProps> = ({
  amount,
  startX,
  startY,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!badgeRef.current || !containerRef.current) return;

    // Target coordinates: Top header area (e.g., top 40px, middle or top-left)
    const targetX = window.innerWidth / 2;
    const targetY = 32;

    const initialX = startX ?? window.innerWidth / 2;
    const initialY = startY ?? window.innerHeight / 2;

    // Set initial position
    gsap.set(badgeRef.current, {
      x: initialX,
      y: initialY,
      xPercent: -50,
      yPercent: -50,
      scale: 0.2,
      opacity: 0,
      rotation: -10,
    });

    const tl = gsap.timeline({
      onComplete,
    });

    // Step 1: Pop in with anticipation and elastic bounce
    tl.to(badgeRef.current, {
      scale: 1.25,
      opacity: 1,
      rotation: 0,
      duration: 0.35,
      ease: 'back.out(2)',
    })
      // Step 2: Brief pause / glow pulse
      .to(
        glowRef.current,
        {
          scale: 1.8,
          opacity: 0.8,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
        },
        '-=0.15'
      )
      // Step 3: Fly up toward the top header bar with arc motion
      .to(badgeRef.current, {
        x: targetX,
        y: targetY,
        scale: 0.45,
        opacity: 0.15,
        duration: 0.65,
        ease: 'power3.in',
      })
      .to(badgeRef.current, {
        opacity: 0,
        duration: 0.1,
      });

    return () => {
      tl.kill();
    };
  }, [amount, startX, startY, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
    >
      <div
        ref={badgeRef}
        className="fixed flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 border border-amber-300 text-white font-black text-sm shadow-[0_0_35px_rgba(245,158,11,0.65)] select-none will-change-transform"
      >
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-2xl bg-amber-400/40 blur-md pointer-events-none"
        />
        <Zap className="w-4 h-4 text-amber-200 fill-amber-300 relative z-10 animate-pulse" />
        <span className="relative z-10 tracking-wider">
          +{persianNumber(amount)} XP
        </span>
        <Sparkles className="w-3.5 h-3.5 text-yellow-200 relative z-10" />
      </div>
    </div>
  );
};
