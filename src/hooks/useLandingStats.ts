import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Token distribution data (fixed values from tokenomics)
const TOKEN_DISTRIBUTION = {
  totalSupply: 1_000_000_000,
  allocations: [
    { name: "Creator Rewards", percentage: 40, amount: 400_000_000, vesting: "Linear release over 5 years" },
    { name: "Consumer Rewards", percentage: 25, amount: 250_000_000, vesting: "Linear release over 5 years" },
    { name: "Ecosystem Development", percentage: 15, amount: 150_000_000, vesting: "1-year cliff, then linear over 4 years" },
    { name: "Team & Advisors", percentage: 10, amount: 100_000_000, vesting: "1-year cliff, then linear over 4 years" },
    { name: "Reserve", percentage: 5, amount: 50_000_000, vesting: "Released as needed by DAO vote" },
    { name: "Public Offering", percentage: 5, amount: 50_000_000, vesting: "25% at TGE, 75% linear over 2 years" },
  ],
};

// Simulate treasury value based on token price (for demo)
const SIMULATED_TOKEN_PRICE = 0.0025; // $0.0025 per token
const TREASURY_TOKENS = TOKEN_DISTRIBUTION.allocations.find(a => a.name === "Reserve")?.amount || 50_000_000;
const ECOSYSTEM_TOKENS = TOKEN_DISTRIBUTION.allocations.find(a => a.name === "Ecosystem Development")?.amount || 150_000_000;

export function useLandingStats() {
  return useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      // Fetch active members (profiles count)
      const { count: membersCount, error: membersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (membersError) {
        console.error("Error fetching members count:", membersError);
      }

      // Fetch passed proposals
      const { count: proposalsCount, error: proposalsError } = await supabase
        .from("governance_proposals")
        .select("*", { count: "exact", head: true })
        .eq("status", "passed");

      if (proposalsError) {
        console.error("Error fetching proposals count:", proposalsError);
      }

      // Fetch all proposals for total count
      const { count: totalProposalsCount, error: totalProposalsError } = await supabase
        .from("governance_proposals")
        .select("*", { count: "exact", head: true });

      if (totalProposalsError) {
        console.error("Error fetching total proposals count:", totalProposalsError);
      }

      // Fetch projects created (posts count)
      const { count: projectsCount, error: projectsError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      if (projectsError) {
        console.error("Error fetching projects count:", projectsError);
      }

      // Calculate treasury value (Reserve + portion of Ecosystem tokens * price)
      const treasuryValue = (TREASURY_TOKENS + ECOSYSTEM_TOKENS * 0.3) * SIMULATED_TOKEN_PRICE;

      return {
        activeMembers: membersCount || 0,
        proposalsPassed: proposalsCount || 0,
        totalProposals: totalProposalsCount || 0,
        treasuryValue,
        projectsCreated: projectsCount || 0,
        tokenDistribution: TOKEN_DISTRIBUTION,
      };
    },
    staleTime: 30000, // Refresh every 30 seconds
    refetchInterval: 60000, // Auto-refresh every minute
  });
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatCurrency(num: number): string {
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`;
  }
  return `$${num.toFixed(0)}`;
}
