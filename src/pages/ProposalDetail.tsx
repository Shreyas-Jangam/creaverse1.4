import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  useProposal, 
  useProposalVotes, 
  useUserVote,
  getTimeRemaining,
  getStatusColor,
  isVotingActive
} from "@/hooks/useGovernance";
import { useSecureCastVote } from "@/hooks/useSecureVote";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Vote,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  Users,
  BadgeCheck,
  MessageCircle,
  Share2
} from "lucide-react";

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: proposal, isLoading: proposalLoading } = useProposal(id);
  const { data: votes } = useProposalVotes(id);
  const castVote = useSecureCastVote();
  
  const [voteReason, setVoteReason] = useState("");
  const [selectedVote, setSelectedVote] = useState<"for" | "against" | "abstain" | null>(null);

  const handleVote = async (voteType: "for" | "against" | "abstain") => {
    if (!id) return;
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }
    
    try {
      // Use secure voting function - voting power calculated server-side from token balance
      await castVote.mutateAsync({
        proposal_id: id,
        vote_type: voteType,
        reason: voteReason.trim() || undefined,
      });
      
      toast.success("Vote cast successfully!", {
        description: `You voted ${voteType === "for" ? "For" : voteType === "against" ? "Against" : "Abstain"}`
      });
      setSelectedVote(null);
      setVoteReason("");
    } catch (error: any) {
      toast.error("Failed to cast vote", {
        description: error.message || "Please try again"
      });
    }
  };

  if (proposalLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto py-6 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!proposal) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto py-6 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Proposal Not Found</h1>
          <Link to="/governance">
            <Button variant="outline">Back to Governance</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const totalVotes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;
  const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votes_against / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.votes_abstain / totalVotes) * 100 : 0;
  const votingIsActive = isVotingActive(proposal);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/governance">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Badge className={getStatusColor(proposal.status)}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </Badge>
        </div>

        {/* Title & Meta */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-3">{proposal.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                  {proposal.creator?.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span>{proposal.creator?.display_name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTimeRemaining(proposal.voting_end_date)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {votes?.length || 0} votes
            </div>
          </div>
        </div>

        {/* Voting Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-primary" />
              Voting Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* For */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-success flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  For
                </span>
                <span className="text-sm">{proposal.votes_for} votes ({forPercentage.toFixed(1)}%)</span>
              </div>
              <Progress value={forPercentage} className="h-3 bg-muted" />
            </div>
            
            {/* Against */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-destructive flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4" />
                  Against
                </span>
                <span className="text-sm">{proposal.votes_against} votes ({againstPercentage.toFixed(1)}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-destructive transition-all"
                  style={{ width: `${againstPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Abstain */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Minus className="w-4 h-4" />
                  Abstain
                </span>
                <span className="text-sm">{proposal.votes_abstain} votes ({abstainPercentage.toFixed(1)}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-muted-foreground/50 transition-all"
                  style={{ width: `${abstainPercentage}%` }}
                />
              </div>
            </div>

            {/* Quorum Status */}
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quorum Progress</span>
                <span className={cn(
                  totalVotes >= proposal.quorum_threshold ? "text-success" : "text-muted-foreground"
                )}>
                  {totalVotes} / {proposal.quorum_threshold} votes needed
                </span>
              </div>
              <Progress 
                value={Math.min((totalVotes / proposal.quorum_threshold) * 100, 100)} 
                className="h-2 mt-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Cast Vote */}
        {votingIsActive && (
          <Card className="mb-6 border-primary/50">
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={selectedVote === "for" ? "default" : "outline"}
                  onClick={() => setSelectedVote("for")}
                  className={cn(
                    "flex-col h-auto py-4",
                    selectedVote === "for" && "bg-success hover:bg-success/90"
                  )}
                >
                  <ThumbsUp className="w-6 h-6 mb-1" />
                  For
                </Button>
                <Button
                  variant={selectedVote === "against" ? "default" : "outline"}
                  onClick={() => setSelectedVote("against")}
                  className={cn(
                    "flex-col h-auto py-4",
                    selectedVote === "against" && "bg-destructive hover:bg-destructive/90"
                  )}
                >
                  <ThumbsDown className="w-6 h-6 mb-1" />
                  Against
                </Button>
                <Button
                  variant={selectedVote === "abstain" ? "default" : "outline"}
                  onClick={() => setSelectedVote("abstain")}
                  className="flex-col h-auto py-4"
                >
                  <Minus className="w-6 h-6 mb-1" />
                  Abstain
                </Button>
              </div>

              {selectedVote && (
                <>
                  <Textarea
                    value={voteReason}
                    onChange={(e) => setVoteReason(e.target.value)}
                    placeholder="Add a reason for your vote (optional)"
                    className="min-h-[80px]"
                  />
                  <Button 
                    variant="glow" 
                    className="w-full"
                    onClick={() => handleVote(selectedVote)}
                    disabled={castVote.isPending}
                  >
                    {castVote.isPending ? "Submitting..." : `Vote ${selectedVote.charAt(0).toUpperCase() + selectedVote.slice(1)}`}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 whitespace-pre-wrap">{proposal.description}</p>
          </CardContent>
        </Card>

        {/* Recent Votes */}
        {votes && votes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Recent Votes ({votes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {votes.slice(0, 10).map((vote) => (
                <div key={vote.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                        {vote.voter?.display_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{vote.voter?.display_name || "Unknown"}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            vote.vote_type === "for" && "text-success border-success/50",
                            vote.vote_type === "against" && "text-destructive border-destructive/50",
                            vote.vote_type === "abstain" && "text-muted-foreground"
                          )}
                        >
                          {vote.vote_type === "for" ? "For" : vote.vote_type === "against" ? "Against" : "Abstain"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{vote.voting_power} VP</span>
                      </div>
                      {vote.reason && (
                        <p className="text-sm text-muted-foreground">{vote.reason}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Share */}
        <div className="flex justify-center mt-6">
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Proposal
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
