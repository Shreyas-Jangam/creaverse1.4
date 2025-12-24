import { forwardRef } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  MessageCircle, 
  Star, 
  UserPlus, 
  Coins,
  AtSign,
  Bell,
  Settings,
  Check,
  BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockUsers } from "@/data/mockData";
import { useAutoTranslate } from "@/hooks/useTranslation";
import { TranslatableText } from "@/components/ui/translatable-text";

interface Activity {
  id: string;
  type: "like" | "comment" | "review" | "follow" | "token" | "mention";
  user: typeof mockUsers[0];
  message: string;
  timestamp: Date;
  isRead: boolean;
  postPreview?: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "like",
    user: mockUsers[0],
    message: "liked your post",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false,
    postPreview: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100"
  },
  {
    id: "2",
    type: "follow",
    user: mockUsers[1],
    message: "started following you",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false
  },
  {
    id: "3",
    type: "review",
    user: mockUsers[2],
    message: "left a 5-star review on your film",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true,
    postPreview: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100"
  },
  {
    id: "4",
    type: "token",
    user: mockUsers[3],
    message: "You earned 50 tokens from reviews",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true
  },
  {
    id: "5",
    type: "comment",
    user: mockUsers[4],
    message: "commented: \"This is amazing work!\"",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    isRead: true,
    postPreview: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=100"
  },
  {
    id: "6",
    type: "mention",
    user: mockUsers[0],
    message: "mentioned you in a comment",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true
  }
];

const getActivityIcon = (type: Activity["type"]) => {
  const icons = {
    like: Heart,
    comment: MessageCircle,
    review: Star,
    follow: UserPlus,
    token: Coins,
    mention: AtSign
  };
  return icons[type];
};

const getActivityColor = (type: Activity["type"]) => {
  const colors = {
    like: "text-destructive bg-destructive/10",
    comment: "text-primary bg-primary/10",
    review: "text-warning bg-warning/10",
    follow: "text-success bg-success/10",
    token: "text-primary bg-primary/10",
    mention: "text-accent bg-accent/10"
  };
  return colors[type];
};

const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface ActivityItemProps {
  activity: Activity;
  t: (text: string) => string;
}

const ActivityItem = forwardRef<HTMLDivElement, ActivityItemProps>(
  ({ activity, t }, ref) => {
    const Icon = getActivityIcon(activity.type);
    
    return (
      <div 
        ref={ref}
        className={cn(
          "flex items-start gap-3 p-4 transition-colors hover:bg-muted/50",
          !activity.isRead && "bg-primary/5"
        )}
      >
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
              {activity.user.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
            getActivityColor(activity.type)
          )}>
            <Icon className="w-3 h-3" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold">{activity.user.displayName}</span>
            {activity.user.isVerified && (
              <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20 inline ml-1" />
            )}
            <span className="text-muted-foreground ml-1">{t(activity.message)}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {timeAgo(activity.timestamp)}
          </p>
        </div>

        {activity.postPreview && (
          <img 
            src={activity.postPreview} 
            alt="" 
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}

        {activity.type === "follow" && (
          <Button size="sm" variant="outline">
            {t("Follow Back")}
          </Button>
        )}

        {!activity.isRead && (
          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
        )}
      </div>
    );
  }
);

ActivityItem.displayName = "ActivityItem";

export default function Activity() {
  const unreadCount = mockActivities.filter(a => !a.isRead).length;
  
  const { t } = useAutoTranslate([
    "Activity",
    "new",
    "Mark all read",
    "All",
    "Likes",
    "Reviews",
    "Tokens",
    "No Activity Yet",
    "When people interact with your content, you'll see it here",
    "liked your post",
    "started following you",
    "left a 5-star review on your film",
    "You earned 50 tokens from reviews",
    "commented: \"This is amazing work!\"",
    "mentioned you in a comment",
    "Follow Back"
  ]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h1 className="text-xl font-bold">{t("Activity")}</h1>
            {unreadCount > 0 && (
              <Badge variant="glow" className="text-xs">
                {unreadCount} {t("new")}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Check className="w-4 h-4 mr-1" />
              {t("Mark all read")}
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
            >
              {t("All")}
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
            >
              <Heart className="w-4 h-4 mr-1" />
              {t("Likes")}
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
            >
              <Star className="w-4 h-4 mr-1" />
              {t("Reviews")}
            </TabsTrigger>
            <TabsTrigger 
              value="tokens" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
            >
              <Coins className="w-4 h-4 mr-1" />
              {t("Tokens")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="divide-y divide-border">
              {mockActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} t={t} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            <div className="divide-y divide-border">
              {mockActivities
                .filter(a => a.type === "like")
                .map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} t={t} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <div className="divide-y divide-border">
              {mockActivities
                .filter(a => a.type === "review")
                .map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} t={t} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="mt-0">
            <div className="divide-y divide-border">
              {mockActivities
                .filter(a => a.type === "token")
                .map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} t={t} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {mockActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("No Activity Yet")}</h3>
            <p className="text-muted-foreground">
              {t("When people interact with your content, you'll see it here")}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
