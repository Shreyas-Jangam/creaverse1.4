// Mock Comment Service for development
// This provides a working comment system while the full implementation is being built

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  profilePic: string;
  text: string;
  timestamp: Date;
  replies: Reply[];
  likesCount?: number;
}

export interface Reply {
  id: string;
  userId: string;
  parentCommentId: string;
  username: string;
  profilePic: string;
  text: string;
  timestamp: Date;
}

export interface CommentWithAuthor {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  author: {
    display_name: string;
    username: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

class MockCommentStorage {
  private storageKey = 'creaverse_comments';
  
  private getComments(): Record<string, CommentWithAuthor[]> {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }
  
  private saveComments(comments: Record<string, CommentWithAuthor[]>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(comments));
  }
  
  getPostComments(postId: string): CommentWithAuthor[] {
    const comments = this.getComments();
    return comments[postId] || [];
  }
  
  addComment(postId: string, content: string, user: any, parentId?: string): CommentWithAuthor {
    const comments = this.getComments();
    if (!comments[postId]) {
      comments[postId] = [];
    }
    
    const newComment: CommentWithAuthor = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
      parent_id: parentId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        display_name: user.displayName || user.username,
        username: user.username,
        avatar_url: user.avatarUrl,
        is_verified: user.isVerified || false
      }
    };
    
    comments[postId].push(newComment);
    this.saveComments(comments);
    
    return newComment;
  }
  
  deleteComment(commentId: string, postId: string): void {
    const comments = this.getComments();
    if (comments[postId]) {
      comments[postId] = comments[postId].filter(c => c.id !== commentId);
      this.saveComments(comments);
    }
  }
  
  updateComment(commentId: string, postId: string, content: string): CommentWithAuthor | null {
    const comments = this.getComments();
    if (comments[postId]) {
      const comment = comments[postId].find(c => c.id === commentId);
      if (comment) {
        comment.content = content.trim();
        comment.updated_at = new Date().toISOString();
        this.saveComments(comments);
        return comment;
      }
    }
    return null;
  }
  
  getCommentCount(postId: string): number {
    const comments = this.getComments();
    return comments[postId]?.length || 0;
  }
}

export const mockCommentStorage = new MockCommentStorage();