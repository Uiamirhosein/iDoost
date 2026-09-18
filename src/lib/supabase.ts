import { createClient } from '@supabase/supabase-js';
import { UserProfile, ChatMessage, ClosedChatRecord } from '../types';
import { TelegramUser } from './telegram';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://qokgasbylphbwkodtvqo.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva2dhc2J5bHBoYndrb2R0dnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTM1NzcsImV4cCI6MjEwNDk4OTU3N30.eQSVExRTvKOxgAub3gPpo085xnpZAGqp1U1-6VSbtZk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

/**
 * Maps Supabase public.users row to frontend UserProfile model
 */
export function mapDbUserToUserProfile(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'کاربر آی‌دوست',
    age: row.age || 0,
    gender: row.gender || 'male',
    city: row.city || '',
    province: row.province || '',
    distanceKm: row.distance_km ?? 0,
    maritalStatus: row.marital_status || 'مجرد',
    job: row.job || '',
    education: row.education || '',
    heightCm: row.height_cm || 0,
    isVerified: row.is_verified ?? true,
    bio: row.bio || '',
    photos:
      Array.isArray(row.photos) && row.photos.length > 0
        ? row.photos.filter((p: string) => !p.includes('unsplash.com'))
        : [],
    interests: Array.isArray(row.interests) ? row.interests : [],
    hobbies: Array.isArray(row.hobbies) ? row.hobbies : [],
    redLines: Array.isArray(row.red_lines) ? row.red_lines : [],
    telegramHandle: row.telegram_handle || row.username || '',
    compatibilityScore: row.compatibility_score || 90,
    smokingStatus: row.smoking_status || '',
    lifestyle: Array.isArray(row.lifestyle) ? row.lifestyle : [],
    isOnline: row.is_online ?? true,
    lastSeen: 'آنلاین',
    inviteCount: row.invite_count || 0,
    isPro: (row.invite_count >= 5) || !!row.is_pro,
    referredBy: row.referred_by || undefined,
  };
}

/**
 * Upsert current Telegram user into Supabase and fetch fresh profile
 */
export async function syncTelegramUser(tgUser: TelegramUser): Promise<UserProfile> {
  const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'کاربر آی‌دوست';

  const { data, error } = await supabase.rpc('sync_telegram_user', {
    p_telegram_id: tgUser.id,
    p_first_name: tgUser.first_name || '',
    p_last_name: tgUser.last_name || '',
    p_username: tgUser.username || '',
    p_name: fullName,
  });

  if (error || !data) {
    console.error('Failed to sync Telegram user to Supabase:', error);
    // Return fallback profile
    return {
      id: `local-${tgUser.id}`,
      name: fullName,
      age: 0,
      gender: 'male',
      city: '',
      province: '',
      distanceKm: 0,
      maritalStatus: 'مجرد',
      job: '',
      education: '',
      heightCm: 0,
      isVerified: true,
      bio: '',
      photos: tgUser.photo_url ? [tgUser.photo_url] : [],
      interests: [],
      telegramHandle: tgUser.username,
      isOnline: true,
    };
  }

  // If user has a photo from Telegram, save it in DB
  if (tgUser.photo_url && (!data.photos || data.photos.length === 0 || data.photos.some((p: string) => p.includes('unsplash.com')))) {
    await supabase
      .from('users')
      .update({ photos: [tgUser.photo_url] })
      .eq('id', data.id);
    data.photos = [tgUser.photo_url];
  }

  return mapDbUserToUserProfile(data);
}

/**
 * Get count and latest avatars of active online users from Supabase
 */
export async function fetchOnlineUsersPresence(): Promise<{
  count: number;
  users: Array<{ id: string; name: string; photo?: string }>;
}> {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data, count, error } = await supabase
      .from('users')
      .select('id, name, photos, last_seen', { count: 'exact' })
      .eq('is_online', true)
      .gte('last_seen', tenMinutesAgo)
      .order('last_seen', { ascending: false })
      .limit(5);

    if (error || !data) {
      return { count: 1, users: [] };
    }

    const cleanUsers = data.map((u: any) => ({
      id: u.id,
      name: u.name,
      photo: Array.isArray(u.photos) && u.photos.length > 0 && !u.photos[0].includes('unsplash.com')
        ? u.photos[0]
        : undefined,
    }));

    return {
      count: Math.max(count || 1, cleanUsers.length, 1),
      users: cleanUsers,
    };
  } catch (err) {
    return { count: 1, users: [] };
  }
}

/**
 * Fetch user profile by ID
 */
export async function fetchUserProfileById(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error || !data) {
    console.warn('Could not fetch user by ID:', userId, error);
    return null;
  }
  return mapDbUserToUserProfile(data);
}

/**
 * Random Matchmaker: Atomic request to find waiting peer or enqueue self
 */
