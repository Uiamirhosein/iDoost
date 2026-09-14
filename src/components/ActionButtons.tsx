import React from 'react';
import { motion } from 'motion/react';
import { X, Send, RotateCcw, Heart } from 'lucide-react';

interface ActionButtonsProps {
  onSkip: () => void;
  onConnect: () => void;
  onLike?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSkip,
  onConnect,
  onLike,
  onUndo,
  canUndo = false,
}) => {
  return (
    <div className="w-full flex items-center justify-center gap-3 px-4 py-3 shrink-0 select-none z-10">
      {/* Undo previous profile button (small) */}
      {onUndo && (
        <motion.button
          type="button"
          id="action-undo-button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center w-11 h-11 rounded-2xl border transition-all ${
            canUndo
              ? 'bg-white/[0.05] border-white/10 text-amber-300 hover:bg-white/[0.08] cursor-pointer'
              : 'bg-white/[0.02] border-white/[0.04] text-white/20 cursor-not-allowed'
          }`}
          title="بازگشت به پروفایل قبلی"
          aria-label="بازگشت"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      )}

      {/* Skip Button: "رد کردن" */}
      <motion.button
        type="button"
        id="action-skip-button"
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.02 }}
        onClick={onSkip}
        className="flex-1 max-w-[140px] flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#161722] hover:bg-[#1c1e2b] border border-white/10 text-white/80 hover:text-white transition-all shadow-md active:border-rose-400/40 group"
        aria-label="رد کردن پروفایل"
      >
        <div className="w-7 h-7 rounded-xl bg-white/[0.05] group-hover:bg-rose-500/20 text-rose-300/80 group-hover:text-rose-300 flex items-center justify-center transition-colors">
          <X className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold tracking-wide">رد کردن</span>
      </motion.button>

      {/* Like / Heart micro-action */}
      {onLike && (
        <motion.button
          type="button"
          id="action-like-button"
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          onClick={onLike}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]"
          title="پسندیدن"
          aria-label="لایک"
        >
          <Heart className="w-5 h-5 fill-rose-500/30 text-rose-300" />
        </motion.button>
      )}

      {/* Connect Button: "چت در تلگرام" - Visually prominent with soft glowing pastel gradient */}
      <motion.button
        type="button"
        id="action-connect-button"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={onConnect}
        className="flex-1 min-w-[160px] flex items-center justify-center gap-2.5 h-12 rounded-2xl bg-gradient-to-r from-violet-600/90 via-purple-500/90 to-pink-500/90 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold text-xs tracking-wide shadow-[0_4px_22px_rgba(168,85,247,0.38)] hover:shadow-[0_6px_28px_rgba(168,85,247,0.55)] border border-white/20 transition-all active:brightness-95 relative overflow-hidden"
        aria-label="شروع چت در تلگرام"
      >
        {/* Soft highlight reflection */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />

        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
          <Send className="w-3.5 h-3.5 -scale-x-100 transform" />
        </div>
        <span className="font-bold drop-shadow-sm">چت در تلگرام</span>
      </motion.button>
    </div>
  );
};
