-- ==========================================================
-- BACKUP OF IDOOST SUPABASE DATABASE (SCHEMA + DATA)
-- Generated: 2026-09-18
-- Project Ref: qokgasbylphbwkodtvqo
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "http";

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'male' CHECK (gender IN ('female', 'male')),
  age INT DEFAULT 24 CHECK (age >= 18 AND age <= 100),
  city TEXT DEFAULT 'تهران',
  province TEXT DEFAULT 'تهران',
  distance_km INT DEFAULT 3,
  marital_status TEXT DEFAULT 'مجرد',
  job TEXT DEFAULT 'آزاد',
  education TEXT DEFAULT 'کارشناسی',
  height_cm INT DEFAULT 175,
  is_verified BOOLEAN DEFAULT true,
  bio TEXT DEFAULT '',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  interests TEXT[] DEFAULT ARRAY['موسیقی', 'کتاب', 'کافه گردی']::TEXT[],
  hobbies TEXT[] DEFAULT ARRAY[]::TEXT[],
  red_lines TEXT[] DEFAULT ARRAY[]::TEXT[],
  telegram_handle TEXT DEFAULT '',
  xp INT DEFAULT 45,
  level INT DEFAULT 1,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  referred_by BIGINT,
  invite_count INT DEFAULT 0,
  is_pro BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- 2. CHAT SESSIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  closed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  duration_seconds INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- 3. MATCH QUEUE TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL,
  search_type TEXT DEFAULT 'random',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
  matched_chat_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  matched_with_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_queue_waiting ON public.match_queue (status, created_at) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_match_queue_user_status ON public.match_queue (user_id, status);

-- ----------------------------------------------------------
-- 4. MESSAGES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_session ON public.messages (chat_session_id, created_at);

-- ----------------------------------------------------------
-- 5. REFERRALS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_telegram_id BIGINT NOT NULL,
  referred_telegram_id BIGINT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------
-- 6. BLOCKED USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- ----------------------------------------------------------
-- 7. REALTIME CONFIGURATION
-- ----------------------------------------------------------
ALTER TABLE public.match_queue REPLICA IDENTITY FULL;
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'match_queue') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_queue;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_sessions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- ----------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users are readable" ON public.users;
CREATE POLICY "Public users are readable" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert or update self" ON public.users;
CREATE POLICY "Users can insert or update self" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Queue entries readable" ON public.match_queue;
CREATE POLICY "Queue entries readable" ON public.match_queue FOR SELECT USING (true);
DROP POLICY IF EXISTS "Queue entries insertable" ON public.match_queue;
CREATE POLICY "Queue entries insertable" ON public.match_queue FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Queue entries updatable" ON public.match_queue;
CREATE POLICY "Queue entries updatable" ON public.match_queue FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Queue entries deletable" ON public.match_queue;
CREATE POLICY "Queue entries deletable" ON public.match_queue FOR DELETE USING (true);

DROP POLICY IF EXISTS "Chat sessions accessible to participants" ON public.chat_sessions;
CREATE POLICY "Chat sessions accessible to participants" ON public.chat_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Messages accessible to session participants" ON public.messages;
CREATE POLICY "Messages accessible to session participants" ON public.messages FOR ALL USING (true);

DROP POLICY IF EXISTS "referrals_all" ON public.referrals;
CREATE POLICY "referrals_all" ON public.referrals FOR ALL USING (true);

DROP POLICY IF EXISTS "blocked_users_all" ON public.blocked_users;
CREATE POLICY "blocked_users_all" ON public.blocked_users FOR ALL USING (true);

-- ----------------------------------------------------------
-- 9. STORED PROCEDURES / FUNCTIONS
-- ----------------------------------------------------------

-- 9.1 Sync Telegram User
CREATE OR REPLACE FUNCTION public.sync_telegram_user(
  p_telegram_id BIGINT,
  p_first_name TEXT DEFAULT '',
  p_last_name TEXT DEFAULT '',
  p_username TEXT DEFAULT '',
  p_name TEXT DEFAULT NULL
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_display_name TEXT;
  v_user public.users;
BEGIN
  v_display_name := COALESCE(NULLIF(p_name, ''), NULLIF(TRIM(COALESCE(p_first_name, '') || ' ' || COALESCE(p_last_name, '')), ''), 'کاربر آی‌دوست');

  INSERT INTO public.users (
    telegram_id,
    first_name,
    last_name,
    username,
    name,
    telegram_handle,
    is_online,
    last_seen
  )
  VALUES (
    p_telegram_id,
    p_first_name,
    p_last_name,
    p_username,
    v_display_name,
    p_username,
    true,
    now()
  )
  ON CONFLICT (telegram_id) DO UPDATE
  SET
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), public.users.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), public.users.last_name),
    username = COALESCE(NULLIF(EXCLUDED.username, ''), public.users.username),
    telegram_handle = COALESCE(NULLIF(EXCLUDED.telegram_handle, ''), public.users.telegram_handle),
    is_online = true,
    last_seen = now(),
    updated_at = now()
  RETURNING * INTO v_user;

  RETURN v_user;
