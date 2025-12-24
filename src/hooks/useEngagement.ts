import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { moderateContent } from "@/services/aiModerationService";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface PostEngagement {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

export interface CommentWithAuthor {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string | null;
  author?: {
    display_name: string;
    username: string;
    avatar_url?: string | null;
    is_verified?: boolean | null;
  };
}

export interface LikeWithUser {
  user_id: string;
  created_at: string;
  user: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  } | null;
}

export function usePostLikes(postId?: string | null) {
  return useQuery<LikeWithUser[]>({
    queryKey: ["post-likes", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data: likesRows, error: likesError } = await supabase
        .from("likes")
        .select("user_id, created_at")
        .eq("post_id", postId);

      if (likesError) throw likesError;

      const userIds = (likesRows ?? []).map((l) => l.user_id);
      if (userIds.length === 0) return [];

      const { data: profilesRows, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, is_verified")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const profilesById = new Map(
        (profilesRows ?? []).map((p) => [p.id, p]),
      );

      return (likesRows ?? []).map((l) => ({
        user_id: l.user_id,
        created_at: l.created_at as string,
        user: profilesById.get(l.user_id) ?? null,
      }));
    },
  });
}

export function usePostEngagement(postId?: string | null) {
  return useQuery<PostEngagement>({
    queryKey: ["post-engagement", postId],
    enabled: !!postId,
    queryFn: async () => {
      // Query the database for all posts
      const { data, error } = await supabase
        .from("posts")
        .select("likes_count, comments_count, shares_count")
        .eq("id", postId)
        .maybeSingle();

      if (error) throw error;

      return {
        likesCount: data?.likes_count ?? 0,
        commentsCount: data?.comments_count ?? 0,
        sharesCount: data?.shares_count ?? 0,
      };
    },
  });
}

export function useIsPostLiked(postId?: string | null) {
  const { user } = useAuth();

  return useQuery<boolean>({
    queryKey: ["post-liked", postId, user?.id],
    enabled: !!postId && !!user,
    queryFn: async () => {
      // Query the database for all posts
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error; // ignore not found
      return !!data;
    },
    initialData: false,
  });
}

export function useTogglePostLike(postId?: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("Missing post id");
      if (!user) throw new Error("Not authenticated");
      
      // Validate UUID format for database posts
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(postId)) {
        throw new Error(`Invalid post ID format: ${postId}. Expected UUID format.`);
      }
      
      // Check if user already liked this post
      const { data: existingLike, error: checkError } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      
      let isLiked: boolean;
      
      if (existingLike) {
        // Unlike: remove the like
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);
        
        if (deleteError) {
          throw deleteError;
        }
        
        isLiked = false;
      } else {
        // Like: add the like
        const { error: insertError } = await supabase
          .from("likes")
          .insert({
            user_id: user.id,
            post_id: postId
          });
        
        if (insertError) {
          throw insertError;
        }
        
        isLiked = true;
      }
      
      // Get updated likes count
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();
      
      if (postError) {
        throw postError;
      }
      
      return {
        is_liked: isLiked,
        likes_count: postData.likes_count || 0
      };
    },
    onMutate: async () => {
      if (!user) {
        toast.error("Please sign in to like posts");
        throw new Error("Not authenticated");
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PostEngagement>(["post-engagement", postId], (old) => ({
        likesCount: data?.likes_count ?? old?.likesCount ?? 0,
        commentsCount: old?.commentsCount ?? 0,
        sharesCount: old?.sharesCount ?? 0,
      }));
      queryClient.setQueryData<boolean>(["post-liked", postId, user?.id], data?.is_liked ?? false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["post-engagement", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-liked", postId, user?.id] });
      
      // Show success message
      toast.success(data?.is_liked ? "Post liked! ❤️" : "Post unliked");
    },
    onError: (error) => {
      toast.error(`Could not update like: ${error?.message || 'Unknown error'}`);
    },
  });
}

export function usePostComments(postId?: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<CommentWithAuthor[]>({
    queryKey: ["post-comments", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
            id,
            post_id,
            author_id,
            content,
            parent_id,
            created_at,
            updated_at,
            author:author_id (
              display_name,
              username,
              avatar_url,
              is_verified
            )
          `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data as any[]) as CommentWithAuthor[];
    },
  });

  useEffect(() => {
    if (!postId) return;
    const channel = supabase
      .channel(`post-comments-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
          queryClient.invalidateQueries({ queryKey: ["post-engagement", postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return query;
}

export function useAddComment(postId?: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string | null }) => {
      if (!postId) throw new Error("Missing post id");
      if (!user) throw new Error("Not authenticated");

      const moderation = await moderateContent("comment", content, undefined);
      if (moderation.is_spam || moderation.ai_analysis.toxicity > 70 || moderation.quality_score < 10) {
        throw new Error("Comment blocked by moderation");
      }

      const { data, error } = await supabase.rpc("add_post_comment", {
        p_post_id: postId,
        p_content: content.trim(),
        p_parent_id: parentId ?? null,
      });
      if (error) throw error;
      return data as CommentWithAuthor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-engagement", postId] });
      toast.success("Comment posted");
    },
    onError: (error: any) => {
      console.error("add comment error", error);
      toast.error(error?.message || "Could not post comment");
    },
  });
}

export function useDeleteComment(postId?: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-engagement", postId] });
      toast.success("Comment deleted");
    },
    onError: (error) => {
      console.error("delete comment error", error);
      toast.error("Could not delete comment");
    },
  });
}

export function useSharePost(postId?: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (platform: string = "link") => {
      if (!postId) throw new Error("Missing post id");
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("record_post_share", {
        p_post_id: postId,
        p_platform: platform,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (sharesCount) => {
      queryClient.setQueryData<PostEngagement>(["post-engagement", postId], (old) => ({
        likesCount: old?.likesCount ?? 0,
        commentsCount: old?.commentsCount ?? 0,
        sharesCount: sharesCount ?? old?.sharesCount ?? 0,
      }));
      toast.success("Share recorded");
    },
    onError: (error) => {
      console.error("share error", error);
      toast.error("Could not share");
    },
  });
}
