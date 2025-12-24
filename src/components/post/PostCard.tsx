import { forwardRef, useMemo, useState } from "react";
import { Post } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Play,
  Star,
  Coins,
  BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { getCategoryGradient } from "@/data/categories";
import { TranslatableText, useTranslateTexts } from "@/components/ui/translatable-text";
import { useAuth } from "@/hooks/useAuth";
import { useIsPostLiked, usePostEngagement, useTogglePostLike, useSharePost } from "@/hooks/useEngagement";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePostLikes } from "@/hooks/useEngagement";

interface PostCardProps {
  post: Post;
}

export const PostCard = forwardRef<HTMLElement, PostCardProps>(({ post }, ref) => {
  const { user } = useAuth();
  const [isLikedLocal, setIsLikedLocal] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likesLocal, setLikesLocal] = useState(post.likes);
  const [showFullContent, setShowFullContent] = useState(false);
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const { data: engagement } = usePostEngagement(post.id);
  const { data: likedRemote } = useIsPostLiked(post.id);
  const toggleLike = useTogglePostLike(post.id);
  const sharePost = useSharePost(post.id);

  // Texts to translate
  const textsToTranslate = useMemo(() => [
    "tokens",
    "reviews",
    "Review",
    "likes",
    "more",
    "View all",
    "comments",
    "Just now",
    post.content,
    post.category.charAt(0).toUpperCase() + post.category.slice(1),
  ], [post.content, post.category]);

  const { t } = useTranslateTexts(textsToTranslate);

  const isLiked = likedRemote ?? isLikedLocal;
  const likesCount = engagement?.likesCount ?? likesLocal;

  const handleLike = () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }
    setIsLikedLocal(!isLiked);
    setLikesLocal(isLiked ? Math.max(0, likesCount - 1) : likesCount + 1);
    toggleLike.mutate();
  };

  const handleShare = async () => {
    if (!user) {
      toast.error("Please sign in to share posts");
      return;
    }
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard?.writeText(url);
      sharePost.mutate("link");
      toast.success("Link copied");
    } catch (err) {
      console.error("share error", err);
      toast.error("Could not share");
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t("Just now");
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 3600) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const translatedContent = t(post.content);
  const contentPreview = translatedContent.length > 150 && !showFullContent
    ? translatedContent.slice(0, 150) + "..."
    : translatedContent;

  return (
    <article className="bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3 min-h-[44px] touch-manipulation">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
            `bg-gradient-to-br ${getCategoryGradient(post.category)}`
          )}>
            {post.author.displayName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm truncate">{post.author.displayName}</span>
              {post.author.isVerified && (
                <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">@{post.author.username}</span>
              <span>·</span>
              <span className="flex-shrink-0">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 flex-shrink-0">
          {post.isTokenized && (
            <Badge variant="glow" className="text-[10px] px-2 py-0.5 hidden sm:flex">
              <Coins className="w-3 h-3 mr-1" />
              {post.tokenReward} {t("tokens")}
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="touch-manipulation">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Media */}
      <Link to={`/post/${post.id}`}>
        <div className="relative aspect-square bg-muted overflow-hidden">
          {post.mediaType === "video" ? (
            <video 
              src={post.mediaUrl} 
              className="w-full h-full object-cover"
              poster={post.thumbnailUrl || post.mediaUrl}
              preload="metadata"
            />
          ) : post.mediaType === "audio" ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-foreground fill-foreground ml-1" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Audio Content</p>
              </div>
            </div>
          ) : post.mediaType === "document" ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-foreground fill-foreground ml-1" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Document</p>
              </div>
            </div>
          ) : (
            <img 
              src={post.mediaUrl} 
              alt={post.content.slice(0, 50)}
              className="w-full h-full object-cover"
            />
          )}
          
          {post.mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/20">
              <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 text-foreground fill-foreground ml-1" />
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              className={cn(
                "bg-gradient-to-r text-white border-0 text-xs",
                getCategoryGradient(post.category)
              )}
            >
              {t(post.category.charAt(0).toUpperCase() + post.category.slice(1))}
            </Badge>
          </div>

          {/* Review Count */}
          {post.reviews > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="glass" className="text-xs backdrop-blur-md">
                <Star className="w-3 h-3 mr-1 text-warning fill-warning" />
                {post.reviews} {t("reviews")}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2">
        <div className="flex items-center gap-0">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLike}
            className={cn("touch-manipulation", isLiked && "text-destructive")}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon" className="touch-manipulation">
            <MessageCircle className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="touch-manipulation"
            onClick={handleShare}
          >
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Link to={`/post/${post.id}/review`}>
            <Button variant="outline" size="sm" className="text-xs min-h-[36px] touch-manipulation">
              <Star className="w-4 h-4 mr-1" />
              {t("Review")}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSave}
            className={cn("touch-manipulation", isSaved && "text-primary")}
          >
            <Bookmark className={cn("w-6 h-6", isSaved && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 sm:px-4 pb-2">
        <button
          type="button"
          onClick={() => setLikesDialogOpen(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {formatNumber(likesCount)} {t("likes")}
        </button>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 pb-3">
        <p className="text-sm">
          <Link to={`/profile/${post.author.username}`} className="font-semibold mr-1.5 hover:underline">
            {post.author.username}
          </Link>
          {contentPreview}
          {translatedContent.length > 150 && !showFullContent && (
            <button 
              onClick={() => setShowFullContent(true)}
              className="text-muted-foreground ml-1 hover:text-foreground touch-manipulation"
            >
              {t("more")}
            </button>
          )}
        </p>
      </div>

      {/* Comments Preview */}
      {post.comments > 0 && (
        <Link to={`/post/${post.id}`} className="block px-3 sm:px-4 pb-4 min-h-[44px] flex items-center touch-manipulation">
          <p className="text-sm text-muted-foreground">
            {t("View all")} {formatNumber(post.comments)} {t("comments")}
          </p>
        </Link>
      )}
    </article>
  );
});

PostCard.displayName = "PostCard";

function LikesDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: likes, isLoading } = usePostLikes(postId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Likes</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : likes && likes.length > 0 ? (
            <div className="space-y-3">
              {likes.map((like) => (
                <div key={like.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={like.user.avatar} alt={like.user.displayName} />
                    <AvatarFallback>{like.user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{like.user.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">@{like.user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No likes yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
