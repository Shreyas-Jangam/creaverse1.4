import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Token Rewards
export interface RewardCalculation {
  base_reward: number;
  quality_score: number;
  reputation_multiplier: number;
  streak_multiplier: number;
  trust_multiplier: number;
  final_reward: number;
  breakdown: { factor: string; value: number; contribution: number }[];
}

export function useClaimTokenReward() {
  return useMutation({
    mutationFn: async (params: {
      event_type: "review" | "post" | "engagement" | "governance";
      content?: string;
      related_post_id?: string;
      related_review_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("ai-token-rewards", {
        body: { user_id: user.id, ...params }
      });

      if (error) throw error;
      return data as { success: boolean; reward_event_id: string; calculation: RewardCalculation };
    }
  });
}

// Semantic Search
export interface SearchFilters {
  categories?: string[];
  creator_types?: string[];
  date_range?: { start: string; end: string };
  min_rating?: number;
  content_type?: "posts" | "reviews" | "creators" | "all";
}

export function useSemanticSearch() {
  return useMutation({
    mutationFn: async (params: { query: string; filters?: SearchFilters; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke("ai-semantic-search", {
        body: params
      });

      if (error) throw error;
      return data;
    }
  });
}

// Personalized Feed
export function usePersonalizedFeed(enabled = true) {
  return useQuery({
    queryKey: ["personalized-feed"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke("ai-personalized-feed", {
        body: { user_id: user.id, content_type: "all", limit: 20 }
      });

      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// User Streaks
export function useUserStreak(userId?: string) {
  return useQuery({
    queryKey: ["user-streak", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Use raw query since types may not be generated yet
      const { data, error } = await supabase
        .from("user_streaks" as any)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as { current_streak: number; longest_streak: number; streak_multiplier: number; last_activity_date: string } | null;
    },
    enabled: !!userId
  });
}

// Token Reward History
export function useRewardHistory(userId?: string) {
  return useQuery({
    queryKey: ["reward-history", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("token_reward_events" as any)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!userId
  });
}

// Trust Score
export function useTrustScore(userId?: string) {
  return useQuery({
    queryKey: ["trust-score", userId],
    queryFn: async () => {
      if (!userId) return { trust_score: 50, sybil_risk_score: 0, is_flagged: false };
      
      const { data, error } = await supabase
        .from("sybil_detection" as any)
        .select("trust_score, sybil_risk_score, is_flagged")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) return { trust_score: 50, sybil_risk_score: 0, is_flagged: false };
      return data as unknown as { trust_score: number; sybil_risk_score: number; is_flagged: boolean };
    },
    enabled: !!userId
  });
}