export async function startRandomMatch(
  userId: string,
  telegramId: number
): Promise<{
  status: 'waiting' | 'matched';
  chatSessionId?: string;
  partner?: UserProfile;
}> {
  const { data, error } = await supabase.rpc('find_or_enqueue_match', {
    p_user_id: userId,
    p_telegram_id: telegramId,
    p_search_type: 'random',
  });

  if (error || !data) {
    console.error('Error in find_or_enqueue_match RPC:', error);
    throw error;
  }

  if (data.status === 'matched') {
    const partnerProfile = data.partner ? mapDbUserToUserProfile(data.partner) : undefined;
    return {
      status: 'matched',
      chatSessionId: data.chat_session_id,
      partner: partnerProfile,
    };
  }

  return {
    status: 'waiting',
  };
}

/**
 * Cancel search in queue
 */
export async function cancelMatchSearch(userId: string): Promise<boolean> {
  const { error } = await supabase.rpc('cancel_match_search', {
    p_user_id: userId,
  });
  if (error) {
    console.error('Failed to cancel match search:', error);
    return false;
  }
  return true;
}

/**
 * Subscribes to match_queue realtime updates for a specific waiting user.
 * Triggered when another user matches with this waiting user.
 */
export function subscribeToMatchQueue(
  userId: string,
  onMatched: (chatSessionId: string, partner: UserProfile) => void
): () => void {
  const channelName = `match_queue_${userId}_${Date.now()}`;

  // Poll fallback interval in case WebSocket packet is dropped by mobile network/VPN
  const pollInterval = setInterval(async () => {
    try {
      const { data } = await supabase
        .from('match_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'matched')
        .not('matched_chat_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].matched_chat_id) {
        clearInterval(pollInterval);
        const row = data[0];
        let partnerProfile: UserProfile | null = null;
        if (row.matched_with_user_id) {
          partnerProfile = await fetchUserProfileById(row.matched_with_user_id);
        }
        if (partnerProfile) {
          onMatched(row.matched_chat_id, partnerProfile);
        }
      }
    } catch (e) {
      // Ignore poll error
    }
  }, 1500);

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'match_queue',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const newRow = payload.new as any;
        if (newRow && newRow.status === 'matched' && newRow.matched_chat_id) {
          clearInterval(pollInterval);
          // Fetch partner profile
          let partnerProfile: UserProfile | null = null;
          if (newRow.matched_with_user_id) {
            partnerProfile = await fetchUserProfileById(newRow.matched_with_user_id);
          }
          if (partnerProfile) {
            onMatched(newRow.matched_chat_id, partnerProfile);
          }
        }
      }
    )
    .subscribe();

  return () => {
    clearInterval(pollInterval);
    supabase.removeChannel(channel);
  };
}

/**
 * Fetches message history for a chat session
 */
export async function fetchSessionMessages(
  sessionId: string,
  currentUserId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.error('Failed to fetch messages:', error);
    return [];
  }

  return data.map((msg: any) => ({
    id: msg.id,
    senderId: msg.sender_id === currentUserId ? 'me' : msg.sender_id,
    text: msg.text,
    timestamp: new Date(msg.created_at).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: msg.status || 'sent',
  }));
}

/**
 * Sends a chat message to Supabase
 */
export async function sendChatMessage(
  sessionId: string,
  senderId: string,
  text: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_session_id: sessionId,
      sender_id: senderId,
      text: text.trim(),
      status: 'sent',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to send message:', error);
    return null;
  }

  return {
    id: data.id,
    senderId: 'me',
    text: data.text,
    timestamp: new Date(data.created_at).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: data.status,
  };
}

/**
 * Subscribes to live incoming messages for an active chat session
 */
