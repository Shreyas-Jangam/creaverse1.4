import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type MediaType = Database["public"]["Enums"]["media_type"];
type CreatorType = Database["public"]["Enums"]["creator_type"];

export interface CreatePostData {
  title: string;
  content: string;
  category: CreatorType;
  subcategory_id?: string;
  media_type: MediaType;
  media_url?: string;
  thumbnail_url?: string;
  tags: string[];
  is_tokenized: boolean;
  token_reward: number;
  is_published: boolean;
}

// Hook to fetch posts for the feed with public/private visibility support
export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      console.log("🔍 Fetching posts from database...");
      
      try {
        // Check authentication status
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        const isAuthenticated = !!user && !authError;
        
        console.log("👤 Authentication status:", { 
          isAuthenticated, 
          userId: user?.id,
          authError: authError?.message 
        });

        // Test basic connection with a simple query that should always work
        const { data: testData, error: testError } = await supabase
          .from("posts")
          .select("count", { count: "exact", head: true })
          .eq("is_published", true)
          .limit(1);
        
        if (testError) {
          console.error("❌ Database connection test failed:", testError);
          // Don't throw immediately, try to continue with a fallback approach
        } else {
          console.log("✅ Database connection OK, published posts:", testData);
        }
        
        // Build the posts query - always fetch published posts
        // RLS policies should handle access control at the database level
        let postsQuery = supabase
          .from("posts")
          .select(`
            id,
            content,
            category,
            media_type,
            media_url,
            thumbnail_url,
            tags,
            is_tokenized,
            token_reward,
            likes_count,
            comments_count,
            shares_count,
            created_at,
            author_id,
            is_published
          `)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50);

        const { data, error } = await postsQuery;

        if (error) {
          console.error("❌ Posts query error:", error);
          console.error("❌ Full error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          // If it's an RLS error, provide a more helpful message
          if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('RLS')) {
            console.log("🔒 RLS policy blocking access, this is expected for unauthenticated users");
            // Return empty array for now - this should be handled by proper RLS policies
            return [];
          }
          
          throw new Error(`Failed to fetch posts: ${error.message}`);
        }

        console.log("✅ Posts fetched:", data?.length || 0, "posts");

        // TEMPORARY: Always return mock posts to showcase creative communities
        // Remove this section when you want to use real database posts
        console.log("🎭 Returning sample posts for each creative community (overriding database posts)");
        
        const mockPosts = [
          {
            id: "cinema-sample-001",
            content: "Just wrapped principal photography on 'Echoes of Tomorrow' - a sci-fi short exploring human connection in our digital age. The cinematography captures both the beauty and isolation of our modern world. Can't wait to share this story with you all! 🎬✨",
            mediaType: "image" as const,
            mediaUrl: "https://images.unsplash.com/photo-1489599735734-79b4af4e22f6?w=800&h=800&fit=crop&auto=format",
            thumbnailUrl: "https://images.unsplash.com/photo-1489599735734-79b4af4e22f6?w=400&h=400&fit=crop&auto=format",
            category: "cinema" as const,
            tags: ["indiefilm", "cinema", "storytelling", "filmmaking"],
            likes: 156,
            comments: 34,
            shares: 28,
            reviews: 12,
            saves: 89,
            tokenReward: 200,
            isTokenized: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isLiked: false,
            isSaved: false,
            author: {
              id: "cinema-creator",
              username: "alex_filmmaker",
              displayName: "Alex Chen",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
              isVerified: true,
              bio: "Independent filmmaker crafting stories that matter. Currently working on my debut feature film.",
              role: "creator" as const,
              followers: 1247,
              following: 89,
              tokensEarned: 15600,
              tokensBalance: 3400,
              reputation: 4.8,
              joinedAt: new Date("2024-01-15"),
              categories: ["cinema" as const]
            }
          },
          {
            id: "art-sample-001",
            content: "Excited to unveil 'Digital Consciousness' - my latest NFT collection exploring the boundary between human emotion and artificial intelligence. Each piece represents a different aspect of our evolving relationship with technology. 🎨🤖 Minting starts tomorrow!",
            mediaType: "image" as const,
            mediaUrl: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800&h=800&fit=crop&auto=format",
            thumbnailUrl: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=400&h=400&fit=crop&auto=format",
            category: "art" as const,
            tags: ["digitalart", "nft", "artwork", "collection"],
            likes: 289,
            comments: 67,
            shares: 45,
            reviews: 23,
            saves: 156,
            tokenReward: 300,
            isTokenized: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isLiked: false,
            isSaved: false,
            author: {
              id: "art-creator",
              username: "maya_digital",
              displayName: "Maya Rodriguez",
              avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format",
              isVerified: true,
              bio: "Digital artist exploring the intersection of technology and human emotion through NFT collections.",
              role: "creator" as const,
              followers: 2891,
              following: 156,
              tokensEarned: 28400,
              tokensBalance: 7200,
              reputation: 4.9,
              joinedAt: new Date("2023-11-10"),
              categories: ["art" as const]
            }
          },
          {
            id: "tech-sample-001",
            content: "🚀 Just released CreativeUI v2.0! This open-source component library now includes 50+ React components, full TypeScript support, and dark mode. Built specifically for creator platforms and content-focused apps. Check it out on GitHub! 💻",
            mediaType: "image" as const,
            mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=800&fit=crop&auto=format",
            thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop&auto=format",
            category: "tech" as const,
            tags: ["opensource", "webdev", "programming", "javascript"],
            likes: 198,
            comments: 42,
            shares: 31,
            reviews: 18,
            saves: 73,
            tokenReward: 150,
            isTokenized: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            isLiked: false,
            isSaved: false,
            author: {
              id: "tech-creator",
              username: "dev_sarah",
              displayName: "Sarah Kim",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format",
              isVerified: false,
              bio: "Full-stack developer passionate about open source and building tools that empower creators.",
              role: "creator" as const,
              followers: 856,
              following: 234,
              tokensEarned: 9200,
              tokensBalance: 1800,
              reputation: 4.6,
              joinedAt: new Date("2024-03-05"),
              categories: ["tech" as const]
            }
          },
          {
            id: "books-sample-001",
            content: "Just finished 'The Memory Architect' by Elena Vasquez - a stunning debut novel about identity in the age of digital consciousness. The way she weaves technology into deeply human stories is masterful. Full review on my blog! 📚✨",
            mediaType: "image" as const,
            mediaUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop&auto=format",
            thumbnailUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&auto=format",
            category: "books" as const,
            tags: ["literature", "reading", "bookclub", "review"],
            likes: 134,
            comments: 28,
            shares: 19,
            reviews: 8,
            saves: 45,
            tokenReward: 100,
            isTokenized: true,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            isLiked: false,
            isSaved: false,
            author: {
              id: "books-creator",
              username: "bookworm_james",
              displayName: "James Wilson",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
              isVerified: false,
              bio: "Avid reader and literary critic. Sharing thoughtful reviews of contemporary fiction and classics.",
              role: "creator" as const,
              followers: 634,
              following: 123,
              tokensEarned: 5800,
              tokensBalance: 1200,
              reputation: 4.4,
              joinedAt: new Date("2024-02-20"),
              categories: ["books" as const]
            }
          },
          {
            id: "nature-sample-001",
            content: "Update from our coral reef restoration project in the Maldives! 🐠 We've successfully transplanted 500 coral fragments this month. The biodiversity returning to these reefs is incredible - spotted 12 new fish species just this week!",
            mediaType: "image" as const,
            mediaUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=800&fit=crop&auto=format",
            thumbnailUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=400&fit=crop&auto=format",
            category: "nature" as const,
            tags: ["conservation", "environment", "sustainability", "nature"],
            likes: 267,
            comments: 51,
            shares: 38,
            reviews: 15,
            saves: 92,
            tokenReward: 250,
            isTokenized: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            isLiked: false,
            isSaved: false,
            author: {
              id: "nature-creator",
              username: "eco_warrior",
              displayName: "Luna Green",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format",
              isVerified: true,
              bio: "Environmental scientist documenting conservation efforts and sustainable living practices.",
              role: "creator" as const,
              followers: 1523,
              following: 67,
              tokensEarned: 18900,
              tokensBalance: 4100,
              reputation: 4.7,
              joinedAt: new Date("2023-09-01"),
              categories: ["nature" as const]
            }
          },
          {
            id: "music-sample-001",
            content: "New track 'Neon Dreams' is live! 🎵 This one's been brewing for months - a fusion of ambient electronica and organic instruments. Recorded everything in my home studio during those late-night creative sessions. Stream it everywhere now!",
            mediaType: "image" as const,
            mediaUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop&auto=format",
            thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&auto=format",
            category: "music" as const,
            tags: ["newmusic", "indie", "songwriter", "release"],
            likes: 223,
            comments: 56,
            shares: 42,
            reviews: 19,
            saves: 78,
            tokenReward: 180,
            isTokenized: true,
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            isLiked: false,
            isSaved: false,
            author: {
              id: "music-creator",
              username: "beats_producer",
              displayName: "Marcus Sound",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format",
              isVerified: false,
              bio: "Music producer and songwriter creating indie electronic music. Always collaborating with new artists.",
              role: "creator" as const,
              followers: 1089,
              following: 178,
              tokensEarned: 12300,
              tokensBalance: 2900,
              reputation: 4.5,
              joinedAt: new Date("2023-12-01"),
              categories: ["music" as const]
            }
          }
        ];
        
        return mockPosts;

        // COMMENTED OUT: Original database post processing
        /*
        if (!data || data.length === 0) {
          console.log("📝 No published posts found in database");
          return [];
        }

        // COMMENTED OUT: Original database post processing
        /*
        // Get unique author IDs
        const authorIds = [...new Set(data.map(post => post.author_id))];
        console.log("👥 Fetching profiles for", authorIds.length, "authors");

        // Fetch author profiles - use public profiles view for public access
        const { data: profiles, error: profilesError } = await supabase
          .from("public_profiles")
          .select("id, username, display_name, avatar_url, is_verified")
          .in("id", authorIds);

        if (profilesError) {
          console.warn("⚠️ Profiles query error:", profilesError);
          console.warn("⚠️ Full profiles error details:", {
            message: profilesError.message,
            details: profilesError.details,
            hint: profilesError.hint,
            code: profilesError.code
          });
          // Continue without profiles - we'll use fallback data
          console.log("📝 Continuing with fallback profile data");
        }

        console.log("✅ Profiles fetched:", profiles?.length || 0, "profiles");

        // Create a map of profiles by ID
        const profilesMap = new Map(
          (profiles || []).map(profile => [profile.id, profile])
        );

        // Transform the data to match our Post interface
        const transformedPosts = data.map(post => {
          const profile = profilesMap.get(post.author_id);
          
          return {
            id: post.id,
            content: post.content,
            mediaType: post.media_type,
            mediaUrl: post.media_url,
            thumbnailUrl: post.thumbnail_url,
            category: post.category,
            tags: post.tags || [],
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            reviews: 0, // We'll need to calculate this separately if needed
            saves: 0, // We'll need to calculate this separately if needed
            tokenReward: post.token_reward || 0,
            isTokenized: post.is_tokenized || false,
            createdAt: new Date(post.created_at),
            isLiked: false, // We'll need to check user's likes separately
            isSaved: false, // We'll need to check user's saves separately
            author: {
              id: profile?.id || post.author_id,
              username: profile?.username || "creator",
              displayName: profile?.display_name || "Creative User",
              avatar: profile?.avatar_url,
              isVerified: profile?.is_verified || false,
              // Default values for required fields
              bio: "",
              role: "creator" as const,
              followers: 0,
              following: 0,
              tokensEarned: 0,
              tokensBalance: 0,
              reputation: 0,
              joinedAt: new Date(),
              categories: []
            }
          };
        });

        console.log("🎉 Transformed posts:", transformedPosts.length);
        return transformedPosts;
        */
      } catch (error) {
        console.error("💥 Posts fetch failed:", error);
        
        // Enhanced error handling with specific messages
        if (error instanceof Error) {
          if (error.message.includes('permission denied') || error.message.includes('RLS')) {
            console.log("🔒 Database access restricted - this may be expected for unauthenticated users");
            return []; // Return empty array instead of throwing
          }
          if (error.message.includes('network') || error.message.includes('fetch')) {
            throw new Error("Network connection failed. Please check your internet connection.");
          }
          if (error.message.includes('timeout')) {
            throw new Error("Request timed out. Please try again.");
          }
        }
        
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter for more frequent updates
    gcTime: 1000 * 60 * 10, // 10 minutes - keep cached data longer
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry RLS/permission errors
      if (error instanceof Error && 
          (error.message.includes('permission denied') || 
           error.message.includes('RLS') ||
           error.message.includes('42501'))) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostData) => {
      console.log("🚀 Creating post with data:", postData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a post");
      }

      console.log("👤 User authenticated:", user.id);

      const insertData = {
        author_id: user.id,
        content: postData.content,
        category: postData.category,
        media_type: postData.media_type,
        media_url: postData.media_url,
        thumbnail_url: postData.thumbnail_url,
        tags: postData.tags,
        is_tokenized: postData.is_tokenized,
        token_reward: postData.token_reward,
        is_published: postData.is_published,
      };

      console.log("📝 Inserting post data:", insertData);

      const { data, error } = await supabase
        .from("posts")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("❌ Post creation error:", error);
        throw error;
      }

      console.log("✅ Post created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("🎉 Post creation success, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("💥 Post creation failed:", error);
    },
  });
}
