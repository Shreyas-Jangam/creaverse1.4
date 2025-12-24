import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function WalletConnectButton({ className }: { className?: string }) {
  const { isConnected, isConnecting, address, connect, disconnect, cdtBalance, getChainInfo } = useWeb3();

  const chainInfo = getChainInfo();
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn("gap-2", className)}>
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="hidden sm:inline">{shortAddress}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover border border-border">
          <div className="p-2">
            <p className="text-xs text-muted-foreground">Connected to</p>
            <p className="font-medium">{chainInfo?.name || "Unknown Network"}</p>
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <p className="text-xs text-muted-foreground">CDT Balance</p>
            <p className="font-bold text-primary">{parseFloat(cdtBalance).toFixed(2)} CDT</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-destructive cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={connect} 
      disabled={isConnecting}
      className={cn("gap-2", className)}
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
