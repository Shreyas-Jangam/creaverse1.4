import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Check if current user follows a specific user
export function useIsFollowing(targetUserId?: string) {
  return useQuery({
    queryKey: ["isFollowing", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!targetUserId,
  });
}

// Follow a user
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to follow");

      // Insert follow relationship (trigger handles count updates)
      const { error: followError } = await supabase
        .from("follows")
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (followError) throw followError;

      return { targetUserId, followerId: user.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", data.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["profile", data.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["profile", data.followerId] });
      queryClient.invalidateQueries({ queryKey: ["profile", "username"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

// Unfollow a user
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to unfollow");

      // Delete follow relationship (trigger handles count updates)
      const { error: unfollowError } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);

      if (unfollowError) throw unfollowError;

      return { targetUserId, followerId: user.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", data.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["profile", data.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["profile", data.followerId] });
      queryClient.invalidateQueries({ queryKey: ["profile", "username"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

// Get followers list with profile info
export function useFollowers(userId?: string) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("follows")
        .select("id, created_at, follower_id")
        .eq("following_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

// Get following list with profile info
export function useFollowing(userId?: string) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("follows")
        .select("id, created_at, following_id")
        .eq("follower_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}
