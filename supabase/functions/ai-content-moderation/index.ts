import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerationResult {
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

interface ContentAnalysisRequest {
  content_type: "review" | "comment" | "post";
  content: string;
  context?: {
    post_title?: string;
    post_description?: string;
    category?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { content_type, content, context }: ContentAnalysisRequest = await req.json();

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[AI Moderation] Analyzing ${content_type}: ${content.substring(0, 100)}...`);

    // Build context-aware prompt
    let contextInfo = "";
    if (context) {
      if (context.post_title) contextInfo += `\nPost Title: "${context.post_title}"`;
      if (context.post_description) contextInfo += `\nPost Description: "${context.post_description}"`;
      if (context.category) contextInfo += `\nCategory: ${context.category}`;
    }

    const systemPrompt = `You are an AI content moderation system for Creaverse DAO, a decentralized creative platform for Cinema, Art, Tech, Books, and Nature content.

Your task is to analyze user-generated content and provide moderation assessment. Be fair but thorough.

Content Categories on this platform:
- Cinema: Short films, feature films, animation, documentaries
- Art: NFTs, digital art, traditional art
- Tech: Open-source tools, code reviews, technical content
- Books: Tokenized chapters, literary reviews
- Nature: Environmental projects, nature content

Evaluate the content based on:
1. Quality Score (0-100): How valuable/constructive is this content?
2. Spam Detection: Does it appear to be spam, promotional, or off-topic?
3. Toxicity: Any harmful, offensive, or inappropriate content?
4. Constructiveness: Does it add value to the discussion/platform?
5. Relevance: Is it relevant to the context (if provided)?`;

    const userPrompt = `Analyze this ${content_type} content:

---
${content}
---
${contextInfo}

Provide a detailed moderation analysis.`;

    // Call Lovable AI with tool calling for structured output
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
              name: "moderation_result",
              description: "Return the content moderation analysis result",
              parameters: {
                type: "object",
                properties: {
                  quality_score: {
                    type: "number",
                    description: "Quality score from 0-100. 0 = spam/low quality, 100 = excellent content"
                  },
                  is_spam: {
                    type: "boolean",
                    description: "True if the content appears to be spam or promotional"
                  },
                  is_low_quality: {
                    type: "boolean",
                    description: "True if the content is low-effort or not valuable"
                  },
                  moderation_flags: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of moderation flags (e.g., 'spam', 'toxic', 'off-topic', 'promotional', 'low-effort')"
                  },
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "negative", "mixed"],
                    description: "Overall sentiment of the content"
                  },
                  constructiveness: {
                    type: "number",
                    description: "How constructive the content is (0-100)"
                  },
                  relevance: {
                    type: "number",
                    description: "How relevant the content is to the context (0-100)"
                  },
                  toxicity: {
                    type: "number",
                    description: "Toxicity level (0-100, lower is better)"
                  },
                  spam_indicators: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific spam indicators found (if any)"
                  },
                  quality_factors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Positive quality factors found"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Recommendations for content improvement"
                  }
                },
                required: ["quality_score", "is_spam", "is_low_quality", "moderation_flags", "sentiment", "constructiveness", "relevance", "toxicity", "spam_indicators", "quality_factors", "recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "moderation_result" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("[AI Moderation] Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("[AI Moderation] Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[AI Moderation] AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("[AI Moderation] AI response received");

    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "moderation_result") {
      throw new Error("Invalid AI response format");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Structure the result
    const result: ModerationResult = {
      quality_score: Math.max(0, Math.min(100, analysis.quality_score)),
      is_spam: analysis.is_spam,
      is_low_quality: analysis.is_low_quality || analysis.quality_score < 30,
      moderation_flags: analysis.moderation_flags || [],
      ai_analysis: {
        sentiment: analysis.sentiment,
        constructiveness: analysis.constructiveness,
        relevance: analysis.relevance,
        toxicity: analysis.toxicity,
        spam_indicators: analysis.spam_indicators || [],
        quality_factors: analysis.quality_factors || [],
        recommendations: analysis.recommendations || [],
      },
    };

    console.log(`[AI Moderation] Analysis complete. Quality: ${result.quality_score}, Spam: ${result.is_spam}`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AI Moderation] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
