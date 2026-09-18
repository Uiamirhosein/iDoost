import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Gift,
  Copy,
  Check,
  Share2,
  Crown,
  Sparkles,
  X,
  CheckCircle2,
  PartyPopper,
  ShieldCheck,
  Zap,
  Flame,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';

interface InviteFriendsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser?: boolean;
  onGrantWeekPro?: () => void;
  inviteCount: number;
  referralLink?: string;
  onSimulateInvite?: () => void;
}

export const InviteFriendsBottomSheet: React.FC<InviteFriendsBottomSheetProps> = ({
  isOpen,
  onClose,
  isProUser = false,
  onGrantWeekPro,
  inviteCount,
  referralLink: customReferralLink,
  onSimulateInvite,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<boolean>(false);

  const referralLink = customReferralLink || `https://t.me/idoostbot?start=ref_invite`;

  const targetPerReward = 5;
  const currentBatch = inviteCount % targetPerReward;
  const canClaim = inviteCount >= targetPerReward && !claimedReward;
  const progressPercent = Math.min(100, Math.round((currentBatch / targetPerReward) * 100));

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `سلام! به مینی‌اپ آی‌دوست در تلگرام ملحق شو تا با افراد نزدیک و متناسب با معیارهات آشنا بشی 👇\n${referralLink}`
    );
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`,
      '_blank'
    );
  };

  const handleClaim = () => {
    onGrantWeekPro();
    setClaimedReward(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-lg bg-[#141524] border-t border-purple-500/30 rounded-t-[32px] p-5 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar space-y-4 text-white"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                  <Gift className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>دعوت دوستان و دریافت ۱ هفته Pro</span>
                    <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </h3>
                  <p className="text-[11px] text-white/50">
                    با هر ۵ دعوت موفق، ۱ هفته اشتراک VIP رایگان بگیرید
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Card */}
            <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#191b2c] to-indigo-950/40 border border-purple-500/20 p-3.5 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/70 font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>وضعیت دعوت‌های شما:</span>
                </span>
                <span className="text-amber-300 font-black">
                  {persianNumber(inviteCount)} دوست ({persianNumber(currentBatch)} از{' '}
                  {persianNumber(targetPerReward)})
                </span>
              </div>

              {/* Progress Line */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500"
                    style={{
                      width: `${
                        currentBatch === 0 && inviteCount > 0 ? 100 : progressPercent
                      }%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-white/40 px-0.5 font-medium">
                  <span>۰ دوست</span>
                  <span className="text-amber-400 font-bold">۵ دوست (★ ۱ هفته Pro)</span>
                  <span>۱۰ دوست (★ ۲ هفته Pro)</span>
                </div>
              </div>

              {/* Reward Action */}
              {canClaim ? (
                <motion.button
                  type="button"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={handleClaim}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 transition-all"
                >
                  <PartyPopper className="w-4 h-4" />
                  <span>تبریک! دریافت و فعال‌سازی ۱ هفته Pro رایگان 🎉</span>
                </motion.button>
              ) : claimedReward ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>۱ هفته اشتراک Pro به حساب شما اضافه شد!</span>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1 text-[11px] text-white/60">
                  <span>
                    فقط{' '}
                    <strong className="text-white font-bold">
                      {persianNumber(targetPerReward - currentBatch)}
                    </strong>{' '}
                    دعوت دیگر تا دریافت خودکار ۱ هفته Pro
                  </span>
                  <button
                    type="button"
                    onClick={onSimulateInvite}
                    title="شبیه‌سازی دعوت جهت تست"
                    className="text-[10px] text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 px-2 py-1 rounded-lg border border-purple-500/30 transition-colors"
                  >
                    +۱ دعوت تستی
                  </button>
                </div>
              )}
            </div>

            {/* Referral Link & Actions */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-white/80">
                لینک اختصاصی دعوت شما:
              </label>

              <div className="flex items-center gap-2 bg-[#0e0f18] border border-white/10 rounded-2xl p-2.5">
                <input
                  type="text"
                  readOnly
                  dir="ltr"
                  value={referralLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 min-w-0 bg-transparent text-xs text-purple-200 font-mono focus:outline-none select-all overflow-x-auto px-1"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی لینک</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Telegram Share Button */}
              <button
                type="button"
                onClick={handleShareTelegram}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 active:scale-95 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>ارسال مستقیم لینک در تلگرام</span>
              </button>
            </div>

            {/* VIP Perks */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>امکاناتی که با فعال‌سازی Pro دریافت می‌کنید:</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-white/80">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>فیلترهای نامحدود جستجو</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-white/80">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>انتقال به تلگرام افراد</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-white/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>مشاهده درصد تفاهم اخلاقی</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-white/80">
                  <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>اولویت نمایش در رادار</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
