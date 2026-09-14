import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, ShieldCheck, Copy, Check, X, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';
import { formatAge } from '../utils/persianNumbers';

interface TelegramConnectModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsReady(false);
      setIsCopied(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 25;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsReady(true), 0);
          return 100;
        }
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleCopyHandle = () => {
    if (user?.telegramHandle) {
      navigator.clipboard?.writeText(user.telegramHandle);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDirectTelegram = () => {
    if (user?.telegramHandle) {
      const cleanHandle = user.telegramHandle.replace('@', '');
      window.open(`https://t.me/${cleanHandle}`, '_blank');
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[380px] rounded-[28px] bg-[#141521] border border-purple-500/25 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] z-10 flex flex-col items-center text-center text-white overflow-hidden"
          >
            {/* Top glowing ambient effect */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-purple-500/20 via-pink-500/10 to-transparent pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              id="close-connect-modal"
              onClick={onClose}
              className="absolute top-4 start-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>

            {/* User Avatar with pulse ring */}
            <div className="relative mt-2 mb-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <img
                  src={user.photos[0]}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-[#229ED9] flex items-center justify-center text-white shadow-md border-2 border-[#141521]">
                <Send className="w-3.5 h-3.5 -scale-x-100 transform" />
              </div>
            </div>

            {/* User Details */}
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <span className="text-sm text-white/70">{formatAge(user.age)}</span>
              {user.isVerified && (
                <CheckCircle2 className="w-4 h-4 fill-sky-400 text-slate-950" />
              )}
            </div>

            {/* Telegram handle badge - hidden for privacy */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 mb-5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>اتصال مستقیم و امن تلگرام فعال شد</span>
            </div>

            {/* Status Message (Crucial Prompt Requirement) */}
            <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-purple-200">
                {!isReady ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    <span>در حال انتقال به چت تلگرام...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>آماده برقراری ارتباط در تلگرام</span>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/50 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                <span>ارتباط مستقیم و امن بر بستر تلگرام</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                id="direct-open-telegram-btn"
                onClick={handleDirectTelegram}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#1E88E5] hover:brightness-105 text-white text-xs font-bold shadow-[0_4px_20px_rgba(34,158,217,0.35)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4 -scale-x-100 transform" />
                <span>باز کردن چت در تلگرام</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                id="cancel-connect-btn"
                onClick={onClose}
                className="w-full h-11 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-colors"
              >
                انصراف و بازگشت
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
