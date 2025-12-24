import { useState } from "react";
import { Post } from "@/types";
import { 
  Heart, 
  MessageCircle, 
  Play, 
  Coins, 
  Eye,
  Bookmark,
  Share2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useIsPostLiked, usePostEngagement, useTogglePostLike, usePostLikes, useSharePost } from "@/hooks/useEngagement";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";

interface PostGridProps {
  posts: Post[];
  emptyState: { title: string; description: string };
  isOwnProfile: boolean;
  showNftBadge?: boolean;
}

export function PostGrid({ posts, emptyState, isOwnProfile, showNftBadge = true }: PostGridProps) {
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showHeart, setShowHeart] = useState<string | null>(null);
  const engagement = usePostEngagement(selectedPost?.id ?? null);
  const isLikedQuery = useIsPostLiked(selectedPost?.id ?? null);
  const toggleLike = useTogglePostLike(selectedPost?.id ?? null);
  const sharePost = useSharePost(selectedPost?.id ?? null);
  const modalLikes = engagement.data?.likesCount ?? selectedPost?.likes ?? 0;
  const modalComments = engagement.data?.commentsCount ?? selectedPost?.comments ?? 0;
  const modalShares = engagement.data?.sharesCount ?? (selectedPost as any)?.shares ?? 0;
  const modalIsLiked = isLikedQuery.data ?? likedPosts.has(selectedPost?.id ?? "");
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);

  const handleDoubleTap = (post: Post) => {
    if (!likedPosts.has(post.id)) {
      setLikedPosts(prev => new Set([...prev, post.id]));
      setShowHeart(post.id);
      setTimeout(() => setShowHeart(null), 1000);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{emptyState.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{emptyState.description}</p>
        {isOwnProfile && emptyState.title.includes("Posts") && (
          <Link to="/create">
            <Button variant="glow">Create First Post</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5 md:gap-1">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="relative aspect-square overflow-hidden group cursor-pointer bg-muted"
            onClick={() => setSelectedPost(post)}
            onDoubleClick={() => handleDoubleTap(post)}
          >
            {/* Image/Video */}
            <img 
              src={post.thumbnailUrl || post.mediaUrl} 
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Media Type Indicator */}
            {post.mediaType === "video" && (
              <div className="absolute top-2 right-2">
                <Play className="w-5 h-5 text-white drop-shadow-lg fill-white" />
              </div>
            )}

            {/* NFT Badge */}
            {showNftBadge && post.isTokenized && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5">
                  <Coins className="w-3 h-3 mr-0.5" />
                  NFT
                </Badge>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <Heart className={cn("w-5 h-5", likedPosts.has(post.id) && "fill-white")} />
                  <span>{formatNumber(post.likes + (likedPosts.has(post.id) ? 1 : 0))}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <MessageCircle className="w-5 h-5" />
                  <span>{formatNumber(post.comments)}</span>
                </div>
              </div>
            </div>

            {/* Heart Animation on Double Tap */}
            <AnimatePresence>
              {showHeart === post.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Heart className="w-20 h-20 text-white fill-white drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl p-0 bg-card border-border overflow-hidden">
          {selectedPost && (
            <div className="flex flex-col md:flex-row">
              {/* Media */}
              <div className="md:w-1/2 aspect-square bg-muted flex-shrink-0">
                <img 
                  src={selectedPost.mediaUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col max-h-[80vh] md:max-h-none">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-primary-foreground">
                    {selectedPost.author.displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{selectedPost.author.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedPost.category}</p>
                  </div>
                  {selectedPost.isTokenized && (
                    <Badge variant="outline" className="gap-1">
                      <Coins className="w-3 h-3" />
                      {selectedPost.tokenReward} tokens
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-sm mb-4">{selectedPost.content}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedPost.tags.map(tag => (
                      <span key={tag} className="text-xs text-primary">#{tag}</span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setLikesDialogOpen(true)}
                      className="hover:text-foreground transition-colors"
                    >
                      {formatNumber(modalLikes)} likes
                    </button>
                    <span>{formatNumber(modalComments)} comments</span>
                    <span>{formatNumber(selectedPost.reviews)} reviews</span>
                    <span>{formatNumber(modalShares)} shares</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                      onClick={() => {
                        if (!user) {
                          toast.error("Please sign in to like posts");
                          return;
                        }
                        if (!likedPosts.has(selectedPost.id)) {
                          setLikedPosts(prev => new Set([...prev, selectedPost.id]));
                        } else {
                          setLikedPosts(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(selectedPost.id);
                            return newSet;
                          });
                        }
                        toggleLike.mutate();
                      }}
                      >
                        <Heart className={cn(
                          "w-6 h-6 transition-colors",
                        modalIsLiked && "fill-destructive text-destructive"
                        )} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="w-6 h-6" />
                      </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={async () => {
                        if (!user) {
                          toast.error("Please sign in to share posts");
                          return;
                        }
                        try {
                          const url = `${window.location.origin}/post/${selectedPost.id}`;
                          await navigator.clipboard?.writeText(url);
                          sharePost.mutate("link");
                          toast.success("Link copied");
                        } catch (err) {
                          console.error("share error", err);
                          toast.error("Could not share");
                        }
                      }}
                    >
                        <Share2 className="w-6 h-6" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Bookmark className={cn(
                        "w-6 h-6",
                        selectedPost.isSaved && "fill-foreground"
                      )} />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    {selectedPost.createdAt.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Likes Dialog for modal */}
      {selectedPost && (
        <Dialog open={likesDialogOpen} onOpenChange={setLikesDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Liked by</DialogTitle>
            </DialogHeader>
            <LikesList postId={selectedPost.id} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
