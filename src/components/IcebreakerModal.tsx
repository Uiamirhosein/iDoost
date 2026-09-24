import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Swords,
  Clock,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { IcebreakerSessionData, IcebreakerOption } from '../types';
import { persianNumber } from '../utils/persianNumbers';
import { getSanitizedName } from '../utils/nameSanitizer';
import { triggerHaptic } from '../lib/telegram';
import {
  getOrInitIcebreaker,
  submitIcebreakerChoice,
  subscribeToIcebreakerUpdates,
} from '../lib/supabase';

interface IcebreakerModalProps {
  matchId: string;
  currentUserId: string;
  partnerName?: string;
  isOpen: boolean;
  onFinish: (quickActionText?: string) => void;
}

export const IcebreakerModal: React.FC<IcebreakerModalProps> = ({
  matchId,
  currentUserId,
  partnerName,
  isOpen,
  onFinish,
}) => {
  const [session, setSession] = useState<IcebreakerSessionData | null>(null);
  const [myChoice, setMyChoice] = useState<number | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<number | null>(null);
  const [status, setStatus] = useState<'VOTING' | 'COMPLETED' | 'EXPIRED'>('VOTING');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showVerdict, setShowVerdict] = useState<boolean>(false);

  const cleanPartnerName = getSanitizedName(partnerName, 'این دوستمون');
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // 1. Initialize session on open
  useEffect(() => {
    if (!isOpen || !matchId) return;

    let isMounted = true;
    setTimeLeft(60);
    setShowVerdict(false);

    getOrInitIcebreaker(matchId, currentUserId).then((data) => {
      if (!isMounted || !data) return;
      setSession(data);
      if (data.my_choice) setMyChoice(data.my_choice);
      if (data.partner_choice) setPartnerChoice(data.partner_choice);
      if (data.status) setStatus(data.status);

      if (data.status === 'COMPLETED' || (data.my_choice && data.partner_choice)) {
        setShowVerdict(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, matchId, currentUserId]);

  // 2. Realtime listener for partner vote
  useEffect(() => {
    if (!isOpen || !matchId || !session) return;

    const unsubscribe = subscribeToIcebreakerUpdates(
      matchId,
      session.is_user1,
      (newPartnerChoice, newStatus) => {
        if (newPartnerChoice !== null) {
          setPartnerChoice(newPartnerChoice);
        }
        if (newStatus) {
          setStatus(newStatus as any);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, matchId, session?.is_user1]);

  // Question & Options
  const question = session?.question || {
    id: 'default',
    category: 'chat_crimes',
    prompt: 'کدوم حرکت توی چت رسماً باید پیگرد قانونی داشته باشه؟ ⚖️',
    options: [
      { id: 1, text: 'ویس بالای ۴ دقیقه تو سر و صدای خیابون با صدای باد' },
      { id: 2, text: 'پیام دادنِ «سلام، هستی یه سوال بپرسم؟» و غیب شدن تا فردا' },
    ],
  };

  const isAgreed = myChoice !== null && partnerChoice !== null && myChoice === partnerChoice;
  const mySelectedOption = question.options.find((o) => o.id === myChoice);
  const partnerSelectedOption = question.options.find((o) => o.id === partnerChoice);

  // Dynamic, authentic & personalized copy for each user (so both sides get distinct, human replies)
  const isUser1 = session?.is_user1 ?? true;

  const quickActionText = React.useMemo(() => {
    if (isAgreed) {
      const agreedOptionsUser1 = [
        'پشمام جفتمون همینو زدیم! دقیقاً سر این حرکت که گفتی بارها قاطی کردم 😂',
        'دمت گرم واقعاً حق خالص بود! حس کردم فقط منم که از این قضیه فشار می‌خورم 🤝',
        'وای دقیقاً! یعنی از صد فرسخی این حرکتو ببینم فرار می‌کنم، خوب شد هم‌نظریم 🌿',
      ];
      const agreedOptionsUser2 = [
        'ناموساً فکر نمی‌کردم یکی دیگه هم مثل خودم سر این حرکت انقدر حرص بخوره 😂 چطوری؟',
        'قشنگ معلومه جفتمون از یه قماشیم! این دقیقاً خط قرمز اعصاب منم بود ✌️',
        'ایول هم‌فرکانس دراومدیم! بگو ببینم سر این ماجرا خاطره سم هم داری یا چی؟ ☕',
      ];
      const pool = isUser1 ? agreedOptionsUser1 : agreedOptionsUser2;
      return pool[Math.abs((matchId.charCodeAt(0) || 0) + (myChoice || 1)) % pool.length];
    } else {
      const conflictOptionsUser1 = [
        'نه خدایی جدی زدی اون یکی؟! یعنی حرکت من رو اعصاب‌تر نبود به نظرت؟ 💀',
        'با احترام ولی کاملاً با انتخابت مخالفم! مگه داریم بدتر از گزینه‌ای که من زدم؟! 😂',
        'شروع نشده اختلاف افتاد بینمون! بیا منطقی بحث کنیم سر این قضیه ببینم چطور به اون رسیدی ☕',
      ];
      const conflictOptionsUser2 = [
        'ناموساً چطور دستت رفت اون یکی رو انتخاب کنی؟! اون که اوج سمه 💀',
        'پشمام سلیقه‌هامون چپه دراومد! ولی جدی من سر گزینه‌ای که زدم زخمی شدم رفیق 😂',
        'شروع پرچالشی شد! باید قانعم کنی چرا به نظر تو اون قضیه بدتر بود تا باهم کنار بیایم 🌿',
      ];
      const pool = isUser1 ? conflictOptionsUser1 : conflictOptionsUser2;
      return pool[Math.abs((matchId.charCodeAt(1) || 0) + (myChoice || 2)) % pool.length];
    }
  }, [isAgreed, isUser1, matchId, myChoice]);

  // 3. Check for verdict trigger (when both picked)
  // When both users answered, show verdict for 2.2 seconds and auto-dismiss into chat
  useEffect(() => {
    if (myChoice !== null && partnerChoice !== null && !showVerdict) {
      triggerHaptic('success');
      setShowVerdict(true);

      const dismissTimer = setTimeout(() => {
        onFinishRef.current(quickActionText);
      }, 2200);

      return () => clearTimeout(dismissTimer);
    }
  }, [myChoice, partnerChoice, showVerdict, quickActionText]);

  // 4. 60-Second circular countdown timer (1 minute)
  useEffect(() => {
    if (!isOpen || showVerdict) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerHaptic('warning');
          setTimeout(() => {
            onFinishRef.current();
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, showVerdict]);

  // Handle Option Select
  const handleSelectOption = async (optionId: number) => {
    if (myChoice !== null || isSubmitting) return;

    triggerHaptic('medium');
    setMyChoice(optionId);
    setIsSubmitting(true);

    try {
      const res = await submitIcebreakerChoice(matchId, currentUserId, optionId);
      if (res && res.status === 'COMPLETED') {
        setStatus('COMPLETED');
      }
    } catch (e) {
      console.warn('Error submitting choice:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-[410px] rounded-[32px] bg-[#10111d] border border-purple-500/30 p-5 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative overflow-hidden flex flex-col text-center"
      >
        {/* Glow backdrop ambient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-600/20 via-pink-600/10 to-transparent pointer-events-none" />

        {!showVerdict ? (
          /* ========================================= */
          /* STAGE 1: THE ENCOUNTER SCREEN (VOTING)   */
          /* ========================================= */
          <div className="relative z-10 flex flex-col items-center">
            {/* Pulsing Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold mb-3 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>⚠️ اتاق نفرت مشترک • تست وایب قبل از چت</span>
            </div>

            {/* Countdown circular / timer pill */}
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{persianNumber(timeLeft)} ثانیه تا شروع مستقیم</span>
            </div>

            {/* Prompt Heading */}
            <h2 className="text-base sm:text-lg font-black text-white leading-relaxed mb-4 px-1">
              {question.prompt}
            </h2>

            {/* 2 Tactile Option Cards */}
            <div className="w-full space-y-3 mb-4">
              {question.options.map((opt, idx) => {
                const isSelected = myChoice === opt.id;
                const letterBadge = idx === 0 ? 'الف' : 'ب';

                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={myChoice !== null}
                    className={`w-full p-4 rounded-2xl border text-right transition-all flex items-start gap-3 relative cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600/30 via-pink-600/25 to-purple-600/30 border-purple-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                        : myChoice !== null
                        ? 'bg-white/[0.02] border-white/5 text-white/40 cursor-not-allowed opacity-60'
                        : 'bg-[#161728] hover:bg-[#1b1d33] border-white/10 hover:border-purple-400/50 text-white/90 shadow-md active:scale-98'
                    }`}
                  >
                    {/* Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black transition-colors ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-4 h-4" /> : letterBadge}
                    </div>

                    {/* Text */}
                    <p className="text-xs sm:text-[13px] font-bold leading-relaxed flex-1">
                      {opt.text}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Waiting state banner */}
            {myChoice !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center gap-2 text-xs text-purple-300 font-bold"
              >
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>شما انتخاب کردی! منتظر رای «{cleanPartnerName}»...</span>
              </motion.div>
            )}

            {/* Skip directly to chat */}
            <button
              type="button"
              onClick={() => onFinish()}
              className="mt-3 text-xs text-white/40 hover:text-white/70 transition-colors py-1 cursor-pointer"
            >
              رد کردن این مرحله و ورود مستقیم به چت
            </button>
          </div>
        ) : (
          /* ========================================= */
          /* STAGE 2: THE VERDICT REVEAL (PAYOFF)     */
          /* ========================================= */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 flex flex-col items-center py-2"
          >
            {/* Header Stamp Badge */}
            <div className="relative mb-3">
              <motion.div
                initial={{ scale: 2, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                  isAgreed
                    ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-600 shadow-[0_0_30px_rgba(168,85,247,0.5)]'
                }`}
              >
                {isAgreed ? (
                  <Flame className="w-8 h-8 fill-amber-200 text-amber-200 animate-pulse" />
                ) : (
                  <Swords className="w-8 h-8 text-rose-300" />
                )}
              </motion.div>
            </div>

            {/* Headline Title */}
            <h3 className="text-base sm:text-lg font-black text-white mb-1.5">
              {isAgreed ? '🔥 پشمام! جفتتون از یه قماشید!' : '⚔️ پشمام... شروع نشده دعوا شد!'}
            </h3>

            {/* Subtitle Details */}
            <p className="text-xs text-white/75 leading-relaxed mb-4 px-2">
              {isAgreed ? (
                <>هر دوتاتون متفق‌القول از «<strong className="text-amber-300 font-bold">{mySelectedOption?.text}</strong>» بیزارید!</>
              ) : (
                <>
                  تو زدی «<strong className="text-purple-300 font-bold">{mySelectedOption?.text}</strong>»، ولی این دوستمون دردش «<strong className="text-rose-300 font-bold">{partnerSelectedOption?.text}</strong>»ئه!
                </>
              )}
            </p>

            {/* Enter Chat Button (Simple and sleek, quickAction passed to chat input chip) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onFinish(quickActionText);
              }}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(168,85,247,0.35)] cursor-pointer active:scale-98 transition-transform"
            >
              <span>ورود به گفت‌وگو</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
