import { createServer } from 'http';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Simple Telegram Bot Runner for Handling /start & Mini App Button
 * 
 * Usage:
 *   node bot.js
 * 
 * Note: If running inside Iran, ensure HTTP_PROXY/HTTPS_PROXY or VPN is active.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.VITE_APP_URL || 'https://your-domain.com';

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

console.log('🤖 Starting Telegram Mini App Bot...');
console.log(`🔗 WebApp Target URL: ${WEBAPP_URL}`);

// Helper to call Telegram Bot API
async function callTelegram(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// 1. Configure the Persistent Menu Button (دکمه ثابت کنار کادر پیام)
async function setupMenuButton(url) {
  try {
    const res = await callTelegram('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: 'شروع همدم ⚡',
        web_app: { url },
      },
    });
    console.log('✅ Menu button configured:', res);
  } catch (err) {
    console.warn('⚠️ Could not set menu button automatically:', err.message);
  }
}

// Simple polling loop for /start
async function startPolling() {
  let offset = 0;
  console.log('📡 Bot polling started. Press Ctrl+C to stop.');

  while (true) {
    try {
      const data = await callTelegram('getUpdates', {
        offset,
        timeout: 25,
        allowed_updates: ['message'],
      });

      if (data && data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message;
          if (!msg || !msg.text) continue;

          const chatId = msg.chat.id;
          const userFirst = msg.from?.first_name || 'کاربر گرامی';

          if (msg.text.startsWith('/start')) {
            await callTelegram('sendMessage', {
              chat_id: chatId,
              text: `سلام ${userFirst} عزیز! 👋\n\nبه مینی‌اپ همدم خوش آمدید.\nبرای جستجوی هم‌صحبت آنلاین و چت آنی، دکمه زیر را لمس کنید:`,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: ' ورود به همدم (Mini App) ✨',
                      web_app: { url: WEBAPP_URL },
                    },
                  ],
                ],
              },
            });
          }
        }
      }
    } catch (e) {
      // Wait 3s on network error before retrying
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Check arguments
const targetUrl = process.argv[2] || WEBAPP_URL;
if (process.argv[2]) {
  setupMenuButton(targetUrl);
}

startPolling();
