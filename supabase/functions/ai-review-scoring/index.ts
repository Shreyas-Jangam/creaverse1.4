import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewScoringRequest {
  review_id: string;
  review_content: string;
  rating: number;
  post_title: string;
  post_category: string;
}

interface ReviewScore {
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
    const { review_id, review_content, rating, post_title, post_category }: ReviewScoringRequest = await req.json();

    if (!review_content || review_content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Review content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Review Scoring] Scoring review ${review_id} for "${post_title}"`);

    const systemPrompt = `You are a review quality analyst for Creaverse DAO, a decentralized creative platform.

Your task is to evaluate the quality of reviews submitted by users. Reviews help the community discover valuable content and reward creators appropriately.

Categories on this platform:
- Cinema: Film reviews focusing on cinematography, storytelling, acting, direction
- Art: Artwork critiques covering technique, creativity, emotional impact
- Tech: Technical reviews of tools, code quality, documentation, usefulness
- Books: Literary reviews covering writing quality, narrative, themes
- Nature: Environmental project assessments, impact evaluation

A high-quality review should:
1. Be specific and detailed (not just "great work" or "I loved it")
2. Provide constructive feedback
3. Reference specific aspects of the work
4. Be helpful to both the creator and other community members
5. Match the rating given with the written content
6. Be original and thoughtful

Token rewards are based on quality:
- Quality 80-100: 50 tokens (excellent, detailed review)
- Quality 60-79: 25 tokens (good, helpful review)
- Quality 40-59: 10 tokens (basic but acceptable review)
- Quality 20-39: 5 tokens (low effort, but not spam)
- Quality 0-19: 0 tokens (spam/irrelevant, flagged for removal)`;

    const userPrompt = `Evaluate this review:

Post Title: "${post_title}"
Category: ${post_category}
User Rating: ${rating}/5 stars

Review Content:
---
${review_content}
---

Analyze the review quality and determine token rewards.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "review_score",
              description: "Return the review quality score and analysis",
              parameters: {
                type: "object",
                properties: {
                  quality_score: {
                    type: "number",
                    description: "Overall quality score 0-100"
                  },
                  is_verified: {
                    type: "boolean",
                    description: "True if the review meets quality standards (score >= 40)"
                  },
                  is_flagged: {
                    type: "boolean",
                    description: "True if the review should be flagged for moderation (spam, inappropriate, etc.)"
                  },
                  depth: {
                    type: "number",
                    description: "How deep and detailed the review is (0-100)"
                  },
                  helpfulness: {
                    type: "number",
                    description: "How helpful the review is to others (0-100)"
                  },
                  accuracy: {
                    type: "number",
                    description: "How accurate and well-reasoned the review appears (0-100)"
                  },
                  engagement: {
                    type: "number",
                    description: "How engaging and well-written the review is (0-100)"
                  },
                  reasoning_quality: {
                    type: "string",
                    enum: ["excellent", "good", "moderate", "poor", "none"],
                    description: "Quality of reasoning in the review"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Positive aspects of the review"
                  },
                  areas_for_improvement: {
                    type: "array",
                    items: { type: "string" },
                    description: "How the reviewer could improve"
                  }
                },
                required: ["quality_score", "is_verified", "is_flagged", "depth", "helpfulness", "accuracy", "engagement", "reasoning_quality", "strengths", "areas_for_improvement"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "review_score" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "review_score") {
      throw new Error("Invalid AI response format");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    const quality = Math.max(0, Math.min(100, analysis.quality_score));

    // Calculate token rewards based on quality
    let tokens_earned = 0;
    if (quality >= 80) tokens_earned = 50;
    else if (quality >= 60) tokens_earned = 25;
    else if (quality >= 40) tokens_earned = 10;
    else if (quality >= 20) tokens_earned = 5;
    else tokens_earned = 0;

    const result: ReviewScore = {
      quality_score: quality,
      is_verified: quality >= 40,
      is_flagged: analysis.is_flagged,
      tokens_earned,
      analysis: {
        depth: analysis.depth,
        helpfulness: analysis.helpfulness,
        accuracy: analysis.accuracy,
        engagement: analysis.engagement,
        reasoning_quality: analysis.reasoning_quality,
        strengths: analysis.strengths || [],
        areas_for_improvement: analysis.areas_for_improvement || [],
      },
    };

    // Update the review in the database
    if (review_id) {
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          quality_score: result.quality_score,
          is_verified: result.is_verified,
          is_flagged: result.is_flagged,
          tokens_earned: result.tokens_earned,
          ai_analysis: result.analysis,
        })
        .eq("id", review_id);

      if (updateError) {
        console.error("[Review Scoring] Failed to update review:", updateError);
      } else {
        console.log(`[Review Scoring] Updated review ${review_id} with score ${quality}`);

        // Award tokens to the reviewer
        if (tokens_earned > 0) {
          const { data: review } = await supabase
            .from("reviews")
            .select("author_id")
            .eq("id", review_id)
            .single();

          if (review?.author_id) {
            // Create token transaction
            await supabase.from("token_transactions").insert({
              user_id: review.author_id,
              type: "earned",
              amount: tokens_earned,
              reason: `Review quality reward (score: ${quality})`,
              related_review_id: review_id,
            });

            // Update user's token balance
            await supabase.rpc("increment_tokens", {
              user_id: review.author_id,
              amount: tokens_earned,
            });

            console.log(`[Review Scoring] Awarded ${tokens_earned} tokens to ${review.author_id}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Review Scoring] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