END;
$$;

-- 9.2 Atomic Matchmaker
CREATE OR REPLACE FUNCTION public.find_or_enqueue_match(
  p_user_id UUID,
  p_telegram_id BIGINT,
  p_search_type TEXT DEFAULT 'random'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_peer_queue RECORD;
  v_new_session RECORD;
  v_current_queue RECORD;
  v_partner RECORD;
BEGIN
  UPDATE public.chat_sessions
  SET status = 'closed', ended_at = now()
  WHERE status = 'active'
    AND (user1_id = p_user_id OR user2_id = p_user_id);

  DELETE FROM public.match_queue
  WHERE user_id = p_user_id;

  DELETE FROM public.match_queue
  WHERE status = 'waiting'
    AND created_at < now() - INTERVAL '2 minutes';

  SELECT * INTO v_peer_queue
  FROM public.match_queue
  WHERE status = 'waiting'
    AND user_id != p_user_id
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    INSERT INTO public.chat_sessions (user1_id, user2_id, status)
    VALUES (v_peer_queue.user_id, p_user_id, 'active')
    RETURNING * INTO v_new_session;

    UPDATE public.match_queue
    SET status = 'matched',
        matched_chat_id = v_new_session.id,
        matched_with_user_id = p_user_id,
        updated_at = now()
    WHERE id = v_peer_queue.id;

    INSERT INTO public.match_queue (
      user_id,
      telegram_id,
      search_type,
      status,
      matched_chat_id,
      matched_with_user_id
    )
    VALUES (
      p_user_id,
      p_telegram_id,
      p_search_type,
      'matched',
      v_new_session.id,
      v_peer_queue.user_id
    );

    SELECT * INTO v_partner FROM public.users WHERE id = v_peer_queue.user_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'chat_session_id', v_new_session.id,
      'partner', to_jsonb(v_partner)
    );
  ELSE
    INSERT INTO public.match_queue (
      user_id,
      telegram_id,
      search_type,
      status
    )
    VALUES (
      p_user_id,
      p_telegram_id,
      p_search_type,
      'waiting'
    )
    RETURNING * INTO v_current_queue;

    RETURN jsonb_build_object(
      'status', 'waiting',
      'queue_id', v_current_queue.id
    );
  END IF;
END;
$$;

