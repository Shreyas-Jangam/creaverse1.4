import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner, formatEther, parseEther, Contract } from "ethers";
import { CDT_TOKEN_ABI, SUPPORTED_CHAINS, getContracts, type ChainId } from "@/lib/contracts";
import { toast } from "sonner";

// Types
interface Web3State {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: ChainId | null;
  balance: string;
  cdtBalance: string;
  votingPower: string;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

interface Web3ContextType extends Web3State {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: ChainId) => Promise<void>;
  refreshBalances: () => Promise<void>;
  transferCDT: (to: string, amount: string) => Promise<string | null>;
  delegateVotes: (delegatee: string) => Promise<string | null>;
  getChainInfo: () => typeof SUPPORTED_CHAINS[ChainId] | null;
}

const defaultState: Web3State = {
  isConnected: false,
  isConnecting: false,
  address: null,
  chainId: null,
  balance: "0",
  cdtBalance: "0",
  votingPower: "0",
  provider: null,
  signer: null,
};

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [state, setState] = useState<Web3State>(defaultState);

  // Check if MetaMask is available
  const hasMetaMask = typeof window !== "undefined" && window.ethereum;

  // Get chain info
  const getChainInfo = useCallback(() => {
    if (!state.chainId) return null;
    return SUPPORTED_CHAINS[state.chainId] || null;
  }, [state.chainId]);

  // Fetch balances
  const refreshBalances = useCallback(async () => {
    if (!state.provider || !state.address || !state.chainId) return;

    try {
      // Get native balance
      const balance = await state.provider.getBalance(state.address);
      
      // Get CDT balance if contract is deployed
      const contracts = getContracts(state.chainId);
      let cdtBalance = "0";
      let votingPower = "0";

      if (contracts?.cdtToken && contracts.cdtToken !== "0x0000000000000000000000000000000000000000") {
        const tokenContract = new Contract(
          contracts.cdtToken,
          CDT_TOKEN_ABI,
          state.provider
        );
        
        try {
          const rawBalance = await tokenContract.balanceOf(state.address);
          cdtBalance = formatEther(rawBalance);
          
          const rawVotingPower = await tokenContract.getVotes(state.address);
          votingPower = formatEther(rawVotingPower);
        } catch (e) {
          console.log("CDT contract not available on this network");
        }
      }

      setState(prev => ({
        ...prev,
        balance: formatEther(balance),
        cdtBalance,
        votingPower,
      }));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }, [state.provider, state.address, state.chainId]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!hasMetaMask) {
      toast.error("Please install MetaMask to connect your wallet");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId) as ChainId;

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        address: accounts[0],
        chainId,
        provider,
        signer,
      }));

      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Connection error:", error);
      setState(prev => ({ ...prev, isConnecting: false }));
      
      if (error.code === 4001) {
        toast.error("Connection rejected by user");
      } else {
        toast.error("Failed to connect wallet");
      }
    }
  }, [hasMetaMask]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState(defaultState);
    toast.info("Wallet disconnected");
  }, []);

  // Switch chain
  const switchChain = useCallback(async (chainId: ChainId) => {
    if (!hasMetaMask) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        const chainInfo = SUPPORTED_CHAINS[chainId];
        if (chainInfo) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: `0x${chainId.toString(16)}`,
                chainName: chainInfo.name,
                nativeCurrency: {
                  name: chainInfo.currency,
                  symbol: chainInfo.currency,
                  decimals: 18,
                },
                rpcUrls: [chainInfo.rpcUrl],
                blockExplorerUrls: chainInfo.blockExplorer ? [chainInfo.blockExplorer] : undefined,
              }],
            });
          } catch (addError) {
            toast.error("Failed to add network");
          }
        }
      } else {
        toast.error("Failed to switch network");
      }
    }
  }, [hasMetaMask]);

  // Transfer CDT tokens
  const transferCDT = useCallback(async (to: string, amount: string): Promise<string | null> => {
    if (!state.signer || !state.chainId) {
      toast.error("Please connect your wallet first");
      return null;
    }

    const contracts = getContracts(state.chainId);
    if (!contracts?.cdtToken || contracts.cdtToken === "0x0000000000000000000000000000000000000000") {
      toast.error("CDT contract not deployed on this network");
      return null;
    }

    try {
      const tokenContract = new Contract(
        contracts.cdtToken,
        CDT_TOKEN_ABI,
        state.signer
      );

      const tx = await tokenContract.transfer(to, parseEther(amount));
      toast.info("Transaction submitted...");
      
      const receipt = await tx.wait();
      toast.success("Transfer successful!");
      
      await refreshBalances();
      return receipt.hash;
    } catch (error: any) {
      console.error("Transfer error:", error);
      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Transfer failed");
      }
      return null;
    }
  }, [state.signer, state.chainId, refreshBalances]);

  // Delegate voting power
  const delegateVotes = useCallback(async (delegatee: string): Promise<string | null> => {
    if (!state.signer || !state.chainId) {
      toast.error("Please connect your wallet first");
      return null;
    }

    const contracts = getContracts(state.chainId);
    if (!contracts?.cdtToken || contracts.cdtToken === "0x0000000000000000000000000000000000000000") {
      toast.error("CDT contract not deployed on this network");
      return null;
    }

    try {
      const tokenContract = new Contract(
        contracts.cdtToken,
        CDT_TOKEN_ABI,
        state.signer
      );

      const tx = await tokenContract.delegate(delegatee);
      toast.info("Delegation submitted...");
      
      const receipt = await tx.wait();
      toast.success("Delegation successful!");
      
      await refreshBalances();
      return receipt.hash;
    } catch (error: any) {
      console.error("Delegation error:", error);
      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Delegation failed");
      }
      return null;
    }
  }, [state.signer, state.chainId, refreshBalances]);

  // Listen for account changes
  useEffect(() => {
    if (!hasMetaMask) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.address) {
        setState(prev => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16) as ChainId;
      setState(prev => ({ ...prev, chainId }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [hasMetaMask, state.address, disconnect]);

  // Refresh balances when connected or chain changes
  useEffect(() => {
    if (state.isConnected && state.address) {
      refreshBalances();
    }
  }, [state.isConnected, state.address, state.chainId, refreshBalances]);

  const value: Web3ContextType = {
    ...state,
    connect,
    disconnect,
    switchChain,
    refreshBalances,
    transferCDT,
    delegateVotes,
    getChainInfo,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
