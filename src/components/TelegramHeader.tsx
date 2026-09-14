import React from 'react';
import { X, MoreVertical, ShieldCheck, Zap } from 'lucide-react';

interface TelegramHeaderProps {
  onClose?: () => void;
  isPro?: boolean;
  dailyStreak?: number;
  userLevel?: number;
  userLevelTitle?: string;
  userXP?: number;
  onOpenGamification?: () => void;
}

export const TelegramHeader: React.FC<TelegramHeaderProps> = ({
  onClose,
  isPro,
  onOpenGamification,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-3 py-2 bg-[#0f1017]/95 backdrop-blur-md border-b border-white/[0.06] text-white/90 select-none z-20 shrink-0">
      {/* Right side in RTL: Close / Dismiss TMA action */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          id="tma-close-button"
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
          title="بستن مینی‌اپ"
          aria-label="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center-Right Brand */}
        <div className="flex items-center gap-1.5 ms-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-xs sm:text-sm font-black tracking-tight text-white/95">
            همدم
          </h1>
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
        </div>
      </div>

      {/* Left side in RTL: Options menu */}
      <div className="flex items-center gap-1.5">
        {isPro && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
            <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>ویژه</span>
          </span>
        )}

        <button
          type="button"
          id="tma-menu-button"
          onClick={onOpenGamification}
          className="flex items-center justify-center w-7 h-7 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
          title="گزینه‌ها"
          aria-label="منوی گزینه‌ها"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

