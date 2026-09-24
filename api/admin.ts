import { supabaseAdmin, callTelegramApi, sendThrottledMessage } from './_lib';

export default async function handler(req: any, res: any) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || req.body?.action;

  try {
    // -------------------------------------------------------------
    // 1. KPI & OVERVIEW ANALYTICS
    // -------------------------------------------------------------
    if (action === 'get_overview') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Total Users & DAU
      const { count: totalUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
      const { count: dau } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('last_seen', todayStart);
      const { count: proUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_pro', true);
      const { count: todayMatches } = await supabaseAdmin.from('chat_sessions').select('*', { count: 'exact', head: true }).gte('created_at', todayStart);

      // Financial Total Revenue
      const { data: txs } = await supabaseAdmin.from('transactions').select('amount').in('status', ['paid', 'approved']);
      const totalRevenue = (txs || []).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

      // Hourly Activity Simulation / Distribution
      const hourlyActivity = Array.from({ length: 24 }).map((_, hour) => {
        const hourLabel = `${hour}:00`;
        // Activity curve matching Iranian dating app peak (20:00 to 01:00)
        let weight = 12;
        if (hour >= 13 && hour <= 16) weight = 45;
        if (hour >= 20 && hour <= 23) weight = 95;
        if (hour === 0 || hour === 1) weight = 80;
        return { hour: hourLabel, count: Math.max(5, Math.round((dau || 20) * (weight / 100))) };
      });

      // Demographic distribution (Age & Gender)
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
    // 2. USER MANAGEMENT: LIST & QUERY
    // -------------------------------------------------------------
    if (action === 'get_users') {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const search = (req.query.search || '').trim();
      const gender = req.query.gender || '';
      const isPro = req.query.isPro;
      const isBanned = req.query.isBanned;

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
    // 2.1 USER MANAGEMENT: ACTIONS (BAN / COINS / SEND DIRECT MSG)
    // -------------------------------------------------------------
    if (action === 'update_user_action') {
      const { userId, type, value, messageText } = req.body;
      if (!userId) return res.status(400).json({ ok: false, error: 'userId_required' });

      // Action: Ban/Unban
      if (type === 'ban') {
        const { error } = await supabaseAdmin.from('users').update({ is_banned: true, ban_reason: value || 'تخلف از قوانین' }).eq('id', userId);
        if (error) throw error;
        return res.status(200).json({ ok: true, message: 'کاربر مسدود شد.' });
      }

      if (type === 'unban') {
        const { error } = await supabaseAdmin.from('users').update({ is_banned: false, ban_reason: '' }).eq('id', userId);
        if (error) throw error;
        return res.status(200).json({ ok: true, message: 'کاربر از مسدودی خارج شد.' });
      }

      // Action: Adjust coins
      if (type === 'adjust_coins') {
        const { data: u } = await supabaseAdmin.from('users').select('coins').eq('id', userId).single();
        const newCoins = Math.max(0, (u?.coins || 0) + Number(value || 0));
        await supabaseAdmin.from('users').update({ coins: newCoins }).eq('id', userId);
        return res.status(200).json({ ok: true, coins: newCoins, message: 'موجودی سکه با موفقیت ویرایش شد.' });
      }

      // Action: Send direct message via Telegram Bot
      if (type === 'send_direct_message') {
        const { data: u } = await supabaseAdmin.from('users').select('telegram_id').eq('id', userId).single();
        if (!u?.telegram_id) return res.status(404).json({ ok: false, error: 'telegram_id_not_found' });

        const sendResult = await sendThrottledMessage(u.telegram_id, messageText);
        if (!sendResult.ok) {
          return res.status(400).json({ ok: false, error: sendResult.description });
        }
        return res.status(200).json({ ok: true, message: 'پیام مستقیماً در تلگرام ارسال شد.' });
      }
    }

    // -------------------------------------------------------------
    // 3. BROADCAST ENGINE (CREATION & THROTTLED QUEUE RUN)
    // -------------------------------------------------------------
    if (action === 'create_broadcast') {
      const { title, text, photoUrl, buttons, segment, scheduledAt } = req.body;
      if (!text) return res.status(400).json({ ok: false, error: 'text_required' });

      // Target selection
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
      const { campaignId, batchSize = 25 } = req.body;
      const { data: campaign } = await supabaseAdmin.from('broadcast_campaigns').select('*').eq('id', campaignId).single();
      if (!campaign) return res.status(404).json({ ok: false, error: 'campaign_not_found' });

      // Fetch targets for this campaign segment
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

        let res: any;
        if (campaign.photo_url) {
          res = await callTelegramApi('sendPhoto', {
            chat_id: chatId,
            photo: campaign.photo_url,
            caption: campaign.text,
            parse_mode: 'HTML',
            ...extra,
          });
        } else {
          res = await sendThrottledMessage(chatId, campaign.text, extra);
        }

        if (res.ok) {
          sent++;
        } else if (res.error_code === 403 || res.blocked) {
          blocked++;
        } else {
          failed++;
        }

        // Safe throttle delay 40ms to stay strictly below 30 msgs/second
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
    // 4. FINANCIAL MODULE (TRANSACTIONS & RECEIPT VERIFICATION)
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
      const { transactionId, status, adminNote } = req.body;
      const { data: tx } = await supabaseAdmin.from('transactions').select('*').eq('id', transactionId).single();
      if (!tx) return res.status(404).json({ ok: false, error: 'transaction_not_found' });

      await supabaseAdmin
        .from('transactions')
        .update({
          status, // 'approved' or 'rejected'
          admin_note: adminNote || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      // If approved, grant PRO or Coins to user
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

          // Send approval message to user in Telegram
          await sendThrottledMessage(
            tx.telegram_id,
            `🎉 فیش واریزی شما به مبلغ <b>${Number(tx.amount).toLocaleString('fa-IR')} تومان</b> تایید شد!\n\n👑 اشتراک VIP Pro و سکه‌های ویژه به حساب شما افزوده شد. از گفتگوی بدون مرز در آی‌دوست لذت ببرید!`
          );
        }
      }

      return res.status(200).json({ ok: true, message: status === 'approved' ? 'تراکنش تایید شد.' : 'تراکنش رد شد.' });
    }

    return res.status(400).json({ ok: false, error: 'unknown_action' });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return res.status(500).json({ ok: false, error: err.message || 'server_error' });
  }
}
