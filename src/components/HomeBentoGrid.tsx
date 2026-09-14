import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shuffle,
  SlidersHorizontal,
  Users,
  Sparkles,
  Zap,
  Lock,
  ArrowLeft,
  ChevronLeft,
  Radio,
  Clock,
  MapPin,
  ShieldCheck,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';
import { UserProfile } from '../types';
import { GamificationState } from '../utils/gamification';

interface HomeBentoGridProps {
  onRandomSearch: () => void;
  onFilteredSearch: () => void;
  filteredSearchRemaining: number;
  isSearching?: boolean;
  onOpenPaywall: () => void;
  activeChatUser?: UserProfile | null;
  onReturnToActiveChat?: () => void;
  gamification?: GamificationState;
  onOpenGamification?: () => void;
}

export const HomeBentoGrid: React.FC<HomeBentoGridProps> = ({
  onRandomSearch,
  onFilteredSearch,
  filteredSearchRemaining,
  isSearching = false,
  onOpenPaywall,
  activeChatUser,
  onReturnToActiveChat,
  gamification,
  onOpenGamification,
}) => {
  // Live online users counter with organic slight fluctuations
  const [onlineCount, setOnlineCount] = useState<number>(1428);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuates slightly by +2 to -1
      const delta = Math.floor(Math.random() * 5) - 2;
      setOnlineCount((prev) => Math.max(1200, prev + delta));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 overflow-y-auto hide-scrollbar">
      {/* Active Chat Notice Banner (Single-party communication rule) */}
      {activeChatUser && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-purple-500/15 to-emerald-500/20 border border-emerald-500/30 shadow-lg flex items-center justify-between gap-3 shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-400 shrink-0">
              <img
                src={activeChatUser.photos[0]}
                alt={activeChatUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0.5 end-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>شما یک گفتگوی فعال دارید</span>
              </div>
              <p className="text-[11px] text-white/70 truncate mt-0.5">
                هم‌صحبت شما: {activeChatUser.name} • در لحظه فقط ۱ چت مجاز است
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReturnToActiveChat}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0c0d15] text-xs font-black shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-1"
          >
            <span>ورود به چت</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Top Banner / Welcome greeting & Gamification badges */}
      <div className="flex items-center justify-between py-1 mb-2">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">
            دیدار و هم‌صحبتی
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            هم‌صحبت اتفاقی یا فیلترشده خود را پیدا کنید
          </p>
        </div>

        {/* Pro Badge button */}
        <button
          type="button"
          id="home-pro-badge-btn"
          onClick={onOpenPaywall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-pink-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>اشتراک ویژه</span>
        </button>
      </div>

      {/* Main Actions Bento Area */}
      <div className="flex flex-col gap-3 flex-1 my-1">
        {/* ACTION 1: Random Search (جستجوی شانسی) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={!isSearching ? onRandomSearch : undefined}
          className="relative rounded-2xl bg-gradient-to-br from-[#1b1534] via-[#15172b] to-[#121320] border border-purple-500/30 p-4 flex flex-col justify-between overflow-hidden cursor-pointer shadow-[0_8px_25px_rgba(147,51,234,0.12)] group"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 end-0 w-36 h-36 rounded-full bg-purple-600/20 blur-[50px] pointer-events-none group-hover:bg-purple-600/30 transition-colors" />

          {/* Top Section */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:rotate-6 transition-transform">
                <Shuffle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  مچ همزمان • بدون نیاز به ارسال درخواست
                </span>
                <h2 className="text-base font-black text-white group-hover:text-purple-200 transition-colors">
                  جستجوی شانسی
                </h2>
              </div>
            </div>

            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Body content / Description */}
          <div className="relative z-10 my-2">
            <p className="text-xs text-white/75 leading-relaxed">
              به محض اینکه شما و کاربری دیگر همزمان روی جستجو بزنید مستقیماً به یکدیگر معرفی می‌شوید.
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span id="instant-two-way-connection-text">اتصال آنی دو طرفه</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
              <span>شروع جستجو</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>

        {/* ACTION 2: Filtered Search (جستجو طبق فیلتر) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onFilteredSearch}
          className="relative rounded-2xl bg-[#131422] border border-white/10 hover:border-indigo-500/40 p-4 flex flex-col justify-between overflow-hidden cursor-pointer shadow-md group transition-colors"
        >
          {/* Subtle Glow */}
          <div className="absolute top-0 start-0 w-28 h-28 rounded-full bg-indigo-600/15 blur-[40px] pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-500/25 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-sm group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-indigo-200 transition-colors">
                  جستجو طبق فیلتر
                </h3>
                <p className="text-xs text-white/55 mt-0.5">
                  انتخاب دقیق جنسیت، بازه سنی و استان مورد نظر
                </p>
              </div>
            </div>

            {/* Remaining pill badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                filteredSearchRemaining > 0
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}
            >
              {filteredSearchRemaining > 0 ? (
                `${persianNumber(filteredSearchRemaining)} بار رایگان`
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> پرو
                </span>
              )}
            </span>
          </div>

          {/* Bottom */}
          <div className="relative z-10 flex items-center justify-between text-xs text-indigo-300 font-bold pt-2 mt-2 border-t border-white/[0.06]">
            <span>تنظیم مشخصات و جستجو</span>
            <div className="flex items-center gap-1 text-white/60 group-hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Safety & Online Status Bar */}
      <div className="mt-2 p-2.5 px-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-white/60">
            محیط امن و ایزوله تلگرام
          </span>
        </div>

        {/* Small live online users indicator */}
        <div id="live-online-footer-badge" className="flex items-center gap-2">
          <div className="flex -space-x-1.5 space-x-reverse">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="user"
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-full border border-[#131422] object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
              alt="user"
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-full border border-[#131422] object-cover"
            />
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {persianNumber(onlineCount.toLocaleString())} نفر آنلاین
          </span>
        </div>
      </div>
    </div>
  );
};
