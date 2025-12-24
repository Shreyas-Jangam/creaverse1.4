import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  color: string | null;
  gradient: string | null;
  cover_image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  creator_type_display: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export interface UserSubcategory {
  id: string;
  user_id: string;
  subcategory_id: string;
  is_primary: boolean;
  subcategory?: Subcategory & { category?: Category };
}

// Fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data as Category[];
    },
  });
}

// Fetch subcategories by category ID
export function useSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("subcategories")
        .select("*")
        .order("display_order");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Subcategory[];
    },
    enabled: !!categoryId || categoryId === undefined,
  });
}

// Fetch all subcategories with their categories
export function useAllSubcategories() {
  return useQuery({
    queryKey: ["subcategories-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select(`
          *,
          category:categories(*)
        `)
        .order("display_order");

      if (error) throw error;
      return data as (Subcategory & { category: Category })[];
    },
  });
}

// Fetch user's selected subcategories
export function useUserSubcategories(userId?: string) {
  return useQuery({
    queryKey: ["user-subcategories", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_subcategories")
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return data as UserSubcategory[];
    },
    enabled: !!userId,
  });
}

// Get primary creator type display for a user
export function useUserCreatorType(userId?: string) {
  const { data: userSubcategories, isLoading } = useUserSubcategories(userId);
  
  const primarySubcategory = userSubcategories?.find(us => us.is_primary) || userSubcategories?.[0];
  const creatorTypeDisplay = primarySubcategory?.subcategory?.creator_type_display;
  
  return {
    creatorTypeDisplay,
    subcategories: userSubcategories,
    isLoading,
  };
}

// Mutation to update user's subcategories
export function useUpdateUserSubcategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      subcategoryIds, 
      primarySubcategoryId 
    }: { 
      userId: string; 
      subcategoryIds: string[]; 
      primarySubcategoryId?: string;
    }) => {
      // First, delete existing user subcategories
      const { error: deleteError } = await supabase
        .from("user_subcategories")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new subcategories
      if (subcategoryIds.length > 0) {
        const insertData = subcategoryIds.map(subId => ({
          user_id: userId,
          subcategory_id: subId,
          is_primary: subId === primarySubcategoryId,
        }));

        const { error: insertError } = await supabase
          .from("user_subcategories")
          .insert(insertData);

        if (insertError) throw insertError;
      }

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-subcategories", variables.userId] });
    },
  });
}
