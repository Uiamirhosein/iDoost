import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Loader2,
  Camera,
  User,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ShieldCheck,
  Send,
  PartyPopper,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';
import { persianNumber } from '../utils/persianNumbers';

interface InitialProfileSyncModalProps {
  isOpen: boolean;
  user: UserProfile;
  onProceedToProfile: () => void;
  onSkipToHome: () => void;
}

type StepStatus = 'pending' | 'loading' | 'completed';

export const InitialProfileSyncModal: React.FC<InitialProfileSyncModalProps> = ({
  isOpen,
  user,
  onProceedToProfile,
  onSkipToHome,
}) => {
  // Step 1: Fetch Photo, Step 2: Fetch Name, Step 3: Create Initial Profile
  const [step1Status, setStep1Status] = useState<StepStatus>('loading');
  const [step2Status, setStep2Status] = useState<StepStatus>('pending');
  const [step3Status, setStep3Status] = useState<StepStatus>('pending');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Sequence the steps realistically and smoothly
    setStep1Status('loading');
    setStep2Status('pending');
    setStep3Status('pending');
    setIsFinished(false);

    // Sequence the steps quickly
    const timer1 = setTimeout(() => {
      setStep1Status('completed');
      setStep2Status('loading');
    }, 400);

    // Step 2 finishes -> Step 3 starts
    const timer2 = setTimeout(() => {
      setStep2Status('completed');
      setStep3Status('loading');
    }, 800);

    // Step 3 finishes -> Show final celebration and prompt
    const timer3 = setTimeout(() => {
      setStep3Status('completed');
      setIsFinished(true);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Ambient Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0a0b12]/90 backdrop-blur-md"
      />

      {/* Main Dialog Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="relative z-10 w-full max-w-md bg-[#121322] border border-purple-500/30 rounded-[32px] p-5 sm:p-6 shadow-2xl overflow-hidden text-right"
        dir="rtl"
      >
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -start-24 w-52 h-52 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -end-24 w-52 h-52 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Telegram Header Chip */}
        <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Send className="w-3.5 h-3.5 -rotate-45" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">اتصال به تلگرام</span>
              <span className="block text-[10px] text-white/50">Telegram Mini-App Sync</span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            همگام‌سازی لحظه‌ای
          </span>
        </div>

        {/* User Synced Avatar & Identity Preview */}
        <div className="flex flex-col items-center justify-center text-center my-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-sky-400 shadow-xl">
              <img
                src={
                  user.photos[0] ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full bg-white/10"
              />
            </div>
            <div className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-[#121322] shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-base font-black text-white mt-2.5">{user.name}</h3>
          <p className="text-xs text-white/50">شناسه متصل: @{user.telegramHandle || 'telegram_user'}</p>
        </div>

        {/* Vertical Step Bar (استپ بار عمودی) */}
        <div className="my-5 bg-[#17182c] border border-white/10 rounded-2xl p-4 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute top-7 bottom-7 start-[31px] w-0.5 bg-white/10 z-0">
            <motion.div
              className="w-full bg-gradient-to-b from-emerald-400 to-purple-500"
              animate={{
                height:
                  step3Status === 'completed'
                    ? '100%'
                    : step2Status === 'completed'
                    ? '66%'
                    : step1Status === 'completed'
                    ? '33%'
                    : '0%',
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="space-y-4 relative z-10">
            {/* Step 1: دریافت عکس */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md">
                {step1Status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : step1Status === 'loading' ? (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/40">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">۱. دریافت عکس</h4>
                  {step1Status === 'completed' && (
                    <span className="text-[10px] text-emerald-400 font-semibold">تکمیل شد ✓</span>
                  )}
                  {step1Status === 'loading' && (
                    <span className="text-[10px] text-purple-300 font-semibold animate-pulse">در حال دریافت...</span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {step1Status === 'completed'
                    ? 'عکس پروفایل با کیفیت اصلی از تلگرام بارگذاری شد.'
                    : 'دریافت تصویر آواتار از پروفایل تلگرام'}
                </p>
              </div>
            </div>

            {/* Step 2: دریافت نام */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md">
                {step2Status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : step2Status === 'loading' ? (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/40">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">۲. دریافت نام</h4>
                  {step2Status === 'completed' && (
                    <span className="text-[10px] text-emerald-400 font-semibold">تکمیل شد ✓</span>
                  )}
                  {step2Status === 'loading' && (
                    <span className="text-[10px] text-purple-300 font-semibold animate-pulse">در حال استعلام...</span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {step2Status === 'completed'
                    ? `نام «${user.name}» با موفقیت همگام گردید.`
                    : 'استعلام نام کاربری و شناسه از اکانت تلگرام'}
                </p>
              </div>
            </div>

            {/* Step 3: ساخت پروفایل پایه */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md">
                {step3Status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : step3Status === 'loading' ? (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/40">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">۳. ساخت حساب پایه</h4>
                  {step3Status === 'completed' && (
                    <span className="text-[10px] text-emerald-400 font-semibold">ساخته شد ✓</span>
                  )}
                  {step3Status === 'loading' && (
                    <span className="text-[10px] text-purple-300 font-semibold animate-pulse">در حال ایجاد...</span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {step3Status === 'completed'
                    ? 'پروفایل اولیه شما با موفقیت ثبت و ایجاد شد.'
                    : 'تخصیص شناسه یکتا و پایگاه داده همدم'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Announcement State: "پروفایل شما ساخته شد! فقط سه قدم تا تکمیل اطلاعات" */}
        <AnimatePresence>
          {isFinished ? (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              {/* Highlight Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/10 border border-purple-500/40 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-1.5">
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>پروفایل شما با موفقیت ساخته شد!</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                  فقط ۳ قدم تا تکمیل اطلاعات و شروع آشنایی باقی مانده است
                </h4>
                <p className="text-[11px] text-white/60 mt-1">
                  برای نمایش در رادار افراد نزدیک و محاسبه درصد سازگاری دقیق، لطفاً مشخصات خود را تکمیل کنید.
                </p>
              </div>

              {/* Action Button: هدایت به بخش پروفایل برای تکمیل اطلاعات */}
              <button
                type="button"
                onClick={onProceedToProfile}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>تکمیل اطلاعات پروفایل (۳ قدم)</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSkipToHome}
                className="w-full py-2 text-center text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                بعداً تکمیل می‌کنم (ورود به صفحه اصلی)
              </button>
            </motion.div>
          ) : (
            <div className="py-2 text-center text-xs text-white/40 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>در حال ایجاد پرونده و همگام‌سازی...</span>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
