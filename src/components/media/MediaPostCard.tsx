import { useState, useRef, useEffect } from 'react';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  Coins,
  BadgeCheck,
  Download,
  Eye,
  FileText,
  Music,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { getCategoryGradient } from '@/data/categories';
import { useAuth } from '@/hooks/useAuth';
import { useIsPostLiked, usePostEngagement, useTogglePostLike, useSharePost } from '@/hooks/useEngagement';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaPostCardProps {
  post: Post;
  autoPlay?: boolean;
  showFullControls?: boolean;
}

export function MediaPostCard({ 
  post, 
  autoPlay = false, 
  showFullControls = true 
}: MediaPostCardProps) {
  const { user } = useAuth();
  const [isLikedLocal, setIsLikedLocal] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likesLocal, setLikesLocal] = useState(post.likes);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for auto-play
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: engagement } = usePostEngagement(post.id);
  const { data: likedRemote } = useIsPostLiked(post.id);
  const toggleLike = useTogglePostLike(post.id);
  const sharePost = useSharePost(post.id);

  const isLiked = likedRemote ?? isLikedLocal;
  const likesCount = engagement?.likesCount ?? likesLocal;

  // Auto-play video when in viewport (Instagram-style)
  useEffect(() => {
    if (!autoPlay || post.mediaType !== 'video') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch(() => {
              // Auto-play failed, user interaction required
            });
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [autoPlay, post.mediaType]);

  // Handle media interactions
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
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Share error:", err);
      toast.error("Could not share post");
    }
  };

  const handleSave = () => {
    if (!user) {
      toast.error("Please sign in to save posts");
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Post removed from saved" : "Post saved!");
  };

  const togglePlayback = () => {
    if (post.mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    } else if (post.mediaType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (post.mediaType === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else if (post.mediaType === 'audio' && audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (post.mediaUrl) {
      const link = document.createElement('a');
      link.href = post.mediaUrl;
      link.download = `creaverse-${post.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };

  const openDocument = () => {
    if (post.mediaUrl) {
      window.open(post.mediaUrl, '_blank');
    }
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Time ago calculation
  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const contentPreview = post.content.length > 150 && !showFullContent
    ? post.content.slice(0, 150) + "..."
    : post.content;

  return (
    <article 
      ref={cardRef}
      className="bg-card border-b border-border w-full max-w-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
            <AvatarFallback className={cn(
              "text-sm font-bold",
              `bg-gradient-to-br ${getCategoryGradient(post.category)}`
            )}>
              {post.author.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
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
            <Badge variant="glow" className="text-xs px-2 py-1">
              <Coins className="w-3 h-3 mr-1" />
              {post.tokenReward}
            </Badge>
          )}
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative">
        
        {post.mediaType === 'image' && (
          <Link to={`/post/${post.id}`}>
            <div className="relative aspect-square overflow-hidden bg-muted">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Failed to load image</p>
                  </div>
                </div>
              )}
              <img 
                src={post.mediaUrl} 
                alt={post.content.slice(0, 50)}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onError={(e) => {
                  // Try a more reliable fallback URL
                  if (!e.currentTarget.src.includes('via.placeholder.com')) {
                    e.currentTarget.src = `https://via.placeholder.com/800x800/6366f1/ffffff?text=${encodeURIComponent(post.category.toUpperCase())}`;
                  } else {
                    setImageError(true);
                  }
                  setImageLoading(false);
                }}
                onLoad={() => {
                  setImageLoading(false);
                  setImageError(false);
                }}
              />
              
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
          </Link>
        )}

        {post.mediaType === 'video' && (
          <div 
            className="relative aspect-square overflow-hidden cursor-pointer"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onClick={togglePlayback}
          >
            <video
              ref={videoRef}
              src={post.mediaUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            {/* Video Controls Overlay */}
            <AnimatePresence>
              {(showControls || !isPlaying) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center"
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 text-white hover:bg-black/70 w-12 h-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayback();
                      }}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </Button>
                    
                    {showFullControls && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            {duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
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
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </Badge>
            </div>

            {/* Duration Badge */}
            {duration > 0 && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="glass" className="text-xs backdrop-blur-md">
                  {formatTime(duration)}
                </Badge>
              </div>
            )}
          </div>
        )}

        {post.mediaType === 'audio' && (
          <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center p-8">
            <div className="text-center w-full">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <Music className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="font-medium mb-2 text-lg">Audio Content</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Tap to play audio
              </p>

              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                
                {showFullControls && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                )}
              </div>

              {/* Hidden Audio Element */}
              <audio
                ref={audioRef}
                src={post.mediaUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                muted={isMuted}
              />

              {/* Progress */}
              {duration > 0 && (
                <div className="w-full max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
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
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {post.mediaType === 'document' && (
          <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center p-8">
            <div className="text-center w-full">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="font-medium mb-2 text-lg">Document</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Click to view document
              </p>

              {/* Document Actions */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={openDocument}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                
                {showFullControls && (
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
              </div>

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
          </div>
        )}

        {/* Review Count */}
        {post.reviews > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="glass" className="text-xs backdrop-blur-md">
              <Star className="w-3 h-3 mr-1 text-warning fill-warning" />
              {post.reviews} reviews
            </Badge>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLike}
            className={cn(isLiked && "text-destructive")}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          </Button>
          <Link to={`/post/${post.id}`}>
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-6 h-6" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare}
          >
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/post/${post.id}/review`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Star className="w-4 h-4 mr-1" />
              Review
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
      <div className="px-4 pb-2">
        <p className="text-sm text-muted-foreground">
          {formatNumber(likesCount)} likes
        </p>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm">
          <Link to={`/profile/${post.author.username}`} className="font-semibold mr-2 hover:underline">
            {post.author.username}
          </Link>
          {contentPreview}
          {post.content.length > 150 && !showFullContent && (
            <button 
              onClick={() => setShowFullContent(true)}
              className="text-muted-foreground ml-1 hover:text-foreground"
            >
              more
            </button>
          )}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-primary hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Comments Preview */}
      {post.comments > 0 && (
        <Link to={`/post/${post.id}`} className="block px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            View all {formatNumber(post.comments)} comments
          </p>
        </Link>
      )}
    </article>
  );
}