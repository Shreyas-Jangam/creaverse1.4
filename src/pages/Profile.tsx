import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { 
  ProfileHeader, 
  StoryHighlights, 
  ProfileTabs, 
  WalletSection,
  EditProfileModal 
} from "@/components/profile";
import { Badge } from "@/components/ui/badge";
import { mockUsers, mockPosts, currentUser } from "@/data/mockData";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserCreatorType, useUpdateUserSubcategories } from "@/hooks/useCategories";
import { useProfileByUsername, useCurrentUserProfile, useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoTranslate } from "@/hooks/useTranslation";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  
  const { t } = useAutoTranslate([
    "You are now following",
    "Add highlight feature coming soon!"
  ]);

  // Check for authenticated user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile from database if username is provided
  const { data: dbProfile, isLoading: profileLoading } = useProfileByUsername(username);
  const { data: currentDbProfile } = useCurrentUserProfile();

  // Use database profile if available, otherwise fall back to mock data
  const user = username 
    ? (dbProfile ? {
        id: dbProfile.id,
        username: dbProfile.username,
        displayName: dbProfile.display_name,
        avatar: dbProfile.avatar_url || undefined,
        bio: dbProfile.bio || undefined,
        isVerified: dbProfile.is_verified || false,
        followers: dbProfile.followers_count || 0,
        following: dbProfile.following_count || 0,
        tokensBalance: dbProfile.tokens_balance || 0,
        tokensEarned: dbProfile.tokens_earned || 0,
        reputation: dbProfile.reputation || 0,
        categories: (dbProfile.creator_types || []) as any[],
        walletAddress: dbProfile.wallet_address || undefined,
        role: "creator" as const,
        joinedAt: new Date(dbProfile.created_at || Date.now()),
      } : mockUsers.find(u => u.username === username) || mockUsers[0])
    : currentDbProfile ? {
        id: currentDbProfile.id,
        username: currentDbProfile.username,
        displayName: currentDbProfile.display_name,
        avatar: currentDbProfile.avatar_url || undefined,
        bio: currentDbProfile.bio || undefined,
        isVerified: currentDbProfile.is_verified || false,
        followers: currentDbProfile.followers_count || 0,
        following: currentDbProfile.following_count || 0,
        tokensBalance: currentDbProfile.tokens_balance || 0,
        tokensEarned: currentDbProfile.tokens_earned || 0,
        reputation: currentDbProfile.reputation || 0,
        categories: (currentDbProfile.creator_types || []) as any[],
        walletAddress: currentDbProfile.wallet_address || undefined,
        role: "creator" as const,
        joinedAt: new Date(currentDbProfile.created_at || Date.now()),
      } : currentUser;
  
  const userPosts = mockPosts.filter(p => p.author.id === user.id);
  
  // Only treat as own profile if we have both an authenticated user AND a matching database profile
  const hasValidDatabaseProfile = authUserId && (currentDbProfile?.id === authUserId || dbProfile?.id === authUserId);
  const isOwnProfile = hasValidDatabaseProfile && user.id === authUserId;

  // Fetch user's creator type from database
  const { creatorTypeDisplay, subcategories, isLoading: creatorTypeLoading } = useUserCreatorType(user.id);
  const updateSubcategories = useUpdateUserSubcategories();

  // Get primary subcategory's category name
  const primarySubcategory = subcategories?.find(us => us.is_primary) || subcategories?.[0];
  const categoryName = primarySubcategory?.subcategory?.category?.name;

  const handleFollow = () => {
    // Follow logic is now handled in ProfileHeader
  };

  const handleMessage = () => {
    navigate("/messages");
  };

  const handleAddHighlight = () => {
    toast.info(t("Add highlight feature coming soon!"));
  };

  const handleEditProfile = () => {
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (data: any) => {
    // Profile update is now handled in EditProfileModal directly
    // This callback is for any additional parent-level logic
  };

  // Loading state
  if (profileLoading && username) {
    return (
      <AppLayout>
        <div className="lg:py-4 space-y-4 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="lg:py-4">
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          isOwnProfile={isOwnProfile}
          creatorTypeDisplay={creatorTypeDisplay}
          categoryName={categoryName}
          onFollow={handleFollow}
          onMessage={handleMessage}
          onEditProfile={handleEditProfile}
        />

        {/* Categories - show database subcategories if available */}
        {subcategories && subcategories.length > 0 ? (
          <div className="px-4 pb-2 flex items-center gap-2 justify-center md:justify-start flex-wrap">
            {subcategories.map((us) => (
              <Link key={us.id} to={`/category/${us.subcategory?.category?.name?.toLowerCase()}`}>
                <Badge 
                  variant={us.is_primary ? "default" : "outline"}
                  className="capitalize hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  {us.subcategory?.name}
                </Badge>
              </Link>
            ))}
          </div>
        ) : user.categories && user.categories.length > 0 && (
          <div className="px-4 pb-2 flex items-center gap-2 justify-center md:justify-start flex-wrap">
            {user.categories.map((cat) => (
              <Link key={cat} to={`/category/${cat}`}>
                <Badge 
                  variant="outline" 
                  className="capitalize hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  {cat}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Story Highlights */}
        <StoryHighlights 
          highlights={[]} 
          isOwnProfile={isOwnProfile}
          onAddHighlight={handleAddHighlight}
        />

        {/* Wallet Section (show for own profile or verified creators) */}
        {(isOwnProfile || user.isVerified) && (
          <WalletSection user={user} isOwnProfile={isOwnProfile} />
        )}

        {/* Tabbed Content - Show only this user's posts */}
        <ProfileTabs 
          posts={userPosts} 
          isOwnProfile={isOwnProfile}
        />

        {/* Edit Profile Modal */}
        {isOwnProfile && (
          <EditProfileModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            user={user}
            onSave={handleSaveProfile}
          />
        )}
      </div>
    </AppLayout>
  );
}
