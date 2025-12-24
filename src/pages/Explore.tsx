import { useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { CategoryCard } from "@/components/category";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { categories } from "@/data/categories";
import { mockPosts, mockUsers } from "@/data/mockData";
import { Search, TrendingUp, Sparkles, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getCategoryGradient } from "@/data/categories";
import { useTranslateTexts } from "@/components/ui/translatable-text";

export default function Explore() {
  const trendingPosts = mockPosts.slice(0, 9);
  const topCreators = mockUsers.filter(u => u.isVerified).slice(0, 5);

  const textsToTranslate = useMemo(() => [
    "Search creators, posts, categories...",
    "Explore Categories", "See all", "Top Creators",
    "followers", "Follow", "Trending Now"
  ], []);

  const { t } = useTranslateTexts(textsToTranslate);

  return (
    <AppLayout>
      <div className="p-4 lg:py-6 space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder={t("Search creators, posts, categories...")}
            className="pl-10 h-12 bg-muted border-0 rounded-xl"
          />
        </div>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("Explore Categories")}
            </h2>
            <Button variant="ghost" size="sm">{t("See all")}</Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Top Creators */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              {t("Top Creators")}
            </h2>
            <Button variant="ghost" size="sm">{t("See all")}</Button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {topCreators.map((creator) => (
              <Link 
                key={creator.id}
                to={`/profile/${creator.username}`}
                className="flex flex-col items-center gap-2 flex-shrink-0 w-28"
              >
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold",
                  "bg-gradient-to-br",
                  getCategoryGradient(creator.categories[0] || "art")
                )}>
                  {creator.displayName.charAt(0)}
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <span className="font-semibold text-sm truncate">{creator.displayName}</span>
                    {creator.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {creator.followers.toLocaleString()} {t("followers")}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {t("Follow")}
                </Button>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Posts Grid */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            {t("Trending Now")}
          </h2>
          
          <div className="grid grid-cols-3 gap-0.5">
            {trendingPosts.map((post, index) => (
              <Link 
                key={post.id}
                to={`/post/${post.id}`}
                className="relative aspect-square overflow-hidden group"
              >
                <img 
                  src={post.mediaUrl} 
                  alt=""
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
                {index < 3 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="gradient" className="text-[10px] px-1.5">
                      #{index + 1}
                    </Badge>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
