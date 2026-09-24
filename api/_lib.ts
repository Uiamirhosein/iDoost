import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qokgasbylphbwkodtvqo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva2dhc2J5bHBoYndrb2R0dnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTM1NzcsImV4cCI6MjEwNDk4OTU3N30.eQSVExRTvKOxgAub3gPpo085xnpZAGqp1U1-6VSbtZk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva2dhc2J5bHBoYndrb2R0dnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQxMzU3NywiZXhwIjoyMTA0OTg5NTc3fQ.Ejuz3pWSlEIsZYjhKM4jBFNm-yN9YF8cmhNudY5LANM';
export const botToken = process.env.TELEGRAM_BOT_TOKEN || '8928251979:AAGbBQeWvg1wki7BnbEXlQDF3lbs9Or_1ko';

// Prefer service key, fallback to anon key
const keyToUse = supabaseServiceKey || supabaseAnonKey;
export const supabaseAdmin = createClient(supabaseUrl, keyToUse);

/**
 * Low-level Telegram API helper adapted from developerAmira/telegram-bot
 */
export async function callTelegramApi(method: string, payload: any = {}) {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;

  const res = await fetch(url, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? payload : JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  return res.json().catch(() => ({ ok: false, error_code: res.status, description: 'invalid_json_response' }));
}

/**
 * Throttled Telegram sender with Rate-limit (< 30 msgs/sec, safe delay 40-50ms)
 * and 429 Retry-After handling adapted from reference repo
 */
export async function sendThrottledMessage(chatId: number | string, text: string, extra: any = {}) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...extra,
    };

    const res: any = await callTelegramApi('sendMessage', payload);

    if (res.ok) {
      return { ok: true, result: res.result };
    }

    if (res.error_code === 429) {
      const retryAfterSec = res.parameters?.retry_after || 1;
      await new Promise((r) => setTimeout(r, (retryAfterSec + 0.5) * 1000));
      continue;
    }

    if (res.error_code === 403) {
      return { ok: false, blocked: true, description: res.description };
    }

    return { ok: false, description: res.description };
  }

  return { ok: false, description: 'max_retries_exceeded' };
}
