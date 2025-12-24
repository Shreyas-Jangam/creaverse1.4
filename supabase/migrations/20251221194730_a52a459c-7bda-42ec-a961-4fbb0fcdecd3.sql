-- Create proposal status enum
CREATE TYPE public.proposal_status AS ENUM ('pending', 'active', 'passed', 'rejected', 'cancelled');

-- Create vote type enum
CREATE TYPE public.vote_type AS ENUM ('for', 'against', 'abstain');

-- Create governance proposals table
CREATE TABLE public.governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status proposal_status NOT NULL DEFAULT 'pending',
  voting_start_date timestamp with time zone NOT NULL,
  voting_end_date timestamp with time zone NOT NULL,
  votes_for numeric NOT NULL DEFAULT 0,
  votes_against numeric NOT NULL DEFAULT 0,
  votes_abstain numeric NOT NULL DEFAULT 0,
  total_voting_power numeric NOT NULL DEFAULT 0,
  quorum_threshold numeric NOT NULL DEFAULT 1000,
  pass_threshold_percentage integer NOT NULL DEFAULT 50,
  proposal_threshold numeric NOT NULL DEFAULT 100,
  on_chain_proposal_id text,
  tx_hash text,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create governance votes table
CREATE TABLE public.governance_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type vote_type NOT NULL,
  voting_power numeric NOT NULL,
  reason text,
  tx_hash text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

-- Create vote delegation table
CREATE TABLE public.vote_delegations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegatee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(delegator_id)
);

-- Enable RLS
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_delegations ENABLE ROW LEVEL SECURITY;

-- Proposals are viewable by everyone
CREATE POLICY "Proposals are viewable by everyone"
ON public.governance_proposals FOR SELECT
USING (true);

-- Authenticated users can create proposals
CREATE POLICY "Authenticated users can create proposals"
ON public.governance_proposals FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Creators can update their pending proposals
CREATE POLICY "Creators can update pending proposals"
ON public.governance_proposals FOR UPDATE
USING (auth.uid() = creator_id AND status = 'pending');

-- Votes are viewable by everyone
CREATE POLICY "Votes are viewable by everyone"
ON public.governance_votes FOR SELECT
USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
ON public.governance_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own vote during active period
CREATE POLICY "Users can update their vote"
ON public.governance_votes FOR UPDATE
USING (auth.uid() = user_id);

-- Delegations viewable by involved parties
CREATE POLICY "Users can view their delegations"
ON public.vote_delegations FOR SELECT
USING (auth.uid() = delegator_id OR auth.uid() = delegatee_id);

-- Users can manage their own delegations
CREATE POLICY "Users can delegate their votes"
ON public.vote_delegations FOR INSERT
WITH CHECK (auth.uid() = delegator_id);

CREATE POLICY "Users can remove delegation"
ON public.vote_delegations FOR DELETE
USING (auth.uid() = delegator_id);

-- Create indexes
CREATE INDEX idx_proposals_status ON public.governance_proposals(status);
CREATE INDEX idx_proposals_creator ON public.governance_proposals(creator_id);
CREATE INDEX idx_proposals_dates ON public.governance_proposals(voting_start_date, voting_end_date);
CREATE INDEX idx_votes_proposal ON public.governance_votes(proposal_id);
CREATE INDEX idx_votes_user ON public.governance_votes(user_id);
CREATE INDEX idx_delegations_delegatee ON public.vote_delegations(delegatee_id);

-- Add trigger for updated_at
CREATE TRIGGER update_governance_proposals_updated_at
BEFORE UPDATE ON public.governance_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update proposal vote counts
CREATE OR REPLACE FUNCTION public.update_proposal_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.governance_proposals
    SET 
      votes_for = votes_for + CASE WHEN NEW.vote_type = 'for' THEN NEW.voting_power ELSE 0 END,
      votes_against = votes_against + CASE WHEN NEW.vote_type = 'against' THEN NEW.voting_power ELSE 0 END,
      votes_abstain = votes_abstain + CASE WHEN NEW.vote_type = 'abstain' THEN NEW.voting_power ELSE 0 END,
      total_voting_power = total_voting_power + NEW.voting_power
    WHERE id = NEW.proposal_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old vote
    UPDATE public.governance_proposals
    SET 
      votes_for = votes_for - CASE WHEN OLD.vote_type = 'for' THEN OLD.voting_power ELSE 0 END,
      votes_against = votes_against - CASE WHEN OLD.vote_type = 'against' THEN OLD.voting_power ELSE 0 END,
      votes_abstain = votes_abstain - CASE WHEN OLD.vote_type = 'abstain' THEN OLD.voting_power ELSE 0 END,
      total_voting_power = total_voting_power - OLD.voting_power
    WHERE id = OLD.proposal_id;
    -- Add new vote
    UPDATE public.governance_proposals
    SET 
      votes_for = votes_for + CASE WHEN NEW.vote_type = 'for' THEN NEW.voting_power ELSE 0 END,
      votes_against = votes_against + CASE WHEN NEW.vote_type = 'against' THEN NEW.voting_power ELSE 0 END,
      votes_abstain = votes_abstain + CASE WHEN NEW.vote_type = 'abstain' THEN NEW.voting_power ELSE 0 END,
      total_voting_power = total_voting_power + NEW.voting_power
    WHERE id = NEW.proposal_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for vote count updates
CREATE TRIGGER trigger_update_proposal_votes
AFTER INSERT OR UPDATE ON public.governance_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_proposal_votes();

-- Enable realtime for governance tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.governance_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.governance_votes;