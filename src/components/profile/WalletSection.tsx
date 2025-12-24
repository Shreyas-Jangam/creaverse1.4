import { User } from "@/types";
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  ExternalLink,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface WalletSectionProps {
  user: User;
  isOwnProfile: boolean;
}

// Mock NFT data
const mockNFTs = [
  { id: "1", name: "Neon Dreams #1", image: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=200", price: 0.5 },
  { id: "2", name: "Digital Soul", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200", price: 0.8 },
  { id: "3", name: "Cyber Wave", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200", price: 1.2 },
];

export function WalletSection({ user, isOwnProfile }: WalletSectionProps) {
  const [copied, setCopied] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("0x1234...5678");
    setCopied(true);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-card border border-border/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="font-semibold">Web3 Wallet</h3>
          </div>
          {isOwnProfile && (
            <Link to="/wallet">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Manage
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>

        {/* Wallet Address */}
        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted/50">
          <code className="text-xs text-muted-foreground flex-1 truncate">
            0x1234...5678
          </code>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={handleCopyAddress}
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Token Balance */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Balance</span>
            </div>
            <p className="text-xl font-bold text-cyan-400 drop-shadow-sm">
              {formatNumber(user.tokensBalance)}
            </p>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.5% this week
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Total Earned</span>
            </div>
            <p className="text-xl font-bold text-secondary">
              {formatNumber(user.tokensEarned)}
            </p>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </div>
        </div>

        {/* NFT Collection Preview */}
        {mockNFTs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">NFT Collection</p>
              <Badge variant="outline" className="text-xs">
                {mockNFTs.length} items
              </Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {mockNFTs.map((nft) => (
                <div 
                  key={nft.id}
                  className="flex-shrink-0 w-20 group cursor-pointer"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-1 border border-border group-hover:border-primary transition-colors">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] truncate">{nft.name}</p>
                  <p className="text-[10px] text-primary font-medium">{nft.price} ETH</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
