import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecommendationRequest {
  user_id: string;
  limit?: number;
  content_type?: "posts" | "creators" | "categories" | "all";
  force_refresh?: boolean;
}

interface ScoredItem {
  id: string;
  score: number;
  factors: string[];
  [key: string]: any;
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
    const { user_id, limit = 20, content_type = "all", force_refresh = false }: RecommendationRequest = await req.json();

    console.log(`[AI Recommendations] Generating for user ${user_id}, type: ${content_type}`);

    // Check cache first (unless force refresh)
    if (!force_refresh) {
      const { data: cached } = await supabase
        .from("recommendation_cache")
        .select("*")
        .eq("user_id", user_id)
        .eq("recommendation_type", content_type === "all" ? "posts" : content_type)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (cached) {
        console.log(`[AI Recommendations] Returning cached recommendations`);
        return new Response(
          JSON.stringify({ cached: true, ...cached }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch user profile and preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, creator_types, reputation, tokens_balance")
      .eq("id", user_id)
      .single();

    // Fetch comprehensive user interaction history
    const [likesResult, savesResult, followsResult, reviewsResult] = await Promise.all([
      supabase
        .from("likes")
        .select("post_id, created_at, posts(category, tags, author_id)")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("saves")
        .select("post_id, created_at, posts(category, tags, author_id)")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("follows")
        .select("following_id, profiles!follows_following_id_fkey(creator_types, reputation)")
        .eq("follower_id", user_id)
        .limit(100),
      supabase
        .from("reviews")
        .select("post_id, rating, posts(category)")
        .eq("author_id", user_id)
        .gte("rating", 4)
        .limit(30)
    ]);

    // Build comprehensive preference model
    const categoryScores: Record<string, number> = {};
    const tagScores: Record<string, number> = {};
    const preferredAuthors: Set<string> = new Set();
    const interactedPosts: Set<string> = new Set();

    // Time decay function (content from today = 1.0, 30 days ago = 0.3)
    const timeDecay = (date: string) => {
      const daysAgo = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(0.3, 1 - (daysAgo / 30) * 0.7);
    };

    // Process likes (moderate signal)
    likesResult.data?.forEach((like: any) => {
      if (like.post_id) interactedPosts.add(like.post_id);
      if (like.posts?.category) {
        const decay = timeDecay(like.created_at);
        categoryScores[like.posts.category] = (categoryScores[like.posts.category] || 0) + 2 * decay;
      }
      like.posts?.tags?.forEach((tag: string) => {
        const decay = timeDecay(like.created_at);
        tagScores[tag] = (tagScores[tag] || 0) + 1 * decay;
      });
      if (like.posts?.author_id) {
        preferredAuthors.add(like.posts.author_id);
      }
    });

    // Process saves (strong signal)
    savesResult.data?.forEach((save: any) => {
      if (save.post_id) interactedPosts.add(save.post_id);
      if (save.posts?.category) {
        const decay = timeDecay(save.created_at);
        categoryScores[save.posts.category] = (categoryScores[save.posts.category] || 0) + 4 * decay;
      }
      save.posts?.tags?.forEach((tag: string) => {
        const decay = timeDecay(save.created_at);
        tagScores[tag] = (tagScores[tag] || 0) + 2 * decay;
      });
      if (save.posts?.author_id) {
        preferredAuthors.add(save.posts.author_id);
      }
    });

    // Process follows (creator type preferences)
    followsResult.data?.forEach((follow: any) => {
      follow.profiles?.creator_types?.forEach((type: string) => {
        categoryScores[type] = (categoryScores[type] || 0) + 1.5;
      });
    });

    // Process positive reviews (interest indicator)
    reviewsResult.data?.forEach((review: any) => {
      if (review.post_id) interactedPosts.add(review.post_id);
      if (review.posts?.category) {
        categoryScores[review.posts.category] = (categoryScores[review.posts.category] || 0) + 3;
      }
    });

    // User's own creator types
    profile?.creator_types?.forEach((type: string) => {
      categoryScores[type] = (categoryScores[type] || 0) + 2;
    });

    // Sort preferences
    const topCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([cat]) => cat);

    const topTags = Object.entries(tagScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([tag]) => tag);

    console.log(`[AI Recommendations] User preferences - Categories: ${topCategories.join(", ")}, Tags: ${topTags.slice(0, 3).join(", ")}`);

    const results: any = {};

    // Fetch and score posts
    if (content_type === "posts" || content_type === "all") {
      // Get candidate posts (exclude already interacted)
      const interactedArray = Array.from(interactedPosts);
      let postsQuery = supabase
        .from("posts")
        .select(`
          id, content, category, tags, media_url, thumbnail_url, media_type,
          likes_count, comments_count, reviews_count, views_count, created_at,
          author:profiles!posts_author_id_fkey(id, display_name, username, avatar_url, is_verified, reputation)
        `)
        .eq("is_published", true);

      // Exclude already seen posts
      if (interactedArray.length > 0 && interactedArray.length < 1000) {
        postsQuery = postsQuery.not("id", "in", `(${interactedArray.join(",")})`);
      }

      // Prioritize top categories
      if (topCategories.length > 0) {
        postsQuery = postsQuery.in("category", topCategories);
      }

      // Recent content preferred
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      postsQuery = postsQuery.gte("created_at", thirtyDaysAgo.toISOString());

      postsQuery = postsQuery.order("created_at", { ascending: false }).limit(limit * 3);

      const { data: candidatePosts } = await postsQuery;

      if (candidatePosts) {
        const scoredPosts: ScoredItem[] = candidatePosts.map((post: any) => {
          let score = 0;
          const factors: string[] = [];

          // Category match (highest weight)
          const catIndex = topCategories.indexOf(post.category);
          if (catIndex !== -1) {
            const catScore = 30 - catIndex * 5;
            score += catScore;
            factors.push(`Category match: +${catScore}`);
          }

          // Tag matches
          let tagMatchCount = 0;
          post.tags?.forEach((tag: string) => {
            if (topTags.includes(tag)) tagMatchCount++;
          });
          if (tagMatchCount > 0) {
            score += tagMatchCount * 5;
            factors.push(`Tag matches: +${tagMatchCount * 5}`);
          }

          // Author preference
          if (post.author?.id && preferredAuthors.has(post.author.id)) {
            score += 15;
            factors.push("Followed author: +15");
          }

          // Quality signals
          if (post.author?.is_verified) {
            score += 5;
            factors.push("Verified creator: +5");
          }

          // Engagement (normalized)
          const engagementScore = Math.min(
            ((post.likes_count || 0) * 1 + 
             (post.comments_count || 0) * 2 + 
             (post.reviews_count || 0) * 3) * 0.1,
            15
          );
          if (engagementScore > 0) {
            score += engagementScore;
            factors.push(`Engagement: +${engagementScore.toFixed(1)}`);
          }

          // Recency bonus (exponential decay over 7 days)
          const daysOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);
          const recencyBonus = Math.max(0, 20 * Math.exp(-daysOld / 7));
          score += recencyBonus;
          if (recencyBonus > 5) {
            factors.push(`Fresh content: +${recencyBonus.toFixed(0)}`);
          }

          // Diversity penalty (avoid same author clustering) - handled in final selection

          return {
            ...post,
            id: post.id,
            score,
            factors
          };
        });

        // Sort by score and apply diversity
        scoredPosts.sort((a, b) => b.score - a.score);

        // Diversity: limit to 2 posts per author
        const authorCounts: Record<string, number> = {};
        const diversePosts = scoredPosts.filter((post: any) => {
          const authorId = post.author?.id || "unknown";
          authorCounts[authorId] = (authorCounts[authorId] || 0) + 1;
          return authorCounts[authorId] <= 2;
        });

        results.posts = diversePosts.slice(0, limit);
      }
    }

    // Fetch and score creators
    if (content_type === "creators" || content_type === "all") {
      const followedIds = followsResult.data?.map((f: any) => f.following_id) || [];

      let creatorsQuery = supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, bio, creator_types, is_verified, followers_count, reputation")
        .gt("reputation", 5);

      // Exclude already followed and self
      if (followedIds.length > 0) {
        creatorsQuery = creatorsQuery.not("id", "in", `(${followedIds.join(",")})`);
      }
      creatorsQuery = creatorsQuery.neq("id", user_id);

      // Prioritize creators in preferred categories
      if (topCategories.length > 0) {
        creatorsQuery = creatorsQuery.overlaps("creator_types", topCategories);
      }

      creatorsQuery = creatorsQuery.order("reputation", { ascending: false }).limit(limit * 2);

      const { data: candidateCreators } = await creatorsQuery;

      if (candidateCreators) {
        const scoredCreators: ScoredItem[] = candidateCreators.map((creator: any) => {
          let score = 0;
          const factors: string[] = [];

          // Creator type match
          let typeMatches = 0;
          creator.creator_types?.forEach((type: string) => {
            if (topCategories.includes(type)) typeMatches++;
          });
          if (typeMatches > 0) {
            score += typeMatches * 15;
            factors.push(`Category match: +${typeMatches * 15}`);
          }

          // Reputation score
          const repScore = Math.min((creator.reputation || 0) * 0.3, 20);
          score += repScore;
          factors.push(`Reputation: +${repScore.toFixed(0)}`);

          // Verified bonus
          if (creator.is_verified) {
            score += 10;
            factors.push("Verified: +10");
          }

          // Follower count (log scale to prevent domination by mega accounts)
          const followerScore = Math.min(Math.log10((creator.followers_count || 0) + 1) * 3, 10);
          score += followerScore;

          return {
            ...creator,
            id: creator.id,
            score,
            factors
          };
        });

        scoredCreators.sort((a, b) => b.score - a.score);
        results.creators = scoredCreators.slice(0, limit);
      }
    }

    // Cache results
    const cacheExpiry = new Date();
    cacheExpiry.setMinutes(cacheExpiry.getMinutes() + 30); // 30 minute cache

    if (results.posts?.length) {
      await supabase.from("recommendation_cache").upsert({
        user_id,
        recommendation_type: "posts",
        recommended_ids: results.posts.map((p: any) => p.id),
        scores: results.posts.map((p: any) => p.score),
        algorithm_version: "v2-collaborative",
        expires_at: cacheExpiry.toISOString()
      }, { onConflict: "user_id,recommendation_type" }).select();
    }

    if (results.creators?.length) {
      await supabase.from("recommendation_cache").upsert({
        user_id,
        recommendation_type: "creators",
        recommended_ids: results.creators.map((c: any) => c.id),
        scores: results.creators.map((c: any) => c.score),
        algorithm_version: "v2-collaborative",
        expires_at: cacheExpiry.toISOString()
      }, { onConflict: "user_id,recommendation_type" }).select();
    }

    console.log(`[AI Recommendations] Generated ${results.posts?.length || 0} posts, ${results.creators?.length || 0} creators`);

    return new Response(
      JSON.stringify({
        cached: false,
        posts: results.posts || [],
        creators: results.creators || [],
        user_preferences: {
          top_categories: topCategories,
          top_tags: topTags.slice(0, 5)
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AI Recommendations] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
