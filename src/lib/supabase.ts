import { createClient } from '@supabase/supabase-js';
import { UserProfile, ChatMessage } from '../types';
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
    name: row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'کاربر همدم',
    age: row.age || 24,
    gender: row.gender || 'male',
    city: row.city || 'تهران',
    province: row.province || 'تهران',
    distanceKm: row.distance_km ?? 3,
    maritalStatus: row.marital_status || 'مجرد',
    job: row.job || 'آزاد',
    education: row.education || 'کارشناسی',
    heightCm: row.height_cm || 175,
    isVerified: row.is_verified ?? true,
    bio: row.bio || '',
    photos:
      Array.isArray(row.photos) && row.photos.length > 0
        ? row.photos
        : ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80'],
    interests: Array.isArray(row.interests) ? row.interests : ['موسیقی', 'کتاب', 'کافه گردی'],
    hobbies: Array.isArray(row.hobbies) ? row.hobbies : [],
    redLines: Array.isArray(row.red_lines) ? row.red_lines : [],
    telegramHandle: row.telegram_handle || row.username || '',
    compatibilityScore: row.compatibility_score || 90,
    smokingStatus: row.smoking_status || 'خیر',
    lifestyle: Array.isArray(row.lifestyle) ? row.lifestyle : ['علاقه‌مند به آرامش'],
    isOnline: row.is_online ?? true,
    lastSeen: 'آنلاین',
  };
}

/**
 * Upsert current Telegram user into Supabase and fetch fresh profile
 */
export async function syncTelegramUser(tgUser: TelegramUser): Promise<UserProfile> {
  const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'کاربر همدم';

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
      age: 25,
      gender: 'male',
      city: 'تهران',
      province: 'تهران',
      distanceKm: 0,
      maritalStatus: 'مجرد',
      job: 'عضو همدم',
      education: 'دانشگاهی',
      heightCm: 175,
      isVerified: true,
      bio: 'علاقه‌مند به گفتگوهای عمیق و آشنایی هدفمند.',
      photos: [
        tgUser.photo_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80',
      ],
      interests: ['موسیقی', 'کتاب', 'کافه گردی'],
      telegramHandle: tgUser.username,
      isOnline: true,
    };
  }

  // If user has a photo from Telegram and DB has only default, update it
  if (tgUser.photo_url && (!data.photos || data.photos.length === 0 || data.photos[0].includes('photo-1535713875002'))) {
    await supabase
      .from('users')
      .update({ photos: [tgUser.photo_url] })
      .eq('id', data.id);
    data.photos = [tgUser.photo_url];
  }

  return mapDbUserToUserProfile(data);
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

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'match_queue',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const newRow = payload.new as any;
        if (newRow && newRow.status === 'matched' && newRow.matched_chat_id) {
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
          onClosed(row.closed_by);
        }
      }
    )
    .subscribe();

  return () => {
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
