import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockPosts } from "@/data/mockData";
import { usePosts } from "@/hooks/usePosts";
import { getCategoryGradient } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  useIsPostLiked,
  usePostEngagement,
  useTogglePostLike,
  useSharePost,
  usePostComments,
  useAddComment,
} from "@/hooks/useEngagement";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Play,
  Star,
  Coins,
  BadgeCheck,
  Send
} from "lucide-react";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  
  // Get posts from database
  const { data: realPosts } = usePosts();
  
  // Combine database posts with fallback mock posts
  const allPosts = [
    ...(realPosts || []),
    ...mockPosts // fallback to original mock posts for development
  ];
  
  const post = allPosts.find(p => p.id === id) || mockPosts[0];
  
  console.log("PostDetail - Looking for post ID:", id);
  console.log("PostDetail - Available posts:", allPosts.map(p => ({ id: p.id, mediaType: p.mediaType, mediaUrl: p.mediaUrl })));
  console.log("PostDetail - Found post:", { id: post.id, mediaType: post.mediaType, mediaUrl: post.mediaUrl });
  
  const { user } = useAuth();
  const [isLikedLocal, setIsLikedLocal] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likesLocal, setLikesLocal] = useState(post.likes);
  const [comment, setComment] = useState("");
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const engagement = usePostEngagement(post.id);
  const isLikedQuery = useIsPostLiked(post.id);
  const toggleLike = useTogglePostLike(post.id);
  const sharePost = useSharePost(post.id);
  const commentsQuery = usePostComments(post.id);
  const addComment = useAddComment(post.id);

  const isLiked = isLikedQuery.data ?? isLikedLocal;
  const likesCount = engagement.data?.likesCount ?? likesLocal;
  const commentsCount = commentsQuery.data?.length ?? post.comments;
  const sharesCount = engagement.data?.sharesCount ?? (post as any).shares ?? 0;

  const handleLike = () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }
    setIsLikedLocal(!isLiked);
    setLikesLocal(isLiked ? Math.max(0, likesCount - 1) : likesCount + 1);
    toggleLike.mutate();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved to collection");
  };

  const handleComment = () => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!comment.trim()) return;
    addComment.mutate({ content: comment });
    setComment("");
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-4 p-4">
            <Link to="/feed">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-semibold">Post</h1>
          </div>
        </div>

        {/* Post */}
        <article>
          {/* Author Header */}
          <div className="flex items-center justify-between p-4">
            <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white",
                `bg-gradient-to-br ${getCategoryGradient(post.category)}`
              )}>
                {post.author.displayName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">{post.author.displayName}</span>
                  {post.author.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>@{post.author.username}</span>
                  <span>·</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {post.isTokenized && (
                <Badge variant="glow" className="text-[10px] px-2 py-0.5">
                  <Coins className="w-3 h-3 mr-1" />
                  {post.tokenReward} tokens
                </Badge>
              )}
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Media */}
          <div className="relative aspect-square bg-muted overflow-hidden">
            {post.mediaType === "video" ? (
              <video 
                src={post.mediaUrl} 
                controls
                className="w-full h-full object-cover"
                poster={post.thumbnailUrl || post.mediaUrl}
              />
            ) : post.mediaType === "audio" ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                    <Play className="w-12 h-12 text-foreground fill-foreground ml-1" />
                  </div>
                  <audio src={post.mediaUrl} controls className="w-full max-w-md mx-auto" />
                  <p className="text-sm font-medium text-foreground/80 mt-4">Audio Content</p>
                </div>
              </div>
            ) : post.mediaType === "document" ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                    <Play className="w-12 h-12 text-foreground fill-foreground ml-1" />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (post.mediaUrl) {
                        window.open(post.mediaUrl, '_blank');
                      }
                    }}
                    className="mb-4"
                  >
                    Open Document
                  </Button>
                  <p className="text-sm font-medium text-foreground/80">Document Content</p>
                </div>
              </div>
            ) : (
              <img 
                src={post.mediaUrl} 
                alt={post.content.slice(0, 50)}
                className="w-full h-full object-cover"
              />
            )}

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge 
                className={cn(
                  "bg-gradient-to-r text-white border-0 text-xs",
                  getCategoryGradient(post.category)
                )}
              >
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLike}
                className={cn(isLiked && "text-destructive")}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageCircle className="w-6 h-6" />
              </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Link to={`/post/${post.id}/review`}>
                <Button variant="glow" size="sm" className="text-xs">
                  <Star className="w-4 h-4 mr-1" />
                  Write Review
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSave}
                className={cn(isSaved && "text-primary")}
              >
                <Bookmark className={cn("w-6 h-6", isSaved && "fill-current")} />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setLikesDialogOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {formatNumber(likesCount)} likes
            </button>
            <p className="text-sm text-muted-foreground">{formatNumber(commentsCount)} comments</p>
            <p className="text-sm text-muted-foreground">{formatNumber(post.reviews)} reviews</p>
            <p className="text-sm text-muted-foreground">{formatNumber(sharesCount)} shares</p>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            <p className="text-sm">
              <Link to={`/profile/${post.author.username}`} className="font-semibold mr-1.5 hover:underline">
                {post.author.username}
              </Link>
              {post.content}
            </p>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map(tag => (
                  <Link key={tag} to={`/explore?tag=${tag}`}>
                    <span className="text-xs text-primary hover:underline">#{tag}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="border-t border-border">
          <div className="p-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="font-semibold">Comments</h2>
          </div>
          {commentsQuery.data && commentsQuery.data.length > 0 ? (
            <div className="divide-y divide-border">
              {commentsQuery.data.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                        {c.author?.display_name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{c.author?.display_name ?? "User"}</span>
                        {c.author?.is_verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />
                        )}
                        <span className="text-xs text-muted-foreground">@{c.author?.username ?? ""}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(new Date(c.created_at))}</span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{c.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 pb-6 text-sm text-muted-foreground">No comments yet.</p>
          )}
        </div>

        {/* Comment Input */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                Y
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={user ? "Add a comment..." : "Sign in to comment"}
                className="min-h-[40px] max-h-[120px] pr-12 resize-none"
              />
              <Button 
                variant="ghost" 
                size="icon-sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleComment}
                disabled={!comment.trim() || !user}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
