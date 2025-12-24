import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type CreatorType = Database["public"]["Enums"]["creator_type"];
type MediaType = Database["public"]["Enums"]["media_type"];

interface SampleProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  is_verified: boolean;
  creator_types: CreatorType[];
  followers_count: number;
  following_count: number;
  tokens_earned: number;
  tokens_balance: number;
  reputation: number;
}

interface SamplePost {
  id: string;
  author_id: string;
  content: string;
  category: CreatorType;
  media_type: MediaType;
  media_url: string;
  thumbnail_url?: string;
  tags: string[];
  is_published: boolean;
  is_tokenized: boolean;
  token_reward: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
}

export class DatabaseSeedingService {
  private async executeWithTransaction<T>(operation: () => Promise<T>): Promise<T> {
    try {
      console.log("🔄 Starting database operation...");
      const result = await operation();
      console.log("✅ Database operation completed successfully");
      return result;
    } catch (error) {
      console.error("❌ Database operation failed:", error);
      throw error;
    }
  }

  async cleanupExistingData(): Promise<void> {
    return this.executeWithTransaction(async () => {
      console.log("🧹 Starting database cleanup...");

      // Delete in order to respect foreign key constraints
      const tables = [
        'post_shares',
        'saves', 
        'likes',
        'comments',
        'reviews',
        'posts'
      ];

      for (const table of tables) {
        console.log(`🗑️ Cleaning up ${table} table...`);
        const { error } = await supabase
          .from(table as any)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

        if (error && !error.message.includes('No rows found')) {
          console.error(`❌ Error cleaning ${table}:`, error);
          throw error;
        }
        console.log(`✅ ${table} table cleaned`);
      }

      console.log("🎉 Database cleanup completed successfully");
    });
  }

  private getSampleProfiles(): SampleProfile[] {
    return [
      {
        id: "cinema-creator-001",
        username: "alex_filmmaker",
        display_name: "Alex Chen",
        bio: "Independent filmmaker crafting stories that matter. Currently working on my debut feature film.",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        is_verified: true,
        creator_types: ["cinema"],
        followers_count: 1247,
        following_count: 89,
        tokens_earned: 15600,
        tokens_balance: 3400,
        reputation: 4.8
      },
      {
        id: "art-creator-001", 
        username: "maya_digital",
        display_name: "Maya Rodriguez",
        bio: "Digital artist exploring the intersection of technology and human emotion through NFT collections.",
        avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        is_verified: true,
        creator_types: ["art"],
        followers_count: 2891,
        following_count: 156,
        tokens_earned: 28400,
        tokens_balance: 7200,
        reputation: 4.9
      },
      {
        id: "tech-creator-001",
        username: "dev_sarah", 
        display_name: "Sarah Kim",
        bio: "Full-stack developer passionate about open source and building tools that empower creators.",
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        is_verified: false,
        creator_types: ["tech"],
        followers_count: 856,
        following_count: 234,
        tokens_earned: 9200,
        tokens_balance: 1800,
        reputation: 4.6
      },
      {
        id: "books-creator-001",
        username: "bookworm_james",
        display_name: "James Wilson", 
        bio: "Avid reader and literary critic. Sharing thoughtful reviews of contemporary fiction and classics.",
        avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        is_verified: false,
        creator_types: ["books"],
        followers_count: 634,
        following_count: 123,
        tokens_earned: 5800,
        tokens_balance: 1200,
        reputation: 4.4
      },
      {
        id: "nature-creator-001",
        username: "eco_warrior",
        display_name: "Luna Green",
        bio: "Environmental scientist documenting conservation efforts and sustainable living practices.",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        is_verified: true,
        creator_types: ["nature"],
        followers_count: 1523,
        following_count: 67,
        tokens_earned: 18900,
        tokens_balance: 4100,
        reputation: 4.7
      },
      {
        id: "music-creator-001",
        username: "beats_producer",
        display_name: "Marcus Sound",
        bio: "Music producer and songwriter creating indie electronic music. Always collaborating with new artists.",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        is_verified: false,
        creator_types: ["music"],
        followers_count: 1089,
        following_count: 178,
        tokens_earned: 12300,
        tokens_balance: 2900,
        reputation: 4.5
      }
    ];
  }

