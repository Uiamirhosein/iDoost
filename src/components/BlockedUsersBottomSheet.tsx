import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserX,
  X,
  ShieldCheck,
  UserCheck,
  MapPin,
  AlertCircle,
  Search,
} from 'lucide-react';
import { UserProfile } from '../types';
import { persianNumber } from '../utils/persianNumbers';

interface BlockedUsersBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  blockedUsers: UserProfile[];
  onUnblock: (userId: string) => void;
}

export const BlockedUsersBottomSheet: React.FC<BlockedUsersBottomSheetProps> = ({
  isOpen,
  onClose,
  blockedUsers,
  onUnblock,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const filteredUsers = blockedUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    (u.city && u.city.includes(searchTerm.trim()))
  );

  const handleUnblockClick = (userId: string) => {
    setUnblockingId(userId);
    setTimeout(() => {
      onUnblock(userId);
      setUnblockingId(null);
    }, 400);
  };

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
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-[430px] bg-[#121320] border-t sm:border border-rose-500/30 rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-3 shrink-0" />

            {/* Header */}
            <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">کاربران مسدود شده</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {persianNumber(blockedUsers.length)} نفر
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50">
                    مدیریت لیست سیاه و خارج کردن از مسدودی (آنبلاک)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/70 transition-colors"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter if list has several users */}
            {blockedUsers.length > 2 && (
              <div className="px-4 pt-3 shrink-0">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در افراد مسدود شده..."
                    className="w-full bg-[#18192a] border border-white/10 rounded-2xl px-9 py-2 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-rose-400/50 transition-all"
                  />
                  <Search className="w-4 h-4 text-white/40 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content List */}
            <div className="p-4 space-y-2.5 overflow-y-auto max-h-[55vh] hide-scrollbar">
              {blockedUsers.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">لیست مسدودی خالی است</h4>
                  <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                    شما در حال حاضر هیچ کاربری را مسدود نکرده‌اید. اگر در هر گفتگویی احساس ناراحتی کردید می‌توانید کاربر را بلاک کنید.
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-white/50 text-xs">
                  کاربری با این مشخصات در لیست مسدود شده‌ها یافت نشد.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isBeingUnblocked = unblockingId === user.id;

                  return (
                    <motion.div
                      key={user.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#18192a] border border-white/10 hover:border-white/20 transition-all"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-rose-500/30 shrink-0 bg-white/5">
                          <img
                            src={user.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover grayscale opacity-80"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                            <UserX className="w-4 h-4 text-rose-400" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                            <span className="text-[10px] text-white/40">
                              ({persianNumber(user.age)} سال)
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-white/50 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-rose-400/80 shrink-0" />
                            <span className="truncate">{user.city || user.province || 'ایران'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Unblock Action Button */}
                      <button
                        type="button"
                        onClick={() => handleUnblockClick(user.id)}
                        disabled={isBeingUnblocked}
                        className={`shrink-0 ms-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isBeingUnblocked
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 scale-95'
                            : 'bg-white/10 border-white/15 text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-300 active:scale-95'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isBeingUnblocked ? 'در حال خروج...' : 'آنبلاک'}</span>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Bottom info note */}
            <div className="p-3.5 bg-black/40 border-t border-white/5 flex items-start gap-2 text-[11px] text-white/50 shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                با آنبلاک کردن، کاربر دوباره می‌تواند در جستجوها و چت‌ها با شما ارتباط برقرار کند.
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
