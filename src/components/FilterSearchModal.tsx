import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  SlidersHorizontal,
  Check,
  AlertCircle,
  Sparkles,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { SearchFilterState, Gender } from '../types';
import { IRAN_PROVINCES } from '../mockData';
import { persianNumber } from '../utils/persianNumbers';

interface FilterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch: (filters: SearchFilterState) => void;
  remainingUses: number;
  initialFilters?: SearchFilterState;
  userLevel?: number;
}

export const FilterSearchModal: React.FC<FilterSearchModalProps> = ({
  isOpen,
  onClose,
  onApplySearch,
  remainingUses,
  initialFilters = {
    gender: 'all',
    minAge: 20,
    maxAge: 35,
    province: 'همه استان‌ها',
    matchByCompatibility: true,
  },
  userLevel = 1,
}) => {
  const [gender, setGender] = useState<Gender>(initialFilters.gender);
  const [minAge, setMinAge] = useState<number>(initialFilters.minAge);
  const [maxAge, setMaxAge] = useState<number>(initialFilters.maxAge);
  const [province, setProvince] = useState<string>(initialFilters.province);
  const [matchByCompatibility, setMatchByCompatibility] = useState<boolean>(
    initialFilters.matchByCompatibility ?? true
  );

  const isAgeFilterUnlocked = userLevel >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplySearch({
      gender,
      minAge,
      maxAge,
      province,
      matchByCompatibility,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-[440px] max-h-[88dvh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-[#11121d] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] p-5 pb-8 text-white z-10 flex flex-col hide-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">جستجو طبق فیلتر</h3>
                  <p className="text-[11px] text-white/50">شخصی‌سازی مشخصات و معیارهای هم‌صحبت</p>
                </div>
              </div>

              <button
                type="button"
                id="close-filter-modal-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Remaining Uses Notice Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4 text-xs">
              <div className="flex items-center gap-2 text-purple-300 font-medium">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>سهمیه رایگان امروز:</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                {persianNumber(remainingUses)} از {persianNumber(3)} بار
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2">
                  جنسیت هم‌صحبت:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`h-11 rounded-2xl text-xs font-bold transition-all border ${
                      gender === 'female'
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                        : 'bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    خانم
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`h-11 rounded-2xl text-xs font-bold transition-all border ${
                      gender === 'male'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                        : 'bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    آقا
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('all')}
                    className={`h-11 rounded-2xl text-xs font-bold transition-all border ${
                      gender === 'all'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    فرقی ندارد
                  </button>
                </div>
              </div>

              {/* Age Range Slider */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span>محدوده سنی:</span>
                    {isAgeFilterUnlocked ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>باز در سطح {persianNumber(userLevel)}</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>امتیاز سطح ۲ (هم‌صحبت)</span>
                      </span>
                    )}
                  </div>
                  <span className="text-purple-400 font-bold">
                    {persianNumber(minAge)} تا {persianNumber(maxAge)} سال
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] text-white/50 mb-1">
                      <span>حداقل سن:</span>
                      <span>{persianNumber(minAge)} سال</span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={45}
                      value={minAge}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= maxAge) setMinAge(val);
                      }}
                      className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-white/50 mb-1">
                      <span>حداکثر سن:</span>
                      <span>{persianNumber(maxAge)} سال</span>
                    </div>
                    <input
                      type="range"
                      min={minAge}
                      max={55}
                      value={maxAge}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minAge) setMaxAge(val);
                      }}
                      className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Province Selection */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2">
                  استان محل سکونت:
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-xs text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {IRAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov} className="bg-[#151624] text-white">
                        {prov}
                      </option>
                    ))}
                  </select>
                  <div className="absolute top-1/2 -translate-y-1/2 end-4 pointer-events-none text-white/40 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Matching Mode: Highest Compatibility from Profile */}
              <div
                onClick={() => setMatchByCompatibility(!matchByCompatibility)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  matchByCompatibility
                    ? 'bg-purple-600/15 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    matchByCompatibility
                      ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>جستجو طبق بیشترین تفاهم</span>
                      <span className="px-1.5 py-0.2 bg-gradient-to-r from-pink-500 to-purple-500 text-[9px] text-white rounded-full font-bold">
                        هوشمند
                      </span>
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        matchByCompatibility
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'border-white/20'
                      }`}
                    >
                      {matchByCompatibility && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                    اولویت با فردی که بیشترین تشابه در علایق، تفریحات، سبک زندگی و خط قرمزهای پروفایل شما را دارد.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-filter-search-btn"
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 active:scale-98 text-white font-bold text-xs shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-transform flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>اعمال فیلتر و آغاز رادار هوشمند</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
