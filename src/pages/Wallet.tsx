import { forwardRef } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet as WalletIcon, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp,
  Gift,
  Star,
  Users,
  ExternalLink,
  Copy,
  Check,
  RefreshCcw
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mockData";
import { toast } from "sonner";
import { useAutoTranslate } from "@/hooks/useTranslation";

interface Transaction {
  id: string;
  type: "earned" | "spent" | "received" | "sent";
  amount: number;
  reason: string;
  timestamp: Date;
  icon: typeof Star;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "earned",
    amount: 50,
    reason: "Review reward - Film critique",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: Star
  },
  {
    id: "2",
    type: "received",
    amount: 25,
    reason: "Tip from @alex_filmmaker",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: Gift
  },
  {
    id: "3",
    type: "earned",
    amount: 100,
    reason: "Content milestone - 1K views",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    icon: TrendingUp
  },
  {
    id: "4",
    type: "spent",
    amount: 20,
    reason: "Unlocked premium chapter",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    icon: Coins
  },
  {
    id: "5",
    type: "earned",
    amount: 75,
    reason: "Referral bonus",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    icon: Users
  },
  {
    id: "6",
    type: "sent",
    amount: 30,
    reason: "Tip to @neon_artist",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    icon: Gift
  }
];

const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default function Wallet() {
  const [copied, setCopied] = useState(false);
  const walletAddress = "0x1234...5678";

  const { t } = useAutoTranslate([
    "Wallet",
    "Manage your tokens and earnings",
    "Refresh",
    "Total Balance",
    "this month",
    "Send",
    "Receive",
    "Wallet Address",
    "View on Explorer",
    "Total Earned",
    "Total Spent",
    "Lifetime Earned",
    "Reputation Score",
    "Transaction History",
    "All",
    "Earned",
    "Spent",
    "Wallet address copied!",
    "Review reward - Film critique",
    "Tip from @alex_filmmaker",
    "Content milestone - 1K views",
    "Unlocked premium chapter",
    "Referral bonus",
    "Tip to @neon_artist"
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText("0x1234567890abcdef1234567890abcdef12345678");
    setCopied(true);
    toast.success(t("Wallet address copied!"));
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarned = mockTransactions
    .filter(t => t.type === "earned" || t.type === "received")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = mockTransactions
    .filter(t => t.type === "spent" || t.type === "sent")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("Wallet")}</h1>
            <p className="text-muted-foreground">{t("Manage your tokens and earnings")}</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" />
            {t("Refresh")}
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card variant="gradient" className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("Total Balance")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{formatNumber(currentUser.tokensBalance)}</span>
                    <span className="text-lg text-muted-foreground">CVT</span>
                  </div>
                  <p className="text-sm text-success mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{formatNumber(totalEarned)} {t("this month")}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="w-7 h-7 text-primary" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="glow" className="flex-1">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {t("Send")}
                </Button>
                <Button variant="outline" className="flex-1">
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  {t("Receive")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">{t("Wallet Address")}</p>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 mb-4">
                <WalletIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">{walletAddress}</span>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={handleCopy}
                  className="ml-auto"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("View on Explorer")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">+{formatNumber(totalEarned)}</p>
              <p className="text-xs text-muted-foreground">{t("Total Earned")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">-{formatNumber(totalSpent)}</p>
              <p className="text-xs text-muted-foreground">{t("Total Spent")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatNumber(currentUser.tokensEarned)}</p>
              <p className="text-xs text-muted-foreground">{t("Lifetime Earned")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{currentUser.reputation}</p>
              <p className="text-xs text-muted-foreground">{t("Reputation Score")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("Transaction History")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all">
              <div className="px-6">
                <TabsList className="w-full justify-start bg-transparent p-0 border-b border-border rounded-none">
                  <TabsTrigger 
                    value="all"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    {t("All")}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="earned"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    {t("Earned")}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="spent"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    {t("Spent")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="divide-y divide-border">
                  {mockTransactions.map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} t={t} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="earned" className="mt-0">
                <div className="divide-y divide-border">
                  {mockTransactions
                    .filter(tx => tx.type === "earned" || tx.type === "received")
                    .map((tx) => (
                      <TransactionItem key={tx.id} transaction={tx} t={t} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="spent" className="mt-0">
                <div className="divide-y divide-border">
                  {mockTransactions
                    .filter(tx => tx.type === "spent" || tx.type === "sent")
                    .map((tx) => (
                      <TransactionItem key={tx.id} transaction={tx} t={t} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  t: (text: string) => string;
}

const TransactionItem = forwardRef<HTMLDivElement, TransactionItemProps>(
  ({ transaction, t }, ref) => {
    const isPositive = transaction.type === "earned" || transaction.type === "received";
    const Icon = transaction.icon;

    return (
      <div ref={ref} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isPositive ? "bg-success/10" : "bg-destructive/10"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            isPositive ? "text-success" : "text-destructive"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{t(transaction.reason)}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(transaction.timestamp)}</p>
        </div>

        <div className={cn(
          "text-right font-semibold",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? "+" : "-"}{transaction.amount} CVT
        </div>
      </div>
    );
  }
);

TransactionItem.displayName = "TransactionItem";
