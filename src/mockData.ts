import { UserProfile, MatchItem, ClosedChatRecord } from './types';

export const IRAN_PROVINCES = [
  'همه استان‌ها',
  'تهران',
  'اصفهان',
  'فارس (شیراز)',
  'خراسان رضوی (مشهد)',
  'آذربایجان شرقی (تبریز)',
  'مازندران',
  'گیلان (رشت)',
  'البرز (کرج)',
  'خوزستان (اهواز)',
  'قم',
  'یزد',
  'کرمانشاه',
  'هرمزگان (بندرعباس)',
  'همدان',
  'کرمان',
  'زنجان',
  'قزوین',
  'اردبیل',
  'کردستان',
  'سمنان',
];

// Rich Selectable Chips for Profile Completion
export const AVAILABLE_INTERESTS = [
  'هنر و دیزاین',
  'تکنولوژی و وب',
  'موسیقی و کنسرت',
  'سینما و تئاتر',
  'ورزش و فیتنس',
  'پادکست و کتاب',
  'عکاسی خیابانی',
  'آشپزی و قهوه',
  'فلسفه و روانشناسی',
  'کوهنوردی',
  'زبان‌های خارجی',
  'شعر و ادبیات',
];

export const AVAILABLE_HOBBIES = [
  'کافه‌گردی',
  'طبیعت‌گردی و کمپ',
  'سفر جاده‌ای',
  'بازی و گیمینگ',
  'گالری و نمایشگاه',
  'دویدن صبحگاهی',
  'بوردگیم با دوستان',
  'تماشای فیلم آخر شب',
  'پیاده‌روی شبانه',
  'باغبانی و گل‌ها',
  'دوچرخه‌سواری',
];

export const AVAILABLE_RED_LINES = [
  'دروغ و پنهان‌کاری',
  'سیگار و دخانیات',
  'بی‌احترامی و پرخاش',
  'بدقولی و عدم تعهد',
  'بی‌هدفی در زندگی',
  'وابستگی افراطی',
  'قضاوت زودهنگام',
  'پنهان‌کاری مالی',
  'تعصبات فکری',
];

export const AVAILABLE_LIFESTYLE = [
  'سحرخیز',
  'شب‌زنده‌دار',
  'ورزشکار منظم',
  'حیوان‌دوست',
  'گیاه‌خوار',
  'اهل پس‌انداز و برنامه',
  'کاری و هدفمند',
  'علاقه‌مند به آرامش',
  'برون‌گرا و اجتماعی',
];

export const MOCK_USERS: UserProfile[] = [];

export const CURRENT_USER: UserProfile = {
  id: 'current-user',
  name: 'کاربر آی‌دوست',
  age: 24,
  gender: 'male',
  city: 'تهران',
  province: 'تهران',
  distanceKm: 0,
  maritalStatus: 'مجرد',
  job: 'عضو آی‌دوست',
  education: 'دانشگاهی',
  heightCm: 175,
  isVerified: true,
  isOnline: true,
  bio: '',
  photos: [],
  interests: ['موسیقی', 'کتاب', 'کافه گردی'],
  hobbies: [],
  redLines: [],
  compatibilityScore: 100,
  smokingStatus: 'خیر',
  lifestyle: ['علاقه‌مند به آرامش'],
  lastSeen: 'آنلاین',
};

// Mutual compatibility calculation function based on user profile overlap
export function calculateMutualCompatibility(userA: UserProfile, userB: UserProfile): number {
  let score = 55; // Base score

  // 1. Common Interests (+7 pts each, max 28)
  const commonInterests = (userA.interests || []).filter((i) => (userB.interests || []).includes(i));
  score += Math.min(28, commonInterests.length * 7);

  // 2. Common Hobbies (+6 pts each, max 18)
  const commonHobbies = (userA.hobbies || []).filter((h) => (userB.hobbies || []).includes(h));
  score += Math.min(18, commonHobbies.length * 6);

  // 3. Common Lifestyle (+5 pts each, max 15)
  const commonLifestyle = (userA.lifestyle || []).filter((l) => (userB.lifestyle || []).includes(l));
  score += Math.min(15, commonLifestyle.length * 5);

  // 4. Red Line checks (e.g. smoking)
  const aDislikesSmoke = (userA.redLines || []).some((r) => r.includes('سیگار'));
  const bSmokes = (userB.smokingStatus || '').includes('سیگاری') && !(userB.smokingStatus || '').includes('نیستم');
  if (aDislikesSmoke && bSmokes) {
    score -= 25;
  }

  // Cap between 60 and 99
  return Math.min(99, Math.max(60, score));
}

export const INITIAL_MATCHES: MatchItem[] = [];

export const INITIAL_CHAT_HISTORY: ClosedChatRecord[] = [];
