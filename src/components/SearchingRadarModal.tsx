import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  AlertCircle,
  X,
  UserCheck,
  RefreshCw,
  Heart,
  Zap,
  Users,
  MessageCircle,
  ArrowRightLeft,
  Radio,
  Crown,
  Flame,
} from 'lucide-react';
import { UserProfile } from '../types';
import { persianNumber } from '../utils/persianNumbers';
import { OnlineBadge } from './OnlineBadge';
import { UserAvatar } from './UserAvatar';

interface SearchingRadarModalProps {
  isOpen: boolean;
  searchType: 'random' | 'filtered';
  matchedUser: UserProfile | null;
  currentUser?: UserProfile;
  onEnterChat: () => void;
  onNextMatch: () => void;
  onCloseSearch: () => void;
  matchByCompatibility?: boolean;
  userLevel?: number;
}

export const SearchingRadarModal: React.FC<SearchingRadarModalProps> = ({
  isOpen,
  searchType,
  matchedUser,
  currentUser,
  onEnterChat,
  onNextMatch,
  onCloseSearch,
  matchByCompatibility = false,
  userLevel = 1,
}) => {
  const [step, setStep] = useState<'scanning' | 'found'>('scanning');
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [autoConnectCountdown, setAutoConnectCountdown] = useState<number>(5);
  const [isGoldenMatch, setIsGoldenMatch] = useState<boolean>(false);

  const goldenBadgeRef = useRef<HTMLDivElement>(null);
  const goldenAuraRef = useRef<HTMLDivElement>(null);

  // Keep references to latest callbacks so intervals never have stale closures
  // and do not unnecessarily recreate timers when parent components re-render
  const onNextMatchRef = useRef(onNextMatch);
  onNextMatchRef.current = onNextMatch;

  const onEnterChatRef = useRef(onEnterChat);
  onEnterChatRef.current = onEnterChat;

  // Scanning transition when opened or when matchedUser changes
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(30);
      setAutoConnectCountdown(5);

      if (!matchedUser) {
        setStep('scanning');
        return;
      }

      // When a match is present (or arrives via Realtime), transition to found
      const timer = setTimeout(() => {
        // Variable Reward: ~28% random chance or score >= 90%
        const score = matchedUser?.compatibilityScore || 88;
        const golden = Math.random() < 0.28 || score >= 90;
        setIsGoldenMatch(golden);
        setStep('found');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, matchedUser?.id]);

  // GSAP animation for Golden Match alert entrance
  useEffect(() => {
    if (step === 'found' && isGoldenMatch && goldenBadgeRef.current) {
      gsap.fromTo(
        goldenBadgeRef.current,
        { scale: 0.35, y: -25, opacity: 0, rotation: -6 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.65,
          ease: 'back.out(2.2)',
        }
      );

      if (goldenAuraRef.current) {
        gsap.to(goldenAuraRef.current, {
          opacity: 0.9,
          scale: 1.15,
          duration: 1.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }
    }
  }, [step, isGoldenMatch]);

  // 30-second countdown for FILTERED SEARCH
  // When 30s expires, automatically proceed to next candidate without deducting credit!
  useEffect(() => {
    if (!isOpen || step !== 'found' || searchType !== 'filtered') {
      return;
    }

    setSecondsLeft(30);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Defer call outside React's state updater to prevent setState-in-render error
          setTimeout(() => {
            onNextMatchRef.current();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, step, searchType, matchedUser?.id]);

  // Optional 5s auto-connect countdown for RANDOM SEARCH (instant mutual connection)
  useEffect(() => {
    if (!isOpen || step !== 'found' || searchType !== 'random') {
      return;
    }

    setAutoConnectCountdown(5);
    const interval = setInterval(() => {
      setAutoConnectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Defer call outside React's state updater to prevent setState-in-render error
          setTimeout(() => {
            onEnterChatRef.current();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, step, searchType, matchedUser?.id]);

  if (!isOpen) return null;

  const progressPercentage = (secondsLeft / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-[400px] rounded-[32px] bg-[#121322] border border-purple-500/30 p-5 flex flex-col items-center text-center shadow-[0_0_50px_rgba(168,85,247,0.25)] relative overflow-hidden"
        dir="rtl"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 w-64 h-64 rounded-full bg-purple-600/20 blur-[70px] pointer-events-none" />

        {/* Top close button */}
        <button
          type="button"
          onClick={onCloseSearch}
          className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-20 cursor-pointer"
          title="خروج از جستجو"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {step === 'scanning' ? (
          <>
            {/* Live Queue Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold mt-1 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>صف تطبیق آنی • کاربر همزمان در حال جستجو</span>
            </div>

            {/* Animated Radar Ripples */}
            <div className="relative w-36 h-36 flex items-center justify-center my-3">
              <motion.div
                animate={{ scale: [1, 2.3], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-purple-500/20 border border-purple-500/40"
              />
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                transition={{ duration: 1.8, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-pink-500/20 border border-pink-500/40"
              />
              <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                <Zap className="w-10 h-10 animate-pulse text-amber-300" />
              </div>
            </div>

            <h3 className="text-base font-black text-white mt-2">
              {searchType === 'random'
                ? 'در حال تطبیق با کاربر آنلاین همزمان...'
                : matchByCompatibility
                ? 'محاسبه تفاهم و اتصال همزمان...'
                : 'بررسی معیارهای فیلتر با کاربران در حال جستجو...'}
            </h3>

            {/* Real-time Simultaneous Match Philosophy Explanation */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 my-3 text-right text-[11px] text-white/70 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>اتصال در لحظه (بدون نیاز به ارسال درخواست)</span>
              </div>
              <p>
                در آی‌دوست هیچ درخواست یا انتظاری وجود ندارد. به محض اینکه فرد دیگری همزمان دکمه جستجو را بزند، مستقیماً به یکدیگر معرفی می‌شوید.
              </p>
            </div>

            <button
              type="button"
              onClick={onCloseSearch}
              className="mt-2 px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              لغو جستجو
            </button>
          </>
        ) : matchedUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full flex flex-col items-center relative rounded-3xl p-3 sm:p-4 transition-all ${
              isGoldenMatch
                ? 'border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/20 via-[#151629] to-[#0d0e19] shadow-[0_0_40px_rgba(245,158,11,0.3)]'
                : 'border border-white/5 bg-transparent'
            }`}
          >
            {/* Ambient Golden Aura */}
            {isGoldenMatch && (
              <div
                ref={goldenAuraRef}
                className="absolute -top-6 inset-x-0 h-36 bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent blur-2xl pointer-events-none"
              />
            )}

            {/* Top Match Badge: Golden Match Alert or Simultaneous Match Badge */}
            {isGoldenMatch ? (
              <div
                ref={goldenBadgeRef}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/25 to-amber-500/30 border border-amber-400/90 text-amber-300 text-xs font-black mb-3 shadow-[0_0_25px_rgba(245,158,11,0.5)] z-10"
              >
                <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>تطابق طلایی: {persianNumber(matchedUser.compatibilityScore || 92)}٪ تشابه سلیقه!</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-pink-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black mb-3 shadow-md">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>مچ همزمان دوطرفه پیدا شد!</span>
              </div>
            )}

            {/* Priority Pool indicator if user is Level 3+ */}
            {userLevel >= 3 && (
              <div className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full mb-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>اولویت در صف کاربران فعال (امتیاز سطح ۳)</span>
              </div>
            )}

            {/* DUAL AVATAR CONVERGENCE (Visualizes two simultaneous searchers connecting) */}
            <div className="w-full flex items-center justify-center gap-2 sm:gap-3 my-1 relative z-10">
              {/* User 1 (Current User) */}
              <div className="flex flex-col items-center">
                <div className="relative rounded-2xl p-0.5 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-md">
                  <UserAvatar
                    src={currentUser?.photos?.[0]}
                    name={currentUser?.name || 'شما'}
                    size="lg"
                  />
                  <div className="absolute -bottom-1 -end-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#121322]" />
                </div>
                <span className="text-[10px] font-bold text-white/70 mt-1">شما (آنلاین)</span>
              </div>

              {/* Connecting Energy Beam & Lightning */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      isGoldenMatch
                        ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                        : 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  </motion.div>
                </div>
                <span className="text-[9px] font-black text-amber-300 mt-1 uppercase tracking-tight">
                  اتصال همزمان
                </span>
              </div>

              {/* User 2 (Matched User) */}
              <div className="flex flex-col items-center">
                <div
                  className={`relative rounded-2xl p-0.5 shadow-md ${
                    isGoldenMatch
                      ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 ring-2 ring-amber-400/70'
                      : 'bg-gradient-to-tr from-pink-500 to-amber-500'
                  }`}
                >
                  <UserAvatar
                    src={matchedUser.photos?.[0]}
                    name={matchedUser.name}
                    size="lg"
                  />
                  <OnlineBadge
                    size="sm"
                    borderColor="border-[#121322]"
                    className="absolute -bottom-1 -end-1"
                  />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isGoldenMatch ? 'text-amber-300' : 'text-pink-300'}`}>
                  {matchedUser.name}
                </span>
              </div>
            </div>

            {/* Smart Compatibility Badge */}
            <div
              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold my-2 z-10 ${
                isGoldenMatch
                  ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                  : 'bg-pink-500/15 border border-pink-500/30 text-pink-300'
              }`}
            >
              <Heart className={`w-3 h-3 ${isGoldenMatch ? 'text-amber-400 fill-amber-400' : 'text-pink-400 fill-pink-400'}`} />
              <span>{persianNumber(matchedUser.compatibilityScore || 94)}٪ تفاهم با معیارهای شما</span>
            </div>

            {/* Matched Details */}
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <span>{matchedUser.name}</span>
              <span className="text-xs sm:text-sm text-purple-400 font-bold">
                ، {persianNumber(matchedUser.age)} ساله
              </span>
              {matchedUser.isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </h3>

            <p className="text-[11px] text-purple-300/80 font-medium mt-0.5">
              {matchedUser.job} • {matchedUser.city || matchedUser.province}
            </p>

            {/* Common Interests tags */}
            {matchedUser.interests && matchedUser.interests.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 my-1.5 max-w-[320px]">
                {matchedUser.interests.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* Bio snippet */}
            <p className="text-[11px] text-white/75 bg-white/[0.03] border border-white/[0.06] rounded-xl p-2 my-1 leading-relaxed text-center line-clamp-2 w-full">
              «{matchedUser.bio}»
            </p>

            {/* Filtered Search 30s Countdown Header */}
            {searchType === 'filtered' ? (
              <div className="w-full flex flex-col items-center gap-1 mb-2">
                <div className="flex items-center justify-between w-full px-1 text-[11px] font-bold">
                  <span className="text-emerald-400">اتصال بدون نیاز به درخواست تایید</span>
                  <div className="flex items-center gap-1 text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>{persianNumber(secondsLeft)} ثانیه تا رد خودکار</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      secondsLeft <= 6
                        ? 'bg-rose-500'
                        : secondsLeft <= 14
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-white/60 mb-2 flex items-center gap-1 justify-center">
                <span>ورود مستقیم به گفتگو در {persianNumber(autoConnectCountdown)} ثانیه...</span>
              </div>
            )}

            {/* Action Buttons */}
            {searchType === 'filtered' ? (
              <div className="w-full space-y-2">
                <button
                  type="button"
                  id="confirm-filtered-chat-btn"
                  onClick={onEnterChat}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 active:scale-98 text-white font-black text-xs shadow-[0_4px_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>شروع مستقیم گفتگو (کسر ۱ سهمیه)</span>
                </button>

                <button
                  type="button"
                  id="skip-to-next-filtered-btn"
                  onClick={onNextMatch}
                  className="w-full h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-98 text-purple-300 hover:text-white font-semibold text-xs border border-purple-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>جستجوی کاربر همزمان دیگر (بدون کسر سهمیه)</span>
                </button>

                <button
                  type="button"
                  onClick={onCloseSearch}
                  className="text-[11px] text-white/40 hover:text-white/70 transition-colors pt-1 cursor-pointer"
                >
                  انصراف و بستن جستجو
                </button>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <button
                  type="button"
                  id="enter-chat-from-radar-btn"
                  onClick={onEnterChat}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 hover:opacity-95 active:scale-98 text-white font-black text-xs shadow-[0_4px_25px_rgba(168,85,247,0.35)] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ورود مستقیم به چت و شروع گفتگو</span>
                </button>

                <button
                  type="button"
                  onClick={onNextMatch}
                  className="w-full h-9 rounded-xl bg-white/[0.04] text-xs text-white/70 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-white/50" />
                  <span>تطبیق با فرد همزمان دیگر</span>
                </button>

                <button
                  type="button"
                  onClick={onCloseSearch}
                  className="text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                >
                  بستن
                </button>
              </div>
            )}
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
};
