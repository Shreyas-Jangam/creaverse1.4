export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          gradient: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          gradient?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          gradient?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_type: string
          color: string | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          reward: number
          target_count: number
          title: string
        }
        Insert: {
          challenge_type: string
          color?: string | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reward: number
          target_count: number
          title: string
        }
        Update: {
          challenge_type?: string
          color?: string | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reward?: number
          target_count?: number
          title?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_embeddings: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          embedding: Json | null
          embedding_model: string | null
          id: string
          keywords: string[] | null
          semantic_categories: string[] | null
          updated_at: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          embedding?: Json | null
          embedding_model?: string | null
          id?: string
          keywords?: string[] | null
          semantic_categories?: string[] | null
          updated_at?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          embedding?: Json | null
          embedding_model?: string | null
          id?: string
          keywords?: string[] | null
          semantic_categories?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_id: string | null
          participant_one: string
          participant_two: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          participant_one: string
          participant_two: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          participant_one?: string
          participant_two?: string
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      governance_proposals: {
        Row: {
          attachments: Json | null
          created_at: string | null
          creator_id: string
          description: string
          id: string
          on_chain_proposal_id: string | null
          pass_threshold_percentage: number
          proposal_threshold: number
          quorum_threshold: number
          status: Database["public"]["Enums"]["proposal_status"]
          title: string
          total_voting_power: number
          tx_hash: string | null
          updated_at: string | null
          votes_abstain: number
          votes_against: number
          votes_for: number
          voting_end_date: string
          voting_start_date: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          creator_id: string
          description: string
          id?: string
          on_chain_proposal_id?: string | null
          pass_threshold_percentage?: number
          proposal_threshold?: number
          quorum_threshold?: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title: string
          total_voting_power?: number
          tx_hash?: string | null
          updated_at?: string | null
          votes_abstain?: number
          votes_against?: number
          votes_for?: number
          voting_end_date: string
          voting_start_date: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          creator_id?: string
          description?: string
          id?: string
          on_chain_proposal_id?: string | null
          pass_threshold_percentage?: number
          proposal_threshold?: number
          quorum_threshold?: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title?: string
          total_voting_power?: number
          tx_hash?: string | null
          updated_at?: string | null
          votes_abstain?: number
          votes_against?: number
          votes_for?: number
          voting_end_date?: string
          voting_start_date?: string
        }
        Relationships: []
      }
      governance_votes: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string
          reason: string | null
          tx_hash: string | null
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
          voting_power: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id: string
          reason?: string | null
          tx_hash?: string | null
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
          voting_power: number
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string
          reason?: string | null
          tx_hash?: string | null
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "governance_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          review_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          review_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          review_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          from_user_id: string | null
          id: string
          is_read: boolean | null
          message: string
          post_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          post_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          post_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["creator_type"]
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_nft: boolean | null
          is_published: boolean | null
          is_tokenized: boolean | null
          likes_count: number | null
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string | null
          nft_contract_address: string | null
          nft_token_id: string | null
          reviews_count: number | null
          saves_count: number | null
          shares_count: number | null
          tags: string[] | null
          thumbnail_url: string | null
          token_reward: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          category: Database["public"]["Enums"]["creator_type"]
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_nft?: boolean | null
          is_published?: boolean | null
          is_tokenized?: boolean | null
          likes_count?: number | null
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          nft_contract_address?: string | null
          nft_token_id?: string | null
          reviews_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          token_reward?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["creator_type"]
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_nft?: boolean | null
          is_published?: boolean | null
          is_tokenized?: boolean | null
          likes_count?: number | null
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          nft_contract_address?: string | null
          nft_token_id?: string | null
          reviews_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          token_reward?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          creator_types: Database["public"]["Enums"]["creator_type"][] | null
          display_name: string
          email: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_verified: boolean | null
          reputation: number | null
          tokens_balance: number | null
          tokens_earned: number | null
          updated_at: string | null
          username: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_types?: Database["public"]["Enums"]["creator_type"][] | null
          display_name: string
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          is_verified?: boolean | null
          reputation?: number | null
          tokens_balance?: number | null
          tokens_earned?: number | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_types?: Database["public"]["Enums"]["creator_type"][] | null
          display_name?: string
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_verified?: boolean | null
          reputation?: number | null
          tokens_balance?: number | null
          tokens_earned?: number | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          ai_analysis: Json | null
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          likes_count: number | null
          post_id: string
          quality_score: number | null
          rating: number
          tokens_earned: number | null
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          likes_count?: number | null
          post_id: string
          quality_score?: number | null
          rating: number
          tokens_earned?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          likes_count?: number | null
          post_id?: string
          quality_score?: number | null
          rating?: number
          tokens_earned?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      saves: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          creator_type_display: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          creator_type_display: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          creator_type_display?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reason: string
          related_post_id: string | null
          related_review_id: string | null
          tx_hash: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reason: string
          related_post_id?: string | null
          related_review_id?: string | null
          tx_hash?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string
          related_post_id?: string | null
          related_review_id?: string | null
          tx_hash?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_related_review_id_fkey"
            columns: ["related_review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_claimed: boolean | null
          is_completed: boolean | null
          progress: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          progress?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          is_online: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subcategories: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          subcategory_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          subcategory_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          subcategory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subcategories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_delegations: {
        Row: {
          created_at: string | null
          delegatee_id: string
          delegator_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          delegatee_id: string
          delegator_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          delegatee_id?: string
          delegator_id?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          creator_types: Database["public"]["Enums"]["creator_type"][] | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string | null
          is_verified: boolean | null
          reputation: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_types?: Database["public"]["Enums"]["creator_type"][] | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string | null
          is_verified?: boolean | null
          reputation?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_types?: Database["public"]["Enums"]["creator_type"][] | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string | null
          is_verified?: boolean | null
          reputation?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_reputation: { Args: { p_user_id: string }; Returns: number }
      cast_governance_vote: {
        Args: {
          p_proposal_id: string
          p_reason?: string
          p_vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Returns: string
      }
      get_or_create_conversation: {
        Args: { other_user_id: string }
        Returns: string
      }
      get_unread_message_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_tokens: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      mark_messages_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "creator" | "moderator" | "admin"
      creator_type: "cinema" | "art" | "tech" | "books" | "nature" | "music"
      media_type: "image" | "video" | "audio" | "document"
      notification_type:
        | "like"
        | "comment"
        | "review"
        | "follow"
        | "token"
        | "mention"
        | "reward"
      proposal_status:
        | "pending"
        | "active"
        | "passed"
        | "rejected"
        | "cancelled"
      transaction_type:
        | "earned"
        | "spent"
        | "received"
        | "sent"
        | "staked"
        | "unstaked"
      vote_type: "for" | "against" | "abstain"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "creator", "moderator", "admin"],
      creator_type: ["cinema", "art", "tech", "books", "nature", "music"],
      media_type: ["image", "video", "audio", "document"],
      notification_type: [
        "like",
        "comment",
        "review",
        "follow",
        "token",
        "mention",
        "reward",
      ],
      proposal_status: ["pending", "active", "passed", "rejected", "cancelled"],
      transaction_type: [
        "earned",
        "spent",
        "received",
        "sent",
        "staked",
        "unstaked",
      ],
      vote_type: ["for", "against", "abstain"],
    },
  },
} as const
