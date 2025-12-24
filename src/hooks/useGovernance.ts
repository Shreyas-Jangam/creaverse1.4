import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export type ProposalStatus = "pending" | "active" | "passed" | "rejected" | "cancelled";
export type VoteType = "for" | "against" | "abstain";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  status: ProposalStatus;
  voting_start_date: string;
  voting_end_date: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_voting_power: number;
  quorum_threshold: number;
  pass_threshold_percentage: number;
  proposal_threshold: number;
  on_chain_proposal_id: string | null;
  tx_hash: string | null;
  attachments: any[];
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface Vote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: VoteType;
  voting_power: number;
  reason: string | null;
  tx_hash: string | null;
  created_at: string;
  voter?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// Fetch all proposals with optional status filter
export function useProposals(status?: ProposalStatus | "all") {
  return useQuery({
    queryKey: ["proposals", status],
    queryFn: async () => {
      let query = supabase
        .from("governance_proposals")
        .select("*")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch creator profiles separately
      const creatorIds = [...new Set(data?.map(p => p.creator_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", creatorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (data || []).map(p => ({
        ...p,
        creator: profileMap.get(p.creator_id),
      })) as Proposal[];
    },
  });
}

// Fetch single proposal with creator
export function useProposal(proposalId?: string) {
  return useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: async () => {
      if (!proposalId) return null;

      const { data, error } = await supabase
        .from("governance_proposals")
        .select("*")
        .eq("id", proposalId)
        .single();

      if (error) throw error;

      // Fetch creator profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("id", data.creator_id)
        .single();

      return { ...data, creator: profile } as Proposal;
    },
    enabled: !!proposalId,
  });
}

// Fetch votes for a proposal
export function useProposalVotes(proposalId?: string) {
  return useQuery({
    queryKey: ["proposal-votes", proposalId],
    queryFn: async () => {
      if (!proposalId) return [];

      const { data, error } = await supabase
        .from("governance_votes")
        .select("*")
        .eq("proposal_id", proposalId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch voter profiles
      const voterIds = [...new Set(data?.map(v => v.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", voterIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (data || []).map(v => ({
        ...v,
        voter: profileMap.get(v.user_id),
      })) as Vote[];
    },
    enabled: !!proposalId,
  });
}

// Check if user has voted on a proposal
export function useUserVote(proposalId?: string, userId?: string) {
  return useQuery({
    queryKey: ["user-vote", proposalId, userId],
    queryFn: async () => {
      if (!proposalId || !userId) return null;

      const { data, error } = await supabase
        .from("governance_votes")
        .select("*")
        .eq("proposal_id", proposalId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as Vote | null;
    },
    enabled: !!proposalId && !!userId,
  });
}

// Create proposal mutation
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: {
      title: string;
      description: string;
      creator_id: string;
      voting_start_date: string;
      voting_end_date: string;
      quorum_threshold?: number;
      pass_threshold_percentage?: number;
      proposal_threshold?: number;
    }) => {
      const { data, error } = await supabase
        .from("governance_proposals")
        .insert([{
          ...proposal,
          status: "active" as ProposalStatus,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

// Cast vote mutation
export function useCastVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vote: {
      proposal_id: string;
      user_id: string;
      vote_type: VoteType;
      voting_power: number;
      reason?: string;
      tx_hash?: string;
    }) => {
      const { data, error } = await supabase
        .from("governance_votes")
        .insert([vote])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", variables.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ["proposal-votes", variables.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ["user-vote", variables.proposal_id] });
    },
  });
}

// Real-time subscription hook for proposals
export function useProposalsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("governance-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "governance_proposals" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["proposals"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "governance_votes" },
        (payload) => {
          const proposalId = (payload.new as any)?.proposal_id || (payload.old as any)?.proposal_id;
          if (proposalId) {
            queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
            queryClient.invalidateQueries({ queryKey: ["proposal-votes", proposalId] });
          }
          queryClient.invalidateQueries({ queryKey: ["proposals"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// Helper to calculate time remaining
export function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// Helper to get proposal status color
export function getStatusColor(status: ProposalStatus): string {
  const colors: Record<ProposalStatus, string> = {
    pending: "bg-warning/20 text-warning border-warning/30",
    active: "bg-primary/20 text-primary border-primary/30",
    passed: "bg-success/20 text-success border-success/30",
    rejected: "bg-destructive/20 text-destructive border-destructive/30",
    cancelled: "bg-muted text-muted-foreground border-muted",
  };
  return colors[status];
}

// Helper to check if voting is active
export function isVotingActive(proposal: Proposal): boolean {
  const now = new Date();
  const start = new Date(proposal.voting_start_date);
  const end = new Date(proposal.voting_end_date);
  return proposal.status === "active" && now >= start && now <= end;
}
