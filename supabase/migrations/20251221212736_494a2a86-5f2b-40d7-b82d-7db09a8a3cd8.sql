-- Create a SECURITY DEFINER function to cast votes securely
-- This ensures voting_power is calculated server-side from the user's token balance
CREATE OR REPLACE FUNCTION public.cast_governance_vote(
  p_proposal_id UUID,
  p_vote_type vote_type,
  p_reason TEXT DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_voting_power NUMERIC;
  v_proposal_status proposal_status;
  v_voting_end_date TIMESTAMP WITH TIME ZONE;
  v_voting_start_date TIMESTAMP WITH TIME ZONE;
  v_vote_id UUID;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to vote';
  END IF;
  
  -- Check proposal exists and is in active voting period
  SELECT status, voting_start_date, voting_end_date 
  INTO v_proposal_status, v_voting_start_date, v_voting_end_date
  FROM governance_proposals 
  WHERE id = p_proposal_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;
  
  IF v_proposal_status != 'active' THEN
    RAISE EXCEPTION 'Proposal is not active for voting';
  END IF;
  
  IF NOW() < v_voting_start_date THEN
    RAISE EXCEPTION 'Voting has not started yet';
  END IF;
  
  IF NOW() > v_voting_end_date THEN
    RAISE EXCEPTION 'Voting has ended';
  END IF;
  
  -- Calculate voting power from user's token balance
  SELECT COALESCE(tokens_balance, 0) INTO v_voting_power
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_voting_power <= 0 THEN
    RAISE EXCEPTION 'You need tokens to vote';
  END IF;
  
  -- Check if user has already voted
  IF EXISTS (SELECT 1 FROM governance_votes WHERE proposal_id = p_proposal_id AND user_id = v_user_id) THEN
    -- Update existing vote
    UPDATE governance_votes 
    SET vote_type = p_vote_type, 
        voting_power = v_voting_power, 
        reason = p_reason,
        created_at = NOW()
    WHERE proposal_id = p_proposal_id AND user_id = v_user_id
    RETURNING id INTO v_vote_id;
  ELSE
    -- Insert new vote
    INSERT INTO governance_votes (proposal_id, user_id, vote_type, voting_power, reason)
    VALUES (p_proposal_id, v_user_id, p_vote_type, v_voting_power, p_reason)
    RETURNING id INTO v_vote_id;
  END IF;
  
  RETURN v_vote_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.cast_governance_vote(UUID, vote_type, TEXT) TO authenticated;