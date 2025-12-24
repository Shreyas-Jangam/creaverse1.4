import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BadgeCheck, 
  Edit, 
  Settings, 
  UserPlus, 
  UserMinus,
  MessageCircle,
  Share2,
  Coins,
  Trophy,
  Sparkles,
  Calendar,
  MapPin,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { getCategoryGradient } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";
import { CreatorTypeBadge } from "./CreatorTypeBadge";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "@/hooks/useFollow";
import { toast } from "sonner";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  creatorTypeDisplay?: string;
  categoryName?: string;
  onFollow?: () => void;
  onMessage?: () => void;
  onEditProfile?: () => void;
}

export function ProfileHeader({ 
  user, 
  isOwnProfile, 
  creatorTypeDisplay,
  categoryName,
  onFollow, 
  onMessage,
  onEditProfile 
}: ProfileHeaderProps) {
  const [showFullBio, setShowFullBio] = useState(false);
  
  // Check if user.id is a valid UUID (real database user)
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
  
  // Real follow functionality from database (only for real users)
  const { data: isFollowing, isLoading: isFollowingLoading } = useIsFollowing(isValidUUID ? user.id : undefined);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleFollow = async () => {
    if (!isValidUUID) {
      toast.error("Cannot follow demo users");
      return;
    }
    
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(user.id);
        toast.success(`Unfollowed ${user.displayName}`);
      } else {
        await followMutation.mutateAsync(user.id);
        toast.success(`Now following ${user.displayName}`);
      }
      onFollow?.();
    } catch (error: any) {
      if (error.message?.includes("logged in")) {
        toast.error("Please log in to follow users");
      } else {
        toast.error("Failed to update follow status");
      }
    }
  };

  const creatorTypeLabel = creatorTypeDisplay || (user.categories?.[0]
    ? `${user.categories[0].charAt(0).toUpperCase() + user.categories[0].slice(1)} Creator`
    : 'Creator');

  return (
    <div className="relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 h-32 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
      
      <div className="relative p-4 lg:p-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
          {/* Profile Picture with Verification Ring */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            {/* Verification/Creator Ring */}
            <div className={cn(
              "absolute -inset-1 rounded-full",
              user.isVerified 
                ? "bg-gradient-primary animate-pulse" 
                : "bg-gradient-to-r from-border to-muted"
            )} />
            
            {/* Avatar */}
            <div className={cn(
              "relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold overflow-hidden",
              "bg-gradient-to-br",
              getCategoryGradient(user.categories?.[0] || "art")
            )}>
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white drop-shadow-lg">
                  {user.displayName.charAt(0)}
                </span>
              )}
            </div>

            {/* Online Status Indicator */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-success rounded-full border-4 border-background" />
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            {/* Username & Verification */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-3"
            >
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.displayName}</h1>
                {user.isVerified && (
                  <BadgeCheck className="w-6 h-6 text-primary fill-primary/20" />
                )}
              </div>
              
              {/* Creator Type Badge */}
              {creatorTypeDisplay ? (
                <CreatorTypeBadge 
                  creatorTypeDisplay={creatorTypeDisplay}
                  categoryName={categoryName}
                  size="md"
                />
              ) : (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "bg-gradient-to-r capitalize px-3 py-1",
                    user.role === "creator" 
                      ? "from-primary/20 to-secondary/20 border-primary/30 text-primary"
                      : user.role === "reviewer"
                      ? "from-warning/20 to-accent/20 border-warning/30 text-warning"
                      : "from-muted to-muted border-border"
                  )}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {creatorTypeLabel}
                </Badge>
              )}
            </motion.div>

            {/* Username Handle */}
            <p className="text-muted-foreground text-sm mb-4">@{user.username}</p>

            {/* Stats Row */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center md:justify-start gap-6 mb-4"
            >
              <button className="text-center group hover:scale-105 transition-transform">
                <p className="font-bold text-lg group-hover:text-primary transition-colors">
                  {formatNumber(user.followers)}
                </p>
                <p className="text-xs text-muted-foreground">followers</p>
              </button>
              <div className="w-px h-8 bg-border" />
              <button className="text-center group hover:scale-105 transition-transform">
                <p className="font-bold text-lg group-hover:text-primary transition-colors">
                  {formatNumber(user.following)}
                </p>
                <p className="text-xs text-muted-foreground">following</p>
              </button>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-bold text-lg">{formatNumber(user.tokensEarned)}</p>
                <p className="text-xs text-muted-foreground">tokens</p>
              </div>
            </motion.div>

            {/* Bio */}
            {user.bio && (
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4 max-w-md mx-auto md:mx-0"
              >
                <p className={cn(
                  "text-sm text-foreground/90",
                  !showFullBio && user.bio.length > 100 && "line-clamp-2"
                )}>
                  {user.bio}
                </p>
                {user.bio.length > 100 && (
                  <button 
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-primary text-sm font-medium mt-1 hover:underline"
                  >
                    {showFullBio ? "less" : "more"}
                  </button>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center md:justify-start gap-3 mb-4"
            >
              {isOwnProfile ? (
                <>
                  <Button variant="outline" size="sm" className="gap-2" onClick={onEditProfile}>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  <Link to="/settings">
                    <Button variant="ghost" size="icon-sm">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon-sm">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant={isFollowing ? "outline" : "glow"} 
                    size="sm"
                    onClick={handleFollow}
                    disabled={isFollowLoading || isFollowingLoading}
                    className={cn(
                      "gap-2 min-w-[100px] transition-all",
                      isFollowing && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    )}
                  >
                    {isFollowLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={onMessage} className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </>
              )}
            </motion.div>

            {/* Token & Reputation Stats */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl bg-gradient-card border border-border/50 w-fit mx-auto md:mx-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold">{formatNumber(user.tokensBalance)}</span>
                  <span className="text-xs text-muted-foreground ml-1">balance</span>
                </div>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <span className="text-sm font-semibold">{user.reputation}</span>
                  <span className="text-xs text-muted-foreground ml-1">rating</span>
                </div>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Joined </span>
                  <span className="text-sm font-semibold">
                    {user.joinedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
