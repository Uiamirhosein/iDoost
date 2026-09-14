import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Moon, Sparkles, HeartHandshake, X } from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';
import { FloatingXpFlyer } from './FloatingXpFlyer';

interface EndChatFeedbackModalProps {
  isOpen: boolean;
  partnerName: string;
  onSelectFeedback: (type: 'great' | 'okay') => void;
  onSkip: () => void;
}

export const EndChatFeedbackModal: React.FC<EndChatFeedbackModalProps> = ({
  isOpen,
  partnerName,
  onSelectFeedback,
  onSkip,
}) => {
  const [flyingXp, setFlyingXp] = useState<{ amount: number; x: number; y: number } | null>(null);
  const greatBtnRef = useRef<HTMLButtonElement>(null);
  const okayBtnRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

  const handleChoose = (type: 'great' | 'okay', e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const amount = type === 'great' ? 30 : 10;

    setFlyingXp({ amount, x: startX, y: startY });

    // Allow the GSAP animation to commence, then complete the feedback
    setTimeout(() => {
      onSelectFeedback(type);
    }, 450);
  };

  return (
    <>
      {/* Floating XP flyer animation */}
      {flyingXp && (
        <FloatingXpFlyer
          amount={flyingXp.amount}
          startX={flyingXp.x}
          startY={flyingXp.y}
          onComplete={() => setFlyingXp(null)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#17192b] to-[#10111d] border border-purple-500/30 p-5 shadow-[0_0_50px_rgba(147,51,234,0.25)] text-center text-white overflow-hidden"
          dir="rtl"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-28 bg-purple-500/15 blur-2xl pointer-events-none" />

          {/* Close / Skip button */}
          <button
            type="button"
            onClick={onSkip}
            className="absolute top-3.5 start-3.5 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            title="رد کردن"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 text-purple-300 shadow-md">
            <HeartHandshake className="w-6 h-6 text-pink-400" />
          </div>

          <h3 className="text-base font-black text-white mb-1">
            گفتگو با «{partnerName}» چطور بود؟
          </h3>

          <p className="text-xs text-white/60 mb-5 leading-relaxed px-2">
            با ثبت بازخورد سریع، شاخص هم‌فرکانسی خود را ارتقا دهید و امتیاز تجربه (XP) بگیرید.
          </p>

          {/* 2 Quick Vibe Reactions */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {/* Vibe 1: عالی بود */}
            <button
              ref={greatBtnRef}
              type="button"
              id="vibe-great-btn"
              onClick={(e) => handleChoose('great', e)}
              className="relative p-3 rounded-2xl bg-gradient-to-tr from-purple-600/30 via-pink-600/30 to-amber-500/20 hover:from-purple-600/45 hover:via-pink-600/45 hover:to-amber-500/30 border border-amber-400/40 hover:border-amber-400 transition-all active:scale-95 text-right flex flex-col justify-between group shadow-lg"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>⚡ عالی بود</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
                  +{persianNumber(30)} XP
                </span>
              </div>
              <p className="text-[10px] text-white/70 font-medium leading-tight">
                کاملاً هم‌فرکانس بودیم (+۵٪ شاخص هم‌فرکانسی)
              </p>
            </button>

            {/* Vibe 2: معمولی */}
            <button
              ref={okayBtnRef}
              type="button"
              id="vibe-okay-btn"
              onClick={(e) => handleChoose('okay', e)}
              className="relative p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all active:scale-95 text-right flex flex-col justify-between group shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-black text-white/90 group-hover:text-white transition-colors flex items-center gap-1">
                  <span>💤 معمولی</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                  +{persianNumber(10)} XP
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-medium leading-tight">
                مکالمه ساده بود
              </p>
            </button>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] text-white/40 hover:text-white/70 transition-colors py-1"
          >
            رد کردن و انتقال به تاریخچه
          </button>
        </motion.div>
      </div>
    </>
  );
};
