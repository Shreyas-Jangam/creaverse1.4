// Contract ABIs for CDT Token and Governor
// These are minimal ABIs for frontend interaction

export const CDT_TOKEN_ABI = [
  // ERC-20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // ERC-20 Votes (Governance)
  "function delegate(address delegatee)",
  "function delegates(address account) view returns (address)",
  "function getVotes(address account) view returns (uint256)",
  "function getPastVotes(address account, uint256 blockNumber) view returns (uint256)",
  "function getPastTotalSupply(uint256 blockNumber) view returns (uint256)",
  
  // Custom functions
  "function getVotingPower(address account) view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
  "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
  "event TokensMinted(address indexed to, uint256 amount, string reason)",
  "event TokensBurned(address indexed from, uint256 amount, string reason)",
] as const;

export const GOVERNOR_ABI = [
  // Proposal functions
  "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)",
  "function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)",
  "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)",
  "function cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)",
  
  // Voting functions
  "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
  "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  
  // View functions
  "function state(uint256 proposalId) view returns (uint8)",
  "function proposalSnapshot(uint256 proposalId) view returns (uint256)",
  "function proposalDeadline(uint256 proposalId) view returns (uint256)",
  "function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
  "function quorum(uint256 blockNumber) view returns (uint256)",
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function proposalThreshold() view returns (uint256)",
  
  // Events
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)",
  "event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)",
  "event ProposalExecuted(uint256 proposalId)",
  "event ProposalCanceled(uint256 proposalId)",
] as const;

// Contract info type
interface ContractInfo {
  cdtToken: string;
  governor: string;
  timelock: string;
}

// Contract addresses - Polygon Mainnet Deployment Ready
export const CONTRACT_ADDRESSES: Record<number, ContractInfo> = {
  // Polygon Mainnet (Primary Target)
  137: {
    cdtToken: "", // Deploy CDT token and add address here
    governor: "", // Deploy Governor and add address here
    timelock: "", // Deploy Timelock and add address here
  },
  // Polygon Mumbai Testnet (Deprecated - use Amoy)
  80001: {
    cdtToken: "",
    governor: "",
    timelock: "",
  },
  // Polygon Amoy Testnet
  80002: {
    cdtToken: "",
    governor: "",
    timelock: "",
  },
  // For development/demo - uses mock addresses
  31337: {
    cdtToken: "0x0000000000000000000000000000000000000000",
    governor: "0x0000000000000000000000000000000000000000",
    timelock: "0x0000000000000000000000000000000000000000",
  },
};

export type ChainId = 137 | 80001 | 31337;

export function getContracts(chainId: number): ContractInfo | undefined {
  return CONTRACT_ADDRESSES[chainId];
}

// Chain configurations
export const SUPPORTED_CHAINS: Record<ChainId, {
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
}> = {
  137: {
    name: "Polygon",
    currency: "MATIC",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
  },
  80001: {
    name: "Mumbai Testnet",
    currency: "MATIC",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
  },
  // Local development
  31337: {
    name: "Localhost",
    currency: "ETH",
    rpcUrl: "http://localhost:8545",
    blockExplorer: "",
  },
};

// Proposal states
export const PROPOSAL_STATES: Record<number, string> = {
  0: "Pending",
  1: "Active",
  2: "Canceled",
  3: "Defeated",
  4: "Succeeded",
  5: "Queued",
  6: "Expired",
  7: "Executed",
};

// Vote types
export const VOTE_TYPES = {
  Against: 0,
  For: 1,
  Abstain: 2,
} as const;
