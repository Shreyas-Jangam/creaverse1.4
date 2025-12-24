import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Vote, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  Search,
  Wallet,
  TrendingUp,
  Shield,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { 
  useProposals, 
  useProposal,
  useProposalVotes,
  useUserVote,
  useCreateProposal,
  useProposalsRealtime,
  getTimeRemaining,
  getStatusColor,
  isVotingActive,
  type Proposal,
  type ProposalStatus,
  type VoteType
} from "@/hooks/useGovernance";
import { useSecureCastVote } from "@/hooks/useSecureVote";
import { supabase } from "@/integrations/supabase/client";
import creaverseLogo from "@/assets/creaverse-logo.png";
import { useWeb3 } from "@/contexts/Web3Context";
import { WalletConnectButton } from "@/components/web3/WalletConnectButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const VOTE_COLORS = {
  for: "#22c55e",
  against: "#ef4444",
  abstain: "#6b7280",
};

export default function Governance() {
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedVoteType, setSelectedVoteType] = useState<VoteType | null>(null);
  const [voteReason, setVoteReason] = useState("");

  // Form state for creating proposal
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
    votingDays: 7,
  });

  const { data: proposals, isLoading } = useProposals(statusFilter);
  const { data: selectedProposalData } = useProposal(selectedProposal || undefined);
  const { data: proposalVotes } = useProposalVotes(selectedProposal || undefined);
  const { isConnected, address, cdtBalance, votingPower } = useWeb3();
  const { data: userVote } = useUserVote(selectedProposal || undefined, address || undefined);
  
  const createProposal = useCreateProposal();
  const castVote = useSecureCastVote();

  // Enable realtime updates
  useProposalsRealtime();

  // Filter proposals by search
  const filteredProposals = proposals?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate stats
  const activeCount = proposals?.filter(p => p.status === "active").length || 0;
  const passedCount = proposals?.filter(p => p.status === "passed").length || 0;
  const totalVotingPower = proposals?.reduce((acc, p) => acc + Number(p.total_voting_power), 0) || 0;

  const handleCreateProposal = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!proposalForm.title || !proposalForm.description) {
      toast.error("Please fill in all fields");
      return;
    }

    const votingPowerNum = parseFloat(votingPower);
    if (votingPowerNum < 100) {
      toast.error("You need at least 100 CDT voting power to create a proposal");
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + proposalForm.votingDays);

      await createProposal.mutateAsync({
        title: proposalForm.title,
        description: proposalForm.description,
        creator_id: address,
        voting_start_date: startDate.toISOString(),
        voting_end_date: endDate.toISOString(),
      });

      toast.success("Proposal created successfully!");
      setCreateDialogOpen(false);
      setProposalForm({ title: "", description: "", votingDays: 7 });
    } catch (error: any) {
      toast.error(error.message || "Failed to create proposal");
    }
  };

  const handleVote = async () => {
    if (!selectedProposal || !selectedVoteType) {
      toast.error("Please select a vote option");
      return;
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      // Use secure voting function - voting power calculated server-side
      await castVote.mutateAsync({
        proposal_id: selectedProposal,
        vote_type: selectedVoteType,
        reason: voteReason || undefined,
      });

      toast.success("Vote cast successfully!");
      setVoteDialogOpen(false);
      setSelectedVoteType(null);
      setVoteReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to cast vote");
    }
  };

  const getVoteChartData = (proposal: Proposal) => {
    const total = Number(proposal.votes_for) + Number(proposal.votes_against) + Number(proposal.votes_abstain);
    if (total === 0) return [];
    
    return [
      { name: "For", value: Number(proposal.votes_for), color: VOTE_COLORS.for },
      { name: "Against", value: Number(proposal.votes_against), color: VOTE_COLORS.against },
      { name: "Abstain", value: Number(proposal.votes_abstain), color: VOTE_COLORS.abstain },
    ].filter(d => d.value > 0);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={creaverseLogo} 
                alt="CreaverseDAO" 
                className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                DAO Governance
              </h1>
              <p className="text-muted-foreground">
                Participate in CreaverseDAO decisions with your CDT tokens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnectButton />
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={!isConnected}>
                  <Plus className="w-4 h-4" />
                  Create Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Proposal</DialogTitle>
                  <DialogDescription>
                    Create a proposal for the DAO to vote on. You need at least 100 CDT voting power.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={proposalForm.title}
                      onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                      placeholder="Enter proposal title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={proposalForm.description}
                      onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                      placeholder="Describe your proposal in detail..."
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Voting Duration (days)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={proposalForm.votingDays}
                      onChange={(e) => setProposalForm({ ...proposalForm, votingDays: parseInt(e.target.value) || 7 })}
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground">Your Voting Power</p>
                    <p className="text-lg font-bold text-primary">{parseFloat(votingPower).toFixed(2)} CDT</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProposal} disabled={createProposal.isPending}>
                    {createProposal.isPending ? "Creating..." : "Create Proposal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Vote className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-xs text-muted-foreground">Active Proposals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{passedCount}</p>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalVotingPower.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Votes Cast</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{parseFloat(votingPower).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Your Voting Power</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProposalStatus | "all")} className="flex-1">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="passed">Passed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Proposals Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : filteredProposals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No proposals found</h3>
              <p className="text-muted-foreground">
                {statusFilter === "all" ? "Be the first to create a proposal!" : `No ${statusFilter} proposals`}
              </p>
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onClick={() => setSelectedProposal(proposal.id)}
              />
            ))
          )}
        </div>

        {/* Proposal Detail Dialog */}
        <Dialog open={!!selectedProposal} onOpenChange={(open) => !open && setSelectedProposal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedProposalData && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className={cn("mb-2", getStatusColor(selectedProposalData.status))}>
                        {selectedProposalData.status.charAt(0).toUpperCase() + selectedProposalData.status.slice(1)}
                      </Badge>
                      <DialogTitle className="text-xl">{selectedProposalData.title}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={selectedProposalData.creator?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {selectedProposalData.creator?.display_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>by {selectedProposalData.creator?.display_name || "Unknown"}</span>
                        <span className="text-muted-foreground">•</span>
                        <Clock className="w-3 h-3" />
                        <span>{getTimeRemaining(selectedProposalData.voting_end_date)}</span>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProposalData.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Voting Results */}
                  <div>
                    <h4 className="font-medium mb-4">Voting Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <VoteBar
                          label="For"
                          value={Number(selectedProposalData.votes_for)}
                          total={Number(selectedProposalData.total_voting_power)}
                          color="bg-success"
                        />
                        <VoteBar
                          label="Against"
                          value={Number(selectedProposalData.votes_against)}
                          total={Number(selectedProposalData.total_voting_power)}
                          color="bg-destructive"
                        />
                        <VoteBar
                          label="Abstain"
                          value={Number(selectedProposalData.votes_abstain)}
                          total={Number(selectedProposalData.total_voting_power)}
                          color="bg-muted-foreground"
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        {getVoteChartData(selectedProposalData).length > 0 ? (
                          <ResponsiveContainer width="100%" height={120}>
                            <PieChart>
                              <Pie
                                data={getVoteChartData(selectedProposalData)}
                                innerRadius={30}
                                outerRadius={50}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {getVoteChartData(selectedProposalData).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">No votes yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total: {Number(selectedProposalData.total_voting_power).toLocaleString()} CDT
                      </span>
                      <span className="text-muted-foreground">
                        Quorum: {Number(selectedProposalData.quorum_threshold).toLocaleString()} CDT
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Recent Votes */}
                  {proposalVotes && proposalVotes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recent Votes</h4>
                      <ScrollArea className="h-[150px]">
                        <div className="space-y-2">
                          {proposalVotes.slice(0, 10).map((vote) => (
                            <div key={vote.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={vote.voter?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {vote.voter?.display_name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {vote.voter?.display_name || "Anonymous"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn(
                                  vote.vote_type === "for" && "text-success border-success/30",
                                  vote.vote_type === "against" && "text-destructive border-destructive/30",
                                  vote.vote_type === "abstain" && "text-muted-foreground"
                                )}>
                                  {vote.vote_type === "for" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {vote.vote_type === "against" && <XCircle className="w-3 h-3 mr-1" />}
                                  {vote.vote_type === "abstain" && <MinusCircle className="w-3 h-3 mr-1" />}
                                  {vote.vote_type.charAt(0).toUpperCase() + vote.vote_type.slice(1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {vote.voting_power.toLocaleString()} CDT
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* Vote Actions */}
                {isVotingActive(selectedProposalData) && (
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    {userVote ? (
                      <div className="w-full p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground">You voted</p>
                        <p className="font-medium capitalize">{userVote.vote_type}</p>
                      </div>
                    ) : isConnected ? (
                      <div className="flex gap-2 w-full">
                        <Button
                          className="flex-1 bg-success hover:bg-success/90"
                          onClick={() => { setSelectedVoteType("for"); setVoteDialogOpen(true); }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Vote For
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => { setSelectedVoteType("against"); setVoteDialogOpen(true); }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Vote Against
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setSelectedVoteType("abstain"); setVoteDialogOpen(true); }}
                        >
                          <MinusCircle className="w-4 h-4 mr-2" />
                          Abstain
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full text-center">
                        <WalletConnectButton className="w-full" />
                      </div>
                    )}
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Vote Confirmation Dialog */}
        <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Your Vote</DialogTitle>
              <DialogDescription>
                You are voting <span className="font-medium capitalize">{selectedVoteType}</span> with{" "}
                <span className="font-medium">{parseFloat(votingPower).toFixed(2)} CDT</span> voting power.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <Textarea
                  value={voteReason}
                  onChange={(e) => setVoteReason(e.target.value)}
                  placeholder="Share why you're voting this way..."
                  rows={3}
                />
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                <p className="text-sm text-warning">
                  This action cannot be undone. Your vote will be recorded on-chain.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleVote} disabled={castVote.isPending}>
                {castVote.isPending ? "Voting..." : "Confirm Vote"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// Proposal Card Component
function ProposalCard({ proposal, onClick }: { proposal: Proposal; onClick: () => void }) {
  const totalVotes = Number(proposal.votes_for) + Number(proposal.votes_against) + Number(proposal.votes_abstain);
  const forPercentage = totalVotes > 0 ? (Number(proposal.votes_for) / totalVotes) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-colors h-full"
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge className={cn("text-xs", getStatusColor(proposal.status))}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              {getTimeRemaining(proposal.voting_end_date)}
            </span>
          </div>
          <CardTitle className="text-base line-clamp-2">{proposal.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription className="line-clamp-2 text-xs">
            {proposal.description}
          </CardDescription>
          
          {/* Vote Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-success">For: {forPercentage.toFixed(0)}%</span>
              <span className="text-muted-foreground">{totalVotes.toLocaleString()} votes</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="bg-success h-full transition-all" 
                style={{ width: `${(Number(proposal.votes_for) / (totalVotes || 1)) * 100}%` }} 
              />
              <div 
                className="bg-destructive h-full transition-all" 
                style={{ width: `${(Number(proposal.votes_against) / (totalVotes || 1)) * 100}%` }} 
              />
              <div 
                className="bg-muted-foreground h-full transition-all" 
                style={{ width: `${(Number(proposal.votes_abstain) / (totalVotes || 1)) * 100}%` }} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="w-4 h-4">
                <AvatarImage src={proposal.creator?.avatar_url || undefined} />
                <AvatarFallback className="text-[8px]">
                  {proposal.creator?.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span>{proposal.creator?.display_name || "Unknown"}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Vote Bar Component
function VoteBar({ 
  label, 
  value, 
  total, 
  color 
}: { 
  label: string; 
  value: number; 
  total: number; 
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full transition-all", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
