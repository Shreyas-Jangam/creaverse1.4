import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Vote, 
  Users, 
  Trophy, 
  TrendingUp,
  ArrowRight,
  Zap,
  Sparkles,
  ChevronRight,
  Bell,
  Plus,
  Clock,
  CheckCircle2,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAutoTranslate } from "@/hooks/useTranslation";

const quickActions = [
  { label: "Create Proposal", href: "/governance/create", icon: Plus, color: "primary" },
  { label: "AI Assistant", href: "/ai-tools", icon: Brain, color: "secondary" },
  { label: "View Projects", href: "/projects", icon: Target, color: "accent" },
];

const recentProposals = [
  {
    id: "1",
    title: "Community Event Fund Allocation",
    status: "active" as const,
    votesFor: 234,
    votesAgainst: 45,
    endsIn: "2 days",
  },
  {
    id: "2", 
    title: "New AI Tool Integration",
    status: "passed" as const,
    votesFor: 567,
    votesAgainst: 89,
    endsIn: "Ended",
  },
  {
    id: "3",
    title: "Creator Rewards Increase",
    status: "active" as const,
    votesFor: 189,
    votesAgainst: 23,
    endsIn: "5 days",
  },
];

const topContributors = [
  { name: "Alice Chen", points: 2450, avatar: "AC", level: 8 },
  { name: "Bob Smith", points: 2180, avatar: "BS", level: 7 },
  { name: "Carol White", points: 1920, avatar: "CW", level: 7 },
];

const recentActivity = [
  { type: "vote", message: "You voted on 'Community Event Fund'", time: "2h ago" },
  { type: "badge", message: "Earned 'Active Voter' badge", time: "1d ago" },
  { type: "points", message: "+50 points from proposal creation", time: "2d ago" },
];

export default function Dashboard() {
  const { t } = useAutoTranslate([
    "Welcome back, John!",
    "Here's what's happening in Creaverse DAO",
    "New Proposal",
    "Your Points",
    "this week",
    "Level",
    "Votes Cast",
    "pending",
    "Reputation",
    "Top 15%",
    "Create Proposal",
    "AI Assistant",
    "View Projects",
    "Get started",
    "Active Proposals",
    "Vote on community decisions",
    "View All",
    "Active",
    "Passed",
    "Vote",
    "For:",
    "Against:",
    "Top Contributors",
    "View Leaderboard",
    "Recent Activity",
    "Community Event Fund Allocation",
    "New AI Tool Integration",
    "Creator Rewards Increase",
    "You voted on 'Community Event Fund'",
    "Earned 'Active Voter' badge",
    "+50 points from proposal creation"
  ]);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("Welcome back, John!")}</h1>
            <p className="text-muted-foreground mt-1">{t("Here's what's happening in Creaverse DAO")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Link to="/governance/create">
              <Button variant="glow">
                <Plus className="w-4 h-4" />
                {t("New Proposal")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="gradient" className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("Your Points")}</p>
                  <p className="text-2xl font-bold mt-1">1,250</p>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +120 {t("this week")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("Level")}</p>
                  <p className="text-2xl font-bold mt-1">5</p>
                  <div className="mt-2">
                    <Progress value={65} className="h-1.5 w-24" />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("Votes Cast")}</p>
                  <p className="text-2xl font-bold mt-1">47</p>
                  <p className="text-xs text-muted-foreground mt-1">3 {t("pending")}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Vote className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("Reputation")}</p>
                  <p className="text-2xl font-bold mt-1">850</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("Top 15%")}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.href}>
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${action.color}/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{t(action.label)}</h3>
                      <p className="text-sm text-muted-foreground">{t("Get started")}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Proposals */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="w-5 h-5 text-primary" />
                    {t("Active Proposals")}
                  </CardTitle>
                  <CardDescription>{t("Vote on community decisions")}</CardDescription>
                </div>
                <Link to="/governance">
                  <Button variant="ghost" size="sm">
                    {t("View All")}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentProposals.map((proposal) => {
                  const totalVotes = proposal.votesFor + proposal.votesAgainst;
                  const forPercentage = (proposal.votesFor / totalVotes) * 100;
                  
                  return (
                    <Link key={proposal.id} to={`/governance/${proposal.id}`}>
                      <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{t(proposal.title)}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={proposal.status}>
                                {proposal.status === "active" ? t("Active") : t("Passed")}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {proposal.endsIn}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">{t("Vote")}</Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-success">{t("For:")} {proposal.votesFor}</span>
                            <span className="text-destructive">{t("Against:")} {proposal.votesAgainst}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-success to-success/70 transition-all duration-300"
                              style={{ width: `${forPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-warning" />
                  {t("Top Contributors")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                        <span className="text-xs font-semibold text-accent-foreground">{contributor.avatar}</span>
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-warning-foreground text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{t("Level")} {contributor.level}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">{contributor.points.toLocaleString()}</p>
                  </div>
                ))}
                
                <Link to="/rewards">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    {t("View Leaderboard")}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("Recent Activity")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{t(activity.message)}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
