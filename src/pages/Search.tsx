import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  TrendingUp,
  Users,
  FileText,
  Hash,
  X,
  Film,
  Palette,
  Code,
  BookOpen,
  Leaf,
  Music2,
  ArrowRight,
  Sparkles,
  Clock,
  Heart,
  MessageCircle,
  BadgeCheck,
  Loader2
} from "lucide-react";
import { useAutoTranslate } from "@/hooks/useTranslation";
import { useSearch, useTrendingTags, useSuggestedCreators } from "@/hooks/useSearch";
import { useDebounce } from "@/hooks/useDebounce";

const categoryConfig: Record<string, { icon: React.ElementType; gradient: string }> = {
  cinema: { icon: Film, gradient: "from-red-500 to-orange-500" },
  art: { icon: Palette, gradient: "from-purple-500 to-pink-500" },
  tech: { icon: Code, gradient: "from-blue-500 to-cyan-500" },
  books: { icon: BookOpen, gradient: "from-amber-500 to-yellow-500" },
  nature: { icon: Leaf, gradient: "from-green-500 to-emerald-500" },
  music: { icon: Music2, gradient: "from-indigo-500 to-violet-500" },
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [recentSearchList, setRecentSearchList] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });

  const { t } = useAutoTranslate([
    "Search",
    "Discover creators, posts, and topics",
    "Search creators, posts, tags...",
    "All",
    "Creators",
    "Posts",
    "Tags",
    "Recent Searches",
    "Clear All",
    "Trending Topics",
    "posts",
    "Suggested Creators",
    "followers",
    "Browse Categories",
    "cinema",
    "art",
    "tech",
    "books",
    "nature",
    "music",
    "No results found",
    "Try a different search term"
  ]);

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Database search
  const { data: searchResults, isLoading: isSearching } = useSearch(debouncedQuery, activeTab);
  
  // Trending and suggested data
  const { data: trendingTags, isLoading: trendingLoading } = useTrendingTags();
  const { data: suggestedCreators, isLoading: creatorsLoading } = useSuggestedCreators();

  const clearRecentSearch = (search: string) => {
    const updated = recentSearchList.filter(s => s !== search);
    setRecentSearchList(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const addToRecentSearches = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearchList.filter(s => s !== term)].slice(0, 5);
    setRecentSearchList(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery.trim());
    }
  };

  const hasQuery = searchQuery.trim().length > 0;
  const hasResults = searchResults && (
    searchResults.profiles.length > 0 || 
    searchResults.posts.length > 0 || 
    searchResults.tags.length > 0
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <SearchIcon className="w-6 h-6 text-primary" />
            {t("Search")}
          </h1>
          <p className="text-muted-foreground">{t("Discover creators, posts, and topics")}</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("Search creators, posts, tags...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-6 text-lg rounded-xl border-2 focus:border-primary"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>
          )}
        </form>

        {/* Search Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">{t("All")}</TabsTrigger>
            <TabsTrigger value="creators">{t("Creators")}</TabsTrigger>
            <TabsTrigger value="posts">{t("Posts")}</TabsTrigger>
            <TabsTrigger value="tags">{t("Tags")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <AnimatePresence mode="wait">
          {!hasQuery ? (
            <motion.div
              key="discover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Recent Searches */}
              {recentSearchList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      {t("Recent Searches")}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRecentSearchList([]);
                        localStorage.removeItem("recentSearches");
                      }}
                      className="text-muted-foreground"
                    >
                      {t("Clear All")}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearchList.map((search) => (
                      <Badge
                        key={search}
                        variant="secondary"
                        className="py-2 px-4 cursor-pointer hover:bg-primary/20 flex items-center gap-2"
                        onClick={() => setSearchQuery(search)}
                      >
                        {search}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRecentSearch(search);
                          }}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Topics */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t("Trending Topics")}
                </h2>
                {trendingLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                ) : trendingTags && trendingTags.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {trendingTags.map((topic, index) => (
                      <motion.div
                        key={topic.tag}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setSearchQuery(`#${topic.tag}`)}
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Hash className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">#{topic.tag}</p>
                                <p className="text-xs text-muted-foreground">
                                  {topic.posts.toLocaleString()} {t("posts")}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No trending topics yet</p>
                )}
              </div>

              {/* Suggested Creators */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {t("Suggested Creators")}
                </h2>
                {creatorsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                ) : suggestedCreators && suggestedCreators.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedCreators.map((creator, index) => {
                      const category = creator.creator_types?.[0] || "art";
                      const config = categoryConfig[category] || categoryConfig.art;
                      const Icon = config.icon;
                      
                      return (
                        <motion.div
                          key={creator.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link to={`/profile/${creator.username}`}>
                            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-12 h-12 border-2 border-border">
                                    <AvatarImage src={creator.avatar_url || undefined} />
                                    <AvatarFallback className={`bg-gradient-to-br ${config.gradient} text-white`}>
                                      {creator.display_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{creator.display_name}</p>
                                      {creator.is_verified && (
                                        <BadgeCheck className="w-4 h-4 text-primary" />
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        <Icon className="w-3 h-3 mr-1" />
                                        {t(category)}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">@{creator.username}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {((creator.followers_count || 0) / 1000).toFixed(1)}K
                                  </p>
                                  <p className="text-xs text-muted-foreground">{t("followers")}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No creators found</p>
                )}
              </div>

              {/* Browse Categories */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t("Browse Categories")}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(categoryConfig).map(([category, config], index) => {
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link to={`/category/${category}`}>
                          <Card className="cursor-pointer hover:scale-105 transition-transform overflow-hidden group">
                            <CardContent className={`p-4 bg-gradient-to-br ${config.gradient} text-white`}>
                              <Icon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                              <p className="font-medium capitalize">{t(category)}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {isSearching ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : hasResults ? (
                <>
                  {/* Creators Results */}
                  {searchResults.profiles.length > 0 && (activeTab === "all" || activeTab === "creators") && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {t("Creators")} ({searchResults.profiles.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.profiles.map((profile, index) => {
                          const category = profile.creator_types?.[0] || "art";
                          const config = categoryConfig[category] || categoryConfig.art;
                          const Icon = config.icon;
                          
                          return (
                            <motion.div
                              key={profile.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <Link to={`/profile/${profile.username}`}>
                                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                                  <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="w-12 h-12 border-2 border-border">
                                        <AvatarImage src={profile.avatar_url || undefined} />
                                        <AvatarFallback className={`bg-gradient-to-br ${config.gradient} text-white`}>
                                          {profile.display_name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium">{profile.display_name}</p>
                                          {profile.is_verified && (
                                            <BadgeCheck className="w-4 h-4 text-primary" />
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                                        {profile.bio && (
                                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                            {profile.bio}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">
                                        {((profile.followers_count || 0) / 1000).toFixed(1)}K
                                      </p>
                                      <p className="text-xs text-muted-foreground">{t("followers")}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Posts Results */}
                  {searchResults.posts.length > 0 && (activeTab === "all" || activeTab === "posts") && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {t("Posts")} ({searchResults.posts.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.posts.map((post, index) => {
                          const config = categoryConfig[post.category] || categoryConfig.art;
                          
                          return (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <Link to={`/post/${post.id}`}>
                                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                                  <CardContent className="p-4">
                                    <div className="flex gap-4">
                                      {(post.thumbnail_url || post.media_url) && (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                          <img 
                                            src={post.thumbnail_url || post.media_url || ""} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Heart className="w-3 h-3" />
                                            {post.likes_count || 0}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <MessageCircle className="w-3 h-3" />
                                            {post.comments_count || 0}
                                          </span>
                                          <Badge variant="outline" className="text-xs capitalize">
                                            {post.category}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tags Results */}
                  {searchResults.tags.length > 0 && (activeTab === "all" || activeTab === "tags") && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        {t("Tags")} ({searchResults.tags.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {searchResults.tags.map((tag, index) => (
                          <motion.div
                            key={tag.tag}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Card 
                              className="cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={() => setSearchQuery(`#${tag.tag}`)}
                            >
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Hash className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">#{tag.tag}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {tag.count} {t("posts")}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("No results found")}</h3>
                  <p className="text-muted-foreground">{t("Try a different search term")}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
