import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qokgasbylphbwkodtvqo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva2dhc2J5bHBoYndrb2R0dnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQxMzU3NywiZXhwIjoyMTA0OTg5NTc3fQ.Ejuz3pWSlEIsZYjhKM4jBFNm-yN9YF8cmhNudY5LANM';
const botToken = process.env.TELEGRAM_BOT_TOKEN || '8928251979:AAGbBQeWvg1wki7BnbEXlQDF3lbs9Or_1ko';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).send('Telegram webhook endpoint ready.');
  }

  try {
    const update = req.body;
    if (!update || !update.message) {
      return res.status(200).json({ ok: true });
    }

    const msg = update.message;
    const text = msg.text || '';
    const chatId = msg.chat?.id;
    const fromUser = msg.from;

    if (!fromUser || !fromUser.id || !chatId) {
      return res.status(200).json({ ok: true });
    }

    // 1. Sync / Save user to Supabase
    const fullName = `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() || 'کاربر تلگرام';
    await supabase.rpc('sync_telegram_user', {
      p_telegram_id: fromUser.id,
      p_first_name: fromUser.first_name || '',
      p_last_name: fromUser.last_name || '',
      p_username: fromUser.username || '',
      p_name: fullName,
    });

    // 2. Handle /start command and referral
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      let referrerTelegramId: number | null = null;
      let referrerName: string | null = null;

      if (parts.length > 1 && parts[1].startsWith('ref_')) {
        const rawRef = parts[1].replace('ref_', '').trim();
        const parsedRef = parseInt(rawRef, 10);
        if (!isNaN(parsedRef) && parsedRef > 0 && parsedRef !== fromUser.id) {
          referrerTelegramId = parsedRef;
        }
      }

      // If referred by someone, record in Supabase!
      if (referrerTelegramId) {
        const { data: refResult } = await supabase.rpc('process_referral', {
          p_new_telegram_id: fromUser.id,
          p_referrer_telegram_id: referrerTelegramId,
        });

        if (refResult) {
          referrerName = refResult.referrer_name;

          // Notify the referrer in Telegram!
          if (refResult.success) {
            const count = refResult.referrer_new_invite_count;
            const remaining = Math.max(0, 5 - count);
            const proUnlocked = refResult.referrer_pro_unlocked;

            let notifText = `🎉 کاربر گرامی، دوست شما (${fullName}) با لینک دعوت اختصاصی شما وارد آی‌دوست شد!\n\n📊 تعداد دعوت‌های موفق شما: ${count} از ۵ نفر`;
            if (proUnlocked) {
              notifText += `\n\n👑 تبریک ویژه! با تکمیل ۵ دعوت، اشتراک VIP Pro برای شما برای همیشه فعال شد! ✨`;
            } else {
              notifText += `\n⚡ فقط ${remaining} دعوت دیگر تا فعال‌سازی خودکار اشتراک VIP Pro باقی مانده است.`;
            }

            // Send notification to referrer
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: referrerTelegramId,
                text: notifText,
              }),
            }).catch(() => {});
          }
        }
      }

      // Reply to the user with welcome message and Mini App button
      let welcomeMsg = `سلام ${fromUser.first_name || 'عزیز'}! 👋\nبه مینی‌اپ همسریابی و دوستیابی «آی‌دوست» خوش آمدید.`;
      if (referrerName) {
        welcomeMsg += `\n\n🎁 شما با دعوت «${referrerName}» به جمع ما پیوستید.`;
      }
      welcomeMsg += `\n\nبرای شروع جستجوی آنلاین، گفتگو و چت آنی، دکمه زیر را لمس کنید:`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcomeMsg,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: ' ورود به مینی‌اپ آی‌دوست ⚡',
                  web_app: { url: 'https://idoost.vercel.app' },
                },
              ],
            ],
          },
        }),
      }).catch(() => {});
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(200).json({ error: err.message });
  }
}
