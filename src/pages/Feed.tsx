import { AppLayout } from "@/components/layout";
import { MediaPostCard } from "@/components/media/MediaPostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePosts } from "@/hooks/usePosts";
import { MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnreadMessageCount } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Post } from "@/types";

export default function Feed() {
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadMessageCount();
  
  // Use only real posts from database
  const { data: posts, isLoading, error, isFetching } = usePosts();
  
  // Cache for previously loaded posts to show during background loading
  const [cachedPosts, setCachedPosts] = useState<Post[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasPreviousData = useRef(false);

  // Debug logging
  console.log("🔍 Feed Debug:", {
    user: user?.id,
    postsCount: posts?.length,
    isLoading,
    error: error?.message,
    isFetching
  });

  // Update cached posts when new data arrives
  useEffect(() => {
    if (posts && posts.length > 0) {
      setCachedPosts(posts);
      hasPreviousData.current = true;
      
      // Mark initial load as complete once we have data
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [posts, isInitialLoad]);

  // Use real posts or cached posts during loading
  const postsToDisplay = (() => {
    // Use current posts if available
    if (posts && posts.length > 0) {
      return posts;
    }
    
    // If we're loading and have cached posts, show cached posts
    if (isLoading && cachedPosts.length > 0) {
      return cachedPosts;
    }
    
    // Otherwise return null/empty
    return null;
  })();

  // Determine loading state for UI
  const showInitialLoader = isInitialLoad && isLoading && !hasPreviousData.current;

  return (
    <AppLayout>
      <div className="lg:py-6 overflow-x-hidden">
        {/* Ultra-Responsive Feed Header - Mobile-First Design */}
        <div className="bg-card border-b border-border sticky top-0 z-40 header-responsive">
          <div className="container-fluid-safe py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2 min-h-[44px]">
              {/* Left: Fluid Adaptive Title Section */}
              <div className="flex-1 min-w-0 pr-2">
                <h1 className="font-bold text-foreground leading-tight">
                  {/* Ultra-small screens (320px): Very short */}
                  <span className="block 2xs:hidden text-responsive-lg">
                    Discover
                  </span>
                  {/* Small screens (375px+): Medium length */}
                  <span className="hidden 2xs:block xs:hidden text-responsive-lg">
                    Creative Content
                  </span>
                  {/* Standard mobile (375px+): Balanced */}
                  <span className="hidden xs:block sm:hidden text-responsive-xl">
                    Discover Creative
                  </span>
                  {/* Tablet+ (640px+): Full title with fluid sizing */}
                  <span className="hidden sm:block text-responsive-xl md:text-2xl lg:text-3xl">
                    Discover Creative Content
                  </span>
                </h1>
                {/* Contextual subtitle - appears only when space allows */}
                <p className="hidden lg:block text-xs text-muted-foreground mt-0.5 leading-tight opacity-80">
                  Explore amazing content from our creative community
                </p>
              </div>
              
              {/* Right: Ultra-Adaptive Action Buttons */}
              <div className="flex items-center space-adaptive-x flex-shrink-0">
                {user ? (
                  <>
                    {/* Messages Button - Fluid Responsive */}
                    <Link to="/messages">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="relative btn-mobile-friendly h-9 px-2 xs:px-3 sm:px-4 rounded-full border-border/50 hover:border-border transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4 flex-shrink-0" />
                        {/* Progressive text reveal based on screen size */}
                        <span className="hidden xs:inline ml-1.5 text-responsive-sm">
                          <span className="xs:hidden sm:inline">Messages</span>
                          <span className="hidden xs:inline sm:hidden">Msg</span>
                        </span>
                        {unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center p-0 text-[10px] font-medium scale-90 xs:scale-100"
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    
                    {/* User Profile Button - Always consistent */}
                    <Link to="/profile">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="btn-mobile-friendly h-9 w-9 rounded-full p-0 hover:bg-accent flex-shrink-0 transition-all duration-200"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs font-semibold">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Messages Button for Guest - Adaptive */}
                    <Link to="/messages">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="btn-mobile-friendly h-9 px-2 xs:px-3 sm:px-4 rounded-full border-border/50 hover:border-border transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden xs:inline ml-1.5 text-responsive-sm">
                          <span className="xs:hidden sm:inline">Messages</span>
                          <span className="hidden xs:inline sm:hidden">Msg</span>
                        </span>
                      </Button>
                    </Link>
                    
                    {/* Sign In Button - Fluid Responsive */}
                    <Link to="/auth">
                      <Button 
                        size="sm" 
                        className="btn-mobile-friendly h-9 px-3 xs:px-4 sm:px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 flex-shrink-0 text-responsive-sm"
                      >
                        <span className="2xs:hidden">In</span>
                        <span className="hidden 2xs:inline">Sign In</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Initial Loading State - only show when no cached data */}
        {showInitialLoader && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading your feed...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !postsToDisplay?.length && !showInitialLoader && (
          <Card className="m-4 border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <h3 className="font-semibold text-destructive mb-2">
                {user ? "Failed to load feed" : "Unable to load content"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {user 
                  ? (error instanceof Error ? error.message : "Something went wrong")
                  : "We're having trouble loading the public feed. This might be a temporary issue."
                }
              </p>
              <div className="flex gap-2 justify-center">
                {!user && (
                  <Link to="/auth">
                    <Button size="sm">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - only show when no posts and not loading */}
        {!showInitialLoader && !error && (!postsToDisplay || postsToDisplay.length === 0) && (
          <Card className="m-4">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {user ? "No posts yet" : "Welcome to Creaverse"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {user 
                  ? "Be the first to share something amazing with the community!"
                  : "Discover amazing creative content from our community. Sign in to create and share your own posts!"
                }
              </p>
              {user ? (
                <Link to="/create">
                  <Button>Create Your First Post</Button>
                </Link>
              ) : (
                <div className="flex gap-2 justify-center">
                  <Link to="/auth">
                    <Button>Sign In</Button>
                  </Link>
                  <Link to="/create">
                    <Button variant="outline">Browse as Guest</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feed - show posts even during background loading */}
        {!showInitialLoader && postsToDisplay && postsToDisplay.length > 0 && (
          <>
            {/* Posts - Always Instagram Style */}
            <div className="space-y-6 w-full max-w-lg mx-auto px-4 overflow-x-hidden">
              {postsToDisplay.map((post: Post) => (
                <MediaPostCard 
                  key={post.id} 
                  post={post} 
                  autoPlay={true}
                  showFullControls={true}
                />
              ))}
            </div>

            {/* Clean Footer */}
            <div className="p-6 text-center">
              <div className="text-xs text-muted-foreground">
                You've reached the end of your feed
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
