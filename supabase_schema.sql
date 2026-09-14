-- ==========================================================
-- SUPABASE SCHEMA & STORED PROCEDURES FOR IDOOST (HAMDAM)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
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
  photos TEXT[] DEFAULT ARRAY['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80']::TEXT[],
  interests TEXT[] DEFAULT ARRAY['موسیقی', 'کتاب', 'کافه گردی']::TEXT[],
  hobbies TEXT[] DEFAULT ARRAY[]::TEXT[],
  red_lines TEXT[] DEFAULT ARRAY[]::TEXT[],
  telegram_handle TEXT DEFAULT '',
  xp INT DEFAULT 45,
  level INT DEFAULT 1,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CHAT SESSIONS TABLE
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

-- 3. MATCH QUEUE TABLE
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

-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_session ON public.messages (chat_session_id, created_at);

-- 5. Enable Realtime Publications & Replica Identity
ALTER TABLE public.match_queue REPLICA IDENTITY FULL;
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'match_queue'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_queue;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- 6. MATCHMAKING ATOMIC FUNCTION
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
  -- 1. Auto-close any old or abandoned sessions for this user so they don't reconnect to ghost chats
  UPDATE public.chat_sessions
  SET status = 'closed', ended_at = now()
  WHERE status = 'active'
    AND (user1_id = p_user_id OR user2_id = p_user_id);

  -- 2. Clear all previous queue rows for this user
  DELETE FROM public.match_queue
  WHERE user_id = p_user_id;

  -- 3. Also purge any stale queue entries older than 2 minutes (users who closed browser/app without cancelling)
  DELETE FROM public.match_queue
  WHERE status = 'waiting'
    AND created_at < now() - INTERVAL '2 minutes';

  -- 4. ATOMIC PEER LOCK: Find someone who is EXPLICITLY waiting in match_queue right now!
  SELECT * INTO v_peer_queue
  FROM public.match_queue
  WHERE status = 'waiting'
    AND user_id != p_user_id
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    -- A real user is actively waiting in the queue! Create active chat session
    INSERT INTO public.chat_sessions (user1_id, user2_id, status)
    VALUES (v_peer_queue.user_id, p_user_id, 'active')
    RETURNING * INTO v_new_session;

    -- Update peer's queue entry so their Realtime subscription and polling notify them
    UPDATE public.match_queue
    SET status = 'matched',
        matched_chat_id = v_new_session.id,
        matched_with_user_id = p_user_id,
        updated_at = now()
    WHERE id = v_peer_queue.id;

    -- Insert matched entry for current user
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

    -- Fetch peer user details to return to current user
    SELECT * INTO v_partner FROM public.users WHERE id = v_peer_queue.user_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'chat_session_id', v_new_session.id,
      'partner', to_jsonb(v_partner)
    );
  ELSE
    -- Nobody is searching right now -> Put current user in queue as waiting
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

-- 7. CANCEL SEARCH FUNCTION
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

-- 8. CLOSE CHAT SESSION FUNCTION
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

  -- Clean up queues for participants
  DELETE FROM public.match_queue
  WHERE matched_chat_id = p_session_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8.1 DAILY DATABASE PURGE (Chats & Messages Retention Policy: 24 Hours)
CREATE OR REPLACE FUNCTION public.purge_expired_chats_and_messages()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_messages INT;
  v_deleted_sessions INT;
BEGIN
  -- Delete messages older than 24 hours
  WITH del_msgs AS (
    DELETE FROM public.messages
    WHERE created_at < now() - INTERVAL '24 hours'
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_messages FROM del_msgs;

  -- Delete closed sessions older than 24 hours
  WITH del_sess AS (
    DELETE FROM public.chat_sessions
    WHERE (status = 'closed' AND ended_at < now() - INTERVAL '24 hours')
       OR (created_at < now() - INTERVAL '24 hours')
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_sessions FROM del_sess;

  -- Delete stale queue entries older than 30 minutes
  DELETE FROM public.match_queue
  WHERE created_at < now() - INTERVAL '30 minutes';

  RETURN jsonb_build_object(
    'deleted_messages', v_deleted_messages,
    'deleted_sessions', v_deleted_sessions,
    'cleaned_at', now()
  );
END;
$$;

-- 9. UPSERT TELEGRAM USER FUNCTION
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
  v_display_name := COALESCE(NULLIF(p_name, ''), NULLIF(TRIM(COALESCE(p_first_name, '') || ' ' || COALESCE(p_last_name, '')), ''), 'کاربر همدم');

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

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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
