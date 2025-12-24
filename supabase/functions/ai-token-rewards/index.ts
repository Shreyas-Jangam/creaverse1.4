import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenRewardRequest {
  user_id: string;
  event_type: "review" | "post" | "engagement" | "governance" | "referral";
  content?: string;
  related_post_id?: string;
  related_review_id?: string;
  metadata?: Record<string, any>;
}

interface RewardCalculation {
  base_reward: number;
  quality_score: number;
  reputation_multiplier: number;
  streak_multiplier: number;
  trust_multiplier: number;
  final_reward: number;
  breakdown: {
    factor: string;
    value: number;
    contribution: number;
  }[];
}

// Base rewards for different event types
const BASE_REWARDS: Record<string, number> = {
  review: 10,
  post: 5,
  engagement: 2,
  governance: 15,
  referral: 25,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const request: TokenRewardRequest = await req.json();

    console.log(`[Token Rewards] Processing ${request.event_type} for user ${request.user_id}`);

    // 1. Get user profile and existing stats
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, reputation, tokens_balance, tokens_earned")
      .eq("id", request.user_id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get user streak info
    const { data: streak } = await supabase
      .from("user_streaks")
      .select("current_streak, streak_multiplier")
      .eq("user_id", request.user_id)
      .single();

    // 3. Get user trust score
    const { data: sybilInfo } = await supabase
      .from("sybil_detection")
      .select("trust_score, sybil_risk_score, is_flagged")
      .eq("user_id", request.user_id)
      .single();

    // 4. If content provided, get AI quality assessment
    let qualityScore = 50; // Default
    if (request.content && request.content.length > 20) {
      try {
        const moderationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a content quality evaluator for Creaverse DAO. Rate content quality from 0-100 based on:
- Originality and insight (30%)
- Constructiveness and value (25%)
- Relevance to creative categories (20%)
- Writing quality and clarity (15%)
- Engagement potential (10%)

Be fair but reward genuinely valuable contributions.`
              },
              {
                role: "user",
                content: `Evaluate this ${request.event_type} content:\n\n${request.content.substring(0, 1000)}`
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "quality_score",
                  description: "Return the content quality score",
                  parameters: {
                    type: "object",
                    properties: {
                      score: {
                        type: "number",
                        description: "Quality score from 0-100"
                      },
                      reasoning: {
                        type: "string",
                        description: "Brief explanation of the score"
                      },
                      strengths: {
                        type: "array",
                        items: { type: "string" },
                        description: "Key strengths identified"
                      },
                      improvements: {
                        type: "array",
                        items: { type: "string" },
                        description: "Suggested improvements"
                      }
                    },
                    required: ["score", "reasoning"],
                    additionalProperties: false
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "quality_score" } },
          }),
        });

        if (moderationResponse.ok) {
          const aiResult = await moderationResponse.json();
          const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            const analysis = JSON.parse(toolCall.function.arguments);
            qualityScore = Math.max(0, Math.min(100, analysis.score));
            console.log(`[Token Rewards] AI quality score: ${qualityScore} - ${analysis.reasoning}`);
          }
        }
      } catch (aiError) {
        console.error("[Token Rewards] AI scoring failed, using default:", aiError);
      }
    }

    // 5. Calculate all multipliers
    const baseReward = BASE_REWARDS[request.event_type] || 5;
    const reputation = profile.reputation || 0;
    const streakMultiplier = streak?.streak_multiplier || 1.0;
    const trustScore = sybilInfo?.trust_score || 50;

    // Calculate individual multipliers
    const reputationMultiplier = 0.5 + (reputation / 100) * 1.5; // 0.5x to 2.0x
    const qualityMultiplier = 0.2 + (qualityScore / 100) * 2.3; // 0.2x to 2.5x
    const trustMultiplier = trustScore < 20 ? 0 : 0.5 + (trustScore / 100); // 0x or 0.5x to 1.5x

    // Check if user is flagged as sybil
    if (sybilInfo?.is_flagged) {
      console.log(`[Token Rewards] User ${request.user_id} is flagged, no rewards`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Account flagged for review",
          reward: 0
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate final reward
    const finalMultiplier = reputationMultiplier * qualityMultiplier * trustMultiplier * streakMultiplier;
    const finalReward = Math.round(baseReward * finalMultiplier * 100) / 100;

    console.log(`[Token Rewards] Calculated reward: ${baseReward} × ${finalMultiplier.toFixed(2)} = ${finalReward}`);

    // 6. Record the reward event
    const { data: rewardEvent, error: eventError } = await supabase
      .from("token_reward_events")
      .insert({
        user_id: request.user_id,
        event_type: request.event_type,
        base_reward: baseReward,
        multiplier: finalMultiplier,
        final_reward: finalReward,
        quality_score: qualityScore,
        reputation_multiplier: reputationMultiplier,
        anti_sybil_score: trustScore,
        related_post_id: request.related_post_id,
        related_review_id: request.related_review_id,
        metadata: request.metadata || {}
      })
      .select()
      .single();

    if (eventError) {
      console.error("[Token Rewards] Failed to record event:", eventError);
      throw eventError;
    }

    // 7. Update user token balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        tokens_balance: (profile.tokens_balance || 0) + finalReward,
        tokens_earned: (profile.tokens_earned || 0) + finalReward
      })
      .eq("id", request.user_id);

    if (updateError) {
      console.error("[Token Rewards] Failed to update balance:", updateError);
    }

    // 8. Record transaction
    await supabase.from("token_transactions").insert({
      user_id: request.user_id,
      type: "earned",
      amount: finalReward,
      reason: `${request.event_type} reward (Quality: ${qualityScore}%, Multiplier: ${finalMultiplier.toFixed(2)}x)`,
      related_post_id: request.related_post_id,
      related_review_id: request.related_review_id
    });

    // 9. Update user streak
    await supabase.rpc("update_user_streak", { p_user_id: request.user_id });

    const result: RewardCalculation = {
      base_reward: baseReward,
      quality_score: qualityScore,
      reputation_multiplier: reputationMultiplier,
      streak_multiplier: streakMultiplier,
      trust_multiplier: trustMultiplier,
      final_reward: finalReward,
      breakdown: [
        { factor: "Base Reward", value: baseReward, contribution: baseReward },
        { factor: "Quality Score", value: qualityScore, contribution: qualityMultiplier },
        { factor: "Reputation", value: reputation, contribution: reputationMultiplier },
        { factor: "Activity Streak", value: streak?.current_streak || 0, contribution: streakMultiplier },
        { factor: "Trust Score", value: trustScore, contribution: trustMultiplier }
      ]
    };

    console.log(`[Token Rewards] Successfully awarded ${finalReward} CDT to user ${request.user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        reward_event_id: rewardEvent.id,
        calculation: result
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Token Rewards] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
