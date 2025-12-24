import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Search,
  Send,
  MoreHorizontal,
  ArrowLeft,
  BadgeCheck,
  Plus,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useAutoTranslate } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
  useSearchUsers,
  useGetOrCreateConversation,
  useUpdatePresence,
  type ConversationWithDetails,
} from "@/hooks/useMessages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatQuery, setNewChatQuery] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversation?.id || null);
  const { data: searchResults = [] } = useSearchUsers(newChatQuery);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesRead();
  const getOrCreateConversation = useGetOrCreateConversation();
  const updatePresence = useUpdatePresence();

  const { t } = useAutoTranslate([
    "Messages",
    "Search messages",
    "Type a message...",
    "Online",
    "Offline",
    "Your Messages",
    "Select a conversation to start messaging",
    "No conversations yet",
    "Start a new conversation",
    "New Message",
    "Search users...",
    "No users found",
  ]);

  // Update presence on mount/unmount
  useEffect(() => {
    if (user) {
      updatePresence.mutate(true);
      
      const handleBeforeUnload = () => {
        updatePresence.mutate(false);
      };
      
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        updatePresence.mutate(false);
      };
    }
  }, [user]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation?.id && selectedConversation.unread_count > 0) {
      markAsRead.mutate(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect to auth if not logged in
  useEffect(() => {
    setShowAuthDialog(!user);
  }, [user]);

  const timeAgo = (date: string | null): string => {
    if (!date) return "";
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversation.id,
        content: messageInput,
      });
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const fetchConversationDetails = useCallback(
    async (conversationId: string): Promise<ConversationWithDetails | null> => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return null;

      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      if (!conv) return null;

      const otherId =
        conv.participant_one === currentUser.id ? conv.participant_two : conv.participant_one;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, is_verified")
        .eq("id", otherId)
        .maybeSingle();

      const { data: lastMessage } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("is_read", false)
        .neq("sender_id", currentUser.id);

      const { data: presence } = await supabase
        .from("user_presence")
        .select("is_online, last_seen")
        .eq("user_id", otherId)
        .maybeSingle();

      return {
        ...conv,
        other_user: profile,
        last_message: lastMessage,
        unread_count: count || 0,
        is_online: presence?.is_online || false,
        last_seen: presence?.last_seen,
      };
    },
    []
  );

  const handleStartConversation = async (userId: string) => {
    try {
      const conversationId = await getOrCreateConversation.mutateAsync(userId);
      setIsNewChatOpen(false);
      setNewChatQuery("");

      // Optimistically load the new/updated conversation details
      const convDetails = await fetchConversationDetails(conversationId);
      if (convDetails) {
        setSelectedConversation(convDetails);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return;
      }

      // Fallback: select from already-loaded list if present
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <AppLayout>
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sign in to message</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              You need an account to view and send messages.
            </p>
            <div className="flex gap-3 mt-4">
              <Button className="flex-1" onClick={() => navigate("/auth?tab=login")}>
                Login
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/auth?tab=signup")}>
                Sign up
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-2" onClick={() => navigate("/")}>
              Go back
            </Button>
          </DialogContent>
        </Dialog>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] flex">
        {/* Conversations List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card",
            selectedConversation && "hidden md:flex"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">{t("Messages")}</h1>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("New Message")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={newChatQuery}
                        onChange={(e) => setNewChatQuery(e.target.value)}
                        placeholder={t("Search users...")}
                        className="pl-10"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {searchResults.length === 0 && newChatQuery.length >= 2 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {t("No users found")}
                        </p>
                      )}
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleStartConversation(user.id)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                              {user.display_name?.charAt(0) || user.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{user.display_name}</span>
                              {user.is_verified && (
                                <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">@{user.username}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Search messages")}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">{t("No conversations yet")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("Start a new conversation")}
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsNewChatOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("New Message")}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                      selectedConversation?.id === conv.id && "bg-muted"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {conv.other_user?.display_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {conv.is_online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">
                            {conv.other_user?.display_name || "Unknown"}
                          </span>
                          {conv.other_user?.is_verified && (
                            <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {timeAgo(conv.last_message?.created_at || conv.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-sm truncate",
                            conv.unread_count > 0
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {conv.last_message?.sender_id === user?.id && "You: "}
                          {conv.last_message?.content || "No messages yet"}
                        </p>
                        {conv.unread_count > 0 && (
                          <Badge
                            variant="default"
                            className="ml-2 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
                          >
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className={cn("flex-1 flex flex-col bg-background")}>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.other_user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {selectedConversation.other_user?.display_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {selectedConversation.other_user?.display_name || "Unknown"}
                    </span>
                    {selectedConversation.other_user?.is_verified && (
                      <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      selectedConversation.is_online ? "text-success" : "text-muted-foreground"
                    )}
                  >
                    {selectedConversation.is_online
                      ? t("Online")
                      : selectedConversation.last_seen
                      ? `Last seen ${timeAgo(selectedConversation.last_seen)}`
                      : t("Offline")}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[10px]",
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {timeAgo(message.created_at)}
                            </span>
                            {isOwn && (
                              <span
                                className={cn(
                                  "text-[10px]",
                                  message.is_read
                                    ? "text-primary-foreground"
                                    : "text-primary-foreground/50"
                                )}
                              >
                                {message.is_read ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={t("Type a message...")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendMessage.isPending}
                  />
                </div>
                <Button
                  variant="glow"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{t("Your Messages")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Select a conversation to start messaging")}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
