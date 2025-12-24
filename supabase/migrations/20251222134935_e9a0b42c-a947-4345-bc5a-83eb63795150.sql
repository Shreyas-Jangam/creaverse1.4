-- Drop the view and recreate with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

-- Create view with SECURITY INVOKER (respects caller's RLS)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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

-- Grant access
GRANT SELECT ON public.public_profiles TO anon, authenticated;