// Creaverse Social Platform Types

export type ContentCategory = "cinema" | "art" | "tech" | "books" | "nature" | "music";

export type UserRole = "creator" | "reviewer" | "collector" | "fan";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  isVerified: boolean;
  followers: number;
  following: number;
  tokensEarned: number;
  tokensBalance: number;
  reputation: number;
  joinedAt: Date;
  categories: ContentCategory[];
  walletAddress?: string;
  email?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  mediaType: "image" | "video" | "audio" | "document";
  mediaUrl: string;
  thumbnailUrl?: string;
  category: ContentCategory;
  tags: string[];
  likes: number;
  comments: number;
  reviews: number;
  shares: number;
  saves: number;
  tokenReward: number;
  isTokenized: boolean;
  royaltySplit?: RoyaltySplit[];
  createdAt: Date;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface RoyaltySplit {
  userId: string;
  user: User;
  percentage: number;
  role: "creator" | "collaborator" | "reviewer";
}

export interface Review {
  id: string;
  postId: string;
  author: User;
  content: string;
  rating: number; // 1-5
  tokensEarned: number;
  likes: number;
  isVerified: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  likes: number;
  replies: Comment[];
  createdAt: Date;
}

export interface CategoryInfo {
  id: ContentCategory;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  coverImage: string;
  postsCount: number;
  creatorsCount: number;
}

export interface TokenActivity {
  id: string;
  userId: string;
  type: "earned" | "spent" | "received" | "sent";
  amount: number;
  reason: string;
  relatedPostId?: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "review" | "follow" | "token" | "mention";
  fromUser: User;
  message: string;
  postId?: string;
  isRead: boolean;
  createdAt: Date;
}
