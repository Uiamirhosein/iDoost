import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Crown,
  Gift,
  Edit3,
  ChevronLeft,
  X,
  Share2,
  UserX,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';
import { persianNumber } from '../utils/persianNumbers';
import { ProfileWizard } from './ProfileWizard';
import { InviteFriendsBottomSheet } from './InviteFriendsBottomSheet';
import { BlockedUsersBottomSheet } from './BlockedUsersBottomSheet';
import { MOCK_USERS } from '../mockData';
import { GamificationState } from '../utils/gamification';
import { MatchDnaBentoCard } from './MatchDnaBentoCard';

interface MyProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenPaywall?: () => void;
  filteredSearchRemaining: number;
  isProUser?: boolean;
  onGrantWeekPro?: () => void;
  blockedUserIds?: string[];
  onUnblockUser?: (userId: string) => void;
  autoOpenWizard?: boolean;
  onWizardComplete?: (updated: UserProfile) => void;
  onReplayInitialSync?: () => void;
  gamification?: GamificationState;
  onOpenGamification?: () => void;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({
  user,
  onUpdateProfile,
  onOpenPaywall,
  filteredSearchRemaining,
  isProUser = false,
  onGrantWeekPro = () => {},
  blockedUserIds = [],
  onUnblockUser = () => {},
  autoOpenWizard = false,
  onWizardComplete,
  onReplayInitialSync,
  gamification,
  onOpenGamification,
}) => {
  // Modal states
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(autoOpenWizard || false);
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState<boolean>(false);
  const [isBlockedSheetOpen, setIsBlockedSheetOpen] = useState<boolean>(false);

  // Sync autoOpenWizard if prop changes
  useEffect(() => {
    if (autoOpenWizard) {
      setIsWizardOpen(true);
    }
  }, [autoOpenWizard]);

  // Referral Invite count state
  const [inviteCount, setInviteCount] = useState<number>(2);

  // Resolved list of blocked user profiles
  const resolvedBlockedUsers = blockedUserIds.map((id) => {
    const found = MOCK_USERS.find((u) => u.id === id);
    if (found) return found;
    return {
      id,
      name: 'کاربر مسدود شده',
      age: 28,
      gender: 'male' as const,
      city: 'نامشخص',
      province: 'ایران',
      distanceKm: 0,
      maritalStatus: 'مجرد',
      job: '',
      education: '',
      heightCm: 175,
      bio: '',
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      ],
      interests: [],
      hobbies: [],
      redLines: [],
      isVerified: false,
      isOnline: false,
    } as UserProfile;
  });

  const targetPerReward = 5;
  const currentBatch = inviteCount % targetPerReward;
  const progressPercent = Math.min(100, Math.round((currentBatch / targetPerReward) * 100));

  const handleSimulateInvite = () => {
    setInviteCount((prev) => prev + 1);
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let score = 25; // photo + name from telegram
    if (user.job?.trim()) score += 10;
    if (user.education?.trim()) score += 10;
    if (user.city?.trim()) score += 10;
    if (user.bio?.trim()) score += 15;
    if ((user.interests || []).length >= 3) score += 10;
    if ((user.hobbies || []).length >= 2) score += 10;
    if ((user.redLines || []).length >= 2) score += 10;
    return Math.min(100, score);
  };

  const completionPercent = calculateCompletion();

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-y-auto hide-scrollbar text-white pb-28">
      {/* 1. Header with VIP & Title */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-lg font-black text-white">پروفایل کاربری</h2>
          <p className="text-[11px] text-white/50">
            مدیریت مشخصات فردی، تنظیمات و دعوت از دوستان
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onReplayInitialSync && (
            <button
              type="button"
              onClick={onReplayInitialSync}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-bold transition-all active:scale-95"
              title="مشاهده مجدد انیمیشن استپ‌بار ساخت پروفایل تلگرام"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>مراحل ورود</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPaywall}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all ${
              isProUser
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            <Crown
              className={`w-3.5 h-3.5 ${
                isProUser
                  ? 'fill-emerald-400 text-emerald-400'
                  : 'fill-amber-400 text-amber-400'
              }`}
            />
            <span>{isProUser ? 'VIP Pro فعال' : 'ارتقا به VIP'}</span>
          </button>
        </div>
      </div>

      {/* 2. Telegram Synced Avatar & Profile Card */}
      <div className="w-full shrink-0 rounded-3xl bg-[#141522] border border-white/10 p-4 sm:p-5 relative overflow-hidden mb-3 shadow-lg">
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-sky-500/15 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          {/* Avatar (Telegram synced, read-only) */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] min-h-[64px] rounded-2xl overflow-hidden border-2 border-sky-400/60 shadow-lg shrink-0">
            <img
              src={user.photos[0]}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
              <Lock className="w-3.5 h-3.5 text-white/70" />
            </div>
          </div>

          {/* User info */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-black text-white truncate">{user.name}</h3>
              <CheckCircle2 className="w-4 h-4 fill-sky-400 text-slate-950 shrink-0" />
            </div>

            <span className="text-[11px] text-sky-300 font-medium flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>همگام‌سازی شده با تلگرام</span>
            </span>

            <p className="text-[10px] text-white/40 mt-1 leading-tight">
              عکس و نام از حساب تلگرام خوانده شده و غیرقابل تغییر است.
            </p>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.08] shrink-0">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-white/60 font-medium">میزان تکمیل پروفایل:</span>
            <span className="text-emerald-400 font-bold">
              {persianNumber(completionPercent)}٪
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button: Open Profile Wizard */}
        <button
          type="button"
          id="edit-profile-wizard-button"
          onClick={() => setIsWizardOpen(true)}
          className="w-full mt-3.5 min-h-[44px] h-11 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 active:scale-95 text-white font-black text-xs shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2 border border-purple-400/30 shrink-0"
        >
          <Edit3 className="w-4 h-4 text-purple-200 shrink-0" />
          <span>تکمیل / ویرایش پروفایل</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">
            {persianNumber(completionPercent)}٪ تکمیل شده
          </span>
        </button>
      </div>

      {/* 2.5. Match DNA (رادار سلیقه) Card */}
      {gamification && (
        <div className="mb-4 shrink-0">
          <MatchDnaBentoCard
            gamification={gamification}
            onOpenLevelPerks={onOpenGamification}
          />
        </div>
      )}

      {/* 3. Invite Friends Card (Directly underneath the Profile Card) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsInviteSheetOpen(true)}
        className="w-full shrink-0 relative rounded-3xl bg-gradient-to-br from-purple-950/60 via-[#18192a] to-indigo-950/60 border border-purple-500/30 p-4 sm:p-5 overflow-hidden shadow-xl mb-4 cursor-pointer hover:border-purple-400/50 active:scale-[0.99] transition-all group"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                  <span>دعوت از دوستان، دریافت ۱ هفته Pro</span>
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                </h3>
                <p className="text-[10px] sm:text-[11px] text-white/60 mt-0.5 leading-snug">
                  با هر ۵ دعوت موفق، ۱ هفته اشتراک ویژه رایگان بگیرید
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full shrink-0">
              <span>مشاهده</span>
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Progress bar inside card */}
          <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 space-y-1.5 shrink-0">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70 font-medium">دعوت‌های ثبت‌شده:</span>
              <span className="text-amber-300 font-bold">
                {persianNumber(inviteCount)} دوست ({persianNumber(currentBatch)} از ۵)
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500"
                style={{
                  width: `${currentBatch === 0 && inviteCount > 0 ? 100 : Math.max(8, progressPercent)}%`,
                }}
              />
            </div>
          </div>

          {/* Action indicator */}
          <div className="w-full flex items-center justify-between text-xs text-purple-300 pt-1 border-t border-white/5 shrink-0 gap-2">
            <span className="flex items-center gap-1.5 font-medium truncate min-w-0 flex-1">
              <Share2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">دریافت لینک اختصاصی و ارسال در تلگرام</span>
            </span>
            <span className="text-white/40 text-[11px] shrink-0">لمس کنید 👈</span>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Blocked Users Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsBlockedSheetOpen(true)}
        className="w-full shrink-0 relative rounded-3xl bg-[#141522] border border-white/10 p-4 sm:p-5 overflow-hidden shadow-lg mb-4 cursor-pointer hover:border-rose-500/40 active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
              <UserX className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-white">کاربران مسدود شده</h3>
                {resolvedBlockedUsers.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {persianNumber(resolvedBlockedUsers.length)} نفر
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/50">
                    خالی
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/50 mt-0.5 truncate">
                مشاهده لیست سیاه و امکان خارج کردن از مسدودی (آنبلاک)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-white/60 group-hover:text-white transition-colors shrink-0">
            <span>مدیریت</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Profile Wizard Full Modal / Sheet */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWizardOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full max-w-lg h-[92vh] max-h-[850px] bg-[#121320] border-t sm:border border-purple-500/30 rounded-t-[32px] sm:rounded-[32px] p-4 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">تکمیل و ویرایش اطلاعات</h3>
                    <p className="text-[10px] text-white/50">ویزارد استپ‌بار ۴ مرحله‌ای</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Wizard Form Container */}
              <div className="flex-1 overflow-y-auto hide-scrollbar pt-3">
                <ProfileWizard
                  initialProfile={user}
                  onSaveProfile={(updated) => {
                    onUpdateProfile(updated);
                    setIsWizardOpen(false);
                    if (onWizardComplete) {
                      onWizardComplete(updated);
                    }
                  }}
                  onCancel={() => setIsWizardOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Invite Friends Bottom Sheet */}
      <InviteFriendsBottomSheet
        isOpen={isInviteSheetOpen}
        onClose={() => setIsInviteSheetOpen(false)}
        isProUser={isProUser}
        onGrantWeekPro={onGrantWeekPro}
        inviteCount={inviteCount}
        onSimulateInvite={handleSimulateInvite}
      />

      {/* 7. Blocked Users Bottom Sheet */}
      <BlockedUsersBottomSheet
        isOpen={isBlockedSheetOpen}
        onClose={() => setIsBlockedSheetOpen(false)}
        blockedUsers={resolvedBlockedUsers}
        onUnblock={onUnblockUser}
      />
    </div>
  );
};
