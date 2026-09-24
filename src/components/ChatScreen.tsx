import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Lock,
  Check,
  CheckCheck,
  ShieldCheck,
  MapPin,
  Sparkles,
  MoreVertical,
  Flag,
  UserX,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Heart,
  Ruler,
  Cigarette,
  Clock,
  AlertTriangle,
  Flame,
  Zap,
  DoorOpen,
  DoorClosed,
  Reply,
  Send,
} from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { persianNumber, formatDistance } from '../utils/persianNumbers';
import { OnlineBadge } from './OnlineBadge';
import { EndChatFeedbackModal } from './EndChatFeedbackModal';
import { FloatingXpFlyer } from './FloatingXpFlyer';
import { UserAvatar } from './UserAvatar';
import { triggerHaptic } from '../lib/telegram';

interface ChatScreenProps {
  user?: UserProfile;
  partner?: UserProfile;
  initialMessages?: ChatMessage[];
  connectedAt?: number;
  chatSessionId?: string;
  isClosedByPartner?: boolean;
  prefilledPrompt?: string;
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onBack: () => void;
  onCloseChat?: (
    closedBy: 'me' | 'partner',
    finalMessages: ChatMessage[],
    durationText: string,
    feedbackVibe?: 'great' | 'okay' | 'skipped'
  ) => void;
  onOpenPaywallForTelegram?: () => void;
  onTriggerPaywall?: () => void;
  isPro?: boolean;
  onSendMessage?: (text: string, replyTo?: { id: string; text: string; senderName?: string }) => void;
  onBlockUser?: (userId: string) => void;
  onReportUser?: (userId: string, reason: string) => void;
  onAddXP?: (xp: number) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  user: userProp,
  partner,
  initialMessages = [],
  connectedAt,
  chatSessionId,
  isClosedByPartner = false,
  prefilledPrompt,
  onMessagesChange,
  onBack,
  onCloseChat,
  onOpenPaywallForTelegram,
  onTriggerPaywall,
  isPro = false,
  onSendMessage,
  onBlockUser,
  onReportUser,
  onAddXP,
}) => {
  const user = userProp || partner;

  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [pendingCloseRole, setPendingCloseRole] = useState<'me' | 'partner'>('me');
  const [flyingXp, setFlyingXp] = useState<{ active: boolean; xp: number }>({
    active: false,
    xp: 0,
  });

  const handleOpenPaywall = onOpenPaywallForTelegram || onTriggerPaywall || (() => {});

  if (!user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0b0c14] text-white">
        <p className="text-sm text-white/70 mb-4">اطلاعات گفتگو در دسترس نیست.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-md hover:bg-purple-500 transition-colors"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    );
  }

  // 1-minute elapsed timer (Calculated continuously from actual connection timestamp)
  const calculateElapsed = () => {
    if (!connectedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - connectedAt) / 1000));
  };

  const [chatSecondsElapsed, setChatSecondsElapsed] = useState<number>(() => calculateElapsed());
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState<boolean>(false);
  const [showPartnerClosedModal, setShowPartnerClosedModal] = useState<boolean>(isClosedByPartner);

  // Trigger partner-closed modal if prop updates in real-time
  useEffect(() => {
    if (isClosedByPartner) {
      setShowPartnerClosedModal(true);
    }
  }, [isClosedByPartner]);

  useEffect(() => {
    setChatSecondsElapsed(calculateElapsed());
    const timer = setInterval(() => {
      setChatSecondsElapsed(calculateElapsed());
    }, 1000);
    return () => clearInterval(timer);
  }, [connectedAt]);

  const MIN_CHAT_DURATION = 60; // 60 seconds (1 minute)
  const canCloseChat = chatSecondsElapsed >= MIN_CHAT_DURATION;
  const remainingSecondsToClose = Math.max(0, MIN_CHAT_DURATION - chatSecondsElapsed);

  const formatChatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${persianNumber(secs)} ثانیه`;
    if (secs === 0) return `${persianNumber(mins)} دقیقه`;
    return `${persianNumber(mins)} دقیقه و ${persianNumber(secs)} ثانیه`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages.length > 0) return initialMessages;
    return [
      {
        id: `msg-${Date.now()}-1`,
        senderId: user?.id || 'partner',
        text: `سلام! خوشحالم که در مینی‌اپ باهم ارتباط گرفتیم 🌸 اگر تمایل داری می‌تونیم اینجا باهم گپ بزنیم.`,
        timestamp: 'همین الان',
        status: 'read',
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [suggestionChip, setSuggestionChip] = useState<string | null>(prefilledPrompt || null);

  // Update suggestionChip when icebreaker passes text
  useEffect(() => {
    if (prefilledPrompt) {
      setSuggestionChip(prefilledPrompt);
    }
  }, [prefilledPrompt]);
  const [replyingMessage, setReplyingMessage] = useState<ChatMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [reportReason, setReportReason] = useState('رفتار نامناسب یا الفاظ توهین‌آمیز');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Keep messages in sync when parent pushes real-time messages
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const sentText = inputText.trim();
    const currentReply = replyingMessage
      ? {
          id: replyingMessage.id,
          text: replyingMessage.text,
          senderName: replyingMessage.senderId === 'me' ? 'شما' : user.name,
        }
      : undefined;

    setInputText('');
    setReplyingMessage(null);

    if (onSendMessage) {
      onSendMessage(sentText, currentReply);
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      text: sentText,
      timestamp: new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
      replyTo: currentReply,
    };

    setMessages((prev) => {
      const next = [...prev, newMsg];
      if (onMessagesChange) onMessagesChange(next);
      return next;
    });

    // Realistic typing simulation
    setTimeout(() => {
      setIsTyping(true);
    }, 400);

    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        'خیلی خوشحال شدم از پیامت! نظرت چیه درباره علایقمون بیشتر بگیم؟ 😊',
        'چه جالب! منم دقیقاً باهات موافقم. توی پروفایلت خوندم که اهل این سبک هستی 🌿',
        'عالیه! اگه مایل باشی به نسخه Pro ارتقا بدی می‌تونیم توی تلگرام هم سریع‌تر و با ویس صحبت کنیم 🎧',
        'مرسی از پاسخت! امروزت چطور می‌گذره؟ ☕',
        'کاملاً درکت می‌کنم، این موضوع همیشه برام اولویت بوده ✨',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: user.id,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'read',
      };
      setMessages((prev) => {
        const next = [...prev, botMsg];
        if (onMessagesChange) onMessagesChange(next);
        return next;
      });
    }, 1800);
  };

  // Block handler
  const handleConfirmBlock = () => {
    setShowBlockConfirmModal(false);
    setShowOptionsMenu(false);
    if (onBlockUser) {
      onBlockUser(user.id);
    }
    showToast(`کاربر ${user.name} با موفقیت بلاک شد.`);
    setTimeout(() => {
      onBack();
    }, 800);
  };

  // Report handler
  const handleSubmitReport = () => {
    setShowReportModal(false);
    setShowOptionsMenu(false);
    if (onReportUser) {
      onReportUser(user.id, reportReason);
    }
    showToast('گزارش شما ثبت گردید و توسط تیم پشتیبانی بررسی می‌شود.');
  };

  // Photos for profile drawer
  const photos = user.photos && user.photos.length > 0 ? user.photos : [];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0c14] text-[#e8e9ed] relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-18 inset-x-4 z-50 p-3 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-500/40 text-white text-xs font-medium text-center shadow-lg backdrop-blur-md"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Chat Header */}
      <header className="h-16 px-3 bg-[#10111a]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between shrink-0 z-20">
        {/* Back and User Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
            title="بازگشت"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div
            onClick={() => setShowProfileDrawer(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <UserAvatar
                src={photos[0]}
                name={user.name}
                size="md"
                className="!rounded-full border-white/15 group-hover:border-purple-400 transition-colors"
              />
              {user.isOnline !== false ? (
                <OnlineBadge
                  size="md"
                  borderColor="border-[#10111a]"
                  className="absolute bottom-0 end-0"
                />
              ) : (
                <div className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full border-2 border-[#10111a] bg-white/30" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {user.name}
                </span>
                {user.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                {isTyping ? (
                  <span className="text-purple-400 font-bold flex items-center gap-1 animate-pulse">
                    <span>در حال نوشتن...</span>
                  </span>
                ) : user.isOnline !== false ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span>آنلاین</span>
                  </span>
                ) : (
                  <span className="text-white/50 truncate">
                    {user.lastSeen || 'آخرین بازدید: اخیراً'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions (Close Chat, Telegram Pro & Options Menu) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Close Chat Button (Strict 1-minute minimum lock) */}
          <button
            type="button"
            id="close-chat-action-btn"
            onClick={() => {
              if (!canCloseChat) {
                showToast(
                  `طبق قوانین، حداقل باید ۱ دقیقه (۶۰ ثانیه) از شروع گفتگو بگذرد تا بتوانید چت را ببندید. (${persianNumber(remainingSecondsToClose)} ثانیه باقی‌مانده)`
                );
                return;
              }
              setShowConfirmCloseModal(true);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
              canCloseChat
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'bg-white/[0.05] text-white/40 border border-white/10 hover:bg-white/[0.08]'
            }`}
            title={
              canCloseChat
                ? 'پایان و بستن گفتگو'
                : `بستن گفتگو (قفل تا ۱ دقیقه - ${persianNumber(remainingSecondsToClose)} ثانیه مانده)`
            }
          >
            {canCloseChat ? (
              <>
                <DoorOpen className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px] whitespace-nowrap">پایان گفتگو</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] whitespace-nowrap">
                  بستن ({persianNumber(remainingSecondsToClose)} ثانیه)
                </span>
              </>
            )}
          </button>

          {/* Three dots / Settings menu */}
          <div className="relative">
            <button
              type="button"
              id="chat-options-menu-btn"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              title="تنظیمات گفتگو"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showOptionsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowOptionsMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute end-0 top-10 w-52 rounded-2xl bg-[#181926] border border-white/10 shadow-2xl p-1.5 z-40 text-xs text-white"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowProfileDrawer(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-right hover:bg-white/5 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>مشاهده کامل پروفایل</span>
                    </button>

                    <button
                      type="button"
                      id="report-user-option-btn"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowReportModal(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-right hover:bg-white/5 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5 text-white/50" />
                      <span>گزارش تخلف کاربر</span>
                    </button>

                    <div className="h-px bg-white/10 my-1" />

                    <button
                      type="button"
                      id="block-user-option-btn"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowBlockConfirmModal(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-right hover:bg-rose-500/15 flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors font-semibold"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-400" />
                      <span>بلاک و مسدودسازی</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* 2. Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 hide-scrollbar">
        {/* Simultaneous Match Info Chip */}
        <div className="flex justify-center my-2">
          <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-emerald-500/15 to-purple-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>
              اتصال مستقیم آنی: شما و {user.name} همزمان در حال جستجو بودید
            </span>
          </div>
        </div>

        {/* Messages List with Swipe-to-Reply */}
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col relative ${isMe ? 'items-start' : 'items-end'}`}
            >
              {/* Swipeable container */}
              <motion.div
                drag="x"
                dragConstraints={{ left: -75, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -45) {
                    triggerHaptic('light');
                    setReplyingMessage(msg);
                  }
                }}
                className="max-w-[85%] relative flex items-center"
              >
                {/* Visual reply icon revealed on swipe left */}
                <div className="absolute -left-8 text-purple-400 opacity-60">
                  <Reply className="w-4 h-4" />
                </div>

                <div
                  className={`w-full rounded-[20px] px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-[#181926] text-white/90 border border-white/[0.08] rounded-bl-none'
                  }`}
                >
                  {/* Quoted Reply Header if this message replies to an older one */}
                  {msg.replyTo && (
                    <div
                      className={`mb-1.5 p-2 rounded-xl text-[11px] border-r-2 text-right ${
                        isMe
                          ? 'bg-black/20 border-white/80 text-white/90'
                          : 'bg-white/5 border-purple-400 text-white/80'
                      }`}
                    >
                      <span className="font-bold text-[10px] text-purple-200 block mb-0.5">
                        {msg.replyTo.senderName || 'پاسخ به'}:
                      </span>
                      <p className="line-clamp-1 opacity-80">{msg.replyTo.text}</p>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-white/65 justify-end' : 'text-white/45 justify-start'
                    }`}
                  >
                    <span>{persianNumber(msg.timestamp)}</span>
                    {isMe && (
                      <CheckCheck className="w-3 h-3 text-sky-300" />
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Typing Bubble */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#181926] border border-white/[0.08] w-fit shadow-sm self-end"
          >
            <span className="text-[10px] text-purple-300/80 ms-1 font-medium">
              {user.name} در حال نوشتن است
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

        {/* 3. Input Footer */}
        <footer className="p-3 bg-[#10111a]/95 backdrop-blur-md border-t border-white/[0.08] shrink-0 z-20">
          {/* Active Reply Banner */}
        {replyingMessage && !isClosedByPartner && (
          <div className="mb-2 p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Reply className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="min-w-0 text-right">
                <span className="font-bold text-[10px] text-purple-300 block">
                  پاسخ به {replyingMessage.senderId === 'me' ? 'خودتان' : user.name}:
                </span>
                <p className="text-[11px] text-white/80 truncate">{replyingMessage.text}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReplyingMessage(null)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Action Suggestion Chip above Input */}
        {!isClosedByPartner && suggestionChip && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2.5 p-2 px-3 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#18192c] to-indigo-950/60 border border-purple-500/30 flex items-center justify-between gap-2 shadow-sm text-xs"
          >
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setInputText(suggestionChip);
                setSuggestionChip(null);
              }}
              className="flex-1 text-right flex items-center gap-1.5 min-w-0 cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="text-[11px] font-bold text-purple-200 truncate group-hover:text-white transition-colors">
                {suggestionChip}
              </span>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  const textToSend = suggestionChip;
                  setSuggestionChip(null);
                  setInputText('');
                  if (onSendMessage) {
                    onSendMessage(textToSend);
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold text-[10px] shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3 -rotate-45" />
                <span>ارسال</span>
              </button>
              <button
                type="button"
                onClick={() => setSuggestionChip(null)}
                className="w-5 h-5 rounded-full hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}

        {isClosedByPartner ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <div className="flex items-center gap-2">
                <DoorClosed className="w-4 h-4 text-amber-400 shrink-0" />
                <span>این گفتگو توسط طرف مقابل بسته شد.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onCloseChat) {
                    onCloseChat(
                      'partner',
                      messages,
                      formatChatDuration(chatSecondsElapsed),
                      'okay'
                    );
                  } else {
                    onBack();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
              >
                پایان و خروج
              </button>
            </div>
          ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="پیامی بنویسید..."
                className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              id="chat-send-btn"
              title="ارسال پیام"
              disabled={!inputText.trim()}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                inputText.trim()
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md active:scale-95 hover:opacity-95'
                  : 'bg-white/[0.05] text-white/30 cursor-not-allowed'
              }`}
            >
              <svg
                className="w-5 h-5 text-current"
                viewBox="0 0 123 123"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_540_2995)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M120.247 44.5801L5.2467 0.370049C4.5914 0.0447391 3.85309 -0.0749663 3.12856 0.0266263C2.40404 0.128219 1.72713 0.446368 1.18656 0.939363C0.645997 1.43236 0.267011 2.07719 0.0992966 2.78932C-0.068418 3.50144 -0.0170366 4.24763 0.246704 4.93005L44.2467 120.54C44.4985 121.205 44.94 121.781 45.5164 122.198C46.0929 122.614 46.7789 122.852 47.4893 122.882C48.1997 122.911 48.9032 122.732 49.5125 122.365C50.1218 121.999 50.6101 121.462 50.9167 120.82L68.6467 84.14L33.4567 33.7701L83.7267 68.86L120.517 51.2401C121.156 50.933 121.691 50.4457 122.056 49.8381C122.421 49.2306 122.6 48.5295 122.571 47.8213C122.543 47.1131 122.307 46.4288 121.894 45.8528C121.481 45.2768 120.908 44.8344 120.247 44.5801Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_540_2995">
                    <rect width="122.56" height="122.88" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </form>
        )}
      </footer>

      {/* 4. Rich Profile Drawer Modal */}
      <AnimatePresence>
        {showProfileDrawer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileDrawer(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-[440px] bg-[#141522] border-t border-white/10 rounded-t-[36px] p-5 text-white z-10 max-h-[85dvh] overflow-y-auto hide-scrollbar"
            >
              {/* Drawer Handle */}
              <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-3" />

              {/* Photo Gallery Carousel */}
              <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-white/10 shadow-lg mb-4 bg-black/40 flex items-center justify-center">
                {photos.length > 0 && photos[activePhotoIndex] && !photos[activePhotoIndex].includes('unsplash.com') ? (
                  <img
                    src={photos[activePhotoIndex]}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserAvatar
                    src={null}
                    name={user.name}
                    size="xl"
                    className="!w-full !h-full !rounded-none"
                  />
                )}

                {/* Photo navigation buttons */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute start-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute end-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Indicator dots */}
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                      {photos.map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === activePhotoIndex
                              ? 'w-6 bg-white shadow-sm'
                              : 'w-1.5 bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Compatibility badge */}
                <div className="absolute top-3 end-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1 text-[11px] font-bold text-pink-300 shadow-md">
                  <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                  <span>{persianNumber(user.compatibilityScore || 92)}٪ سازگاری هوشمند</span>
                </div>

                {/* Online status indicator */}
                <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-[11px] font-medium text-white shadow-md">
                  {user.isOnline !== false ? (
                    <>
                      <OnlineBadge size="sm" />
                      <span className="text-emerald-300 font-bold">هم‌اکنون آنلاین</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-white/50" />
                      <span className="text-white/70">{user.lastSeen || 'آخرین بازدید اخیراً'}</span>
                    </>
                  )}
                </div>
              </div>

              {/* User Identity & Info Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">
                      {user.name}، {persianNumber(user.age)} سال
                    </h3>
                    {user.isVerified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تایید هویت شده</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-purple-300/90 font-medium mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>{user.job}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-white/40" />
                  <span>{user.city} • {formatDistance(user.distanceKm)} فاصله</span>
                </div>
              </div>

              {/* Key Attributes Bento Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/40 block">تحصیلات</span>
                    <span className="text-xs font-semibold text-white/90 truncate block">
                      {user.education}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-300 shrink-0">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/40 block">قد</span>
                    <span className="text-xs font-semibold text-white/90 block">
                      {persianNumber(user.heightCm)} سانتی‌متر
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-300 shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/40 block">وضعیت تاهل</span>
                    <span className="text-xs font-semibold text-white/90 block">
                      {user.maritalStatus}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-300 shrink-0">
                    <Cigarette className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-white/40 block">دخانیات</span>
                    <span className="text-xs font-semibold text-white/90 block">
                      {user.smokingStatus || 'سیگاری نیستم'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <span className="text-[11px] text-white/50 block mb-1.5 font-medium">
                  درباره من و نگرش زندگی:
                </span>
                <p className="text-xs text-white/85 leading-relaxed">
                  «{user.bio}»
                </p>
              </div>

              {/* Lifestyle Chips */}
              {user.lifestyle && user.lifestyle.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] text-white/50 block mb-2 font-medium">
                    سبک زندگی و عادات:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.lifestyle.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests Chips */}
              {user.interests && user.interests.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] text-white/50 block mb-2 font-medium">
                    علاقه‌مندی‌ها و سلیقه‌ها:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-200 text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hobbies Chips */}
              {user.hobbies && user.hobbies.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] text-white/50 block mb-2 font-medium">
                    تفریحات و اوقات فراغت:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.hobbies.map((hobby, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs font-medium"
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Lines Chips */}
              {user.redLines && user.redLines.length > 0 && (
                <div className="mb-5">
                  <span className="text-[11px] text-rose-300/70 block mb-2 font-medium">
                    خط قرمزها در ارتباط:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.redLines.map((line, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  id="chat-in-telegram-pro-btn"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    handleOpenPaywall();
                  }}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 via-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition-all"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>انتقال به گفتگوی تلگرام</span>
                  <span className="px-1.5 py-0.5 bg-amber-400 text-[#0c0d15] text-[9px] font-black rounded uppercase">
                    PRO
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDrawer(false);
                      setShowReportModal(true);
                    }}
                    className="flex-1 h-10 rounded-xl bg-white/[0.04] hover:bg-amber-500/10 border border-white/10 text-amber-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-400" />
                    <span>گزارش تخلف</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDrawer(false);
                      setShowBlockConfirmModal(true);
                    }}
                    className="flex-1 h-10 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 border border-white/10 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserX className="w-3.5 h-3.5 text-rose-400" />
                    <span>بلاک کاربر</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Report User Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-[360px] rounded-3xl bg-[#181926] border border-amber-500/30 p-5 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Flag className="w-4 h-4" />
                  <span>گزارش تخلف {user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/70 mb-4 leading-relaxed">
                لطفاً دلیل گزارش خود را انتخاب کنید تا توسط تیم پشتیبانی بررسی شود:
              </p>

              <div className="space-y-2 mb-5">
                {[
                  'رفتار نامناسب یا الفاظ توهین‌آمیز',
                  'پروفایل جعلی یا جعل هویت',
                  'ارسال پیام‌های تبلیغاتی یا اسپم',
                  'ارسال محتوای غیراخلاقی',
                  'سایر موارد',
                ].map((reason) => (
                  <label
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      reportReason === reason
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 font-medium'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{reason}</span>
                    <input
                      type="radio"
                      name="report-reason"
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="accent-amber-400"
                    />
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-md active:scale-98 transition-all"
                >
                  ثبت و ارسال گزارش
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Block User Confirmation Modal */}
      <AnimatePresence>
        {showBlockConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-[340px] rounded-3xl bg-[#181926] border border-rose-500/30 p-5 text-white shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <UserX className="w-6 h-6" />
              </div>

              <h4 className="text-base font-bold text-white mb-2">
                مسدودسازی {user.name}
              </h4>

              <p className="text-xs text-white/70 leading-relaxed mb-5">
                آیا از مسدود کردن این کاربر اطمینان دارید؟ تمام پیام‌های این مکالمه حذف شده و دیگر امکان دریافت پیام از سوی ایشان وجود نخواهد داشت.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  id="confirm-block-action-btn"
                  onClick={handleConfirmBlock}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  <span>بله، کاربر را بلاک کن</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBlockConfirmModal(false)}
                  className="w-full h-9 rounded-xl text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Modal: Confirm Close Chat by User */}
      <AnimatePresence>
        {showConfirmCloseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-[#151624] border border-rose-500/30 p-5 text-center shadow-2xl"
              dir="rtl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <DoorClosed className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-white mb-2">
                بستن و پایان این گفتگو؟
              </h3>

              <p className="text-xs text-white/70 leading-relaxed mb-4">
                توجه داشته باشید که پس از پایان، این گفتگو برای همیشه بسته شده و به بخش <span className="text-purple-300 font-bold">«تاریخچه چت‌ها»</span> منتقل می‌گردد و <span className="text-rose-400 font-bold">دیگر امکان بازگشایی مجدد یا ارسال پیام وجود نخواهد داشت</span>.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  id="confirm-close-chat-btn"
                  onClick={() => {
                    setShowConfirmCloseModal(false);
                    // Direct close without survey modal (temporarily disabled)
                    if (onCloseChat) {
                      onCloseChat(
                        'me',
                        messages,
                        formatChatDuration(chatSecondsElapsed),
                        'okay'
                      );
                    } else {
                      onBack();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  بستن قطعی گفتگو و انتقال به تاریخچه
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmCloseModal(false)}
                  className="w-full py-2 rounded-xl text-white/60 hover:text-white text-xs font-semibold transition-colors"
                >
                  ادامه چت و انصراف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Modal: Partner Ended Chat Notification */}
      <AnimatePresence>
        {showPartnerClosedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-3xl bg-[#151624] border border-amber-500/30 p-5 text-center shadow-2xl"
              dir="rtl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <DoorClosed className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-white mb-2">
                طرف مقابل گفتگو را به پایان رساند
              </h3>

              <p className="text-xs text-white/70 leading-relaxed mb-4">
                کاربر «{user.name}» گفتگو را بست. طبق قوانین آی‌دوست، این گفتگو پایان یافت و به بخش «تاریخچه چت‌ها» منتقل گردید.
              </p>

              <button
                type="button"
                id="ack-partner-closed-btn"
                onClick={() => {
                  setShowPartnerClosedModal(false);
                  // Direct close without survey modal (temporarily disabled)
                  if (onCloseChat) {
                    onCloseChat(
                      'partner',
                      messages,
                      formatChatDuration(chatSecondsElapsed),
                      'okay'
                    );
                  } else {
                    onBack();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all"
              >
                انتقال به تاریخچه چت‌ها
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. Post-Chat Micro-Feedback Modal (Temporarily Disabled) */}
      {/* <EndChatFeedbackModal
        isOpen={showFeedbackModal}
        partnerName={user.name}
        onFeedback={(vibe) => {
          const xpAmount = vibe === 'great' ? 30 : 10;
          setFlyingXp({ active: true, xp: xpAmount });
          if (onAddXP) onAddXP(xpAmount);

          setTimeout(() => {
            setShowFeedbackModal(false);
            if (onCloseChat) {
              onCloseChat(
                pendingCloseRole,
                messages,
                formatChatDuration(chatSecondsElapsed),
                vibe
              );
            } else {
              onBack();
            }
          }, 950);
        }}
        onSkip={() => {
          setShowFeedbackModal(false);
          if (onCloseChat) {
            onCloseChat(
              pendingCloseRole,
              messages,
              formatChatDuration(chatSecondsElapsed),
              'skipped'
            );
          } else {
            onBack();
          }
        }}
      /> */}

      {/* 10. Flying XP Flyer GSAP Animation */}
      <FloatingXpFlyer xp={flyingXp.xp} active={flyingXp.active} />
    </div>
  );
};
