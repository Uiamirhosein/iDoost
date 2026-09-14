import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  Zap,
  Flame,
  Waves,
  SlidersHorizontal,
  Users,
  Send,
  ExternalLink,
  Instagram,
  UserCheck,
  Share2,
  MessageSquare,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  GamificationState,
  LEVELS_CONFIG,
  LEVEL_TASKS,
  LevelTask,
  getProgressTowardsNextLevel,
  calculateLevelFromState,
} from '../utils/gamification';
import { persianNumber } from '../utils/persianNumbers';

interface GamificationPerksModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: GamificationState;
  onAddTestXP?: (amount: number) => void;
  onCompleteTask: (taskId: string, rewardXP: number, taskTitle: string) => void;
  onActionNavigate?: (actionType: string) => void;
}

export const GamificationPerksModal: React.FC<GamificationPerksModalProps> = ({
  isOpen,
  onClose,
  gamification,
  onAddTestXP,
  onCompleteTask,
  onActionNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'tasks'>('tasks');
  const [completedAnimId, setCompletedAnimId] = useState<string | null>(null);

  if (!isOpen) return null;

  const { currentLevel, nextLevel, percentage, xpNeeded, pendingTasksForNextLevel } =
    getProgressTowardsNextLevel(gamification.userXP, gamification.completedTaskIds);

  const getPerkIcon = (key: string) => {
    switch (key) {
      case 'age_filter':
        return <SlidersHorizontal className="w-4 h-4 text-purple-400" />;
      case 'priority_pool':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'free_telegram':
        return <Send className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTaskIcon = (actionType: string) => {
    switch (actionType) {
      case 'telegram_channel':
        return <Send className="w-4 h-4 text-sky-400" />;
      case 'instagram_page':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'complete_profile':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'invite_friend':
        return <Share2 className="w-4 h-4 text-amber-400" />;
      case 'chat_action':
      default:
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
    }
  };

  const handleTaskClick = (task: LevelTask) => {
    if (gamification.completedTaskIds.includes(task.id)) return;

    // If task has an external URL (e.g. Telegram channel or Instagram page)
    if (task.targetUrl) {
      try {
        window.open(task.targetUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.log('Opened link:', task.targetUrl);
      }
    }

    // Trigger local completion animation
    setCompletedAnimId(task.id);
    setTimeout(() => setCompletedAnimId(null), 1200);

    // Complete task and award XP
    onCompleteTask(task.id, task.rewardXP, task.title);

    // If task requires UI navigation
    if (task.actionType === 'complete_profile' || task.actionType === 'invite_friend') {
      if (onActionNavigate) {
        onActionNavigate(task.actionType);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 27, stiffness: 290 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-[#121323] border border-white/10 p-5 shadow-2xl text-white flex flex-col hide-scrollbar"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Waves className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">باشگاه هم‌فرکانس</h3>
              <p className="text-[11px] text-white/50">ماموریت‌های هر مرحله، سطوح و بازگشایی امکانات</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Overview */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/35 via-indigo-900/25 to-purple-900/35 border border-purple-500/25 mb-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">سطح کنونی:</span>
              <span className="text-xs font-black text-amber-300">
                سطح {persianNumber(currentLevel.level)} ({currentLevel.title})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              <Zap className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              <span>{persianNumber(gamification.userXP)} XP</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-white/60 mb-1">
              <span>پیشرفت تا سطح بعدی</span>
              <span>
                {nextLevel
                  ? `${persianNumber(xpNeeded)} XP تا ${nextLevel.title}`
                  : 'بالاترین سطح'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Streak info */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>استریک فعالیت: {persianNumber(gamification.dailyStreak)} روز متوالی</span>
            </div>
          </div>
        </div>

        {/* Tab switch: Tasks by Level vs Roadmap */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/5 mb-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              activeTab === 'tasks'
                ? 'bg-purple-600 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            تسک‌ها و ماموریت‌های مراحل
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('levels')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              activeTab === 'levels'
                ? 'bg-purple-600 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            نقشه راه سطوح و جوایز
          </button>
        </div>

        {/* View 1: Tasks by Level with interactive CTA buttons */}
        {activeTab === 'tasks' && (
          <div className="space-y-3.5 mb-4">
            {LEVELS_CONFIG.map((lvl) => {
              const tasks = LEVEL_TASKS.filter((t) => t.level === lvl.level);
              if (tasks.length === 0) return null;

              const isLevelUnlocked = currentLevel.level >= lvl.level;
              const isNextLevel = nextLevel?.level === lvl.level;
              const completedInThisLevel = tasks.filter((t) =>
                gamification.completedTaskIds.includes(t.id)
              ).length;

              return (
                <div
                  key={lvl.level}
                  className={`rounded-2xl p-3.5 border transition-all ${
                    isNextLevel
                      ? 'bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/20'
                      : isLevelUnlocked
                      ? 'bg-white/[0.03] border-white/10'
                      : 'bg-white/[0.015] border-white/5 opacity-75'
                  }`}
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ${
                          isLevelUnlocked
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isNextLevel
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 text-white/40'
                        }`}
                      >
                        {persianNumber(lvl.level)}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>تسک‌های مرحله {persianNumber(lvl.level)} ({lvl.title})</span>
                          {isNextLevel && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                              مرحله هدف بعدی
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-white/50">
                          جایزه مرحله: {lvl.perkTitle}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-purple-300">
                      {persianNumber(completedInThisLevel)} از {persianNumber(tasks.length)}
                    </span>
                  </div>

                  {/* Level Tasks List */}
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const isCompleted = gamification.completedTaskIds.includes(task.id);
                      const isTaskJustDone = completedAnimId === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">{getTaskIcon(task.actionType)}</div>
                              <div>
                                <h5 className="text-xs font-bold text-white leading-tight">
                                  {task.title}
                                </h5>
                                <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">
                                  {task.description}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black">
                              +{persianNumber(task.rewardXP)} XP
                            </span>
                          </div>

                          {/* CTA Button */}
                          <div className="flex items-center justify-end pt-1">
                            {isCompleted ? (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-black bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>انجام شد</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTaskClick(task)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
                                  task.actionType === 'telegram_channel'
                                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
                                    : task.actionType === 'instagram_page'
                                    ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 hover:opacity-95 text-white shadow-pink-500/20'
                                    : 'bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200'
                                }`}
                              >
                                {task.actionType === 'telegram_channel' && (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                {task.actionType === 'instagram_page' && (
                                  <Instagram className="w-3.5 h-3.5" />
                                )}
                                <span>{task.actionText}</span>
                                {task.targetUrl && (
                                  <ExternalLink className="w-3 h-3 text-white/70" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View 2: Levels Roadmap */}
        {activeTab === 'levels' && (
          <div className="space-y-2.5 mb-4">
            {LEVELS_CONFIG.map((lvl) => {
              const isUnlocked = currentLevel.level >= lvl.level;
              const isCurrent = currentLevel.level === lvl.level;

              return (
                <div
                  key={lvl.level}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-purple-600/15 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                      : isUnlocked
                      ? 'bg-white/[0.03] border-white/10 opacity-90'
                      : 'bg-white/[0.01] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border ${
                          isUnlocked
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {persianNumber(lvl.level)}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>{lvl.title}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 text-[9px] font-bold border border-amber-400/30">
                              سطح کنونی
                            </span>
                          )}
                        </h5>
                        <span className="text-[10px] text-white/40">
                          حداقل {persianNumber(lvl.minXP)} XP
                        </span>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>آزاد شده</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-white/40 font-semibold bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        <Lock className="w-3 h-3" />
                        <span>قفل</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-white/[0.04]">
                    <div className="mt-0.5">{getPerkIcon(lvl.perkKey)}</div>
                    <div>
                      <span className="text-xs font-bold text-white/90 block">
                        {lvl.perkTitle}
                      </span>
                      <p className="text-[11px] text-white/50 leading-relaxed">
                        {lvl.perkDescription}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Test / Demo XP Booster Button */}
        {onAddTestXP && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-white/40">تست شبیه‌سازی:</span>
            <button
              type="button"
              onClick={() => onAddTestXP(30)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>افزودن ۳۰+ XP برای تست ارتقا</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

