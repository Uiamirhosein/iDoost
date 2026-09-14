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

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-1',
    name: 'سارا رضوانی',
    age: 26,
    gender: 'female',
    city: 'تهران، ونک',
    province: 'تهران',
    distanceKm: 3,
    maritalStatus: 'مجرد',
    job: 'طراح محصول (UI/UX)',
    education: 'کارشناسی ارشد هنر و دیزاین',
    heightCm: 168,
    isVerified: true,
    isOnline: true,
    bio: 'عاشق پیاده‌روی‌های پاییزی در ولیعصر، قهوه دمی تخصصی و پلی‌لیست‌های خاطره‌انگیز. معتقدم مکالمه عمیق درباره سینما و کتاب بهترین شروع برای یک ارتباط معناداره.',
    photos: [],
    interests: ['هنر و دیزاین', 'سینما و تئاتر', 'پادکست و کتاب', 'عکاسی خیابانی', 'آشپزی و قهوه'],
    hobbies: ['کافه‌گردی', 'گالری و نمایشگاه', 'پیاده‌روی شبانه', 'سفر جاده‌ای'],
    redLines: ['دروغ و پنهان‌کاری', 'سیگار و دخانیات', 'بی‌احترامی و پرخاش'],
    compatibilityScore: 96,
    smokingStatus: 'اصلاً سیگار نمی‌کشم',
    lifestyle: ['سحرخیز', 'ورزشکار منظم', 'حیوان‌دوست'],
    lastSeen: 'آنلاین',
  },
  {
    id: 'user-2',
    name: 'علی کریمی',
    age: 29,
    gender: 'male',
    city: 'تهران، سعادت‌آباد',
    province: 'تهران',
    distanceKm: 5,
    maritalStatus: 'مجرد',
    job: 'توسعه‌دهنده ارشد نرم‌افزار',
    education: 'مهندسی کامپیوتر دانشگاه شریف',
    heightCm: 184,
    isVerified: true,
    isOnline: true,
    bio: 'روزها کد می‌زنم و شب‌ها پادکست می‌شنوم یا پیانو تمرین می‌کنم. اهل طبیعت‌گردی آخر هفته، سفر جاده‌ای شمال و ساختن یک گفت‌وگوی سرشار از خنده و احترام متقابل.',
    photos: [],
    interests: ['تکنولوژی و وب', 'موسیقی و کنسرت', 'ورزش و فیتنس', 'کوهنوردی'],
    hobbies: ['طبیعت‌گردی و کمپ', 'سفر جاده‌ای', 'بازی و گیمینگ', 'دویدن صبحگاهی'],
    redLines: ['دروغ و پنهان‌کاری', 'بدقولی و عدم تعهد'],
    compatibilityScore: 88,
    smokingStatus: 'سیگاری نیستم',
    lifestyle: ['سحرخیز', 'کاری و هدفمند', 'برون‌گرا و اجتماعی'],
    lastSeen: 'آنلاین',
  },
  {
    id: 'user-3',
    name: 'نیلوفر افشار',
    age: 25,
    gender: 'female',
    city: 'شیراز، معالی‌آباد',
    province: 'فارس (شیراز)',
    distanceKm: 8,
    maritalStatus: 'مجرد',
    job: 'مهندس معمار و تصویرساز',
    education: 'کارشناسی معماری دانشگاه تهران',
    heightCm: 171,
    isVerified: true,
    isOnline: true,
    bio: 'طراحی بناهای معاصر و اسکچ کشیدن از معماری سنتی ایرانی دغدغه روزمرمه. به دنبال کسی هستم که برای گفت‌وگو وقت بذاره، نگاه آرومی به زندگی داشته باشه و همراه سفر باشه.',
    photos: [],
    interests: ['هنر و دیزاین', 'عکاسی خیابانی', 'پادکست و کتاب', 'شعر و ادبیات'],
    hobbies: ['کافه‌گردی', 'گالری و نمایشگاه', 'باغبانی و گل‌ها', 'طبیعت‌گردی و کمپ'],
    redLines: ['بی‌احترامی و پرخاش', 'تعصبات فکری', 'سیگار و دخانیات'],
    compatibilityScore: 94,
    smokingStatus: 'خیر',
    lifestyle: ['علاقه‌مند به آرامش', 'حیوان‌دوست', 'گیاه‌خوار'],
    lastSeen: 'آنلاین',
  },
  {
    id: 'user-4',
    name: 'آرش زند',
    age: 31,
    gender: 'male',
    city: 'اصفهان، مرداویج',
    province: 'اصفهان',
    distanceKm: 4,
    maritalStatus: 'جدا شده',
    job: 'پزشک عمومی و فعال سلامت',
    education: 'دکترای حرفه‌ای پزشکی',
    heightCm: 181,
    isVerified: true,
    isOnline: false,
    bio: 'آدمی صادق، متعهد و واقع‌بین با تجربیات ارزشمند از مسیر زندگی. به تغذیه سالم، تنیس هفتگی و گفت‌وگوهای شفاف باور دارم. ارزش آرامش در رابطه برام از هر چیزی بالاتره.',
    photos: [],
    interests: ['ورزش و فیتنس', 'فلسفه و روانشناسی', 'پادکست و کتاب', 'کوهنوردی'],
    hobbies: ['دویدن صبحگاهی', 'سفر جاده‌ای', 'تماشای فیلم آخر شب'],
    redLines: ['دروغ و پنهان‌کاری', 'بدقولی و عدم تعهد', 'پنهان‌کاری مالی'],
    compatibilityScore: 84,
    smokingStatus: 'اصلاً',
    lifestyle: ['سحرخیز', 'ورزشکار منظم', 'کاری و هدفمند'],
    lastSeen: 'آخرین بازدید: ۱۸ دقیقه پیش',
  },
  {
    id: 'user-5',
    name: 'مهسا یزدانی',
    age: 27,
    gender: 'female',
    city: 'مشهد، سجاد',
    province: 'خراسان رضوی (مشهد)',
    distanceKm: 6,
    maritalStatus: 'مجرد',
    job: 'مترجم زبان و نویسنده محتوا',
    education: 'کارشناسی زبان و ادبیات انگلیسی',
    heightCm: 165,
    isVerified: true,
    isOnline: true,
    bio: 'دوستدار گربه‌ها، ادبیات داستانی و موسیقی بی‌کلام. اهل شلوغی‌های بی‌معنی نیستم و یک عصر دلپذیر توی کافه دنج با صحبت‌های واقعی رو به هر مهمونی ترجیح می‌دم.',
    photos: [],
    interests: ['شعر و ادبیات', 'پادکست و کتاب', 'زبان‌های خارجی', 'موسیقی و کنسرت'],
    hobbies: ['کافه‌گردی', 'پیاده‌روی شبانه', 'بوردگیم با دوستان'],
    redLines: ['بی‌احترامی و پرخاش', 'دروغ و پنهان‌کاری'],
    compatibilityScore: 92,
    smokingStatus: 'خیر',
    lifestyle: ['علاقه‌مند به آرامش', 'حیوان‌دوست', 'شب‌زنده‌دار'],
    lastSeen: 'آنلاین',
  },
  {
    id: 'user-6',
    name: 'پریسا نامدار',
    age: 26,
    gender: 'female',
    city: 'تبریز، ولیعصر',
    province: 'آذربایجان شرقی (تبریز)',
    distanceKm: 9,
    maritalStatus: 'مجرد',
    job: 'مدرس پیانو و آهنگساز',
    education: 'کارشناسی ارشد نوازندگی موسیقی',
    heightCm: 169,
    isVerified: true,
    isOnline: true,
    bio: 'موسیقی زبان روح منه. عاشق نت‌ها، بوی قهوه تازه و گفتگوهای طولانی در شب‌های برفی. برای من درک احساسات و صداقت زیباترین ویژگی یک انسانه.',
    photos: [],
    interests: ['موسیقی و کنسرت', 'هنر و دیزاین', 'پادکست و کتاب', 'آشپزی و قهوه'],
    hobbies: ['کافه‌گردی', 'تماشای فیلم آخر شب', 'گالری و نمایشگاه'],
    redLines: ['دروغ و پنهان‌کاری', 'سیگار و دخانیات'],
    compatibilityScore: 95,
    smokingStatus: 'خیر',
    lifestyle: ['علاقه‌مند به آرامش', 'شب‌زنده‌دار'],
    lastSeen: 'آنلاین',
  },
];

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

export const INITIAL_MATCHES: MatchItem[] = [
  {
    id: 'match-1',
    user: MOCK_USERS[0], // سارا
    matchedAt: '۲ ساعت پیش',
    lastMessage: 'سلام! سلیقه موسیقی‌تون فوق‌العاده‌ست 🎵',
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-1',
        text: 'سلام! از پروفایلتون خوشم اومد، به خصوص علاقه‌مندی‌تون به پادکست‌های هنری ✨',
        timestamp: '۱۴:۳۲',
        status: 'read',
      },
      {
        id: 'msg-2',
        senderId: 'me',
        text: 'سلام سارا جان، خیلی ممنون! اتفاقاً طراحی‌های UI/UX شما رو دیدم، واقعاً مینیمال و تمیزه 👏',
        timestamp: '۱۴:۳۵',
        status: 'read',
      },
      {
        id: 'msg-3',
        senderId: 'user-1',
        text: 'سلام! سلیقه موسیقی‌تون فوق‌العاده‌ست 🎵',
        timestamp: '۱۴:۴۰',
        status: 'read',
      },
    ],
  },
];

export const INITIAL_CHAT_HISTORY: ClosedChatRecord[] = [];