-- 9.3 Cancel Search
CREATE OR REPLACE FUNCTION public.cancel_match_search(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.match_queue
  WHERE user_id = p_user_id AND status = 'waiting';
  RETURN true;
END;
$$;

-- 9.4 Close Chat Session
CREATE OR REPLACE FUNCTION public.close_chat_session(
  p_session_id UUID,
  p_user_id UUID,
  p_duration_seconds INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.chat_sessions
  SET status = 'closed',
      closed_by = p_user_id,
      duration_seconds = p_duration_seconds,
      ended_at = now()
  WHERE id = p_session_id AND status = 'active';

  DELETE FROM public.match_queue
  WHERE matched_chat_id = p_session_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 9.5 Daily Purge (Closed chats > 24 hours)
CREATE OR REPLACE FUNCTION public.purge_expired_chats_and_messages()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_messages INT;
  v_deleted_sessions INT;
BEGIN
  WITH del_msgs AS (
    DELETE FROM public.messages
    WHERE chat_session_id IN (
      SELECT id FROM public.chat_sessions
      WHERE status = 'closed'
        AND ended_at < now() - INTERVAL '24 hours'
    )
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_messages FROM del_msgs;

  WITH del_sess AS (
    DELETE FROM public.chat_sessions
    WHERE status = 'closed'
      AND ended_at < now() - INTERVAL '24 hours'
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_sessions FROM del_sess;

  DELETE FROM public.match_queue
  WHERE created_at < now() - INTERVAL '30 minutes';

  RETURN jsonb_build_object(
    'deleted_messages', v_deleted_messages,
    'deleted_sessions', v_deleted_sessions,
    'cleaned_at', now()
  );
END;
$$;

-- 9.6 Process Referral
CREATE OR REPLACE FUNCTION public.process_referral(
  p_new_telegram_id BIGINT,
  p_referrer_telegram_id BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_user RECORD;
  v_referrer RECORD;
  v_new_invites INT;
BEGIN
  IF p_new_telegram_id = p_referrer_telegram_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'self_referral');
  END IF;

  SELECT * INTO v_referrer FROM public.users WHERE telegram_id = p_referrer_telegram_id;
  IF NOT FOUND THEN
    INSERT INTO public.users (telegram_id, name, is_online)
    VALUES (p_referrer_telegram_id, 'کاربر دعوت‌کننده', false)
    RETURNING * INTO v_referrer;
  END IF;

  SELECT * INTO v_new_user FROM public.users WHERE telegram_id = p_new_telegram_id;
  IF NOT FOUND THEN
    INSERT INTO public.users (telegram_id, name, is_online)
    VALUES (p_new_telegram_id, 'کاربر جدید', true)
    RETURNING * INTO v_new_user;
  END IF;

  IF v_new_user.referred_by IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_referred',
      'referrer_name', v_referrer.name
    );
  END IF;

  UPDATE public.users
  SET referred_by = p_referrer_telegram_id
  WHERE id = v_new_user.id;

  INSERT INTO public.referrals (referrer_telegram_id, referred_telegram_id)
  VALUES (p_referrer_telegram_id, p_new_telegram_id)
  ON CONFLICT (referred_telegram_id) DO NOTHING;

  SELECT count(*) INTO v_new_invites
  FROM public.referrals
  WHERE referrer_telegram_id = p_referrer_telegram_id;

  UPDATE public.users
  SET invite_count = v_new_invites,
      is_pro = CASE WHEN v_new_invites >= 5 THEN true ELSE is_pro END
  WHERE telegram_id = p_referrer_telegram_id;

  RETURN jsonb_build_object(
    'success', true,
    'referrer_name', v_referrer.name,
    'referrer_telegram_id', p_referrer_telegram_id,
    'referrer_new_invite_count', v_new_invites,
    'referrer_pro_unlocked', (v_new_invites >= 5)
  );
END;
$$;

-- ----------------------------------------------------------
-- 10. CURRENT DATA DUMP (USERS)
-- ----------------------------------------------------------
INSERT INTO public.users (id, telegram_id, first_name, last_name, username, name, gender, age, city, province, distance_km, marital_status, job, education, height_cm, is_verified, bio, photos, interests, hobbies, red_lines, telegram_handle, xp, level, is_online, last_seen, created_at, updated_at, referred_by, invite_count, is_pro)
VALUES
  ('a379eb0a-0571-4d27-b8b7-082a4a92c21f', 990000001, 'امیرحسین', 'جفاری', 'amir_dev', 'امیرحسین جفاری', 'male', 24, 'تهران', 'تهران', 3, 'مجرد', 'آزاد', 'کارشناسی', 175, true, '', ARRAY[]::TEXT[], ARRAY['موسیقی', 'کتاب', 'کافه گردی']::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'amir_dev', 45, 1, true, '2026-09-18 18:21:39.261045+00', '2026-09-17 13:51:40.238093+00', '2026-09-18 18:21:39.261045+00', NULL, 0, false),
  ('c0bc7ad0-4008-488c-9724-db0a79289267', 272919428, 'Amirhosein', '', 'imkaper', 'Amirhosein', 'male', 24, 'تهران', 'تهران', 3, 'مجرد', 'آزاد', 'کارشناسی', 175, true, '', ARRAY['https://t.me/i/userpic/320/5NjvgL7YrUmxIOt_6f8mTia7LwExM7hrz6L1zUE3Gy4.svg']::TEXT[], ARRAY['موسیقی', 'کتاب', 'کافه گردی']::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'imkaper', 45, 1, true, '2026-09-14 22:39:52.214058+00', '2026-09-14 22:39:52.214058+00', '2026-09-14 22:39:52.214058+00', NULL, 0, false),
  ('8eff3c96-c621-434b-b445-123c875f1fa1', 7456054110, 'Ramin', 'Mooraiean', 'manraminm', 'Ramin Mooraiean', 'male', 24, 'تهران', 'تهران', 3, 'مجرد', 'آزاد', 'کارشناسی', 175, true, '', ARRAY['https://t.me/i/userpic/320/G99NDLxj_sS8Zid2tPaH_sPRF6xi8TmGhEi80sP9F3EENjZE8KRvRhiHySP6pTI-.svg']::TEXT[], ARRAY['موسیقی', 'کتاب', 'کافه گردی']::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'manraminm', 45, 1, true, '2026-09-15 09:32:00.232698+00', '2026-09-14 22:38:31.629973+00', '2026-09-15 09:32:00.232698+00', NULL, 0, false),
  ('f25cb3c0-060f-4310-9da0-de7b86eb189c', 264385281, 'Amirhosein', 'Nejadjafari', 'uiamirhosein', 'Amirhosein Nejadjafari', 'male', 24, 'تهران', 'تهران', 3, 'مجرد', 'آزاد', 'کارشناسی', 175, true, '', ARRAY['https://t.me/i/userpic/320/lc4ytWqNB5xFrnyl7Ro44ZWoCmRJYICxF970Oz80Lz4.svg']::TEXT[], ARRAY['موسیقی', 'کتاب', 'کافه گردی']::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'uiamirhosein', 45, 1, true, '2026-09-16 10:21:15.541114+00', '2026-09-14 21:26:42.187546+00', '2026-09-16 10:21:15.541114+00', NULL, 0, false)
ON CONFLICT (telegram_id) DO NOTHING;
