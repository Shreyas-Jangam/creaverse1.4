-- Add post_shares table for tracking shares by user/platform
CREATE TABLE public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT DEFAULT 'link',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Post shares are viewable by everyone"
  ON public.post_shares FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create shares"
  ON public.post_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares"
  ON public.post_shares FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX idx_post_shares_user_id ON public.post_shares(user_id);
CREATE INDEX idx_post_shares_created_at ON public.post_shares(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS unique_post_like ON public.likes(user_id, post_id) WHERE post_id IS NOT NULL;

-- === Engagement count helpers ===

-- Likes count
CREATE OR REPLACE FUNCTION public.increment_post_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_post_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.post_id IS NOT NULL THEN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_likes_inc ON public.likes;
CREATE TRIGGER trg_likes_inc
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_post_likes();

DROP TRIGGER IF EXISTS trg_likes_dec ON public.likes;
CREATE TRIGGER trg_likes_dec
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_post_likes();

-- Comments count
CREATE OR REPLACE FUNCTION public.increment_post_comments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_post_comments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_comments_inc ON public.comments;
CREATE TRIGGER trg_comments_inc
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_post_comments();

DROP TRIGGER IF EXISTS trg_comments_dec ON public.comments;
CREATE TRIGGER trg_comments_dec
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_post_comments();

-- Shares count
CREATE OR REPLACE FUNCTION public.increment_post_shares()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_post_shares()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_shares_inc ON public.post_shares;
CREATE TRIGGER trg_post_shares_inc
  AFTER INSERT ON public.post_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_post_shares();

DROP TRIGGER IF EXISTS trg_post_shares_dec ON public.post_shares;
CREATE TRIGGER trg_post_shares_dec
  AFTER DELETE ON public.post_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_post_shares();

-- === RPC helpers ===

-- Toggle like for current user; returns is_liked and likes_count
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id UUID)
RETURNS TABLE(is_liked BOOLEAN, likes_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Try insert
  BEGIN
    INSERT INTO public.likes (user_id, post_id) VALUES (v_user, p_post_id);
    is_liked := true;
  EXCEPTION
    WHEN unique_violation THEN
      -- Already liked: remove
      DELETE FROM public.likes WHERE user_id = v_user AND post_id = p_post_id;
      is_liked := false;
  END;

  SELECT likes_count INTO likes_count FROM public.posts WHERE id = p_post_id;
  RETURN NEXT;
END;
$$;

-- Add a comment; returns the inserted row
CREATE OR REPLACE FUNCTION public.add_post_comment(p_post_id UUID, p_content TEXT, p_parent_id UUID DEFAULT NULL)
RETURNS public.comments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID;
  v_comment public.comments%ROWTYPE;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.comments (post_id, author_id, content, parent_id)
  VALUES (p_post_id, v_user, p_content, p_parent_id)
  RETURNING * INTO v_comment;

  RETURN v_comment;
END;
$$;

-- Record a share; returns the new shares_count
CREATE OR REPLACE FUNCTION public.record_post_share(p_post_id UUID, p_platform TEXT DEFAULT 'link')
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID;
  v_count INTEGER;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.post_shares (post_id, user_id, platform)
  VALUES (p_post_id, v_user, COALESCE(p_platform, 'link'));

  SELECT shares_count INTO v_count FROM public.posts WHERE id = p_post_id;
  RETURN v_count;
END;
$$;

-- Publish to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;


