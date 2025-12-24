-- Fix the view security issue - drop and recreate without SECURITY DEFINER issue
-- Views don't need SECURITY DEFINER, we just need to ensure proper access
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate as a simple view (inherits caller's permissions)
CREATE VIEW public.public_profiles AS
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

-- Grant SELECT on the view to all users
GRANT SELECT ON public.public_profiles TO anon, authenticated;