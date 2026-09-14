import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Check, Zap, Sparkles, ShieldCheck, MessageCircle, Sliders } from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'limit_reached' | 'telegram_export' | 'general';
  onUpgrade?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  reason = 'general',
  onUpgrade,
}) => {
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
          >
            {/* Top Close Button & Drag indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>اشتراک ویژه پرو (Telegram Pro)</span>
              </div>
              <button
                type="button"
                id="close-paywall-modal-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Glowing Icon & Banner */}
            <div className="text-center my-3">
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-500 to-pink-500 p-[1.5px] shadow-[0_0_30px_rgba(245,158,11,0.35)]">
                  <div className="w-full h-full rounded-2xl bg-[#0e0f17] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
                <div className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-amber-400 text-[#0e0f17] flex items-center justify-center font-black text-[10px] shadow-md">
                  PRO
                </div>
              </div>

              <h2 className="text-xl font-black text-white tracking-tight">
                {reason === 'limit_reached'
                  ? 'سقف جستجوی روزانه به پایان رسید!'
                  : reason === 'telegram_export'
                  ? 'انتقال به تلگرام نیازمند نسخه Pro است'
                  : 'دسترسی نامحدود به مینی‌اپ با پرو'}
              </h2>

              <p className="text-xs text-white/65 mt-1.5 leading-relaxed px-2">
                {reason === 'limit_reached'
                  ? 'شما از سقف ۳ جستجوی فیلتردار رایگان امروز استفاده کردید. با تهیه نسخه Pro بدون هیچ محدودیتی پارتنر ایده‌آل خود را پیدا کنید.'
                  : reason === 'telegram_export'
                  ? 'برای اتصال امن و مستقیم به محیط تلگرام و چت بدون محدودیت، نسخه ویژه را فعال کنید.'
                  : 'امکانات نامحدود، چت بدون مرز و دیده‌شدن توسط هزاران کاربر آنلاین را با نسخه پرو تجربه کنید.'}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-2.5 my-3">
              {proFeatures.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center shrink-0 border border-white/5`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{f.title}</span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Packages */}
            <div className="grid grid-cols-2 gap-2.5 my-2">
              <div className="relative p-3 rounded-2xl bg-gradient-to-b from-purple-500/10 to-transparent border-2 border-purple-500/50 flex flex-col items-center text-center">
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] font-bold text-white shadow-sm">
                  محبوب‌ترین
                </span>
                <span className="text-xs text-white/70 mt-1">۱ ماهه نامحدود</span>
                <span className="text-base font-black text-white mt-0.5">
                  {persianNumber('89,000')} <span className="text-[10px] font-normal text-white/60">تومان</span>
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 font-medium">۴۰٪ تخفیف افتتاحیه</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col items-center text-center">
                <span className="text-xs text-white/70">۳ ماهه ویژه VIP</span>
                <span className="text-base font-black text-white mt-0.5">
                  {persianNumber('199,000')} <span className="text-[10px] font-normal text-white/60">تومان</span>
                </span>
                <span className="text-[10px] text-purple-300 mt-1 font-medium">به همراه نشان تایید</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                id="upgrade-to-pro-cta-btn"
                onClick={() => {
                  if (onUpgrade) onUpgrade();
                  onClose();
                }}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:opacity-95 active:scale-98 transition-transform font-bold text-sm text-[#0e0f17] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.3)]"
              >
                <Crown className="w-4 h-4 fill-[#0e0f17]" />
                <span>ارتقا به نسخه ویژه (Pro)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-white/50 hover:text-white/80 transition-colors text-center"
              >
                شاید بعداً (ادامه با نسخه محدود)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
