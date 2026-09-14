import React from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../utils/persianNumbers';

interface TopBarProps {
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenFilters,
  activeFilterCount,
}) => {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 shrink-0">
      {/* Brand title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500/30 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-white/95">
              کاوش و همسان‌یابی
            </span>
          </div>
          <p className="text-[11px] text-white/50">
            افراد نزدیک و هم‌سلیقه با شما
          </p>
        </div>
      </div>

      {/* Filter button */}
      <button
        type="button"
        id="open-filters-button"
        onClick={onOpenFilters}
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all duration-200 active:scale-95 text-xs font-medium"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-purple-300" />
        <span>فیلترها</span>

        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-[10px] font-bold text-gray-950 shadow-sm">
            {toPersianDigits(activeFilterCount)}
          </span>
        )}
      </button>
    </div>
  );
};
