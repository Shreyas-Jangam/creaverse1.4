// Mock like storage system for tracking likes on mock posts
interface MockPostLikes {
  [postId: string]: {
    count: number;
    likedBy: string[];
  };
}

const MOCK_LIKES_KEY = 'creaverse_mock_likes';

export class MockLikeStorage {
  private static getLikesData(): MockPostLikes {
    try {
      const data = localStorage.getItem(MOCK_LIKES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading mock likes from localStorage:', error);
      return {};
    }
  }

  private static saveLikesData(data: MockPostLikes): void {
    try {
      localStorage.setItem(MOCK_LIKES_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving mock likes to localStorage:', error);
    }
  }

  static toggleLike(postId: string, userId: string): { isLiked: boolean; likesCount: number } {
    const likesData = this.getLikesData();
    
    // Initialize post data if it doesn't exist
    if (!likesData[postId]) {
      likesData[postId] = {
        count: 0,
        likedBy: []
      };
    }

    const postLikes = likesData[postId];
    const userIndex = postLikes.likedBy.indexOf(userId);
    const wasLiked = userIndex !== -1;

    if (wasLiked) {
      // Unlike: remove user from likedBy array and decrease count
      postLikes.likedBy.splice(userIndex, 1);
      postLikes.count = Math.max(0, postLikes.count - 1);
    } else {
      // Like: add user to likedBy array and increase count
      postLikes.likedBy.push(userId);
      postLikes.count += 1;
    }

    this.saveLikesData(likesData);

    return {
      isLiked: !wasLiked,
      likesCount: postLikes.count
    };
  }

  static isPostLiked(postId: string, userId: string): boolean {
    const likesData = this.getLikesData();
    return likesData[postId]?.likedBy.includes(userId) || false;
  }

  static getLikesCount(postId: string): number {
    const likesData = this.getLikesData();
    return likesData[postId]?.count || 0;
  }

  static getLikedBy(postId: string): string[] {
    const likesData = this.getLikesData();
    return likesData[postId]?.likedBy || [];
  }

  // Reset all likes (useful for testing)
  static resetAllLikes(): void {
    localStorage.removeItem(MOCK_LIKES_KEY);
  }

  // Get all likes data (useful for debugging)
  static getAllLikesData(): MockPostLikes {
    return this.getLikesData();
  }
}