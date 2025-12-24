-- Create function to increment user tokens (used by review scoring)
CREATE OR REPLACE FUNCTION public.increment_tokens(user_id UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET 
    tokens_balance = COALESCE(tokens_balance, 0) + amount,
    tokens_earned = COALESCE(tokens_earned, 0) + amount
  WHERE id = user_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_tokens(UUID, INTEGER) TO authenticated;

-- Create function to calculate and update reputation score
CREATE OR REPLACE FUNCTION public.calculate_reputation(p_user_id UUID)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reputation NUMERIC := 0;
  v_review_quality NUMERIC;
  v_engagement NUMERIC;
  v_followers NUMERIC;
  v_tokens NUMERIC;
BEGIN
  -- Average review quality (weighted heavily)
  SELECT COALESCE(AVG(quality_score), 0) * 0.4 INTO v_review_quality
  FROM reviews
  WHERE author_id = p_user_id AND is_verified = true;
  
  -- Post engagement score
  SELECT COALESCE(
    SUM(likes_count + comments_count * 2 + shares_count * 3 + saves_count * 2) / NULLIF(COUNT(*), 0), 
    0
  ) * 0.02 INTO v_engagement
  FROM posts
  WHERE author_id = p_user_id AND is_published = true;
  v_engagement := LEAST(v_engagement, 20); -- Cap at 20 points
  
  -- Follower score (logarithmic)
  SELECT COALESCE(LOG(GREATEST(followers_count, 1) + 1) * 5, 0) INTO v_followers
  FROM profiles
  WHERE id = p_user_id;
  v_followers := LEAST(v_followers, 20); -- Cap at 20 points
  
  -- Token balance contribution
  SELECT COALESCE(LOG(GREATEST(tokens_balance, 1) + 1) * 2, 0) INTO v_tokens
  FROM profiles
  WHERE id = p_user_id;
  v_tokens := LEAST(v_tokens, 20); -- Cap at 20 points
  
  -- Calculate total reputation (max 100)
  v_reputation := LEAST(v_review_quality + v_engagement + v_followers + v_tokens, 100);
  
  -- Update the profile
  UPDATE profiles
  SET reputation = v_reputation
  WHERE id = p_user_id;
  
  RETURN v_reputation;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.calculate_reputation(UUID) TO authenticated;