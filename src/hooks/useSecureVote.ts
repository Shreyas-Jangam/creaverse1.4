import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { VoteType } from "./useGovernance";

// Secure vote casting using server-side function
// This ensures voting_power is calculated from user's token balance server-side
export function useSecureCastVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vote: {
      proposal_id: string;
      vote_type: VoteType;
      reason?: string;
    }) => {
      // Call the SECURITY DEFINER function that calculates voting power server-side
      const { data, error } = await supabase.rpc('cast_governance_vote', {
        p_proposal_id: vote.proposal_id,
        p_vote_type: vote.vote_type,
        p_reason: vote.reason || null,
      });

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
