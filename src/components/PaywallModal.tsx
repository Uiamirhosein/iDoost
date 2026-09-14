import React from 'react';
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
  Users,
  Share2,
  Copy,
  ChevronLeft,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'limit_reached' | 'telegram_export' | 'general';
  inviteCount?: number;
  referralLink?: string;
  onOpenInvite?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  reason = 'general',
  inviteCount = 0,
  referralLink = '',
  onOpenInvite,
}) => {
  const REQUIRED_INVITES = 5;
  const remainingInvites = Math.max(0, REQUIRED_INVITES - inviteCount);
  const progressPercent = Math.min(100, Math.round((inviteCount / REQUIRED_INVITES) * 100));

  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard?.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `سلام! با این لینک وارد مینی‌اپ آی‌دوست شو تا باهم چت کنیم و دوست‌های جدید پیدا کنیم 👇\n${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

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
            {/* Top Close Button */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>اشتراک ویژه پرو (iDoost VIP Pro)</span>
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
              <div className="relative inline-flex items-center justify-center mb-2.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-purple-500 to-pink-500 p-[1.5px] shadow-[0_0_30px_rgba(245,158,11,0.35)]">
                  <div className="w-full h-full rounded-2xl bg-[#0e0f17] flex items-center justify-center">
                    <Crown className="w-8 h-8 text-amber-400 fill-amber-400" />
                  </div>
                </div>
                <div className="absolute -top-1 -end-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-[#0e0f17] flex items-center justify-center font-black text-[9px] shadow-md">
                  VIP
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {reason === 'limit_reached'
                  ? 'سقف استفاده رایگان به پایان رسید'
                  : reason === 'telegram_export'
                  ? 'انتقال به تلگرام نیازمند نسخه Pro است'
                  : 'فعال‌سازی رایگان اشتراک VIP Pro'}
              </h2>

              <p className="text-xs text-white/70 mt-1.5 leading-relaxed px-2">
                دسترسی به تمام امکانات نسخه Pro کاملاً رایگان است؛ تنها با دعوت ۵ نفر از دوستانتان به آی‌دوست، اشتراک VIP شما برای همیشه فعال خواهد شد!
              </p>
            </div>

            {/* Affiliate 5-Invites Progress Card */}
            <div className="my-3 p-4 rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#161726] to-[#0e0f19] border border-purple-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>پیشرفت دعوت‌های موفق:</span>
                </span>
                <span className="font-black text-amber-300">
                  {persianNumber(inviteCount)} از {persianNumber(REQUIRED_INVITES)} نفر
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400"
                />
              </div>

              <div className="text-[11px] text-white/60 text-center font-medium">
                {remainingInvites === 0 ? (
                  <span className="text-emerald-400 font-bold">
                    🎉 تبریک! ۵ دعوت شما تکمیل شده و اشتراک پرو برای شما فعال است.
                  </span>
                ) : (
                  <span>
                    فقط با دعوت <span className="text-amber-300 font-black">{persianNumber(remainingInvites)}</span> دوست دیگر، اشتراک پرو به طور خودکار باز می‌شود.
                  </span>
                )}
              </div>

              {/* Referral Link & Quick Copy / Share */}
              {referralLink && (
                <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 px-3 text-[11px] text-purple-200 truncate select-all focus:outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="h-9 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Unlocked Pro Features */}
            <div className="space-y-2 my-2">
              <span className="text-[11px] text-white/50 font-bold px-1">
                امکاناتی که با ۵ دعوت باز می‌شوند:
              </span>
              {proFeatures.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center shrink-0 border border-white/5`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{f.title}</span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-tight mt-0.5">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                id="share-invite-link-btn"
                onClick={handleShareTelegram}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:opacity-95 active:scale-98 transition-transform font-black text-xs sm:text-sm text-[#0c0d15] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(168,85,247,0.35)] cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>ارسال لینک دعوت به دوستان در تلگرام ⚡</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-white/50 hover:text-white/80 transition-colors text-center cursor-pointer"
              >
                انصراف و ادامه با نسخه عادی
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
