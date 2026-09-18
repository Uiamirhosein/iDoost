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
  ArrowRight,
  Flame,
  CheckCircle2,
  PartyPopper,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';

interface InviteFriendsSectionProps {
  isProUser?: boolean;
  onGrantWeekPro: () => void;
  onOpenPaywall?: () => void;
  inviteCount?: number;
  referralLink?: string;
}

export const InviteFriendsSection: React.FC<InviteFriendsSectionProps> = ({
  isProUser = false,
  onGrantWeekPro,
  onOpenPaywall,
  inviteCount = 0,
  referralLink: customReferralLink,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<boolean>(false);

  const referralLink = customReferralLink || `https://t.me/idoostbot?start=ref_invite`;

  // Calculations for 5-invites threshold
  const targetPerReward = 5;
  const currentBatch = inviteCount % targetPerReward;
  const canClaim = inviteCount >= targetPerReward && !claimedReward;
  const progressPercent = Math.min(100, Math.round((currentBatch / targetPerReward) * 100));

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `سلام! به مینی‌اپ آی‌دوست در تلگرام ملحق شو تا با افراد نزدیک و متناسب با معیارهات آشنا بشی 👇\n${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleClaimWeekPro = () => {
    onGrantWeekPro();
    setClaimedReward(true);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. Hero Promo Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-950/60 via-[#18192a] to-indigo-950/60 border border-purple-500/30 p-5 overflow-hidden shadow-xl">
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>دعوت از دوستان، دریافت ۱ هفته Pro</span>
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                </h3>
                <p className="text-[11px] text-white/50">
                  با هر ۵ دعوت موفق، ۱ هفته اشتراک ویژه (VIP) رایگان بگیرید
                </p>
              </div>
            </div>

            {isProUser && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>اشتراک Pro فعال</span>
              </span>
            )}
          </div>

          {/* Progress Card */}
          <div className="rounded-2xl bg-black/40 border border-white/10 p-3.5 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>دعوت‌های موفق شما:</span>
              </span>
              <span className="text-amber-300 font-black">
                {persianNumber(inviteCount)} دوست ({persianNumber(currentBatch)} از {persianNumber(targetPerReward)})
              </span>
            </div>

            {/* Visual Step Bar / Progress */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${currentBatch === 0 && inviteCount > 0 ? 100 : progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-white/40 px-0.5 font-medium">
                <span>۰ دوست</span>
                <span className="text-amber-400 font-bold">۵ دوست (★ ۱ هفته Pro)</span>
                <span>۱۰ دوست (★ ۲ هفته Pro)</span>
              </div>
            </div>

            {/* Claim Pro Button or Info */}
            <AnimatePresence>
              {canClaim ? (
                <motion.button
                  type="button"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={handleClaimWeekPro}
                  className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 transition-all"
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
                    فقط <strong className="text-white font-bold">{persianNumber(targetPerReward - currentBatch)}</strong> دعوت دیگر تا دریافت خودکار ۱ هفته Pro
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Referral Link & Copy Box */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-sky-400" />
          <span>لینک اختصاصی دعوت شما</span>
        </h4>

        <div className="flex items-center gap-2 bg-[#121320] border border-white/10 rounded-2xl p-2.5">
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

        {/* Telegram Direct Share Button */}
        <button
          type="button"
          onClick={handleShareTelegram}
          className="w-full h-11 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>ارسال مستقیم لینک در تلگرام</span>
        </button>
      </div>

      {/* 3. Pro Perks Highlights */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>مزایای اشتراک ۱ هفته‌ای Pro</span>
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>فیلترهای نامحدود</span>
            </div>
            <p className="text-[10px] text-white/40 leading-tight">
              جستجو بر اساس سن، استان و بیشترین تفاهم اخلاقی
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>انتقال به تلگرام</span>
            </div>
            <p className="text-[10px] text-white/40 leading-tight">
              دریافت آنی آیدی تلگرام افراد مچ‌شده برای گفتگوی خصوصی
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>مشاهده درصد تفاهم</span>
            </div>
            <p className="text-[10px] text-white/40 leading-tight">
              نمایش دقیق تشابه علایق و خط قرمزها در پروفایل‌ها
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>اولویت در رادار</span>
            </div>
            <p className="text-[10px] text-white/40 leading-tight">
              نمایش پروفایل شما در صدر پیشنهادهای کاربران هم‌استانی
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
