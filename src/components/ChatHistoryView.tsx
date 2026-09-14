import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Lock,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  X,
  MessageSquare,
  MessageSquareX,
  Radio,
  UserX,
  ChevronLeft,
  Scale,
} from 'lucide-react';
import { ClosedChatRecord, UserProfile } from '../types';
import { persianNumber } from '../utils/persianNumbers';

import { UserAvatar } from './UserAvatar';

interface ChatHistoryViewProps {
  history: ClosedChatRecord[];
  activeChatUser: UserProfile | null;
  onOpenActiveChat: () => void;
  onGoToExplore: () => void;
  onDeleteRecord?: (recordId: string) => void;
}

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({
  history,
  activeChatUser,
  onOpenActiveChat,
  onGoToExplore,
  onDeleteRecord,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ClosedChatRecord | null>(null);
  const [showRulesSheet, setShowRulesSheet] = useState<boolean>(false);

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-y-auto hide-scrollbar select-none text-white pb-24">
      {/* 1. Header Bar with Title & Rules Bottom Sheet Trigger */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <span>تاریخچه چت‌ها</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              {persianNumber(history.length)} گفتگو
            </span>
          </h2>
          <p className="text-[11px] text-white/50 mt-0.5">
            آرشیو چت‌های پایان‌یافته • غیرقابل بازگشایی مجدد
          </p>
        </div>

        {/* Rules Icon Button (Top-left in RTL) */}
        <button
          type="button"
          id="rules-bottom-sheet-trigger-btn"
          onClick={() => setShowRulesSheet(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all active:scale-95 shadow-sm shrink-0"
          title="مشاهده قوانین"
        >
          <Scale className="w-4 h-4 text-purple-400" />
          <span>قوانین</span>
        </button>
      </div>

      {/* 2. Active Chat Reminder Card (if user has an ongoing active chat) */}
      {activeChatUser && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-purple-500/15 to-emerald-500/15 border border-emerald-500/30 shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <UserAvatar
                src={activeChatUser.photos?.[0]}
                name={activeChatUser.name}
                size="md"
                className="border-emerald-400"
              />
              <span className="absolute bottom-1 end-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>گفتگوی فعال در جریان</span>
              </div>
              <p className="text-[11px] text-white/80 font-bold truncate mt-0.5">
                در حال ارتباط با: {activeChatUser.name} ({persianNumber(activeChatUser.age)} ساله)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenActiveChat}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0c0d15] text-xs font-black shrink-0 transition-transform active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <span>ورود به چت</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* 3. History Records List or Empty State */}
      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mb-4 shadow-lg">
            <History className="w-9 h-9 text-purple-300 opacity-80" />
          </div>

          <h3 className="text-sm font-bold text-white mb-1.5">
            هنوز تاریخچه‌ای از چت‌های گذشته ثبت نشده است
          </h3>
          <p className="text-xs text-white/50 leading-relaxed max-w-[280px] mb-5">
            به محض شروع و پایان گفتگو با افراد آنلاین، متن چت در این بخش به عنوان تاریخچه نگهداری می‌شود.
          </p>

          <button
            type="button"
            onClick={onGoToExplore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <span>شروع جستجو در صفحه اصلی</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((record) => {
            const isClosedByMe = record.closedBy === 'me';

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="w-full rounded-2xl bg-[#141522] hover:bg-[#18192a] border border-white/[0.08] hover:border-purple-500/30 p-3.5 transition-all cursor-pointer shadow-md group relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      src={record.user.photos?.[0]}
                      name={record.user.name}
                      size="md"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors truncate">
                          {record.user.name}
                        </h4>
                        <span className="text-xs text-white/50">
                          ، {persianNumber(record.user.age)} ساله
                        </span>
                      </div>

                      {/* Snippet of last message */}
                      <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5 font-medium">
                        «{record.lastMessage || 'پیامی رد و بدل نشد'}»
                      </p>

                      {/* Closed Status */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold border ${
                            isClosedByMe
                              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          {isClosedByMe ? 'بسته شده توسط شما' : 'بسته شده توسط طرف مقابل'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ended time */}
                  <div className="flex items-center shrink-0">
                    <span className="text-[10px] text-white/40 font-mono">
                      {record.endedAt}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. READ-ONLY ARCHIVE MODAL (View Transcript of Closed Chat) */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[420px] max-h-[85vh] rounded-[28px] bg-[#121320] border border-purple-500/30 flex flex-col shadow-2xl overflow-hidden"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={selectedRecord.user.photos[0]}
                    alt={selectedRecord.user.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-white/15 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white truncate">
                      تاریخچه چت با {selectedRecord.user.name}
                    </h3>
                    <p className="text-[10px] text-white/50">
                      پایان‌یافته در {selectedRecord.endedAt} • مدت: {selectedRecord.durationText}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Closed Warning Banner */}
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 text-[11px] text-rose-300 flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>این گفتگو پایان یافته است و امکان ارسال پیام مجدد وجود ندارد.</span>
              </div>

              {/* Messages Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar min-h-[220px]">
                {selectedRecord.messages.map((msg) => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-purple-600/70 text-white rounded-br-xs'
                            : 'bg-[#1e1f30] text-white/90 border border-white/10 rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-white/40 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Disabled Bottom Action Area */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-center">
                <div className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-xs text-white/40 flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-white/30" />
                  <span>گفتگو مسدود و بسته شده است • غیرقابل بازگشایی</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 5. Rules Bottom Sheet */}
        {showRulesSheet && (
          <div
            id="rules-bottom-sheet-container"
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRulesSheet(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              id="rules-bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative z-10 w-full max-w-md bg-[#141524] border-t border-white/10 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
              dir="rtl"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4 shrink-0" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">قوانین گفتگو و تاریخچه</h3>
                    <p className="text-[11px] text-white/50 mt-0.5">اصول ارتباط و حریم خصوصی</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="close-rules-sheet-btn"
                  onClick={() => setShowRulesSheet(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rules Items */}
              <div className="my-4 space-y-2.5 overflow-y-auto hide-scrollbar text-xs leading-relaxed pr-0.5">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 font-bold text-xs mt-0.5">
                    ۱
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">قانون ارتباط تک‌نفره</h4>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      شما در هر لحظه فقط با ۱ نفر می‌توانید در ارتباط باشید تا کیفیت و تمرکز مکالمه حفظ شود. برای شروع گفتگوی جدید، باید گفتگوی فعلی بسته شود.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 font-bold text-xs mt-0.5">
                    ۲
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">حداقل زمان گفتگو (۱ دقیقه)</h4>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      برای جلوگیری از قطع سریع و رفتار نامناسب، دکمه بستن چت پس از گذشت ۶۰ ثانیه از اتصال برای طرفین فعال می‌گردد.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 font-bold text-xs mt-0.5">
                    ۳
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">بایگانی دائمی و عدم بازگشایی</h4>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      پس از بستن چت (توسط شما یا طرف مقابل)، مکالمه برای همیشه به تاریخچه منتقل شده و دیگر امکان بازگشایی یا ارسال پیام جدید وجود ندارد.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0 font-bold text-xs mt-0.5">
                    ۴
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">احترام و امنیت گفتار</h4>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      رعایت ادب و احترام متقابل الزامی است. شما در هر لحظه امکان گزارش تخلف یا مسدود کردن کاربران متخلف را دارید.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="rules-confirm-btn"
                onClick={() => setShowRulesSheet(false)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>متوجه شدم</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
