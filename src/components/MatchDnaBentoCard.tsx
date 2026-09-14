import React from 'react';
import { motion } from 'motion/react';
import {
  Waves,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  ChevronLeft,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import {
  GamificationState,
  getProgressTowardsNextLevel,
  calculateLevelFromState,
} from '../utils/gamification';
import { persianNumber } from '../utils/persianNumbers';

interface MatchDnaBentoCardProps {
  gamification: GamificationState;
  onOpenLevelPerks?: () => void;
}

export const MatchDnaBentoCard: React.FC<MatchDnaBentoCardProps> = ({
  gamification,
  onOpenLevelPerks,
}) => {
  const { currentLevel, nextLevel, percentage, xpNeeded, pendingTasksForNextLevel, isLockedByTasks } =
    getProgressTowardsNextLevel(gamification.userXP, gamification.completedTaskIds);

  const nextDnaMilestone =
    gamification.matchDnaPercentage < 50
      ? 50
      : gamification.matchDnaPercentage < 75
      ? 75
      : 95;
  const remainingChatsForMilestone = Math.max(
    1,
    Math.ceil((nextDnaMilestone - gamification.matchDnaPercentage) / 5)
  );

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onOpenLevelPerks}
      className="relative rounded-2xl bg-gradient-to-br from-[#1c1338] via-[#14152a] to-[#0f101d] border border-purple-500/30 p-4 flex flex-col justify-between overflow-hidden shadow-[0_8px_25px_rgba(147,51,234,0.12)] cursor-pointer group"
      dir="rtl"
    >
      {/* Ambient Radial Glow */}
      <div className="absolute top-0 end-0 w-36 h-36 rounded-full bg-pink-500/15 blur-[45px] pointer-events-none group-hover:bg-pink-500/25 transition-colors" />

      {/* Top Header: Badge & Level Info */}
      <div className="flex items-center justify-between relative z-10 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] group-hover:rotate-6 transition-transform shrink-0">
            <Waves className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white group-hover:text-purple-200 transition-colors">
                شاخص هم‌فرکانسی
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-black border border-pink-500/30">
                {persianNumber(gamification.matchDnaPercentage)}٪ تطابق
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              سطح {persianNumber(currentLevel.level)}: {currentLevel.title} • {persianNumber(gamification.userXP)} XP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-white/40 group-hover:text-white transition-colors">
          <span className="text-[11px] text-purple-300 font-bold hidden sm:inline">تسک‌ها و جوایز</span>
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:translate-x-0.5 transition-all">
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Visual Frequency / Resonance Progress Bar */}
      <div className="relative z-10 my-1">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-white/80 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>دقت الگوریتم تطابق هم‌فرکانسی:</span>
          </span>
          <span className="text-amber-300 font-black">
            {persianNumber(gamification.matchDnaPercentage)}٪
          </span>
        </div>

        {/* Outer bar */}
        <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5 border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${gamification.matchDnaPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
          />
        </div>
      </div>

      {/* Dynamic Subtext & Next Level Task Alert */}
      <div className="relative z-10 mt-2 pt-2 border-t border-white/[0.06]">
        {pendingTasksForNextLevel.length > 0 ? (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-300/95 font-bold flex items-center gap-1">
              <ListTodo className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {persianNumber(pendingTasksForNextLevel.length)} تسک برای ورود به {nextLevel?.title || 'سطح بعد'}
              </span>
            </span>
            <span className="text-[10px] text-purple-300 underline font-semibold">
              مشاهده و تکمیل تسک‌ها
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-purple-300/90 font-medium">
              {persianNumber(remainingChatsForMilestone)} مکالمه دیگر تا ارتقای تطابق فرکانس
            </span>

            {currentLevel.perkKey !== 'none' && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{currentLevel.perkTitle}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

