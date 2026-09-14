import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Check, RotateCcw, Users, HeartHandshake, MapPin } from 'lucide-react';
import { FilterOptions, Gender, MaritalStatus } from '../types';
import { toPersianDigits } from '../utils/persianNumbers';

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, isOpen]);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Sliding Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-[#12131d] border-t border-white/10 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar z-10 text-white"
          >
            {/* Top Sheet Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4 cursor-grab active:cursor-grabbing" />

            {/* Header: Title & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    فیلترهای پیشرفته
                  </h3>
                  <p className="text-[11px] text-white/50">
                    انتخاب معیارهای دقیق برای پیشنهادات بهتر
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="close-filters-button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION 1: GENDER SELECTION (PILLS) */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-white/80">
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span>نمایش پروفایل‌ها:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'all' as Gender, label: 'همه' },
                  { key: 'female' as Gender, label: 'خانم‌ها' },
                  { key: 'male' as Gender, label: 'آقایان' },
                ].map((item) => {
                  const isSelected = filters.gender === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, gender: item.key }))}
                      className={`h-10 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/20 border-purple-400/60 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                          : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-300" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: AGE RANGE SLIDER */}
            <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-white/80">بازه سنی:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-bold">
                  {toPersianDigits(filters.minAge)} تا {toPersianDigits(filters.maxAge)} سال
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-white/40">
                  <span>حداقل سن: {toPersianDigits(filters.minAge)}</span>
                  <span>حداکثر سن: {toPersianDigits(filters.maxAge)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/50">{toPersianDigits(18)}</span>
                  <input
                    type="range"
                    min={18}
                    max={filters.maxAge - 1}
                    value={filters.minAge}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minAge: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-purple-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min={filters.minAge + 1}
                    max={50}
                    value={filters.maxAge}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxAge: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-pink-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[11px] text-white/50">{toPersianDigits(50)}</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: MARITAL STATUS SELECTION */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-white/80">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />
                <span>وضعیت تاهل:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'all' as const, label: 'همه' },
                  { key: 'مجرد' as MaritalStatus, label: 'مجرد' },
                  { key: 'جدا شده' as MaritalStatus, label: 'جدا شده' },
                ].map((item) => {
                  const isSelected = filters.maritalStatus === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          maritalStatus: item.key,
                        }))
                      }
                      className={`h-10 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
                        isSelected
                          ? 'bg-rose-500/20 border-rose-400/60 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                          : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-rose-300" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: DISTANCE SLIDER */}
            <div className="mb-6 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-white/80">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>حداکثر فاصله مکانی:</span>
                </div>
                <span className="text-emerald-300 font-bold">
                  تا {toPersianDigits(filters.maxDistanceKm)} کیلومتر
                </span>
              </div>

              <input
                type="range"
                min={2}
                max={50}
                step={2}
                value={filters.maxDistanceKm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxDistanceKm: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-emerald-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer mt-2"
              />
              <div className="flex items-center justify-between text-[10px] text-white/40 mt-1">
                <span>{toPersianDigits(2)} کیلومتر</span>
                <span>سراسر شهر ({toPersianDigits(50)} کیلومتر)</span>
              </div>
            </div>

            {/* FOOTER ACTIONS: APPLY & RESET BUTTONS */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                id="reset-filters-button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی</span>
              </button>

              <button
                type="button"
                id="apply-filters-button"
                onClick={handleApply}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs shadow-[0_4px_20px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <span>اعمال فیلتر</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
