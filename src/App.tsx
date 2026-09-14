import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './components/BottomNav';
import { HomeBentoGrid } from './components/HomeBentoGrid';
import { FilterSearchModal } from './components/FilterSearchModal';
import { SearchingRadarModal } from './components/SearchingRadarModal';
import { ChatScreen } from './components/ChatScreen';
import { PaywallModal } from './components/PaywallModal';
import { ChatHistoryView } from './components/ChatHistoryView';
import { MyProfileView } from './components/MyProfileView';
import { InitialProfileSyncModal } from './components/InitialProfileSyncModal';
import {
  CURRENT_USER,
  calculateMutualCompatibility,
  INITIAL_CHAT_HISTORY,
} from './mockData';
import { UserProfile, SearchFilterState, ActiveTab, ChatMessage, ClosedChatRecord } from './types';
import { persianNumber } from './utils/persianNumbers';
import {
  GamificationState,
  LevelConfig,
  getStoredGamificationState,
  saveGamificationState,
  calculateLevelFromXP,
  calculateLevelFromState,
} from './utils/gamification';
import { LevelUpModal } from './components/LevelUpModal';
import { GamificationPerksModal } from './components/GamificationPerksModal';
import {
  getTelegramUser,
  initTelegramWebApp,
  isRealTelegramClient,
  TelegramUser,
} from './lib/telegram';
import {
  syncTelegramUser,
  startRandomMatch,
  cancelMatchSearch,
  subscribeToMatchQueue,
  fetchSessionMessages,
  sendChatMessage,
  subscribeToChatMessages,
  subscribeToChatSessionStatus,
  closeChatSession,
  fetchBlockedUsers,
  blockUser,
  unblockUser,
  getSavedChatHistory,
  saveChatRecordToHistory,
  triggerDailyDatabasePurge,
  fetchUserActiveChatSession,
} from './lib/supabase';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');

  // Gamification & Level Engine
  const [gamification, setGamification] = useState<GamificationState>(getStoredGamificationState);
  const [celebratingLevel, setCelebratingLevel] = useState<LevelConfig | null>(null);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState<boolean>(false);

  // Telegram User & Supabase sync state
  const [currentTgUser, setCurrentTgUser] = useState<TelegramUser>(getTelegramUser);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);

  // Freemium / Pro State: Filtered Search is limited to 3 uses
  const [filteredSearchRemaining, setFilteredSearchRemaining] = useState<number>(3);
  const [isProUser, setIsProUser] = useState<boolean>(false);

  // Modals & Active Screen states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [paywallReason, setPaywallReason] = useState<
    'limit_reached' | 'telegram_export' | 'general'
  >('general');

  // Searching States
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'random' | 'filtered'>('random');
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [seenCandidateIds, setSeenCandidateIds] = useState<string[]>([]);

  // Single Active Chat State & Supabase Session ID
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [activeChatConnectedAt, setActiveChatConnectedAt] = useState<number | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);
  const [isChatClosedByPartner, setIsChatClosedByPartner] = useState<boolean>(false);

  // Realtime subscription refs
  const matchQueueSubRef = useRef<(() => void) | null>(null);
  const chatMsgSubRef = useRef<(() => void) | null>(null);
  const chatStatusSubRef = useRef<(() => void) | null>(null);

  // Initialize Telegram WebApp & Sync with Supabase on mount
  useEffect(() => {
    initTelegramWebApp();
    let isMounted = true;

    syncTelegramUser(currentTgUser)
      .then(async (profile) => {
        if (isMounted) {
          setCurrentUser(profile);
          setChatHistory(getSavedChatHistory(profile.id));
          triggerDailyDatabasePurge();

          // Restore ongoing active chat session if user closed mini app while chatting
          const activeSession = await fetchUserActiveChatSession(profile.id);
          if (activeSession && isMounted) {
            setActiveChatSessionId(activeSession.sessionId);
            setActiveChatUser(activeSession.partner);
            setActiveChatConnectedAt(activeSession.connectedAt);

            const msgs = await fetchSessionMessages(activeSession.sessionId, profile.id);
            if (isMounted) {
              setActiveChatMessages(msgs);
            }

            // Reconnect live message listener
            if (chatMsgSubRef.current) chatMsgSubRef.current();
            chatMsgSubRef.current = subscribeToChatMessages(
              activeSession.sessionId,
              profile.id,
              (incomingMsg) => {
                setActiveChatMessages((prev) => {
                  if (prev.some((m) => m.id === incomingMsg.id)) return prev;
                  return [...prev, incomingMsg];
                });
              }
            );

            // Reconnect session close listener
            if (chatStatusSubRef.current) chatStatusSubRef.current();
            chatStatusSubRef.current = subscribeToChatSessionStatus(activeSession.sessionId, (closedBy) => {
              if (closedBy !== profile.id) {
                setIsChatClosedByPartner(true);
                showAppToast(`کاربر «${activeSession.partner.name}» به گفتگو پایان داد.`);
              }
            });
          }
        }
      })
      .catch((err) => {
        console.error('Error syncing initial user profile:', err);
      });

    return () => {
      isMounted = false;
      if (matchQueueSubRef.current) matchQueueSubRef.current();
      if (chatMsgSubRef.current) chatMsgSubRef.current();
      if (chatStatusSubRef.current) chatStatusSubRef.current();
    };
  }, [currentTgUser]);

  // Chat History (Closed / Ended chats archive - cannot be reopened)
  const [chatHistory, setChatHistory] = useState<ClosedChatRecord[]>(INITIAL_CHAT_HISTORY);

  // Search Filter form state
  const [filterCriteria, setFilterCriteria] = useState<SearchFilterState>({
    gender: 'all',
    minAge: 20,
    maxAge: 35,
    province: 'همه استان‌ها',
    matchByCompatibility: true,
  });

  // Real Blocked users state from Supabase
  const [blockedUsers, setBlockedUsers] = useState<UserProfile[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [appToast, setAppToast] = useState<string | null>(null);

  // Load blocked users from Supabase on currentUser load
  useEffect(() => {
    if (currentUser?.id && !currentUser.id.startsWith('local-')) {
      fetchBlockedUsers(currentUser.id).then((list) => {
        setBlockedUsers(list);
        setBlockedUserIds(list.map((u) => u.id));
      });
    }
  }, [currentUser?.id]);

  // Initial Onboarding Sync Modal State (first launch or triggered)
  const [showInitialSyncModal, setShowInitialSyncModal] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem('hamdam_onboarding_sync_shown');
      return seen !== 'true';
    } catch {
      return true;
    }
  });

  // Flag to automatically open the profile wizard upon landing in profile tab
  const [autoOpenProfileWizard, setAutoOpenProfileWizard] = useState<boolean>(false);

  const showAppToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 4000);
  };

  // Action 1: Random Search (Connected to Supabase Real-Time Waiting Room)
  const handleRandomSearch = async () => {
    if (activeChatUser) {
      showAppToast(
        `شما در حال حاضر با «${activeChatUser.name}» گفتگوی فعال دارید. در هر لحظه فقط با یک نفر می‌توانید در ارتباط باشید.`
      );
      return;
    }

    setSearchType('random');
    setIsSearching(true);
    setFoundUser(null);

    // Clean up any lingering queue subscription
    if (matchQueueSubRef.current) {
      matchQueueSubRef.current();
      matchQueueSubRef.current = null;
    }

    try {
      // Execute atomic matchmaker RPC in Supabase
      const result = await startRandomMatch(currentUser.id, currentTgUser.id);

      if (result.status === 'matched' && result.partner && result.chatSessionId) {
        setActiveChatSessionId(result.chatSessionId);
        setFoundUser(result.partner);
        showAppToast('هم‌صحبت پیدا شد! در حال انتقال به گفتگو...');
      } else {
        // User entered waiting room queue
        showAppToast('در صف تطبیق آنی قرار گرفتید... در حال جستجوی کاربر همزمان');

        // Subscribe to Realtime notifications for match_queue table
        matchQueueSubRef.current = subscribeToMatchQueue(
          currentUser.id,
          (chatSessionId, partner) => {
            setActiveChatSessionId(chatSessionId);
            setFoundUser(partner);
            showAppToast(`اتصال برقرار شد! با «${partner.name}» مچ شدید.`);
          }
        );
      }
    } catch (err) {
      console.error('Random match error:', err);
      showAppToast('خطا در اتصال به سرور همسریابی. لطفاً دوباره تلاش کنید.');
      setIsSearching(false);
    }
  };

  // Action 2: Trigger Filtered Search Modal (Checks remaining usage limit)
  const handleOpenFilterSearch = () => {
    if (activeChatUser) {
      showAppToast(
        `شما در حال حاضر با «${activeChatUser.name}» گفتگوی فعال دارید. در هر لحظه فقط با یک نفر می‌توانید در ارتباط باشید.`
      );
      return;
    }

    if (!isProUser && filteredSearchRemaining <= 0) {
      setPaywallReason('limit_reached');
      setIsPaywallOpen(true);
      return;
    }
    setIsFilterModalOpen(true);
  };

  // Action 2.1: Execute Filtered Search (Connects to Realtime Supabase Matchmaker)
  const handleApplyFilteredSearch = async (criteria: SearchFilterState) => {
    if (!isProUser && filteredSearchRemaining <= 0) {
      setPaywallReason('limit_reached');
      setIsPaywallOpen(true);
      return;
    }

    setFilterCriteria(criteria);
    setIsFilterModalOpen(false);
    setSearchType('filtered');
    setIsSearching(true);
    setFoundUser(null);

    // Clean up any lingering queue subscription
    if (matchQueueSubRef.current) {
      matchQueueSubRef.current();
      matchQueueSubRef.current = null;
    }

    try {
      const result = await startRandomMatch(currentUser.id, currentTgUser.id);
      if (result.status === 'matched' && result.partner && result.chatSessionId) {
        setActiveChatSessionId(result.chatSessionId);
        setFoundUser(result.partner);
        showAppToast('هم‌صحبت پیدا شد! در حال انتقال به گفتگو...');
      } else {
        showAppToast('در صف تطبیق آنی قرار گرفتید... در حال جستجوی کاربر همزمان');
        matchQueueSubRef.current = subscribeToMatchQueue(
          currentUser.id,
          (chatSessionId, partner) => {
            setActiveChatSessionId(chatSessionId);
            setFoundUser(partner);
            showAppToast(`اتصال برقرار شد! با «${partner.name}» مچ شدید.`);
          }
        );
      }
    } catch (err) {
      console.error('Match search error:', err);
      showAppToast('خطا در جستجوی هم‌صحبت آنلاین.');
      setIsSearching(false);
    }
  };

  // Action 2.2: Next Match Handler (Cancels and re-enqueues real match search)
  const handleNextMatchFromRadar = async () => {
    setFoundUser(null);
    if (currentUser?.id) {
      await cancelMatchSearch(currentUser.id);
    }
    await handleRandomSearch();
  };

  // Action 3: Confirm Chat from Radar (Connects to Supabase Real-Time Chat Room)
  const handleEnterChatFromRadar = async () => {
    if (!foundUser) return;

    // Deduct credit ONLY for filtered search upon explicit user confirmation
    if (searchType === 'filtered' && !isProUser) {
      setFilteredSearchRemaining((prev) => Math.max(0, prev - 1));
    }

    setIsSearching(false);

    // Unsubscribe from waiting queue
    if (matchQueueSubRef.current) {
      matchQueueSubRef.current();
      matchQueueSubRef.current = null;
    }

    const sessionId = activeChatSessionId;
    setActiveChatConnectedAt(Date.now());
    setActiveChatUser(foundUser);
    setIsChatMinimized(false);

    if (sessionId) {
      // 1. Fetch existing messages from Supabase
      const existing = await fetchSessionMessages(sessionId, currentUser.id);
      if (existing.length > 0) {
        setActiveChatMessages(existing);
      } else {
        setActiveChatMessages([
          {
            id: `welcome-${Date.now()}`,
            senderId: foundUser.id,
            text: `سلام! ما هر دو همزمان در حال جستجو بودیم و سیستم مستقیم وصلمون کرد 👋`,
            timestamp: 'همین الان',
            status: 'read',
          },
        ]);
      }

      // 2. Clean up previous chat subscriptions if any
      if (chatMsgSubRef.current) chatMsgSubRef.current();
      if (chatStatusSubRef.current) chatStatusSubRef.current();

      // 3. Listen for live incoming messages from Supabase Realtime
      chatMsgSubRef.current = subscribeToChatMessages(
        sessionId,
        currentUser.id,
        (incomingMsg) => {
          setActiveChatMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
        }
      );

      // 4. Listen for session closure by partner
      chatStatusSubRef.current = subscribeToChatSessionStatus(sessionId, (closedBy) => {
        if (closedBy !== currentUser.id) {
          setIsChatClosedByPartner(true);
          showAppToast(`کاربر «${foundUser.name}» به گفتگو پایان داد.`);
        }
      });
    } else {
      // Fallback message for demo/filtered mock
      const initialMsgs: ChatMessage[] = [
        {
          id: `msg-${Date.now()}`,
          senderId: foundUser.id,
          text: `سلام! ما هر دو همزمان در حال جستجو بودیم و سیستم مستقیم وصلمون کرد 👋 چطوری؟`,
          timestamp: 'همین الان',
          status: 'read',
        },
      ];
      setActiveChatMessages(initialMsgs);
    }
  };

  // Action 3.1: Send Message to Supabase & Realtime Broadcast
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (activeChatSessionId) {
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ChatMessage = {
        id: tempId,
        senderId: 'me',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'sent',
      };
      setActiveChatMessages((prev) => [...prev, optimisticMsg]);

      const sent = await sendChatMessage(activeChatSessionId, currentUser.id, text.trim());
      if (sent) {
        setActiveChatMessages((prev) =>
          prev.map((m) => (m.id === tempId ? sent : m))
        );
      }
    }
  };

  // Gamification Engine Handlers
  const handleAddXP = (amount: number, reason?: string) => {
    setGamification((prev) => {
      const prevLevel = calculateLevelFromState(prev.userXP, prev.completedTaskIds || []);
      const newXP = prev.userXP + amount;
      const newLevel = calculateLevelFromState(newXP, prev.completedTaskIds || []);

      const updated: GamificationState = {
        ...prev,
        userXP: newXP,
        userLevel: newLevel.level,
      };
      saveGamificationState(updated);

      // Trigger Level-Up Celebration modal if a new level is attained
      if (newLevel.level > prevLevel.level) {
        setTimeout(() => {
          setCelebratingLevel(newLevel);
        }, 550);
      }

      return updated;
    });
  };

  const handleCompleteTask = (taskId: string, rewardXP: number, taskTitle: string) => {
    setGamification((prev) => {
      if (prev.completedTaskIds?.includes(taskId)) return prev;

      const prevLevel = calculateLevelFromState(prev.userXP, prev.completedTaskIds || []);
      const newCompleted = [...(prev.completedTaskIds || []), taskId];
      const newXP = prev.userXP + rewardXP;
      const newLevel = calculateLevelFromState(newXP, newCompleted);

      const updated: GamificationState = {
        ...prev,
        userXP: newXP,
        completedTaskIds: newCompleted,
        userLevel: newLevel.level,
      };
      saveGamificationState(updated);

      showAppToast(`تسک «${taskTitle}» با موفقیت انجام شد! ${persianNumber(rewardXP)}+ XP دریافت کردید ⚡`);

      if (newLevel.level > prevLevel.level) {
        setTimeout(() => {
          setCelebratingLevel(newLevel);
        }, 550);
      }

      return updated;
    });
  };

  const handleIncreaseMatchDna = (delta: number) => {
    setGamification((prev) => {
      const newDna = Math.min(99, prev.matchDnaPercentage + delta);
      const updated: GamificationState = {
        ...prev,
        matchDnaPercentage: newDna,
        positiveFeedbackCount: prev.positiveFeedbackCount + 1,
      };
      saveGamificationState(updated);
      return updated;
    });
  };

  // Action 4: Close Chat Handler (Rule: Both parties can close after >= 1 min; archived to History forever, cannot reopen)
  const handleCloseChat = async (
    closedBy: 'me' | 'partner',
    finalMessages: ChatMessage[],
    durationText: string,
    feedbackVibe?: 'great' | 'okay' | 'skipped'
  ) => {
    if (!activeChatUser) return;

    const sessionId = activeChatSessionId;

    // Clean up chat subscriptions
    if (chatMsgSubRef.current) {
      chatMsgSubRef.current();
      chatMsgSubRef.current = null;
    }
    if (chatStatusSubRef.current) {
      chatStatusSubRef.current();
      chatStatusSubRef.current = null;
    }

    // Inform Supabase that the chat session has concluded
    if (sessionId && closedBy === 'me') {
      const durationSecs = activeChatConnectedAt
        ? Math.max(1, Math.floor((Date.now() - activeChatConnectedAt) / 1000))
        : 60;
      await closeChatSession(sessionId, currentUser.id, durationSecs);
    }

    // Apply Gamification XP feedback outcomes
    if (feedbackVibe === 'great') {
      showAppToast('بازخورد عالی ثبت شد! ۳۰+ امتیاز XP دریافت کردید ⚡');
    } else if (feedbackVibe === 'okay') {
      showAppToast('۱۰+ امتیاز XP بابت پایان مکالمه دریافت کردید 💤');
    }

    const newRecord: ClosedChatRecord = {
      id: `history-${Date.now()}`,
      user: activeChatUser,
      startedAt: 'امروز',
      endedAt: new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationText: durationText || '۱ دقیقه و ۰۰ ثانیه',
      closedBy,
      messages: finalMessages,
      lastMessage:
        finalMessages[finalMessages.length - 1]?.text || 'گفتگو با موفقیت پایان یافت',
    };

    setChatHistory((prev) => [newRecord, ...prev]);
    saveChatRecordToHistory(currentUser.id, newRecord);

    const partnerName = activeChatUser.name;
    setActiveChatSessionId(null);
    setActiveChatUser(null);
    setActiveChatMessages([]);
    setActiveChatConnectedAt(null);
    setIsChatMinimized(false);
    setIsChatClosedByPartner(false);
    setActiveTab('history');
    showAppToast(
      `گفتگو با «${partnerName}» بسته شد و در بخش «تاریخچه چت‌ها» بایگانی گردید.`
    );
  };

  // Close Radar Search completely & cancel queue in Supabase
  const handleCloseRadarSearch = async () => {
    setIsSearching(false);
    setFoundUser(null);
    setSeenCandidateIds([]);

    if (matchQueueSubRef.current) {
      matchQueueSubRef.current();
      matchQueueSubRef.current = null;
    }

    if (currentUser?.id) {
      await cancelMatchSearch(currentUser.id);
    }

    if (searchType === 'filtered') {
      showAppToast('جستجو متوقف شد. هیچ اعتباری از سهمیه شما کسر نگردید.');
    } else {
      showAppToast('جستجو لغو شد.');
    }
  };

  // Block User Handler (Saves to Supabase)
  const handleBlockUser = async (userId: string) => {
    setBlockedUserIds((prev) => [...prev, userId]);
    if (activeChatUser?.id === userId) {
      setBlockedUsers((prev) => [...prev, activeChatUser]);
      setActiveChatUser(null);
      setActiveChatMessages([]);
      setActiveChatConnectedAt(null);
      setIsChatMinimized(false);
    }
    setChatHistory((prev) => prev.filter((h) => h.user.id !== userId));

    if (currentUser?.id && !currentUser.id.startsWith('local-')) {
      await blockUser(currentUser.id, userId);
      const updatedList = await fetchBlockedUsers(currentUser.id);
      setBlockedUsers(updatedList);
      setBlockedUserIds(updatedList.map((u) => u.id));
    }
    showAppToast('کاربر با موفقیت مسدود شد و به لیست مسدودی اضافه گردید.');
  };

  // Unblock User Handler (Updates Supabase)
  const handleUnblockUser = async (userId: string) => {
    const unblockedUser = blockedUsers.find((u) => u.id === userId);
    setBlockedUserIds((prev) => prev.filter((id) => id !== userId));
    setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));

    if (currentUser?.id && !currentUser.id.startsWith('local-')) {
      await unblockUser(currentUser.id, userId);
    }

    showAppToast(
      unblockedUser
        ? `کاربر «${unblockedUser.name}» با موفقیت از لیست مسدودی خارج شد.`
        : 'کاربر از لیست مسدودی خارج شد.'
    );
  };

  // Report User Handler
  const handleReportUser = (userId: string, reason: string) => {
    showAppToast('گزارش تخلف ثبت گردید و توسط تیم نظارت بررسی خواهد شد.');
  };

  // Initial Onboarding Actions
  const handleProceedFromSyncToProfile = () => {
    try {
      localStorage.setItem('hamdam_onboarding_sync_shown', 'true');
    } catch {
      // ignore
    }
    setShowInitialSyncModal(false);
    setActiveTab('profile');
    setAutoOpenProfileWizard(true);
    showAppToast('به بخش تکمیل پروفایل هدایت شدید. لطفاً اطلاعات خود را تکمیل نمایید.');
  };

  const handleSkipSyncToHome = () => {
    try {
      localStorage.setItem('hamdam_onboarding_sync_shown', 'true');
    } catch {
      // ignore
    }
    setShowInitialSyncModal(false);
  };

  // Wizard Completion Handler: Save profile and redirect to explore/search
  const handleProfileWizardCompleted = (updated: UserProfile) => {
    setCurrentUser(updated);
    setAutoOpenProfileWizard(false);
    setActiveTab('explore');
    showAppToast('🎉 تبریک! اطلاعات شما با موفقیت تکمیل شد و به بخش رادار و جستجو هدایت شدید.');
  };

  // Trigger Paywall for "Chat in Telegram" (Locked with Pro)
  const handleTriggerPaywallForTelegram = () => {
    setPaywallReason('telegram_export');
    setIsPaywallOpen(true);
  };

  const handleUpgradeToPro = () => {
    setIsProUser(true);
    setFilteredSearchRemaining(999);
    setIsPaywallOpen(false);
    showAppToast('اشتراک VIP پرو با موفقیت فعال شد!');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#08090e] text-[#e8e9ed] flex items-center justify-center p-0 sm:py-4 font-['Vazirmatn',sans-serif] selection:bg-purple-500/30"
    >
      {/* Background ambient lighting for desktop display */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 start-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 rounded-full bg-pink-600/15 blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-[430px] h-[100dvh] sm:h-[844px] bg-[#0c0d16] sm:rounded-[40px] shadow-[0_25px_70px_rgba(0,0,0,0.8)] border-0 sm:border sm:border-white/10 flex flex-col overflow-hidden">
        {/* Browser Multi-User Testing Banner (Shown only when outside actual Telegram app) */}
        {!isRealTelegramClient() && (
          <div className="w-full bg-[#161828] border-b border-purple-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-white/90 select-none z-20">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80">تست دونفره:</span>
              <span className="font-bold text-purple-300">{currentTgUser.first_name}</span>
              <span className="text-[10px] text-white/50">(کاربر {currentTgUser.id === 990000001 ? '۱' : '۲'})</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextSlot = currentTgUser.id === 990000001 ? '2' : '1';
                localStorage.setItem('idoost_dev_user_slot', nextSlot);
                window.location.search = `?u=${nextSlot}`;
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[10px] font-bold transition-all cursor-pointer active:scale-95"
            >
              تغییر به {currentTgUser.id === 990000001 ? 'کاربر ۲ (سارا)' : 'کاربر ۱ (امیرحسین)'}
            </button>
          </div>
        )}

        {/* Global Toast Notification */}
        <AnimatePresence>
          {appToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 inset-x-4 z-50 p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold text-center shadow-[0_4px_25px_rgba(168,85,247,0.4)] border border-white/20 pointer-events-none"
            >
              {appToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Screen View */}
        <main className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
          {activeChatUser && !isChatMinimized ? (
            <ChatScreen
              user={activeChatUser}
              partner={activeChatUser}
              initialMessages={activeChatMessages}
              connectedAt={activeChatConnectedAt || undefined}
              chatSessionId={activeChatSessionId || undefined}
              isClosedByPartner={isChatClosedByPartner}
              onSendMessage={handleSendMessage}
              onMessagesChange={(msgs) => setActiveChatMessages(msgs)}
              onBack={() => setIsChatMinimized(true)}
              onCloseChat={handleCloseChat}
              onOpenPaywallForTelegram={handleTriggerPaywallForTelegram}
              onTriggerPaywall={handleTriggerPaywallForTelegram}
              isPro={isProUser}
              onBlockUser={handleBlockUser}
              onReportUser={handleReportUser}
              onAddXP={(amt) => handleAddXP(amt)}
            />
          ) : (
            <>
              {/* TAB 1: EXPLORE & RADAR HERO */}
              {activeTab === 'explore' && (
                <HomeBentoGrid
                  onRandomSearch={handleRandomSearch}
                  onFilteredSearch={handleOpenFilterSearch}
                  filteredSearchRemaining={filteredSearchRemaining}
                  activeChatUser={activeChatUser}
                  onReturnToActiveChat={() => setIsChatMinimized(false)}
                  onOpenPaywall={() => {
                    setPaywallReason('general');
                    setIsPaywallOpen(true);
                  }}
                  gamification={gamification}
                  onOpenGamification={() => setIsPerksModalOpen(true)}
                />
              )}

              {/* TAB 2: CHAT HISTORY (ARCHIVE OF CLOSED CONVERSATIONS) */}
              {activeTab === 'history' && (
                <ChatHistoryView
                  history={chatHistory}
                  activeChatUser={activeChatUser}
                  onOpenActiveChat={() => setIsChatMinimized(false)}
                  onGoToExplore={() => setActiveTab('explore')}
                  onDeleteRecord={(id) => {
                    setChatHistory((prev) => prev.filter((r) => r.id !== id));
                    showAppToast('مورد از تاریخچه چت‌ها حذف شد.');
                  }}
                />
              )}

              {/* TAB 3: USER PROFILE VIEW */}
              {activeTab === 'profile' && (
                <MyProfileView
                  user={currentUser}
                  onUpdateProfile={(updated) => {
                    setCurrentUser(updated);
                    showAppToast('مشخصات پروفایل شما با موفقیت ذخیره شد.');
                  }}
                  filteredSearchRemaining={filteredSearchRemaining}
                  isProUser={isProUser}
                  onGrantWeekPro={() => {
                    setIsProUser(true);
                    setFilteredSearchRemaining(999);
                    showAppToast('تبریک! ۱ هفته اشتراک Pro به دلیل ۵ دعوت موفق فعال گردید 🎉');
                  }}
                  onOpenPaywall={() => {
                    setPaywallReason('general');
                    setIsPaywallOpen(true);
                  }}
                  blockedUserIds={blockedUserIds}
                  blockedUsersList={blockedUsers}
                  onUnblockUser={handleUnblockUser}
                  autoOpenWizard={autoOpenProfileWizard}
                  onWizardComplete={handleProfileWizardCompleted}
                  gamification={gamification}
                  onOpenGamification={() => setIsPerksModalOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (Only visible when not deep inside a chat) */}
        {!(activeChatUser && !isChatMinimized) && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
            }}
            historyCount={chatHistory.length}
          />
        )}

        {/* Modal 1: Filtered Search Selection Modal (Gender, Age, Province, Smart Compatibility) */}
        <FilterSearchModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplySearch={handleApplyFilteredSearch}
          remainingUses={filteredSearchRemaining}
          initialFilters={filterCriteria}
          userLevel={gamification.userLevel}
        />

        {/* Modal 2: Searching Radar with Animated Rings, 30s Countdown, and Next Match */}
        <SearchingRadarModal
          isOpen={isSearching}
          searchType={searchType}
          matchedUser={foundUser}
          currentUser={currentUser}
          onEnterChat={handleEnterChatFromRadar}
          onNextMatch={handleNextMatchFromRadar}
          onCloseSearch={handleCloseRadarSearch}
          matchByCompatibility={filterCriteria.matchByCompatibility}
          userLevel={gamification.userLevel}
        />

        {/* Modal 3: Sleek 'Get Pro' Paywall Modal */}
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          reason={paywallReason}
          onUpgrade={handleUpgradeToPro}
        />

        {/* Modal 4: Initial Telegram Profile Sync with Vertical Step Bar */}
        <InitialProfileSyncModal
          isOpen={showInitialSyncModal}
          user={currentUser}
          onProceedToProfile={handleProceedFromSyncToProfile}
          onSkipToHome={handleSkipSyncToHome}
        />

        {/* Modal 5: Level-Up Celebration Modal */}
        {celebratingLevel && (
          <LevelUpModal
            isOpen={!!celebratingLevel}
            newLevel={celebratingLevel}
            onClose={() => setCelebratingLevel(null)}
            onTryFeature={(perkKey) => {
              setCelebratingLevel(null);
              if (perkKey === 'age_filter') {
                setIsFilterModalOpen(true);
              } else if (perkKey === 'priority_pool') {
                showAppToast('اولویت صف کاربران فعال هم‌اکنون فعال گردید ✨');
                handleRandomSearch();
              } else if (perkKey === 'free_telegram') {
                showAppToast('۱ بار انتقال رایگان به تلگرام در این هفته فعال شد! 🎁');
              }
            }}
          />
        )}

        {/* Modal 6: Gamification Perks Roadmap & Test Modal */}
        <GamificationPerksModal
          isOpen={isPerksModalOpen}
          onClose={() => setIsPerksModalOpen(false)}
          gamification={gamification}
          onAddTestXP={(amount) => handleAddXP(amount, 'تست شبیه‌سازی')}
          onCompleteTask={handleCompleteTask}
          onActionNavigate={(actionType) => {
            setIsPerksModalOpen(false);
            if (actionType === 'complete_profile' || actionType === 'invite_friend') {
              setActiveTab('profile');
            } else if (actionType === 'chat_action') {
              setActiveTab('explore');
            }
          }}
        />
      </div>
    </div>
  );
}
