import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { CategoryCard } from "@/components/category";
import { PostCard } from "@/components/post";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, getCategoryById } from "@/data/categories";
import { mockPosts, mockUsers } from "@/data/mockData";
import { ContentCategory } from "@/types";
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  TrendingUp,
  BadgeCheck,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryGradient } from "@/data/categories";
import { useAutoTranslate } from "@/hooks/useTranslation";

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const category = getCategoryById(id as ContentCategory);

  const { t } = useAutoTranslate([
    "Category Not Found",
    "Back to Explore",
    "Posts",
    "Creators",
    "Avg Tokens",
    "Top Creators in",
    "followers",
    "Follow",
    "Trending",
    "Recent",
    "Top Rated",
    "No Posts Yet",
    "Be the first to post in",
    "Create Post"
  ]);
  
  if (!category) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{t("Category Not Found")}</h1>
            <Link to="/explore">
              <Button variant="outline">{t("Back to Explore")}</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const categoryPosts = mockPosts.filter(p => p.category === id);
  const categoryCreators = mockUsers.filter(u => u.categories?.includes(id as ContentCategory));

  return (
    <AppLayout>
      <div className="lg:py-6">
        {/* Hero */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img 
            src={category.coverImage} 
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Back Button */}
          <Link 
            to="/explore"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center hover:bg-background/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Category Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{category.icon}</span>
              <h1 className="text-3xl font-bold">{category.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">{category.description}</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-around p-4 border-b border-border bg-card">
          <div className="text-center">
            <p className="text-xl font-bold">{category.postsCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("Posts")}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{category.creatorsCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("Creators")}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-primary">150</p>
            <p className="text-xs text-muted-foreground">{t("Avg Tokens")}</p>
          </div>
        </div>

        {/* Top Creators */}
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {t("Top Creators in")} {category.name}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categoryCreators.map((creator) => (
              <Link 
                key={creator.id}
                to={`/profile/${creator.username}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 flex-shrink-0 hover:bg-muted transition-colors"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                  "bg-gradient-to-br",
                  getCategoryGradient(category.id)
                )}>
                  {creator.displayName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">{creator.displayName}</span>
                    {creator.isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{creator.followers.toLocaleString()} {t("followers")}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs ml-2">
                  {t("Follow")}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Posts */}
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 px-4">
            <TabsTrigger 
              value="trending" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("Trending")}
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              {t("Recent")}
            </TabsTrigger>
            <TabsTrigger 
              value="top" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              {t("Top Rated")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="mt-0">
            {categoryPosts.length > 0 ? (
              <div className="divide-y divide-border">
                {categoryPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-1">{t("No Posts Yet")}</h3>
                <p className="text-sm text-muted-foreground">{t("Be the first to post in")} {category.name}!</p>
                <Link to="/create">
                  <Button variant="glow" className="mt-4">{t("Create Post")}</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <div className="divide-y divide-border">
              {categoryPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="mt-0">
            <div className="divide-y divide-border">
              {[...categoryPosts].sort((a, b) => b.likes - a.likes).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
