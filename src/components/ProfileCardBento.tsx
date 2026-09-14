import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  CheckCircle2,
  MapPin,
  Heart,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  Flame,
} from 'lucide-react';
import { UserProfile } from '../types';
import { toPersianDigits, formatDistance, formatAge } from '../utils/persianNumbers';

import { UserAvatar } from './UserAvatar';

interface ProfileCardBentoProps {
  user: UserProfile;
  isFront?: boolean;
}

export const ProfileCardBento: React.FC<ProfileCardBentoProps> = ({
  user,
  isFront = true,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  // 3D Perspective interactive spring tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [6, -6]), {
    stiffness: 280,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-6, 6]), {
    stiffness: 280,
    damping: 24,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFront) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
    }
  };

  return (
    <motion.div
      style={{
        perspective: 1000,
      }}
      className="w-full h-full flex flex-col justify-start"
    >
      <motion.div
        style={{
          rotateX: isFront ? rotateX : 0,
          rotateY: isFront ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full rounded-[28px] bg-[#12131c]/95 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.55)] overflow-y-auto no-scrollbar flex flex-col transition-colors duration-300 select-none"
      >
        {/* TOP SECTION: Large Hero Photo with Interactive Carousel */}
        <div className="relative w-full h-[320px] shrink-0 bg-[#181a26] overflow-hidden rounded-t-[26px] flex items-center justify-center">
          {user.photos && user.photos.length > 0 && user.photos[currentPhotoIndex] && !user.photos[currentPhotoIndex].includes('unsplash.com') ? (
            <img
              src={user.photos[currentPhotoIndex] || user.photos[0]}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-500 ease-out"
              loading="eager"
            />
          ) : (
            <UserAvatar
              src={null}
              name={user.name}
              size="xl"
              className="!w-full !h-full !rounded-none"
            />
          )}

          {/* Photo Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12131c] via-black/20 to-black/60 pointer-events-none" />

          {/* Top Indicators: Photo progress bars & Badges */}
          <div className="absolute top-3 inset-x-3 flex flex-col gap-2 pointer-events-none z-10">
            {/* Story-like photo dashes */}
            {user.photos.length > 1 && (
              <div className="flex items-center gap-1.5 w-full px-1">
                {user.photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      idx === currentPhotoIndex
                        ? 'bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                        : 'bg-white/25'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Top Badges row */}
            <div className="flex items-center justify-between w-full mt-1">
              {/* Distance pill (Pastel Mint accent) */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-medium">
                <MapPin className="w-3 h-3 text-emerald-300" />
                <span>{formatDistance(user.distanceKm)}</span>
              </div>

              {/* Compatibility Pill (Pastel Lavender/Purple accent) */}
              {user.compatibilityScore && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/60 backdrop-blur-md border border-purple-400/30 text-purple-200 text-[11px] font-medium shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  <span>{toPersianDigits(user.compatibilityScore)}٪ هم‌سلیقه</span>
                </div>
              )}
            </div>
          </div>

          {/* Photo Navigation Touch Areas (Left and Right halves) */}
          {user.photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                aria-label="عکس قبلی"
                className="absolute inset-y-0 start-0 w-1/3 flex items-center justify-start ps-3 text-white/40 hover:text-white/80 opacity-0 hover:opacity-100 transition-opacity z-10"
              >
                <div className="p-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                aria-label="عکس بعدی"
                className="absolute inset-y-0 end-0 w-1/3 flex items-center justify-end pe-3 text-white/40 hover:text-white/80 opacity-0 hover:opacity-100 transition-opacity z-10"
              >
                <div className="p-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <ChevronLeft className="w-5 h-5" />
                </div>
              </button>
            </>
          )}

          {/* Bottom of Photo: Name, Age, Verification */}
          <div className="absolute bottom-3 inset-x-4 pointer-events-none z-10">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                {user.name}
              </h2>
              <span className="text-xl font-bold text-white/80">
                {formatAge(user.age)}
              </span>
              {user.isVerified && (
                <div
                  className="flex items-center justify-center text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                  title="هویت تایید شده در تلگرام"
                >
                  <CheckCircle2 className="w-5 h-5 fill-sky-400 text-slate-950" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/70 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span>{user.city}</span>
            </div>
          </div>
        </div>

        {/* BENTO GRID DETAILS SECTION */}
        <div className="p-4 flex flex-col gap-3 grow">
          {/* Row 1: Marital Status & Job / Career Bento Block */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Bento Cell A: Marital Status (Soft Peach Accent) */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col justify-between hover:border-orange-300/30 transition-colors">
              <div className="flex items-center justify-between text-white/50 text-[11px] mb-1">
                <span>وضعیت تاهل</span>
                <Heart className="w-3.5 h-3.5 text-rose-300/80" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-400/80"></span>
                <span className="text-xs font-semibold text-white/90">
                  {user.maritalStatus}
                </span>
              </div>
            </div>

            {/* Bento Cell B: Height & Vital stats (Soft Mint Accent) */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col justify-between hover:border-emerald-300/30 transition-colors">
              <div className="flex items-center justify-between text-white/50 text-[11px] mb-1">
                <span>قد و سلامت</span>
                <Flame className="w-3.5 h-3.5 text-emerald-300/80" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/80"></span>
                <span className="text-xs font-semibold text-white/90">
                  {toPersianDigits(user.heightCm)} سانتی‌متر
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Job & Education Bento Block */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-300 flex items-center justify-center shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="truncate font-medium">{user.job}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{user.education}</span>
            </div>
          </div>

          {/* Row 3: Bio / About Me Bento Block */}
          <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.07] p-3.5">
            <div className="flex items-center gap-1.5 text-purple-200/90 text-xs font-semibold mb-1.5">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>درباره من</span>
            </div>
            <p className="text-xs leading-relaxed text-white/75 text-justify">
              {user.bio}
            </p>
          </div>

          {/* Row 4: Interests Tags Bento Block (Pastel Pills) */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/80">
                علاقه‌مندی‌ها و سرگرمی‌ها
              </span>
              <span className="text-[10px] text-white/40">
                {toPersianDigits(user.interests.length)} مورد
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {user.interests.map((tag, idx) => {
                // Alternating soft pastel pill colors for aesthetic balance
                const styles = [
                  'bg-purple-500/10 text-purple-200 border-purple-500/20',
                  'bg-emerald-500/10 text-emerald-200 border-emerald-500/20',
                  'bg-rose-500/10 text-rose-200 border-rose-500/20',
                  'bg-sky-500/10 text-sky-200 border-sky-500/20',
                  'bg-amber-500/10 text-amber-200 border-amber-500/20',
                ];
                const styleClass = styles[idx % styles.length];

                return (
                  <span
                    key={tag}
                    className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${styleClass}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Row 5: Lifestyle quick tags if present */}
          {user.lifestyle && user.lifestyle.length > 0 && (
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 flex items-center justify-between text-xs">
              <span className="text-white/50 text-[11px]">سبک زندگی:</span>
              <div className="flex items-center gap-2">
                {user.lifestyle.map((life) => (
                  <span
                    key={life}
                    className="text-[10px] text-white/70 bg-white/[0.06] px-2 py-0.5 rounded-md"
                  >
                    {life}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
