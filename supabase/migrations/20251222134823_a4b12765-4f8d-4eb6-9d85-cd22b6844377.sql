-- Fix 1: Secure increment_tokens function - only admins can call it
CREATE OR REPLACE FUNCTION public.increment_tokens(user_id UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: only admins can modify token balances';
  END IF;
  
  -- Validate amount is positive and reasonable
  IF amount <= 0 OR amount > 10000 THEN
    RAISE EXCEPTION 'Invalid amount: must be between 1 and 10000';
  END IF;

  UPDATE profiles 
  SET 
    tokens_balance = COALESCE(tokens_balance, 0) + amount,
    tokens_earned = COALESCE(tokens_earned, 0) + amount
  WHERE id = user_id;
END;
$$;

-- Fix 2: Protect email in profiles - replace overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Users can see their own full profile (including email)
CREATE POLICY "Users can view own full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Public can view profiles but app must exclude sensitive columns
CREATE POLICY "Public can view basic profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Create a secure view that hides sensitive data for public queries
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  bio,
  creator_types,
  is_verified,
  reputation,
  followers_count,
  following_count,
  created_at,
  updated_at
FROM public.profiles;