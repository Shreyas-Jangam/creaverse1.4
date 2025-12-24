import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  moderateContent, 
  scoreReview, 
  getRecommendations,
  preCheckContent,
  type ModerationResult,
  type ReviewScore,
  type RecommendationResult
} from "@/services/aiModerationService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to moderate content before submission
 */
export function useContentModeration() {
  return useMutation({
    mutationFn: async ({
      contentType,
      content,
      context,
    }: {
      contentType: "review" | "comment" | "post";
      content: string;
      context?: {
        post_title?: string;
        post_description?: string;
        category?: string;
      };
    }) => {
      return moderateContent(contentType, content, context);
    },
    onError: (error: Error) => {
      console.error("[Content Moderation] Error:", error);
      // Don't show error to user - moderation should be silent
    },
  });
}

/**
 * Hook to score a review after submission
 */
export function useReviewScoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      reviewContent,
      rating,
      postTitle,
      postCategory,
    }: {
      reviewId: string;
      reviewContent: string;
      rating: number;
      postTitle: string;
      postCategory: string;
    }) => {
      return scoreReview(reviewId, reviewContent, rating, postTitle, postCategory);
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Show token reward notification
      if (data.tokens_earned > 0) {
        toast.success(`Earned ${data.tokens_earned} CDT tokens!`, {
          description: `Review quality: ${data.quality_score}%`,
        });
      }
    },
    onError: (error: Error) => {
      console.error("[Review Scoring] Error:", error);
    },
  });
}

/**
 * Hook to get personalized recommendations
 */
export function useRecommendations(
  userId: string | undefined,
  contentType: "posts" | "creators" | "all" = "all",
  limit: number = 10
) {
  return useQuery({
    queryKey: ["recommendations", userId, contentType, limit],
    queryFn: async () => {
      if (!userId) return { posts: [], creators: [] };
      return getRecommendations(userId, limit, contentType);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for pre-submission content check
 */
export function usePreCheckContent() {
  return useMutation({
    mutationFn: async (content: string) => {
      return preCheckContent(content);
    },
  });
}

/**
 * Hook to calculate and update user reputation
 */
export function useCalculateReputation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc("calculate_reputation", {
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Combined hook for handling content submission with moderation
 */
export function useModeratdedSubmission() {
  const moderationMutation = useContentModeration();
  
  return async (
    contentType: "review" | "comment" | "post",
    content: string,
    context?: {
      post_title?: string;
      post_description?: string;
      category?: string;
    }
  ): Promise<{
    allowed: boolean;
    result?: ModerationResult;
    reason?: string;
  }> => {
    try {
      const result = await moderationMutation.mutateAsync({
        contentType,
        content,
        context,
      });

      // Determine if content should be allowed
      if (result.is_spam) {
        return {
          allowed: false,
          result,
          reason: "Your content was flagged as spam. Please review and try again.",
        };
      }

      if (result.ai_analysis.toxicity > 70) {
        return {
          allowed: false,
          result,
          reason: "Your content contains inappropriate language. Please revise.",
        };
      }

      if (result.quality_score < 10) {
        return {
          allowed: false,
          result,
          reason: "Your content doesn't meet our quality standards. Please add more detail.",
        };
      }

      return { allowed: true, result };
    } catch (error) {
      // If moderation fails, allow the content through
      console.error("[Moderated Submission] Moderation failed, allowing content:", error);
      return { allowed: true };
    }
  };
}
