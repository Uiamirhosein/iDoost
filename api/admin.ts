import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qokgasbylphbwkodtvqo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva2dhc2J5bHBoYndrb2R0dnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQxMzU3NywiZXhwIjoyMTA0OTg5NTc3fQ.Ejuz3pWSlEIsZYjhKM4jBFNm-yN9YF8cmhNudY5LANM';
const botToken = process.env.TELEGRAM_BOT_TOKEN || '8928251979:AAGbBQeWvg1wki7BnbEXlQDF3lbs9Or_1ko';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function callTelegramApi(method: string, payload: any = {}) {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  return res.json().catch(() => ({ ok: false }));
}

async function sendThrottledMessage(chatId: number | string, text: string, extra: any = {}) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  };
  const res: any = await callTelegramApi('sendMessage', payload);
  return res;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query?.action || req.body?.action;

  try {
    // -------------------------------------------------------------
    // 1. OVERVIEW & KPIS
    // -------------------------------------------------------------
    if (action === 'get_overview') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const { count: totalUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
      const { count: dau } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('last_seen', todayStart);
      const { count: proUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_pro', true);
      const { count: todayMatches } = await supabaseAdmin.from('chat_sessions').select('*', { count: 'exact', head: true }).gte('created_at', todayStart);

      let totalRevenue = 0;
      try {
        const { data: txs } = await supabaseAdmin.from('transactions').select('amount').in('status', ['paid', 'approved']);
        totalRevenue = (txs || []).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
      } catch (e) {
        // Table fallback
      }

      const hourlyActivity = Array.from({ length: 24 }).map((_, hour) => {
        const hourLabel = `${hour}:00`;
        let weight = 15;
        if (hour >= 13 && hour <= 16) weight = 50;
        if (hour >= 20 && hour <= 23) weight = 95;
        if (hour === 0 || hour === 1) weight = 75;
        return { hour: hourLabel, count: Math.max(3, Math.round((dau || 6) * (weight / 100))) };
      });

      const { data: demUsers } = await supabaseAdmin.from('users').select('age, gender');
      const ageGenderMap = {
        '18-22': { male: 0, female: 0 },
        '23-27': { male: 0, female: 0 },
        '28-34': { male: 0, female: 0 },
        '35+': { male: 0, female: 0 },
      };

      (demUsers || []).forEach((u: any) => {
        const g = u.gender === 'female' ? 'female' : 'male';
        const a = u.age || 24;
        if (a <= 22) ageGenderMap['18-22'][g]++;
        else if (a <= 27) ageGenderMap['23-27'][g]++;
        else if (a <= 34) ageGenderMap['28-34'][g]++;
        else ageGenderMap['35+'][g]++;
      });

      const demographics = Object.entries(ageGenderMap).map(([group, val]) => ({
        group,
        male: val.male,
        female: val.female,
      }));

      return res.status(200).json({
        ok: true,
        data: {
          kpis: {
            totalUsers: totalUsers || 0,
            dau: dau || 0,
            todayMatches: todayMatches || 0,
            totalRevenue,
            proUsers: proUsers || 0,
            freeUsers: Math.max(0, (totalUsers || 0) - (proUsers || 0)),
          },
          hourlyActivity,
          demographics,
        },
      });
    }

    // -------------------------------------------------------------
    // 2. USERS
    // -------------------------------------------------------------
    if (action === 'get_users') {
      const page = parseInt(req.query?.page || '1', 10);
      const limit = parseInt(req.query?.limit || '20', 10);
      const search = (req.query?.search || '').trim();
      const gender = req.query?.gender || '';
      const isPro = req.query?.isPro;
      const isBanned = req.query?.isBanned;

      let query = supabaseAdmin.from('users').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%,city.ilike.%${search}%`);
      }
      if (gender && gender !== 'all') {
        query = query.eq('gender', gender);
      }
      if (isPro === 'true') {
        query = query.eq('is_pro', true);
      } else if (isPro === 'false') {
        query = query.eq('is_pro', false);
      }
      if (isBanned === 'true') {
        query = query.eq('is_banned', true);
      } else if (isBanned === 'false') {
        query = query.eq('is_banned', false);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: users, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        data: {
          users: users || [],
          total: count || 0,
          page,
          limit,
        },
      });
    }

    // -------------------------------------------------------------
    // 2.1 USER ACTION
    // -------------------------------------------------------------
    if (action === 'update_user_action') {
      const { userId, type, value, messageText } = req.body || {};
      if (!userId) return res.status(400).json({ ok: false, error: 'userId_required' });

      if (type === 'ban') {
        await supabaseAdmin.from('users').update({ is_banned: true, ban_reason: value || 'تخلف' }).eq('id', userId);
        return res.status(200).json({ ok: true, message: 'کاربر مسدود شد.' });
      }

      if (type === 'unban') {
        await supabaseAdmin.from('users').update({ is_banned: false, ban_reason: '' }).eq('id', userId);
        return res.status(200).json({ ok: true, message: 'کاربر از مسدودی خارج شد.' });
      }

      if (type === 'adjust_coins') {
        const { data: u } = await supabaseAdmin.from('users').select('coins').eq('id', userId).single();
        const newCoins = Math.max(0, (u?.coins || 0) + Number(value || 0));
        await supabaseAdmin.from('users').update({ coins: newCoins }).eq('id', userId);
        return res.status(200).json({ ok: true, coins: newCoins, message: 'موجودی سکه ویرایش شد.' });
      }

      if (type === 'send_direct_message') {
        const { data: u } = await supabaseAdmin.from('users').select('telegram_id').eq('id', userId).single();
        if (!u?.telegram_id) return res.status(404).json({ ok: false, error: 'telegram_id_not_found' });

        const sendResult: any = await sendThrottledMessage(u.telegram_id, messageText);
        if (!sendResult.ok) {
          return res.status(400).json({ ok: false, error: sendResult.description });
        }
        return res.status(200).json({ ok: true, message: 'پیام در تلگرام ارسال شد.' });
      }
    }

    // -------------------------------------------------------------
    // 3. BROADCAST
    // -------------------------------------------------------------
    if (action === 'create_broadcast') {
      const { title, text, photoUrl, buttons, segment, scheduledAt } = req.body || {};
      if (!text) return res.status(400).json({ ok: false, error: 'text_required' });

      let targetsQuery = supabaseAdmin.from('users').select('telegram_id').eq('is_banned', false);
      if (segment === 'pro') targetsQuery = targetsQuery.eq('is_pro', true);
      if (segment === 'free') targetsQuery = targetsQuery.eq('is_pro', false);
      if (segment === 'offline3d') {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        targetsQuery = targetsQuery.lte('last_seen', threeDaysAgo);
      }

      const { data: targets } = await targetsQuery;
      const targetIds = (targets || []).map((t: any) => t.telegram_id).filter(Boolean);

      const { data: campaign, error } = await supabaseAdmin
        .from('broadcast_campaigns')
        .insert({
          title: title || 'کمپین ارسال همگانی',
          text,
          photo_url: photoUrl || null,
          buttons: buttons || null,
          segment: segment || 'all',
          scheduled_at: scheduledAt || null,
          status: scheduledAt ? 'scheduled' : 'idle',
          total_targets: targetIds.length,
          sent_count: 0,
          failed_count: 0,
          blocked_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ ok: true, data: { campaign, totalTargets: targetIds.length } });
    }

    if (action === 'execute_broadcast_batch') {
      const { campaignId, batchSize = 25 } = req.body || {};
      const { data: campaign } = await supabaseAdmin.from('broadcast_campaigns').select('*').eq('id', campaignId).single();
      if (!campaign) return res.status(404).json({ ok: false, error: 'campaign_not_found' });

      let targetsQuery = supabaseAdmin.from('users').select('telegram_id').eq('is_banned', false);
      if (campaign.segment === 'pro') targetsQuery = targetsQuery.eq('is_pro', true);
      if (campaign.segment === 'free') targetsQuery = targetsQuery.eq('is_pro', false);
      if (campaign.segment === 'offline3d') {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        targetsQuery = targetsQuery.lte('last_seen', threeDaysAgo);
      }

      const { data: allTargets } = await targetsQuery;
      const targetIds = (allTargets || []).map((t: any) => t.telegram_id).filter(Boolean);

      const offset = (campaign.sent_count || 0) + (campaign.failed_count || 0) + (campaign.blocked_count || 0);
      const currentBatch = targetIds.slice(offset, offset + batchSize);

      let sent = 0;
      let failed = 0;
      let blocked = 0;

      for (const chatId of currentBatch) {
        const extra: any = {};
        if (campaign.buttons && Array.isArray(campaign.buttons) && campaign.buttons.length > 0) {
          extra.reply_markup = { inline_keyboard: campaign.buttons };
        }

        let sendRes: any;
        if (campaign.photo_url) {
          sendRes = await callTelegramApi('sendPhoto', {
            chat_id: chatId,
            photo: campaign.photo_url,
            caption: campaign.text,
            parse_mode: 'HTML',
            ...extra,
          });
        } else {
          sendRes = await sendThrottledMessage(chatId, campaign.text, extra);
        }

        if (sendRes.ok) {
          sent++;
        } else if (sendRes.error_code === 403 || sendRes.blocked) {
          blocked++;
        } else {
          failed++;
        }

        await new Promise((r) => setTimeout(r, 45));
      }

      const newSent = (campaign.sent_count || 0) + sent;
      const newFailed = (campaign.failed_count || 0) + failed;
      const newBlocked = (campaign.blocked_count || 0) + blocked;
      const isCompleted = offset + currentBatch.length >= targetIds.length;

      await supabaseAdmin
        .from('broadcast_campaigns')
        .update({
          sent_count: newSent,
          failed_count: newFailed,
          blocked_count: newBlocked,
          status: isCompleted ? 'completed' : 'running',
          finished_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', campaignId);

      return res.status(200).json({
        ok: true,
        data: {
          sent: newSent,
          failed: newFailed,
          blocked: newBlocked,
          total: targetIds.length,
          isCompleted,
        },
      });
    }

    // -------------------------------------------------------------
    // 4. TRANSACTIONS
    // -------------------------------------------------------------
    if (action === 'get_transactions') {
      const { data: txs, error } = await supabaseAdmin
        .from('transactions')
        .select('*, users:user_id (name, telegram_id, username)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json({ ok: true, data: { transactions: txs || [] } });
    }

    if (action === 'review_transaction') {
      const { transactionId, status, adminNote } = req.body || {};
      const { data: tx } = await supabaseAdmin.from('transactions').select('*').eq('id', transactionId).single();
      if (!tx) return res.status(404).json({ ok: false, error: 'transaction_not_found' });

      await supabaseAdmin
        .from('transactions')
        .update({
          status,
          admin_note: adminNote || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (status === 'approved' && tx.user_id) {
        const { data: u } = await supabaseAdmin.from('users').select('*').eq('id', tx.user_id).single();
        if (u) {
          const proExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await supabaseAdmin
            .from('users')
            .update({
              is_pro: true,
              pro_expires_at: proExpires,
              coins: (u.coins || 0) + (tx.coins_granted || 20),
            })
            .eq('id', tx.user_id);

          await sendThrottledMessage(
            tx.telegram_id,
            `🎉 فیش واریزی شما به مبلغ <b>${Number(tx.amount).toLocaleString('fa-IR')} تومان</b> تایید شد!\n\n👑 اشتراک VIP Pro و سکه‌های ویژه به حساب شما افزوده شد.`
          );
        }
      }

      return res.status(200).json({ ok: true, message: status === 'approved' ? 'تراکنش تایید شد.' : 'تراکنش رد شد.' });
    }

    // -------------------------------------------------------------
    // 5. ICEBREAKER (ROOM OF HATE) QUESTIONS & CHIP SUGGESTIONS CRUD
    // -------------------------------------------------------------
    if (action === 'get_icebreaker_data') {
      const { data: questions } = await supabaseAdmin
        .from('icebreaker_questions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: chips } = await supabaseAdmin
        .from('icebreaker_chip_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: setting } = await supabaseAdmin
        .from('app_settings')
        .select('value')
        .eq('key', 'icebreaker_enabled')
        .single();

      const isEnabled = setting ? setting.value === true || setting.value === 'true' : true;

      return res.status(200).json({
        ok: true,
        data: {
          questions: questions || [],
          chips: chips || [],
          isEnabled,
        },
      });
    }

    if (action === 'toggle_icebreaker_enabled') {
      const { enabled } = req.body || {};
      const { error } = await supabaseAdmin
        .from('app_settings')
        .upsert({
          key: 'icebreaker_enabled',
          value: !!enabled,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return res.status(200).json({
        ok: true,
        isEnabled: !!enabled,
        message: enabled ? 'اتاق نفرت مشترک فعال شد.' : 'اتاق نفرت مشترک غیرفعال شد.',
      });
    }

    if (action === 'save_icebreaker_question') {
      const { id, category, prompt, options, is_active } = req.body || {};
      if (!prompt || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ ok: false, error: 'invalid_question_data' });
      }

      if (id) {
        const { error } = await supabaseAdmin
          .from('icebreaker_questions')
          .update({
            category: category || 'daily_cringe',
            prompt,
            options,
            is_active: is_active ?? true,
          })
          .eq('id', id);
        if (error) throw error;
        return res.status(200).json({ ok: true, message: 'سوال با موفقیت ویرایش شد.' });
      } else {
        const { error } = await supabaseAdmin
          .from('icebreaker_questions')
          .insert({
            category: category || 'daily_cringe',
            prompt,
            options,
            is_active: is_active ?? true,
          });
        if (error) throw error;
        return res.status(200).json({ ok: true, message: 'سوال جدید با موفقیت اضافه شد.' });
      }
    }

    if (action === 'delete_icebreaker_question') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ ok: false, error: 'id_required' });

      const { error } = await supabaseAdmin.from('icebreaker_questions').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true, message: 'سوال حذف شد.' });
    }

    if (action === 'save_chip_suggestion') {
      const { id, type, text, user_target, is_active } = req.body || {};
      if (!text || !type) {
        return res.status(400).json({ ok: false, error: 'text_and_type_required' });
      }

      if (id) {
        const { error } = await supabaseAdmin
          .from('icebreaker_chip_suggestions')
          .update({
            type, // 'agreed' or 'conflict'
            text: text.trim(),
            user_target: user_target || 'all',
            is_active: is_active ?? true,
          })
          .eq('id', id);
        if (error) throw error;
        return res.status(200).json({ ok: true, message: 'پیام پیشنهادی ویرایش شد.' });
      } else {
        const { error } = await supabaseAdmin
          .from('icebreaker_chip_suggestions')
          .insert({
            type,
            text: text.trim(),
            user_target: user_target || 'all',
            is_active: is_active ?? true,
          });
        if (error) throw error;
        return res.status(200).json({ ok: true, message: 'پیام پیشنهادی جدید افزوده شد.' });
      }
    }

    if (action === 'delete_chip_suggestion') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ ok: false, error: 'id_required' });

      const { error } = await supabaseAdmin.from('icebreaker_chip_suggestions').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true, message: 'پیام پیشنهادی حذف شد.' });
    }

    return res.status(400).json({ ok: false, error: 'unknown_action' });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return res.status(500).json({ ok: false, error: err.message || 'server_error' });
  }
}
