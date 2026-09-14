/**
 * Telegram Mini App (TMA) Helpers & Authentication Validation
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: TelegramUser;
          auth_date?: string;
          hash?: string;
        };
        themeParams?: Record<string, string>;
        colorScheme?: 'light' | 'dark';
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        headerColor?: string;
        backgroundColor?: string;
      };
    };
  }
}

/**
 * Validates Telegram WebApp initData HMAC-SHA256 signature using Web Crypto API.
 */
export async function validateTelegramInitData(initData: string, botToken: string): Promise<boolean> {
  if (!initData || !botToken) return false;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');

    // Sort parameters alphabetically
    const keys = Array.from(params.keys()).sort();
    const dataCheckString = keys.map((key) => `${key}=${params.get(key)}`).join('\n');

    const enc = new TextEncoder();
    // 1. secret_key = HMAC_SHA256("WebAppData", botToken)
    const webAppDataKey = await crypto.subtle.importKey(
      'raw',
      enc.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const secretKeyBytes = await crypto.subtle.sign('HMAC', webAppDataKey, enc.encode(botToken));

    // 2. data_hash = HMAC_SHA256(secret_key, dataCheckString)
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      secretKeyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', hmacKey, enc.encode(dataCheckString));
    const calculatedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return calculatedHash.toLowerCase() === hash.toLowerCase();
  } catch (err) {
    console.error('Error validating Telegram initData:', err);
    return false;
  }
}

/**
 * Initialize Telegram WebApp viewport & lifecycle.
 */
export function initTelegramWebApp() {
  if (typeof window === 'undefined') return;

  const tg = window.Telegram?.WebApp;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch (e) {
      console.warn('Could not expand Telegram WebApp:', e);
    }
  }
}

/**
 * Extract user information from Telegram or test query parameter / local cache.
 * Supports testing with 2 browser tabs using ?u=1 and ?u=2.
 */
export function getTelegramUser(): TelegramUser {
  // 1. First check if real Telegram WebApp user is available
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (tgUser && tgUser.id) {
    return tgUser;
  }

  // 2. Browser fallback for testing multi-user flow
  // Check URL query param ?u=1 or ?u=2, or localStorage
  let userParam: string | null = null;
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    userParam = urlParams.get('u') || urlParams.get('user');
    if (!userParam) {
      userParam = localStorage.getItem('idoost_dev_user_slot') || '1';
    } else {
      localStorage.setItem('idoost_dev_user_slot', userParam);
    }
  }

  if (userParam === '2') {
    return {
      id: 990000002,
      first_name: 'سارا',
      last_name: 'رضوانی',
      username: 'sara_rezvani',
    };
  }

  // Default User 1 for testing
  return {
    id: 990000001,
    first_name: 'امیرحسین',
    last_name: 'جفاری',
    username: 'amir_dev',
  };
}

export function isRealTelegramClient(): boolean {
  return !!(window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
}
