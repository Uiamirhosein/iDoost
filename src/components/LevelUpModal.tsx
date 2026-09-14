import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import {
  Trophy,
  Sparkles,
  Zap,
  SlidersHorizontal,
  Users,
  Send,
  CheckCircle2,
  X,
  Flame,
} from 'lucide-react';
import { LevelConfig, LEVELS_CONFIG } from '../utils/gamification';
import { persianNumber } from '../utils/persianNumbers';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: LevelConfig;
  onClose: () => void;
  onTryFeature: (perkKey: string) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  onClose,
  onTryFeature,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger GSAP Celebration Burst Animation
    if (particlesContainerRef.current) {
      // Clear previous particles
      particlesContainerRef.current.innerHTML = '';
      const particleCount = 36;
      const colors = ['#f59e0b', '#ec4899', '#a855f7', '#10b981', '#38bdf8'];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 8 + 6;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
        particle.style.backgroundColor = color;
        particle.style.left = '50%';
        particle.style.top = '35%';
        particle.style.pointerEvents = 'none';

        particlesContainerRef.current.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 160 + 90;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;

        gsap.to(particle, {
          x: destX,
          y: destY,
          rotation: Math.random() * 360,
          scale: 0,
          opacity: 0,
          duration: Math.random() * 0.9 + 0.8,
          ease: 'power3.out',
        });
      }
    }

    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.3, rotation: -25, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'elastic.out(1, 0.45)',
        }
      );
    }
  }, [isOpen, newLevel.level]);

  if (!isOpen) return null;

  const renderPerkIcon = () => {
    switch (newLevel.perkKey) {
      case 'age_filter':
        return <SlidersHorizontal className="w-5 h-5 text-purple-400" />;
      case 'priority_pool':
        return <Users className="w-5 h-5 text-amber-400" />;
      case 'free_telegram':
        return <Send className="w-5 h-5 text-sky-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      {/* GSAP Canvas/Particles Container */}
      <div
        ref={particlesContainerRef}
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      />

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        className="relative z-20 w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#19192f] via-[#121322] to-[#0c0d16] border border-amber-500/40 p-6 text-center text-white shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden"
        dir="rtl"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/20 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Level Emblem / Trophy Badge */}
        <div
          ref={badgeRef}
          className="relative w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-500 p-0.5 shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center justify-center"
        >
          <div className="w-full h-full rounded-[22px] bg-[#121324] flex flex-col items-center justify-center text-amber-300">
            <Trophy className="w-8 h-8 fill-amber-400 text-amber-300 animate-bounce" />
            <span className="text-[10px] font-black text-amber-200 mt-0.5">
              سطح {persianNumber(newLevel.level)}
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>تبریک! ارتقای سطح جدید</span>
        </div>

        <h3 className="text-xl font-black text-white tracking-tight mb-1">
          شما به سطح «{newLevel.title}» رسیدید!
        </h3>

        <p className="text-xs text-white/60 mb-5 leading-relaxed px-1">
          با فعالیت و بازخورد مستمر، امکانات اختصاصی زیر برای حساب شما آزاد شد:
        </p>

        {/* Unlocked Perk Showcase Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-right mb-5 space-y-1.5 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              {renderPerkIcon()}
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 block uppercase">
                قابلیت بازگشایی‌شده:
              </span>
              <h4 className="text-xs font-black text-white">
                {newLevel.perkTitle}
              </h4>
            </div>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed pr-10">
            {newLevel.perkDescription}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            id="try-unlocked-feature-btn"
            onClick={() => {
              onTryFeature(newLevel.perkKey);
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>آزمایش قابلیت بازشده</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-white/50 hover:text-white text-xs transition-colors"
          >
            متوجه شدم، ادامه کار
          </button>
        </div>
      </motion.div>
    </div>
  );
};
