import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircle, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { UserProfile, MatchItem } from '../types';
import { persianNumber } from '../utils/persianNumbers';
import { OnlineBadge } from './OnlineBadge';

import { UserAvatar } from './UserAvatar';

interface MatchesViewProps {
  matches: MatchItem[];
  onSelectUserForChat: (user: UserProfile) => void;
  onGoToExplore: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  onSelectUserForChat,
  onGoToExplore,
}) => {
  return (
    <div className="w-full h-full flex flex-col p-4 overflow-y-auto hide-scrollbar select-none text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>گفتگوها و همسان‌ها</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              {persianNumber(matches.length)} گفتگو
            </span>
          </h2>
          <p className="text-[11px] text-white/50">
            چت‌های فعال درون‌برنامه‌ای و هم‌صحبت‌های شما
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {matches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          {/* Pastel Glowing Icon Container */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-pink-500/10 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <Heart className="w-10 h-10 text-rose-300 animate-pulse" />
            <div className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-purple-500/30 border border-purple-300/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            </div>
          </div>

          <h3 className="text-base font-bold text-white mb-2">
            هنوز گفتگویی شروع نشده است
          </h3>
          <p className="text-xs text-white/60 leading-relaxed max-w-[280px] mb-6">
            با جستجوی شانسی یا جستجو طبق فیلتر در صفحه اصلی، با افراد آنلاین هم‌صحبت شوید.
          </p>

          <button
            type="button"
            onClick={onGoToExplore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-[0_4px_16px_rgba(168,85,247,0.3)] transition-all"
          >
            <span>شروع جستجوی هم‌صحبت</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      ) : (
        /* MATCHES LIST VIEW */
        <div className="flex flex-col gap-3">
          {/* New Likes Story Bar */}
          <div className="mb-2">
            <span className="text-xs font-semibold text-white/70 block mb-2.5">
              هم‌صحبت‌های آنلاین
            </span>
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-1">
              {matches
                .filter((item) => item && item.user)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectUserForChat(item.user)}
                    className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                  >
                    <div className="relative rounded-2xl p-0.5 bg-gradient-to-tr from-purple-400 via-pink-400 to-rose-400 shadow-md">
                      <UserAvatar
                        src={item.user.photos?.[0]}
                        name={item.user.name}
                        size="lg"
                      />
                      {item.isOnline && (
                        <OnlineBadge
                          size="md"
                          borderColor="border-[#12131d]"
                          className="absolute bottom-0.5 end-0.5"
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-white/80 group-hover:text-purple-200 truncate max-w-[64px]">
                      {item.user.name?.split(' ')[0] || 'کاربر'}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Conversations List */}
          <span className="text-xs font-semibold text-white/70 mt-1 mb-1">
            پیام‌ها و چت‌های درون‌برنامه
          </span>

          {matches
            .filter((match) => match && match.user)
            .map((match) => (
              <div
                key={match.id}
                onClick={() => onSelectUserForChat(match.user)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <UserAvatar
                      src={match.user.photos?.[0]}
                      name={match.user.name}
                      size="md"
                    />
                    {match.isOnline && (
                      <OnlineBadge
                        size="sm"
                        borderColor="border-[#12131d]"
                        className="absolute bottom-1 end-1"
                      />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-purple-200 transition-colors">
                        {match.user.name || 'کاربر'}
                      </span>
                    <span className="text-[11px] text-white/40">
                      {persianNumber(match.user.age)} سال
                    </span>
                    {match.user.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>

                  <p className="text-[11px] text-white/60 truncate mt-0.5">
                    {match.lastMessage || 'مکالمه آغاز شد'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0 ms-2">
                <span className="text-[10px] text-white/40">{match.matchedAt}</span>
                <button
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[10px] font-semibold transition-colors border border-purple-500/20"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>گفتگو</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
