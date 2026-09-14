export interface LevelConfig {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  perkTitle: string;
  perkDescription: string;
  perkKey: 'none' | 'age_filter' | 'priority_pool' | 'free_telegram';
  badgeColor: string;
  gradient: string;
}

export interface LevelTask {
  id: string;
  level: number;
  title: string;
  description: string;
  rewardXP: number;
  actionText: string;
  actionType: 'telegram_channel' | 'instagram_page' | 'complete_profile' | 'invite_friend' | 'chat_action';
  targetUrl?: string;
  isRequiredForLevel: boolean;
}

export const LEVELS_CONFIG: LevelConfig[] = [
  {
    level: 1,
    title: 'مسافر',
    minXP: 0,
    maxXP: 100,
    perkTitle: 'عضویت پایه',
    perkDescription: 'دسترسی به گفتگوی اتفاقی و فیلترهای استانی',
    perkKey: 'none',
    badgeColor: 'text-zinc-300',
    gradient: 'from-zinc-500 to-slate-400',
  },
  {
    level: 2,
    title: 'هم‌صحبت',
    minXP: 100,
    maxXP: 300,
    perkTitle: 'فیلتر اختلاف سن',
    perkDescription: 'امکان تنظیم محدوده سنی دقیق در جستجوی پیشرفته',
    perkKey: 'age_filter',
    badgeColor: 'text-purple-300',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    level: 3,
    title: 'محبوب',
    minXP: 300,
    maxXP: 600,
    perkTitle: 'اولویت در صف کاربران فعال',
    perkDescription: 'قرارگیری در اولویت اتصال رادار به کاربران آنلاین',
    perkKey: 'priority_pool',
    badgeColor: 'text-amber-300',
    gradient: 'from-amber-500 to-rose-500',
  },
  {
    level: 4,
    title: 'هم‌فرکانس برتر',
    minXP: 600,
    maxXP: 1000,
    perkTitle: '۱ بار انتقال رایگان به تلگرام در هفته',
    perkDescription: 'ارسال آیدی تلگرام به هم‌صحبت بدون نیاز به سکه و اشتراک',
    perkKey: 'free_telegram',
    badgeColor: 'text-yellow-400',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
  },
];

export const LEVEL_TASKS: LevelTask[] = [
  // Level 1 Tasks
  {
    id: 'task_lvl1_city',
    level: 1,
    title: 'تکمیل استان و شهر محل سکونت',
    description: 'برای یافتن نزدیک‌ترین افراد هم‌فرکانس در استان شما',
    rewardXP: 15,
    actionText: 'تنظیم شهر',
    actionType: 'complete_profile',
    isRequiredForLevel: false,
  },
  {
    id: 'task_lvl1_first_chat',
    level: 1,
    title: 'اولین گفتگوی اتفاقی',
    description: 'آشنایی اولیه با محیط چت و کسب اولین تجربه هم‌نشینی',
    rewardXP: 20,
    actionText: 'شروع گفتگو',
    actionType: 'chat_action',
    isRequiredForLevel: false,
  },

  // Level 2 Tasks (Required for unlocking Level 2)
  {
    id: 'task_lvl2_telegram_channel',
    level: 2,
    title: 'عضویت در کانال رسمی تلگرام ما',
    description: 'ساب‌اسکرایب به کانال رسمی تلگرام برای دریافت اخبار، امکانات جدید و کدهای هدیه',
    rewardXP: 35,
    actionText: 'عضویت در کانال تلگرام',
    actionType: 'telegram_channel',
    targetUrl: 'https://t.me/hamdam_official',
    isRequiredForLevel: true,
  },
  {
    id: 'task_lvl2_instagram_page',
    level: 2,
    title: 'مشاهده صفحه اینستاگرام ما',
    description: 'مشاهده و دنبال کردن پیج رسمی اینستاگرام ما برای داستان‌های موفقیت و آموزش‌ها',
    rewardXP: 30,
    actionText: 'مشاهده صفحه اینستاگرام',
    actionType: 'instagram_page',
    targetUrl: 'https://instagram.com/hamdam_dating_app',
    isRequiredForLevel: true,
  },

  // Level 3 Tasks (Required for unlocking Level 3)
  {
    id: 'task_lvl3_bio',
    level: 3,
    title: 'تکمیل بیوگرافی و علایق در پروفایل',
    description: 'نوشتن حداقل یک خط معرفی در پروفایل برای تطبیق بهتر هم‌فرکانسی',
    rewardXP: 40,
    actionText: 'تکمیل بیوگرافی',
    actionType: 'complete_profile',
    isRequiredForLevel: true,
  },
  {
    id: 'task_lvl3_invite',
    level: 3,
    title: 'دعوت از حداقل ۱ دوست',
    description: 'ارسال لینک اختصاصی دعوت به دوستان و ورود آنها به برنامه',
    rewardXP: 50,
    actionText: 'ارسال لینک دعوت',
    actionType: 'invite_friend',
    isRequiredForLevel: true,
  },

  // Level 4 Tasks (Required for unlocking Level 4)
  {
    id: 'task_lvl4_feedbacks',
    level: 4,
    title: 'ثبت ۳ بازخورد گفتگوی عالی (⚡)',
    description: 'گفتگوهای دلنشین و کسب نشان رضایت هم‌فرکانسی از هم‌صحبت‌ها',
    rewardXP: 60,
    actionText: 'شروع گفتگو',
    actionType: 'chat_action',
    isRequiredForLevel: true,
  },
  {
    id: 'task_lvl4_streak',
    level: 4,
    title: 'حفظ استریک ۳ روز متوالی',
    description: 'فعالیت منظم روزانه در باشگاه هم‌فرکانس‌ها',
    rewardXP: 50,
    actionText: 'بررسی استریک',
    actionType: 'chat_action',
    isRequiredForLevel: true,
  },
];

