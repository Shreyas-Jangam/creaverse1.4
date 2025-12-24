import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  Award,
  Coins,
  AtSign,
  CheckCheck,
  Settings,
  Filter,
  Trash2
} from "lucide-react";
import { useAutoTranslate } from "@/hooks/useTranslation";
import { TranslatableText } from "@/components/ui/translatable-text";

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    type: "like" as const,
    message: "liked your post",
    fromUser: { name: "Sarah Chen", username: "sarahcreates", avatar: "" },
    postTitle: "My latest digital artwork",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
  },
  {
    id: "2",
    type: "comment" as const,
    message: "commented on your post",
    fromUser: { name: "Marcus Thompson", username: "marcusmusic", avatar: "" },
    postTitle: "Behind the scenes of my new track",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
  },
  {
    id: "3",
    type: "follow" as const,
    message: "started following you",
    fromUser: { name: "Emma Rodriguez", username: "emmadirects", avatar: "" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
  },
  {
    id: "4",
    type: "token" as const,
    message: "You earned 50 CDT tokens",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isRead: true,
  },
  {
    id: "5",
    type: "review" as const,
    message: "left a review on your post",
    fromUser: { name: "Alex Kim", username: "alextech", avatar: "" },
    postTitle: "Web3 development tutorial",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
  },
  {
    id: "6",
    type: "reward" as const,
    message: "You completed a challenge and earned 100 CDT!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isRead: true,
  },
  {
    id: "7",
    type: "mention" as const,
    message: "mentioned you in a comment",
    fromUser: { name: "Jordan Lee", username: "jordanlee", avatar: "" },
    postTitle: "Creative community discussion",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    isRead: true,
  },
];

const notificationIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  follow: { icon: UserPlus, color: "text-green-500", bg: "bg-green-500/10" },
  review: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  token: { icon: Coins, color: "text-primary", bg: "bg-primary/10" },
  reward: { icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
  mention: { icon: AtSign, color: "text-orange-500", bg: "bg-orange-500/10" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type === activeTab;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const { t } = useAutoTranslate([
    "Notifications",
    "Stay updated with your activity",
    "Mark all read",
    "All",
    "Unread",
    "Likes",
    "Comments",
    "Follows",
    "Tokens",
    "No notifications",
    "You're all caught up!",
    "You'll see notifications here when there's activity",
    "Load More Notifications",
    "new",
    "liked your post",
    "commented on your post",
    "started following you",
    "You earned 50 CDT tokens",
    "left a review on your post",
    "You completed a challenge and earned 100 CDT!",
    "mentioned you in a comment"
  ]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              {t("Notifications")}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} {t("new")}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">{t("Stay updated with your activity")}</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                {t("Mark all read")}
              </Button>
            )}
            <Link to="/settings">
              <Button variant="ghost" size="icon-sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full overflow-x-auto justify-start">
            <TabsTrigger value="all">{t("All")}</TabsTrigger>
            <TabsTrigger value="unread">
              {t("Unread")}
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="like">{t("Likes")}</TabsTrigger>
            <TabsTrigger value="comment">{t("Comments")}</TabsTrigger>
            <TabsTrigger value="follow">{t("Follows")}</TabsTrigger>
            <TabsTrigger value="token">{t("Tokens")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("No notifications")}</h3>
                <p className="text-muted-foreground">
                  {activeTab === "unread" 
                    ? t("You're all caught up!") 
                    : t("You'll see notifications here when there's activity")
                  }
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification, index) => {
                  const config = notificationIcons[notification.type];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.isRead ? "bg-primary/5 border-primary/20" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Icon or Avatar */}
                            {notification.fromUser ? (
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={notification.fromUser.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                                    {notification.fromUser.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center`}>
                                  <Icon className={`w-3 h-3 ${config.color}`} />
                                </div>
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${config.color}`} />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                {notification.fromUser && (
                                  <Link 
                                    to={`/profile/${notification.fromUser.username}`}
                                    className="font-semibold hover:text-primary"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {notification.fromUser.name}
                                  </Link>
                                )}{" "}
                                <span className="text-muted-foreground">{t(notification.message)}</span>
                                {notification.postTitle && (
                                  <>
                                    {" "}
                                    <span className="font-medium">"{notification.postTitle}"</span>
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="outline" className="w-full">
              {t("Load More Notifications")}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
