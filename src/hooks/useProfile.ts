import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schemas
export const profileFormSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .nullable(),
  avatar_url: z
    .string()
    .url("Invalid avatar URL")
    .optional()
    .nullable(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  wallet_address: string | null;
  is_verified: boolean | null;
  reputation: number | null;
  tokens_balance: number | null;
  tokens_earned: number | null;
  followers_count: number | null;
  following_count: number | null;
  creator_types: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

// Fetch profile by ID
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!userId,
  });
}

// Fetch profile by username
export function useProfileByUsername(username?: string) {
  return useQuery({
    queryKey: ["profile", "username", username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!username,
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: Partial<ProfileFormData>;
    }) => {
      // Validate input data
      const validatedData = profileFormSchema.partial().parse(data);
      
      // Check if username is already taken (if changing username)
      if (validatedData.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", validatedData.username)
          .neq("id", userId)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
          throw new Error("Username is already taken");
        }
      }

      // Update profile
      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return updatedProfile as Profile;
    },
    onSuccess: (data, variables) => {
      // Invalidate all profile queries
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", "username"] });
    },
  });
}

// Get current authenticated user's profile
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
  });
}

// Check if username is available
export function useCheckUsername() {
  return useMutation({
    mutationFn: async ({ username, currentUserId }: { username: string; currentUserId?: string }) => {
      let query = supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase());

      if (currentUserId) {
        query = query.neq("id", currentUserId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return !data; // Returns true if username is available
    },
  });
}