import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { 
  Target, 
  Plus,
  Users,
  Calendar,
  Coins,
  TrendingUp,
  Filter,
  Search,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";

const mockProjects = [
  {
    id: "1",
    title: "Community Art Exhibition",
    description: "A virtual gallery showcasing the best digital art from our community members",
    status: "active",
    progress: 65,
    category: "art",
    contributors: 12,
    funding: 5000,
    fundingGoal: 10000,
    deadline: "2024-02-15",
    creator: { name: "Maya Digital", avatar: "M" },
  },
  {
    id: "2",
    title: "Open Source UI Library",
    description: "Building a comprehensive React component library for the community",
    status: "active",
    progress: 80,
    category: "tech",
    contributors: 28,
    funding: 8500,
    fundingGoal: 10000,
    deadline: "2024-01-30",
    creator: { name: "Dev Martinez", avatar: "D" },
  },
  {
    id: "3",
    title: "Indie Film Festival",
    description: "Organizing an online film festival featuring community-made short films",
    status: "planning",
    progress: 25,
    category: "cinema",
    contributors: 8,
    funding: 2500,
    fundingGoal: 15000,
    deadline: "2024-03-20",
    creator: { name: "Alex Chen", avatar: "A" },
  },
  {
    id: "4",
    title: "Music Collaboration Album",
    description: "A collaborative album featuring tracks from multiple community musicians",
    status: "completed",
    progress: 100,
    category: "music",
    contributors: 15,
    funding: 7500,
    fundingGoal: 7500,
    deadline: "2024-01-01",
    creator: { name: "Luna Beats", avatar: "L" },
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-success/20 text-success border-success/30";
    case "planning": return "bg-warning/20 text-warning border-warning/30";
    case "completed": return "bg-primary/20 text-primary border-primary/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const getCategoryGradient = (category: string) => {
  const gradients: Record<string, string> = {
    art: "from-purple-500 to-pink-500",
    tech: "from-cyan-500 to-blue-500",
    cinema: "from-red-500 to-orange-500",
    music: "from-pink-500 to-rose-500",
    books: "from-amber-500 to-yellow-500",
    nature: "from-green-500 to-emerald-500",
  };
  return gradients[category] || gradients.tech;
};

export default function Projects() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Community Projects</h1>
            <p className="text-muted-foreground">Collaborate and contribute to community initiatives</p>
          </div>
          <Link to="/create">
            <Button variant="glow">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{mockProjects.length}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold">63</p>
              <p className="text-xs text-muted-foreground">Contributors</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <Coins className="w-6 h-6 mx-auto text-warning mb-2" />
              <p className="text-2xl font-bold">23.5K</p>
              <p className="text-xs text-muted-foreground">Tokens Funded</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {mockProjects.map((project) => (
            <Card key={project.id} variant="interactive" className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Category Indicator */}
                  <div className={`w-full md:w-2 h-2 md:h-auto bg-gradient-to-r md:bg-gradient-to-b ${getCategoryGradient(project.category)}`} />
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                        
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-white">
                                {project.creator.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span>{project.creator.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project.contributors} contributors
                          </div>
                          <div className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {project.funding.toLocaleString()} / {project.fundingGoal.toLocaleString()} tokens
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (if no projects) */}
        {mockProjects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Projects Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to start a community project
              </p>
              <Link to="/create">
                <Button variant="glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
