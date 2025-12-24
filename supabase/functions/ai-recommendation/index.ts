import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecommendationRequest {
  user_id: string;
  limit?: number;
  content_type?: "posts" | "creators" | "all";
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
    const { user_id, limit = 10, content_type = "all" }: RecommendationRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Recommendations] Generating for user ${user_id}`);

    // Fetch user profile and preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, creator_types, reputation")
      .eq("id", user_id)
      .single();

    // Fetch user's recent interactions (likes, follows, saves)
    const { data: recentLikes } = await supabase
      .from("likes")
      .select("post_id, posts(category, tags)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: follows } = await supabase
      .from("follows")
      .select("following_id, profiles!follows_following_id_fkey(creator_types)")
      .eq("follower_id", user_id)
      .limit(50);

    const { data: saves } = await supabase
      .from("saves")
      .select("post_id, posts(category, tags)")
      .eq("user_id", user_id)
      .limit(20);

    // Build user preference profile
    const categoryPreferences: Record<string, number> = {};
    const tagPreferences: Record<string, number> = {};

    // Analyze likes
    recentLikes?.forEach((like: any) => {
      if (like.posts?.category) {
        categoryPreferences[like.posts.category] = (categoryPreferences[like.posts.category] || 0) + 2;
      }
      like.posts?.tags?.forEach((tag: string) => {
        tagPreferences[tag] = (tagPreferences[tag] || 0) + 1;
      });
    });

    // Analyze saves (stronger signal)
    saves?.forEach((save: any) => {
      if (save.posts?.category) {
        categoryPreferences[save.posts.category] = (categoryPreferences[save.posts.category] || 0) + 3;
      }
      save.posts?.tags?.forEach((tag: string) => {
        tagPreferences[tag] = (tagPreferences[tag] || 0) + 2;
      });
    });

    // Analyze followed creators
    follows?.forEach((follow: any) => {
      follow.profiles?.creator_types?.forEach((type: string) => {
        categoryPreferences[type] = (categoryPreferences[type] || 0) + 1;
      });
    });

    // User's own creator types
    profile?.creator_types?.forEach((type: string) => {
      categoryPreferences[type] = (categoryPreferences[type] || 0) + 1;
    });

    const topCategories = Object.entries(categoryPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    const topTags = Object.entries(tagPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    console.log(`[Recommendations] User preferences - Categories: ${topCategories.join(", ")}, Tags: ${topTags.join(", ")}`);

    const results: any = {};

    // Fetch recommended posts
    if (content_type === "posts" || content_type === "all") {
      let postsQuery = supabase
        .from("posts")
        .select(`
          id, content, category, tags, media_url, thumbnail_url,
          likes_count, comments_count, views_count, created_at,
          author:profiles!posts_author_id_fkey(id, display_name, username, avatar_url, is_verified)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(limit * 3); // Fetch more to filter

      // Prioritize preferred categories
      if (topCategories.length > 0) {
        postsQuery = postsQuery.in("category", topCategories);
      }

      const { data: posts, error: postsError } = await postsQuery;

      if (posts && !postsError) {
        // Score and rank posts
        const scoredPosts = posts.map((post: any) => {
          let score = 0;
          
          // Category match
          if (topCategories.includes(post.category)) {
            score += 10 * (topCategories.length - topCategories.indexOf(post.category));
          }
          
          // Tag match
          post.tags?.forEach((tag: string) => {
            if (topTags.includes(tag)) {
              score += 5;
            }
          });
          
          // Engagement signals
          score += Math.min(post.likes_count || 0, 100) * 0.1;
          score += Math.min(post.comments_count || 0, 50) * 0.2;
          
          // Recency bonus (decay over 7 days)
          const daysSincePost = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);
          score += Math.max(0, 20 - daysSincePost * 3);
          
          // Verified creator bonus
          if (post.author?.is_verified) {
            score += 5;
          }

          return { ...post, recommendation_score: score };
        });

        results.posts = scoredPosts
          .sort((a: any, b: any) => b.recommendation_score - a.recommendation_score)
          .slice(0, limit);
      }
    }

    // Fetch recommended creators
    if (content_type === "creators" || content_type === "all") {
      const followedIds = follows?.map((f: any) => f.following_id) || [];
      
      let creatorsQuery = supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, bio, creator_types, is_verified, followers_count, reputation")
        .gt("followers_count", 0)
        .order("reputation", { ascending: false })
        .limit(limit * 2);

      // Exclude already followed
      if (followedIds.length > 0) {
        creatorsQuery = creatorsQuery.not("id", "in", `(${followedIds.join(",")})`);
      }
      
      // Exclude self
      creatorsQuery = creatorsQuery.neq("id", user_id);

      const { data: creators, error: creatorsError } = await creatorsQuery;

      if (creators && !creatorsError) {
        // Score creators based on user preferences
        const scoredCreators = creators.map((creator: any) => {
          let score = 0;
          
          // Creator type match
          creator.creator_types?.forEach((type: string) => {
            if (topCategories.includes(type)) {
              score += 15;
            }
          });
          
          // Reputation and followers
          score += Math.min(creator.reputation || 0, 100) * 0.2;
          score += Math.min(creator.followers_count || 0, 1000) * 0.01;
          
          // Verified bonus
          if (creator.is_verified) {
            score += 10;
          }

          return { ...creator, recommendation_score: score };
        });

        results.creators = scoredCreators
          .sort((a: any, b: any) => b.recommendation_score - a.recommendation_score)
          .slice(0, limit);
      }
    }

    console.log(`[Recommendations] Generated ${results.posts?.length || 0} posts, ${results.creators?.length || 0} creators`);

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Recommendations] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