export interface GamificationState {
  userXP: number;
  userLevel: number;
  matchDnaPercentage: number;
  dailyStreak: number;
  lastActiveDate?: string;
  positiveFeedbackCount: number;
  completedTaskIds: string[];
}

const STORAGE_KEY = 'hamdam_gamification_state_v2';

export const areLevelTasksCompleted = (level: number, completedTaskIds: string[]): boolean => {
  const requiredTasks = LEVEL_TASKS.filter((t) => t.level === level && t.isRequiredForLevel);
  if (requiredTasks.length === 0) return true;
  return requiredTasks.every((t) => completedTaskIds.includes(t.id));
};

export const getPendingLevelTasks = (level: number, completedTaskIds: string[]): LevelTask[] => {
  return LEVEL_TASKS.filter((t) => t.level === level && t.isRequiredForLevel && !completedTaskIds.includes(t.id));
};

export const getStoredGamificationState = (): GamificationState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.userXP === 'number') {
        return {
          ...parsed,
          completedTaskIds: Array.isArray(parsed.completedTaskIds) ? parsed.completedTaskIds : [],
        };
      }
    }
  } catch (e) {
    console.error('Failed to load gamification state', e);
  }

  // Default initial state:
  // Starts with 75 XP so completing either TG channel (+35) or Instagram (+30) or chat pushes them over 100 XP!
  return {
    userXP: 75,
    userLevel: 1,
    matchDnaPercentage: 35,
    dailyStreak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    positiveFeedbackCount: 2,
    completedTaskIds: [],
  };
};

export const saveGamificationState = (state: GamificationState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save gamification state', e);
  }
};

export const calculateLevelFromState = (xp: number, completedTaskIds: string[] = []): LevelConfig => {
  // Check Level 4 (XP >= 600 & L2, L3, L4 tasks completed)
  if (
    xp >= 600 &&
    areLevelTasksCompleted(2, completedTaskIds) &&
    areLevelTasksCompleted(3, completedTaskIds) &&
    areLevelTasksCompleted(4, completedTaskIds)
  ) {
    return LEVELS_CONFIG[3];
  }

  // Check Level 3 (XP >= 300 & L2, L3 tasks completed)
  if (
    xp >= 300 &&
    areLevelTasksCompleted(2, completedTaskIds) &&
    areLevelTasksCompleted(3, completedTaskIds)
  ) {
    return LEVELS_CONFIG[2];
  }

  // Check Level 2 (XP >= 100 & L2 tasks completed: TG Channel & IG Page)
  if (xp >= 100 && areLevelTasksCompleted(2, completedTaskIds)) {
    return LEVELS_CONFIG[1];
  }

  // Default Level 1
  return LEVELS_CONFIG[0];
};

export const calculateLevelFromXP = (xp: number): LevelConfig => {
  // Legacy fallback if tasks are not provided
  return calculateLevelFromState(xp, []);
};

export const getProgressTowardsNextLevel = (
  xp: number,
  completedTaskIds: string[] = []
): {
  currentLevel: LevelConfig;
  nextLevel: LevelConfig | null;
  percentage: number;
  xpNeeded: number;
  pendingTasksForNextLevel: LevelTask[];
  isLockedByTasks: boolean;
} => {
  const currentLevel = calculateLevelFromState(xp, completedTaskIds);
  const nextLevel = LEVELS_CONFIG.find((l) => l.level === currentLevel.level + 1) || null;

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      percentage: 100,
      xpNeeded: 0,
      pendingTasksForNextLevel: [],
      isLockedByTasks: false,
    };
  }

  const range = nextLevel.minXP - currentLevel.minXP;
  const currentInLevel = Math.max(0, xp - currentLevel.minXP);
  const percentage = Math.min(100, Math.max(0, Math.round((currentInLevel / range) * 100)));
  const xpNeeded = Math.max(0, nextLevel.minXP - xp);
  const pendingTasks = getPendingLevelTasks(nextLevel.level, completedTaskIds);
  const isLockedByTasks = xp >= nextLevel.minXP && pendingTasks.length > 0;

  return {
    currentLevel,
    nextLevel,
    percentage,
    xpNeeded,
    pendingTasksForNextLevel: pendingTasks,
    isLockedByTasks,
  };
};
