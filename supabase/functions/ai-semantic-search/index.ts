import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query: string;
  filters?: {
    categories?: string[];
    creator_types?: string[];
    date_range?: { start: string; end: string };
    min_rating?: number;
    content_type?: "posts" | "reviews" | "creators" | "all";
  };
  limit?: number;
  user_id?: string; // For personalization
}

interface SearchResult {
  posts: any[];
  creators: any[];
  reviews: any[];
  semantic_suggestions: string[];
  total_results: number;
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
    const { query, filters, limit = 20, user_id }: SearchRequest = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Query must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Semantic Search] Query: "${query}" with filters:`, filters);

    // 1. Use AI to understand query intent and extract semantic meaning
    const semanticResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a search query analyzer for Creaverse DAO, a creative platform with categories: Cinema, Art, Tech, Books, Nature.

Analyze the search query and extract:
1. Primary intent (what the user is looking for)
2. Relevant categories
3. Keywords for database search
4. Semantic synonyms and related terms
5. Suggested refinements`
          },
          {
            role: "user",
            content: `Analyze this search query: "${query}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "search_analysis",
              description: "Return search query analysis",
              parameters: {
                type: "object",
                properties: {
                  intent: {
                    type: "string",
                    description: "Primary user intent (e.g., 'find_content', 'find_creator', 'learn_topic')"
                  },
                  categories: {
                    type: "array",
                    items: { type: "string" },
                    description: "Relevant categories from: cinema, art, tech, books, nature"
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Keywords for database search (lowercase)"
                  },
                  synonyms: {
                    type: "array",
                    items: { type: "string" },
                    description: "Semantic synonyms and related terms"
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Suggested search refinements"
                  }
                },
                required: ["intent", "categories", "keywords", "synonyms", "suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "search_analysis" } },
      }),
    });

    let searchTerms: string[] = [query.toLowerCase()];
    let relevantCategories: string[] = [];
    let semanticSuggestions: string[] = [];

    if (semanticResponse.ok) {
      const aiResult = await semanticResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const analysis = JSON.parse(toolCall.function.arguments);
        searchTerms = [...new Set([query.toLowerCase(), ...analysis.keywords, ...analysis.synonyms])];
        relevantCategories = analysis.categories || [];
        semanticSuggestions = analysis.suggestions || [];
        console.log(`[Semantic Search] AI analysis:`, analysis);
      }
    }

    const contentType = filters?.content_type || "all";
    const results: SearchResult = {
      posts: [],
      creators: [],
      reviews: [],
      semantic_suggestions: semanticSuggestions,
      total_results: 0
    };

    // 2. Search posts with semantic matching
    if (contentType === "posts" || contentType === "all") {
      let postsQuery = supabase
        .from("posts")
        .select(`
          id, content, category, tags, media_url, thumbnail_url,
          likes_count, comments_count, reviews_count, views_count, created_at,
          author:profiles!posts_author_id_fkey(id, display_name, username, avatar_url, is_verified)
        `)
        .eq("is_published", true);

      // Apply text search on content
      const searchPattern = searchTerms.join(" | ");
      postsQuery = postsQuery.or(`content.ilike.%${query}%,tags.cs.{${searchTerms.slice(0, 5).join(",")}}`);

      // Apply category filter
      if (filters?.categories?.length) {
        postsQuery = postsQuery.in("category", filters.categories);
      } else if (relevantCategories.length > 0) {
        postsQuery = postsQuery.in("category", relevantCategories);
      }

      // Apply date range
      if (filters?.date_range?.start) {
        postsQuery = postsQuery.gte("created_at", filters.date_range.start);
      }
      if (filters?.date_range?.end) {
        postsQuery = postsQuery.lte("created_at", filters.date_range.end);
      }

      postsQuery = postsQuery.order("likes_count", { ascending: false }).limit(limit);

      const { data: posts, error: postsError } = await postsQuery;

      if (posts && !postsError) {
        // Score and rank results semantically
        results.posts = posts.map((post: any) => {
          let relevanceScore = 0;
          const contentLower = post.content?.toLowerCase() || "";

          // Score based on keyword matches
          searchTerms.forEach((term, idx) => {
            if (contentLower.includes(term)) {
              relevanceScore += 10 - idx; // Earlier keywords weighted more
            }
          });

          // Tag matches
          post.tags?.forEach((tag: string) => {
            if (searchTerms.some(t => tag.toLowerCase().includes(t))) {
              relevanceScore += 5;
            }
          });

          // Category relevance
          if (relevantCategories.includes(post.category)) {
            relevanceScore += 3;
          }

          // Engagement boost
          relevanceScore += Math.min((post.likes_count || 0) * 0.1, 5);

          return { ...post, relevance_score: relevanceScore };
        }).sort((a: any, b: any) => b.relevance_score - a.relevance_score);
      }
    }

    // 3. Search creators
    if (contentType === "creators" || contentType === "all") {
      let creatorsQuery = supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, bio, creator_types, is_verified, followers_count, reputation")
        .gt("reputation", 0);

      // Search by username, display_name, or bio
      creatorsQuery = creatorsQuery.or(
        `username.ilike.%${query}%,display_name.ilike.%${query}%,bio.ilike.%${query}%`
      );

      // Filter by creator types
      if (filters?.creator_types?.length) {
        creatorsQuery = creatorsQuery.overlaps("creator_types", filters.creator_types);
      } else if (relevantCategories.length > 0) {
        creatorsQuery = creatorsQuery.overlaps("creator_types", relevantCategories);
      }

      creatorsQuery = creatorsQuery.order("reputation", { ascending: false }).limit(limit);

      const { data: creators, error: creatorsError } = await creatorsQuery;

      if (creators && !creatorsError) {
        results.creators = creators.map((creator: any) => {
          let relevanceScore = 0;

          if (creator.username?.toLowerCase().includes(query.toLowerCase())) {
            relevanceScore += 15;
          }
          if (creator.display_name?.toLowerCase().includes(query.toLowerCase())) {
            relevanceScore += 12;
          }
          if (creator.bio?.toLowerCase().includes(query.toLowerCase())) {
            relevanceScore += 8;
          }

          // Creator type matches
          creator.creator_types?.forEach((type: string) => {
            if (relevantCategories.includes(type)) {
              relevanceScore += 5;
            }
          });

          relevanceScore += Math.min((creator.reputation || 0) * 0.1, 10);

          return { ...creator, relevance_score: relevanceScore };
        }).sort((a: any, b: any) => b.relevance_score - a.relevance_score);
      }
    }

    // 4. Search reviews (for deep content search)
    if (contentType === "reviews" || contentType === "all") {
      let reviewsQuery = supabase
        .from("reviews")
        .select(`
          id, content, rating, quality_score, likes_count, created_at, is_verified,
          author:profiles!reviews_author_id_fkey(id, display_name, username, avatar_url),
          post:posts!reviews_post_id_fkey(id, content, category)
        `)
        .ilike("content", `%${query}%`);

      if (filters?.min_rating) {
        reviewsQuery = reviewsQuery.gte("rating", filters.min_rating);
      }

      reviewsQuery = reviewsQuery
        .eq("is_verified", true)
        .order("quality_score", { ascending: false })
        .limit(limit);

      const { data: reviews, error: reviewsError } = await reviewsQuery;

      if (reviews && !reviewsError) {
        results.reviews = reviews.map((review: any) => ({
          ...review,
          relevance_score: review.quality_score || 0
        }));
      }
    }

    results.total_results = results.posts.length + results.creators.length + results.reviews.length;

    console.log(`[Semantic Search] Found ${results.total_results} results`);

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Semantic Search] Error:", error);

    // Handle rate limits
    if (error instanceof Error && error.message.includes("429")) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
