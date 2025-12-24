import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    followers_count: number | null;
    creator_types: string[] | null;
    is_verified: boolean | null;
  }[];
  posts: {
    id: string;
    content: string;
    media_url: string | null;
    thumbnail_url: string | null;
    category: string;
    likes_count: number | null;
    comments_count: number | null;
    created_at: string | null;
    author_id: string;
  }[];
  tags: {
    tag: string;
    count: number;
  }[];
}

export function useSearch(query: string, activeTab: string = "all") {
  return useQuery({
    queryKey: ["search", query, activeTab],
    queryFn: async (): Promise<SearchResult> => {
      const searchTerm = query.trim().toLowerCase();
      
      if (!searchTerm) {
        return { profiles: [], posts: [], tags: [] };
      }

      const results: SearchResult = { profiles: [], posts: [], tags: [] };

      // Search profiles (creators)
      if (activeTab === "all" || activeTab === "creators") {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, bio, followers_count, creator_types, is_verified")
          .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
          .limit(10);

        if (!profilesError && profiles) {
          results.profiles = profiles;
        }
      }

      // Search posts
      if (activeTab === "all" || activeTab === "posts") {
        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("id, content, media_url, thumbnail_url, category, likes_count, comments_count, created_at, author_id")
          .eq("is_published", true)
          .or(`content.ilike.%${searchTerm}%`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!postsError && posts) {
          results.posts = posts;
        }
      }

      // Search by tags (posts with matching tags)
      if (activeTab === "all" || activeTab === "tags") {
        const { data: taggedPosts, error: tagsError } = await supabase
          .from("posts")
          .select("tags")
          .eq("is_published", true)
          .not("tags", "is", null);

        if (!tagsError && taggedPosts) {
          // Count tag occurrences that match the search
          const tagCounts: Record<string, number> = {};
          taggedPosts.forEach((post) => {
            if (post.tags) {
              post.tags.forEach((tag: string) => {
                if (tag.toLowerCase().includes(searchTerm)) {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
              });
            }
          });

          results.tags = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        }
      }

      return results;
    },
    enabled: query.trim().length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Fetch trending tags (most used)
export function useTrendingTags() {
  return useQuery({
    queryKey: ["trendingTags"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("tags")
        .eq("is_published", true)
        .not("tags", "is", null);

      if (error) throw error;

      // Count all tag occurrences
      const tagCounts: Record<string, number> = {};
      posts?.forEach((post) => {
        if (post.tags) {
          post.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      return Object.entries(tagCounts)
        .map(([tag, posts]) => ({ tag, posts }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 6);
    },
    staleTime: 60000, // Cache for 1 minute
  });
}

// Fetch suggested creators (most followed)
export function useSuggestedCreators() {
  return useQuery({
    queryKey: ["suggestedCreators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, followers_count, creator_types, is_verified")
        .order("followers_count", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000, // Cache for 1 minute
  });
}
