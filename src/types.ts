export type MaritalStatus = 'مجرد' | 'جدا شده' | 'همسر فوت شده';
export type Gender = 'female' | 'male' | 'all';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'female' | 'male';
  city: string;
  province?: string;
  distanceKm: number;
  maritalStatus: MaritalStatus;
  job: string;
  education: string;
  heightCm: number;
  isVerified: boolean;
  bio: string;
  photos: string[];
  interests: string[];
  hobbies?: string[];
  redLines?: string[];
  telegramHandle?: string;
  compatibilityScore?: number;
  smokingStatus?: string;
  lifestyle?: string[];
  isOnline?: boolean;
  lastSeen?: string;
}

export interface SearchFilterState {
  gender: Gender;
  minAge: number;
  maxAge: number;
  province: string;
  matchByCompatibility?: boolean;
}

export type FilterOptions = SearchFilterState & {
  maritalStatus?: 'all' | MaritalStatus;
  maxDistanceKm?: number;
};


export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or user.id
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface MatchItem {
  id: string;
  user: UserProfile;
  matchedAt: string;
  lastMessage?: string;
  unreadCount?: number;
  isOnline?: boolean;
  messages?: ChatMessage[];
}

export interface ClosedChatRecord {
  id: string;
  user: UserProfile;
  startedAt: string;
  endedAt: string;
  durationText: string;
  closedBy: 'me' | 'partner';
  messages: ChatMessage[];
  lastMessage: string;
}

export type ActiveTab = 'explore' | 'history' | 'profile';

