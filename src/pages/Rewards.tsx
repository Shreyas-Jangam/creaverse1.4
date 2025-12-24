import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Medal, 
  Crown,
  Flame,
  Target,
  Star,
  Zap,
  Gift,
  BadgeCheck,
  TrendingUp,
  Users,
  FileText,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockUsers, currentUser } from "@/data/mockData";
import { useAutoTranslate } from "@/hooks/useTranslation";

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  icon: typeof Star;
  color: string;
}

const challenges: Challenge[] = [
  {
    id: "1",
    title: "First Review",
    description: "Write your first content review",
    reward: 50,
    progress: 1,
    total: 1,
    icon: Star,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "2",
    title: "Content Creator",
    description: "Publish 5 posts",
    reward: 100,
    progress: 3,
    total: 5,
    icon: FileText,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "3",
    title: "Community Builder",
    description: "Get 100 followers",
    reward: 200,
    progress: 67,
    total: 100,
    icon: Users,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "4",
    title: "Token Master",
    description: "Earn 1,000 tokens",
    reward: 500,
    progress: 560,
    total: 1000,
    icon: Coins,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "5",
    title: "Viral Content",
    description: "Get 10,000 views on a single post",
    reward: 1000,
    progress: 2340,
    total: 10000,
    icon: TrendingUp,
    color: "from-red-500 to-pink-500"
  }
];

const leaderboardUsers = [...mockUsers].sort((a, b) => b.tokensEarned - a.tokensEarned);

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-muted-foreground font-medium">#{rank}</span>;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default function Rewards() {
  const userRank = leaderboardUsers.findIndex(u => u.id === currentUser.id) + 1 || leaderboardUsers.length + 1;
  const completedChallenges = challenges.filter(c => c.progress >= c.total).length;

  const { t } = useAutoTranslate([
    "Rewards & Leaderboard",
    "Earn While You Create",
    "Complete challenges, climb the leaderboard, and earn tokens",
    "Your Rank",
    "Tokens Earned",
    "Challenges",
    "Day Streak",
    "Leaderboard",
    "tokens",
    "Claim",
    "You",
    "First Review",
    "Write your first content review",
    "Content Creator",
    "Publish 5 posts",
    "Community Builder",
    "Get 100 followers",
    "Token Master",
    "Earn 1,000 tokens",
    "Viral Content",
    "Get 10,000 views on a single post"
  ]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{t("Rewards & Leaderboard")}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("Earn While You Create")}</h1>
          <p className="text-muted-foreground">
            {t("Complete challenges, climb the leaderboard, and earn tokens")}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">#{userRank}</p>
              <p className="text-xs text-muted-foreground">{t("Your Rank")}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatNumber(currentUser.tokensEarned)}</p>
              <p className="text-xs text-muted-foreground">{t("Tokens Earned")}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold">{completedChallenges}/{challenges.length}</p>
              <p className="text-xs text-muted-foreground">{t("Challenges")}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-muted-foreground">{t("Day Streak")}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="challenges" className="flex-1">
              <Target className="w-4 h-4 mr-2" />
              {t("Challenges")}
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1">
              <Trophy className="w-4 h-4 mr-2" />
              {t("Leaderboard")}
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const isCompleted = challenge.progress >= challenge.total;
                const progressPercent = Math.min((challenge.progress / challenge.total) * 100, 100);
                const Icon = challenge.icon;

                return (
                  <Card 
                    key={challenge.id}
                    variant={isCompleted ? "gradient" : "default"}
                    className={cn(isCompleted && "border-success/50")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                          challenge.color
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{t(challenge.title)}</h3>
                            <Badge variant={isCompleted ? "success" : "secondary"}>
                              <Coins className="w-3 h-3 mr-1" />
                              {challenge.reward} {t("tokens")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {t(challenge.description)}
                          </p>
                          <div className="flex items-center gap-3">
                            <Progress value={progressPercent} className="flex-1 h-2" />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {challenge.progress}/{challenge.total}
                            </span>
                          </div>
                        </div>

                        {isCompleted && (
                          <Button variant="glow" size="sm">
                            <Gift className="w-4 h-4 mr-1" />
                            {t("Claim")}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 mb-8 px-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <Avatar className="w-16 h-16 border-4 border-gray-400">
                  <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xl">
                    {leaderboardUsers[1]?.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-400/20 rounded-t-lg px-6 py-4 mt-2 text-center min-w-[100px]">
                  <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="font-bold text-sm">{leaderboardUsers[1]?.displayName}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(leaderboardUsers[1]?.tokensEarned || 0)}</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center -mt-8">
                <Avatar className="w-20 h-20 border-4 border-yellow-500">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-2xl">
                    {leaderboardUsers[0]?.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-yellow-500/20 rounded-t-lg px-8 py-6 mt-2 text-center min-w-[120px]">
                  <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                  <p className="font-bold">{leaderboardUsers[0]?.displayName}</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(leaderboardUsers[0]?.tokensEarned || 0)}</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <Avatar className="w-14 h-14 border-4 border-amber-600">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white text-lg">
                    {leaderboardUsers[2]?.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-amber-600/20 rounded-t-lg px-5 py-3 mt-2 text-center min-w-[90px]">
                  <Medal className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="font-bold text-sm">{leaderboardUsers[2]?.displayName}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(leaderboardUsers[2]?.tokensEarned || 0)}</p>
                </div>
              </div>
            </div>

            {/* Full Leaderboard */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {leaderboardUsers.map((user, index) => (
                    <div 
                      key={user.id}
                      className={cn(
                        "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                        user.id === currentUser.id && "bg-primary/5"
                      )}
                    >
                      <div className="w-8 text-center">
                        {getRankIcon(index + 1)}
                      </div>

                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{user.displayName}</span>
                          {user.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                          )}
                          {user.id === currentUser.id && (
                            <Badge variant="secondary" className="text-[10px] ml-2">{t("You")}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">{formatNumber(user.tokensEarned)}</p>
                        <p className="text-xs text-muted-foreground">{t("tokens")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
