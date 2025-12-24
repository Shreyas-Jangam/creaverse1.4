import { supabase } from "@/integrations/supabase/client";

export interface ModerationResult {
  quality_score: number;
  is_spam: boolean;
  is_low_quality: boolean;
  moderation_flags: string[];
  ai_analysis: {
    sentiment: string;
    constructiveness: number;
    relevance: number;
    toxicity: number;
    spam_indicators: string[];
    quality_factors: string[];
    recommendations: string[];
  };
}

export interface ReviewScore {
  quality_score: number;
  is_verified: boolean;
  is_flagged: boolean;
  tokens_earned: number;
  analysis: {
    depth: number;
    helpfulness: number;
    accuracy: number;
    engagement: number;
    reasoning_quality: string;
    strengths: string[];
    areas_for_improvement: string[];
  };
}

export interface RecommendationResult {
  posts?: Array<{
    id: string;
    content: string;
    category: string;
    tags: string[];
    media_url: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    recommendation_score: number;
    author: {
      id: string;
      display_name: string;
      username: string;
      avatar_url: string | null;
      is_verified: boolean;
    };
  }>;
  creators?: Array<{
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    creator_types: string[];
    is_verified: boolean;
    followers_count: number;
    reputation: number;
    recommendation_score: number;
  }>;
}

/**
 * Analyze content for moderation (spam, quality, toxicity)
 */
export async function moderateContent(
  contentType: "review" | "comment" | "post",
  content: string,
  context?: {
    post_title?: string;
    post_description?: string;
    category?: string;
  }
): Promise<ModerationResult> {
  const { data, error } = await supabase.functions.invoke("ai-content-moderation", {
    body: {
      content_type: contentType,
      content,
      context,
    },
  });

  if (error) {
    console.error("[AI Moderation] Error:", error);
    throw new Error(error.message || "Failed to moderate content");
  }

  return data as ModerationResult;
}

/**
 * Score a review and determine token rewards
 */
export async function scoreReview(
  reviewId: string,
  reviewContent: string,
  rating: number,
  postTitle: string,
  postCategory: string
): Promise<ReviewScore> {
  const { data, error } = await supabase.functions.invoke("ai-review-scoring", {
    body: {
      review_id: reviewId,
      review_content: reviewContent,
      rating,
      post_title: postTitle,
      post_category: postCategory,
    },
  });

  if (error) {
    console.error("[AI Review Scoring] Error:", error);
    throw new Error(error.message || "Failed to score review");
  }

  return data as ReviewScore;
}

/**
 * Get personalized content recommendations
 */
export async function getRecommendations(
  userId: string,
  limit: number = 10,
  contentType: "posts" | "creators" | "all" = "all"
): Promise<RecommendationResult> {
  const { data, error } = await supabase.functions.invoke("ai-recommendation", {
    body: {
      user_id: userId,
      limit,
      content_type: contentType,
    },
  });

  if (error) {
    console.error("[AI Recommendations] Error:", error);
    throw new Error(error.message || "Failed to get recommendations");
  }

  return data as RecommendationResult;
}

/**
 * Pre-check content before submission (lightweight spam check)
 */
export async function preCheckContent(content: string): Promise<{
  isAcceptable: boolean;
  issues: string[];
}> {
  try {
    const result = await moderateContent("post", content);
    
    const issues: string[] = [];
    
    if (result.is_spam) {
      issues.push("Content appears to be spam or promotional");
    }
    
    if (result.ai_analysis.toxicity > 50) {
      issues.push("Content may contain inappropriate language");
    }
    
    if (result.quality_score < 20) {
      issues.push("Content quality is too low");
    }

    return {
      isAcceptable: !result.is_spam && result.ai_analysis.toxicity <= 50 && result.quality_score >= 20,
      issues,
    };
  } catch (error) {
    // If moderation fails, allow content through but log the error
    console.error("[AI PreCheck] Error:", error);
    return { isAcceptable: true, issues: [] };
  }
}
