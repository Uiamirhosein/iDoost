import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Crown,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Sliders,
  Clock,
  Gift,
  PartyPopper,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'limit_reached' | 'telegram_export' | 'general';
  onUpgrade?: () => void;
}

// 90 days countdown timer helper
function getTimeRemaining() {
  const STORAGE_KEY = 'idoost_free_countdown_start';
  let startTime = 0;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      startTime = parseInt(saved, 10);
    } else {
      startTime = Date.now();
      localStorage.setItem(STORAGE_KEY, startTime.toString());
    }
  } catch {
    startTime = Date.now();
  }

  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
  const targetTime = startTime + NINETY_DAYS_MS;
  const totalSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  reason = 'general',
  onUpgrade,
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const proFeatures = [
    {
      title: 'انتقال مستقیم به چت اختصاصی تلگرام',
      desc: 'لینک امن و مستقیم گفتگو در تلگرام بدون محدودیت درون‌برنامه',
      icon: MessageCircle,
      accent: 'from-sky-500/20 to-blue-500/20 text-sky-400',
    },
    {
      title: 'جستجوی فیلتردار نامحدود',
      desc: 'فیلتر بدون مرز بر اساس سن دقیق، جنسیت و تمام استان‌های کشور',
      icon: Sliders,
      accent: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    },
    {
      title: 'اولویت نمایش پروفایل (VIP Boost)',
      desc: 'پروفایل شما در رادار جستجوی افراد آنلاین ۳ برابر بیشتر دیده می‌شود',
      icon: Zap,
      accent: 'from-amber-500/20 to-orange-500/20 text-amber-400',
    },
    {
      title: 'نشان تایید هویت طلایی',
      desc: 'افزایش اعتماد و نرخ پاسخ‌دهی بالای ۹۵ درصد',
      icon: ShieldCheck,
      accent: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    },
  ];

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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-[440px] max-h-[90dvh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-[#11121d] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] p-5 pb-8 text-white z-10 flex flex-col hide-scrollbar"
            dir="rtl"
          >
            {/* Top Close Button & Drag indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>جشنواره ویژه راه‌اندازی آی‌دوست</span>
              </div>
              <button
                type="button"
                id="close-paywall-modal-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Glowing Icon & Main Headline */}
            <div className="text-center my-2">
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 via-purple-500 to-amber-400 p-[1.5px] shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                  <div className="w-full h-full rounded-2xl bg-[#0e0f17] flex items-center justify-center">
                    <PartyPopper className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div className="absolute -top-1 -end-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-[#0e0f17] flex items-center justify-center font-black text-[9px] shadow-md">
                  رایگان
                </div>
              </div>

              {/* Exact Requested Title */}
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                تا ۹۰ روز دیگر همه چیز رایگان است! 🎉
              </h2>

              <p className="text-xs text-white/70 mt-2 leading-relaxed px-1">
                به مناسبت رونمایی و افتتاح رسمی مینی‌اپ آی‌دوست، تمامی قابلیت‌های نسخه ویژه Pro شامل چت نامحدود و فیلترهای پیشرفته برای همه کاربران کاملاً رایگان است.
              </p>
            </div>

            {/* 90 Days Live Countdown Timer */}
            <div className="my-4 p-4 rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#161726] to-[#0e0f19] border border-purple-500/30 shadow-lg">
              <div className="flex items-center justify-center gap-1.5 text-xs text-purple-300 font-bold mb-3">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>زمان باقی‌مانده از دسترسی کاملاً رایگان:</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Days */}
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                  <span className="text-lg font-black text-amber-300">
                    {persianNumber(timeLeft.days)}
                  </span>
                  <span className="text-[10px] text-white/50 mt-0.5">روز</span>
                </div>

                {/* Hours */}
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                  <span className="text-lg font-black text-white">
                    {persianNumber(String(timeLeft.hours).padStart(2, '0'))}
                  </span>
                  <span className="text-[10px] text-white/50 mt-0.5">ساعت</span>
                </div>

                {/* Minutes */}
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                  <span className="text-lg font-black text-white">
                    {persianNumber(String(timeLeft.minutes).padStart(2, '0'))}
                  </span>
                  <span className="text-[10px] text-white/50 mt-0.5">دقیقه</span>
                </div>

                {/* Seconds */}
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                  <span className="text-lg font-black text-emerald-400 animate-pulse">
                    {persianNumber(String(timeLeft.seconds).padStart(2, '0'))}
                  </span>
                  <span className="text-[10px] text-white/50 mt-0.5">ثانیه</span>
                </div>
              </div>
            </div>

            {/* Unlocked Free Features List */}
            <div className="space-y-2.5 my-2">
              <div className="text-[11px] text-white/50 font-bold px-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>امکانات فعال شده برای شما:</span>
              </div>
              {proFeatures.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center shrink-0 border border-white/5`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{f.title}</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          فعال (رایگان)
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                id="activate-free-pro-btn"
                onClick={() => {
                  if (onUpgrade) onUpgrade();
                  onClose();
                }}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:opacity-95 active:scale-98 transition-transform font-black text-sm text-[#07130e] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>شروع و استفاده رایگان از تمام امکانات ✨</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-white/50 hover:text-white/80 transition-colors text-center cursor-pointer"
              >
                بستن و ادامه چت
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
