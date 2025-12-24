import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostGrid } from "./PostGrid";
import { Post } from "@/types";
import { 
  Grid3X3, 
  Image, 
  Sparkles, 
  Tag, 
  Bookmark,
  Coins,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileTabsProps {
  posts: Post[];
  isOwnProfile: boolean;
}

export function ProfileTabs({ posts, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts");

  // Filter posts by type (mock filters for demo)
  const nftPosts = posts.filter(p => p.isTokenized);
  const aiPosts = posts.filter(p => p.tags.some(t => t.toLowerCase().includes('ai')));
  const taggedPosts = posts.slice(0, 2); // Mock tagged posts
  const savedPosts = posts.filter(p => p.isSaved);

  const tabs = [
    { id: "posts", label: "Posts", icon: Grid3X3, count: posts.length },
    { id: "nfts", label: "NFTs", icon: Coins, count: nftPosts.length },
    { id: "ai", label: "AI Content", icon: Sparkles, count: aiPosts.length },
    { id: "tagged", label: "Tagged", icon: Tag, count: taggedPosts.length },
    ...(isOwnProfile ? [{ id: "saved", label: "Saved", icon: Bookmark, count: savedPosts.length }] : []),
  ];

  const getTabContent = (tabId: string) => {
    switch (tabId) {
      case "posts":
        return posts;
      case "nfts":
        return nftPosts;
      case "ai":
        return aiPosts;
      case "tagged":
        return taggedPosts;
      case "saved":
        return savedPosts;
      default:
        return [];
    }
  };

  const getEmptyMessage = (tabId: string) => {
    switch (tabId) {
      case "posts":
        return { title: "No Posts Yet", description: "When you create posts, they will appear here." };
      case "nfts":
        return { title: "No NFTs Yet", description: "Tokenized creations will appear here." };
      case "ai":
        return { title: "No AI Content", description: "AI-generated content will appear here." };
      case "tagged":
        return { title: "No Tagged Posts", description: "Posts you're tagged in will appear here." };
      case "saved":
        return { title: "No Saved Posts", description: "Save posts to view them later." };
      default:
        return { title: "Nothing here", description: "Content will appear here." };
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tab Navigation */}
      <div className="border-t border-border sticky top-14 lg:top-0 bg-background/95 backdrop-blur-sm z-10">
        <TabsList className="w-full justify-start md:justify-center bg-transparent h-auto p-0 gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-4 rounded-none border-t-2 border-transparent",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "hover:bg-muted/30 transition-all"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 md:w-5 md:h-5",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="hidden md:inline text-sm font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === tab.id 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PostGrid 
                posts={getTabContent(tab.id)} 
                emptyState={getEmptyMessage(tab.id)}
                isOwnProfile={isOwnProfile}
                showNftBadge={tab.id !== "nfts"}
              />
            </motion.div>
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  );
}
