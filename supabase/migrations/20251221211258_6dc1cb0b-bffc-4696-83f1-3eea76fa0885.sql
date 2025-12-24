-- Create function to update follower/following counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment followers_count for the user being followed
    UPDATE profiles 
    SET followers_count = COALESCE(followers_count, 0) + 1
    WHERE id = NEW.following_id;
    
    -- Increment following_count for the follower
    UPDATE profiles 
    SET following_count = COALESCE(following_count, 0) + 1
    WHERE id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement followers_count for the user being unfollowed
    UPDATE profiles 
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
    WHERE id = OLD.following_id;
    
    -- Decrement following_count for the unfollower
    UPDATE profiles 
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
    WHERE id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for follows table
DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Add unique constraint to prevent duplicate follows
ALTER TABLE follows ADD CONSTRAINT unique_follow UNIQUE (follower_id, following_id);