  private getSamplePosts(): SamplePost[] {
    const now = new Date();
    const profiles = this.getSampleProfiles();

    return [
      {
        id: "cinema-post-001",
        author_id: profiles[0].id,
        content: "Just wrapped principal photography on 'Echoes of Tomorrow' - a sci-fi short exploring human connection in our digital age. The cinematography captures both the beauty and isolation of our modern world. Can't wait to share this story with you all! 🎬✨ #IndieFilm #SciFi #Storytelling",
        category: "cinema",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1489599735734-79b4af4e22f6?w=800&h=800&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1489599735734-79b4af4e22f6?w=400&h=400&fit=crop",
        tags: ["indiefilm", "cinema", "storytelling", "filmmaking"],
        is_published: true,
        is_tokenized: true,
        token_reward: 200,
        likes_count: 156,
        comments_count: 34,
        shares_count: 28,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "art-post-001", 
        author_id: profiles[1].id,
        content: "Excited to unveil 'Digital Consciousness' - my latest NFT collection exploring the boundary between human emotion and artificial intelligence. Each piece represents a different aspect of our evolving relationship with technology. 🎨🤖 Minting starts tomorrow!",
        category: "art",
        media_type: "image", 
        media_url: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800&h=800&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=400&h=400&fit=crop",
        tags: ["digitalart", "nft", "artwork", "collection"],
        is_published: true,
        is_tokenized: true,
        token_reward: 300,
        likes_count: 289,
        comments_count: 67,
        shares_count: 45,
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "tech-post-001",
        author_id: profiles[2].id,
        content: "🚀 Just released CreativeUI v2.0! This open-source component library now includes 50+ React components, full TypeScript support, and dark mode. Built specifically for creator platforms and content-focused apps. Check it out on GitHub! 💻",
        category: "tech",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=800&fit=crop", 
        thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop",
        tags: ["opensource", "webdev", "programming", "javascript"],
        is_published: true,
        is_tokenized: true,
        token_reward: 150,
        likes_count: 198,
        comments_count: 42,
        shares_count: 31,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "books-post-001",
        author_id: profiles[3].id,
        content: "Just finished 'The Memory Architect' by Elena Vasquez - a stunning debut novel about identity in the age of digital consciousness. The way she weaves technology into deeply human stories is masterful. Full review on my blog! 📚✨ #BookReview #SciFi #Literature",
        category: "books",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop", 
        tags: ["literature", "reading", "bookclub", "review"],
        is_published: true,
        is_tokenized: true,
        token_reward: 100,
        likes_count: 134,
        comments_count: 28,
        shares_count: 19,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "nature-post-001",
        author_id: profiles[4].id,
        content: "Update from our coral reef restoration project in the Maldives! 🐠 We've successfully transplanted 500 coral fragments this month. The biodiversity returning to these reefs is incredible - spotted 12 new fish species just this week! #Conservation #MarineBiology #Sustainability",
        category: "nature",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=800&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=400&fit=crop",
        tags: ["conservation", "environment", "sustainability", "nature"],
        is_published: true,
        is_tokenized: true,
        token_reward: 250,
        likes_count: 267,
        comments_count: 51,
        shares_count: 38,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "music-post-001",
        author_id: profiles[5].id,
        content: "New track 'Neon Dreams' is live! 🎵 This one's been brewing for months - a fusion of ambient electronica and organic instruments. Recorded everything in my home studio during those late-night creative sessions. Stream it everywhere now! #NewMusic #Electronic #IndieMusic",
        category: "music",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        tags: ["newmusic", "indie", "songwriter", "release"],
        is_published: true,
        is_tokenized: true,
        token_reward: 180,
        likes_count: 223,
        comments_count: 56,
        shares_count: 42,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  async createSampleProfiles(): Promise<void> {
    return this.executeWithTransaction(async () => {
      console.log("👥 Creating sample user profiles...");
      
      const profiles = this.getSampleProfiles();
      
      for (const profile of profiles) {
        console.log(`👤 Creating profile: ${profile.username}`);
        
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', profile.id)
          .single();

        if (existingProfile) {
          console.log(`📝 Updating existing profile: ${profile.username}`);
          const { error } = await supabase
            .from('profiles')
            .update({
              username: profile.username,
              display_name: profile.display_name,
              bio: profile.bio,
              avatar_url: profile.avatar_url,
              is_verified: profile.is_verified,
              creator_types: profile.creator_types,
              followers_count: profile.followers_count,
              following_count: profile.following_count,
              tokens_earned: profile.tokens_earned,
              tokens_balance: profile.tokens_balance,
              reputation: profile.reputation
            })
            .eq('id', profile.id);

          if (error) {
            console.error(`❌ Error updating profile ${profile.username}:`, error);
            throw error;
          }
        } else {
          console.log(`➕ Creating new profile: ${profile.username}`);
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: profile.id,
              username: profile.username,
              display_name: profile.display_name,
              bio: profile.bio,
              avatar_url: profile.avatar_url,
              is_verified: profile.is_verified,
              creator_types: profile.creator_types,
              followers_count: profile.followers_count,
              following_count: profile.following_count,
              tokens_earned: profile.tokens_earned,
              tokens_balance: profile.tokens_balance,
              reputation: profile.reputation
            });

          if (error) {
            console.error(`❌ Error creating profile ${profile.username}:`, error);
            throw error;
          }
        }
        
        console.log(`✅ Profile created/updated: ${profile.username}`);
      }
      
      console.log("🎉 All sample profiles created successfully");
    });
  }

  async createSamplePosts(): Promise<void> {
    return this.executeWithTransaction(async () => {
      console.log("📝 Creating sample posts...");
      
      const posts = this.getSamplePosts();
      
      for (const post of posts) {
        console.log(`📄 Creating post: ${post.category} post`);
        
        const { error } = await supabase
          .from('posts')
          .insert({
            id: post.id,
            author_id: post.author_id,
            content: post.content,
            category: post.category,
            media_type: post.media_type,
            media_url: post.media_url,
            thumbnail_url: post.thumbnail_url,
            tags: post.tags,
            is_published: post.is_published,
            is_tokenized: post.is_tokenized,
            token_reward: post.token_reward,
            likes_count: post.likes_count,
            comments_count: post.comments_count,
            shares_count: post.shares_count,
            created_at: post.created_at
          });

        if (error) {
          console.error(`❌ Error creating ${post.category} post:`, error);
          throw error;
        }
        
        console.log(`✅ ${post.category} post created successfully`);
      }
      
      console.log("🎉 All sample posts created successfully");
    });
  }

  async verifyDataIntegrity(): Promise<void> {
    console.log("🔍 Verifying data integrity...");
    
    // Check posts count
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, category, author_id')
      .eq('is_published', true);

    if (postsError) {
      console.error("❌ Error verifying posts:", postsError);
      throw postsError;
    }

    console.log(`📊 Found ${posts?.length || 0} published posts`);
    
    // Check profiles count
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username');

    if (profilesError) {
      console.error("❌ Error verifying profiles:", profilesError);
      throw profilesError;
    }

    console.log(`👥 Found ${profiles?.length || 0} profiles`);
    
    // Verify all posts have valid authors
    if (posts) {
      for (const post of posts) {
        const authorExists = profiles?.some(p => p.id === post.author_id);
        if (!authorExists) {
          throw new Error(`Post ${post.id} has invalid author_id: ${post.author_id}`);
        }
      }
    }
    
    console.log("✅ Data integrity verification passed");
  }

  async seedDatabase(): Promise<void> {
    console.log("🌱 Starting database seeding process...");
    
    try {
      // Phase 1: Cleanup
      await this.cleanupExistingData();
      
      // Phase 2: Create profiles
      await this.createSampleProfiles();
      
      // Phase 3: Create posts
      await this.createSamplePosts();
      
      // Phase 4: Verify integrity
      await this.verifyDataIntegrity();
      
      console.log("🎉 Database seeding completed successfully!");
      console.log("📱 You can now view the sample posts in the feed");
      
    } catch (error) {
      console.error("💥 Database seeding failed:", error);
      throw error;
    }
  }
}

export const databaseSeedingService = new DatabaseSeedingService();