export function subscribeToChatMessages(
  sessionId: string,
  currentUserId: string,
  onNewMessage: (msg: ChatMessage) => void
): () => void {
  const channelName = `chat_messages_${sessionId}_${Date.now()}`;

  // Poll fallback in case WebSocket event is delayed or dropped
  let lastSeenTime = new Date().toISOString();
  const pollInterval = setInterval(async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .neq('sender_id', currentUserId)
        .gt('created_at', lastSeenTime)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        for (const msg of data) {
          lastSeenTime = msg.created_at;
          onNewMessage({
            id: msg.id,
            senderId: msg.sender_id === currentUserId ? 'me' : msg.sender_id,
            text: msg.text,
            timestamp: new Date(msg.created_at).toLocaleTimeString('fa-IR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: msg.status || 'sent',
          });
        }
      }
    } catch (e) {
      // Ignore poll error
    }
  }, 1500);

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_session_id=eq.${sessionId}`,
      },
      (payload) => {
        const msg = payload.new as any;
        if (!msg) return;
        lastSeenTime = msg.created_at;

        // Map DB message to ChatMessage
        const chatMsg: ChatMessage = {
          id: msg.id,
          senderId: msg.sender_id === currentUserId ? 'me' : msg.sender_id,
          text: msg.text,
          timestamp: new Date(msg.created_at).toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: msg.status || 'sent',
        };

        onNewMessage(chatMsg);
      }
    )
    .subscribe();

  return () => {
    clearInterval(pollInterval);
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to chat session close events (when partner ends chat)
 */
export function subscribeToChatSessionStatus(
  sessionId: string,
  onClosed: (closedBy: string) => void
): () => void {
  const channelName = `chat_status_${sessionId}_${Date.now()}`;

  // Poll fallback for session closure
  const pollInterval = setInterval(async () => {
    try {
      const { data } = await supabase
        .from('chat_sessions')
        .select('status, closed_by')
        .eq('id', sessionId)
        .single();

      if (data && data.status === 'closed') {
        clearInterval(pollInterval);
        onClosed(data.closed_by);
      }
    } catch (e) {
      // Ignore
    }
  }, 2000);

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        const row = payload.new as any;
        if (row && row.status === 'closed') {
          clearInterval(pollInterval);
          onClosed(row.closed_by);
        }
      }
    )
    .subscribe();

  return () => {
    clearInterval(pollInterval);
    supabase.removeChannel(channel);
  };
}

/**
 * Closes an active chat session in Supabase
 */
export async function closeChatSession(
  sessionId: string,
  userId: string,
  durationSeconds: number = 0
): Promise<boolean> {
  const { error } = await supabase.rpc('close_chat_session', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_duration_seconds: durationSeconds,
  });

  if (error) {
    console.error('Failed to close chat session:', error);
    return false;
  }
  return true;
}

/**
 * Records a referral when a new user enters via someone's affiliate link
 */
export async function processReferralAttribution(
  newTelegramId: number,
  referrerTelegramId: number
): Promise<{ success: boolean; referrerName?: string; proUnlocked?: boolean }> {
  try {
    const { data, error } = await supabase.rpc('process_referral', {
      p_new_telegram_id: newTelegramId,
      p_referrer_telegram_id: referrerTelegramId,
    });

    if (error || !data) {
      console.error('Failed to process referral RPC:', error);
      return { success: false };
    }

    return {
      success: !!data.success,
      referrerName: data.referrer_name,
      proUnlocked: !!data.referrer_pro_unlocked,
    };
  } catch (err) {
    console.error('Error in processReferralAttribution:', err);
    return { success: false };
  }
}

/**
 * Checks if user has an ongoing active chat session in Supabase.
 */
export async function fetchUserActiveChatSession(userId: string): Promise<{
  sessionId: string;
  partner: UserProfile;
  connectedAt: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('status', 'active')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const session = data[0];
    const partnerId = session.user1_id === userId ? session.user2_id : session.user1_id;
    const partner = await fetchUserProfileById(partnerId);

    if (!partner) return null;

    return {
      sessionId: session.id,
      partner,
      connectedAt: new Date(session.created_at).getTime(),
    };
  } catch (err) {
    console.error('Error fetching active session:', err);
    return null;
  }
}

/**
 * Fetch and cleanup user's closed chat history (only keeps chats from the last 24 hours)
 */
export function getSavedChatHistory(userId: string): ClosedChatRecord[] {
  try {
    const key = `idoost_chat_history_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list: ClosedChatRecord[] = JSON.parse(raw);

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Filter out chats older than 24 hours
    const valid = list.filter((r) => {
      const chatTime = (r as any).createdAtTimestamp || (r.id ? parseInt(r.id.replace('history-', ''), 10) : 0);
      if (!chatTime) return true;
      return now - chatTime < ONE_DAY_MS;
    });

    if (valid.length !== list.length) {
      localStorage.setItem(key, JSON.stringify(valid));
    }

    return valid;
  } catch (err) {
    return [];
  }
}

/**
 * Save updated closed chat record to user's 24-hour history
 */
export function saveChatRecordToHistory(userId: string, record: ClosedChatRecord) {
  try {
    const key = `idoost_chat_history_${userId}`;
    const current = getSavedChatHistory(userId);
    const enrichedRecord = {
      ...record,
      createdAtTimestamp: Date.now(),
    };
    const updated = [enrichedRecord, ...current.filter((r) => r.id !== record.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving chat history:', err);
  }
}

/**
 * Triggers backend database purge of sessions and messages older than 24 hours
 */
export async function triggerDailyDatabasePurge() {
  try {
    await supabase.rpc('purge_expired_chats_and_messages');
  } catch (e) {
    // Ignore
  }
}
/**
 * Fetch blocked users for a specific user from Supabase
 */
export async function fetchBlockedUsers(userId: string): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_user_id, users:blocked_user_id (*)')
      .eq('user_id', userId);

    if (error || !data) {
      return [];
    }

    return data
      .map((row: any) => row.users)
      .filter(Boolean)
      .map(mapDbUserToUserProfile);
  } catch (err) {
    console.error('Error fetching blocked users:', err);
    return [];
  }
}

/**
 * Block a user in Supabase
 */
export async function blockUser(userId: string, targetUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('blocked_users')
      .upsert({ user_id: userId, blocked_user_id: targetUserId });

    if (error) {
      console.error('Error blocking user:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error blocking user:', err);
    return false;
  }
}

/**
 * Unblock a user in Supabase
 */
export async function unblockUser(userId: string, targetUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('user_id', userId)
      .eq('blocked_user_id', targetUserId);

    if (error) {
      console.error('Error unblocking user:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error unblocking user:', err);
    return false;
  }
}
