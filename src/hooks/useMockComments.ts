// Mock Comment Hooks - Temporary implementation for development
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { mockCommentStorage, CommentWithAuthor } from "@/services/mockCommentService";

export function useMockPostComments(postId?: string | null) {
  return useQuery<CommentWithAuthor[]>({
    queryKey: ["mock-post-comments", postId],
    enabled: !!postId,
    queryFn: async () => {
      if (!postId) return [];
      return mockCommentStorage.getPostComments(postId);
    },
  });
}

export function useMockAddComment(postId?: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string | null }) => {
      if (!postId) throw new Error("Missing post id");
      if (!user) throw new Error("Not authenticated");
      if (!content.trim()) throw new Error("Comment cannot be empty");

      return mockCommentStorage.addComment(postId, content, user, parentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-engagement", postId] });
      toast.success("Comment posted");
    },
    onError: (error: any) => {
      console.error("add comment error", error);
      toast.error(error?.message || "Could not post comment");
    },
  });
}

export function useMockDeleteComment(postId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!postId) throw new Error("Missing post id");
      mockCommentStorage.deleteComment(commentId, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-engagement", postId] });
      toast.success("Comment deleted");
    },
    onError: (error: any) => {
      console.error("delete comment error", error);
      toast.error(error?.message || "Could not delete comment");
    },
  });
}

export function useMockUpdateComment(postId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      if (!postId) throw new Error("Missing post id");
      if (!content.trim()) throw new Error("Comment cannot be empty");
      
      const updated = mockCommentStorage.updateComment(commentId, postId, content);
      if (!updated) throw new Error("Comment not found");
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-post-comments", postId] });
      toast.success("Comment updated");
    },
    onError: (error: any) => {
      console.error("update comment error", error);
      toast.error(error?.message || "Could not update comment");
    },
  });
}