import { useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Vote, 
  Users, 
  Trophy, 
  ArrowRight,
  Zap,
  Globe,
  Loader2
} from "lucide-react";
import { useTranslateTexts } from "@/components/ui/translatable-text";
import creaverseLogo from "@/assets/creaverse-logo.png";
import { useLandingStats, formatNumber, formatCurrency } from "@/hooks/useLandingStats";
import { useAuth } from "@/hooks/useAuth";
import "../styles/spline-iframe.css";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Creation",
    description: "Generate content, refine prompts, and build projects with intelligent AI assistance.",
    color: "primary",
  },
  {
    icon: Vote,
    title: "DAO Governance",
    description: "Propose ideas, vote on decisions, and shape the future of our creative ecosystem.",
    color: "secondary",
  },
  {
    icon: Users,
    title: "Community Hub",
    description: "Connect with creators, share your work, and collaborate on groundbreaking projects.",
    color: "accent",
  },
  {
    icon: Trophy,
    title: "Earn Rewards",
    description: "Get recognized for your contributions with reputation points, badges, and rewards.",
    color: "success",
  },
];

// AnimatedCounter component for smooth number transitions
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: stats, isLoading } = useLandingStats();

  // Remove automatic redirect - let users visit the landing page even when authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/feed", { replace: true });
  //   }
  // }, [isAuthenticated, navigate]);
  // All texts to translate
  const textsToTranslate = useMemo(() => [
    "Features", "Community", "Governance", "Sign In", "Launch App",
    "AI + DAO + Creative Community",
    "Create. Govern.", "Build the Future.",
    "Join the decentralized creative ecosystem where AI accelerates your ideas, community shapes decisions, and contributions are rewarded.",
    "Enter Creaverse", "Explore Governance",
    "Active Members", "Proposals Passed", "Treasury Value", "Projects Created",
    "Everything You Need to", "Create & Govern",
    "A complete ecosystem for creators, innovators, and community builders.",
    "AI-Powered Creation", "Generate content, refine prompts, and build projects with intelligent AI assistance.",
    "DAO Governance", "Propose ideas, vote on decisions, and shape the future of our creative ecosystem.",
    "Community Hub", "Connect with creators, share your work, and collaborate on groundbreaking projects.",
    "Earn Rewards", "Get recognized for your contributions with reputation points, badges, and rewards.",
    "Ready to Join the", "Creative Revolution",
    "Be part of a community that's redefining how creators collaborate, govern, and build together.",
    "Get Started Now",
    "All rights reserved.", "Discord", "Twitter", "GitHub",
  ], []);

  const { t } = useTranslateTexts(textsToTranslate);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <img 
                src={creaverseLogo} 
                alt="CreaverseDAO" 
                className="w-9 h-9 sm:w-12 sm:h-12 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="font-bold text-base sm:text-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              CreaverseDAO
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("Features")}</a>
            <a href="#community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("Community")}</a>
            <a href="#governance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("Governance")}</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">{t("Sign In")}</Button>
              <Button variant="ghost" size="icon" className="sm:hidden min-h-[44px] min-w-[44px]">
                <Users className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/feed">
              <Button variant="glow" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">{t("Launch App")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 md:pt-40 md:pb-32 min-h-screen flex items-center">
        {/* 3D Animation Background */}
        <div className="absolute inset-0 overflow-hidden spline-iframe-container">
          <iframe 
            src='https://my.spline.design/100followersfocus-sWgokELcNtF2J5Y56onrIfb7/' 
            className="spline-iframe"
            title="3D Animation Background"
            allow="camera; microphone; xr-spatial-tracking"
          />
          {/* Watermark overlay */}
          <div className="watermark-overlay" />
          {/* Theme-aware overlay to improve text readability */}
          <div className="absolute inset-0 bg-black/20 dark:bg-black/20 light:bg-white/30 backdrop-blur-[0.5px] pointer-events-none theme-transition" />
        </div>

        <div className="container mx-auto px-4 content-overlay">
          <div className="max-w-4xl mx-auto text-center">
            {/* Spacer to replace removed logo */}
            <div className="mb-6 sm:mb-8 h-24 sm:h-32 md:h-40"></div>

            {/* Badge */}
            <Badge variant="glow" className="mb-4 sm:mb-6 fade-in-up stagger-1 text-xs sm:text-sm bg-black/80 dark:bg-black/80 light:bg-white/90 backdrop-blur-md border-cyan-400/50 text-cyan-100 dark:text-cyan-100 light:text-cyan-600 shadow-2xl shadow-cyan-500/30 theme-transition">
              <Zap className="w-3 h-3 mr-1" />
              {t("AI + DAO + Creative Community")}
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 fade-in-up stagger-2">
              <span className="text-white dark:text-white light:text-gray-900 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] light:drop-shadow-[0_4px_20px_rgba(255,255,255,0.9)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] dark:[text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] light:[text-shadow:_2px_2px_4px_rgb(255_255_255_/_80%)] theme-transition">{t("Create. Govern.")}</span>
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400 light:from-cyan-600 light:via-blue-600 light:to-purple-600 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] light:drop-shadow-[0_4px_20px_rgba(255,255,255,0.9)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] dark:[text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] light:[text-shadow:_2px_2px_4px_rgb(255_255_255_/_80%)] theme-transition">{t("Build the Future.")}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 dark:text-white/95 light:text-gray-800/95 max-w-3xl mx-auto mb-6 sm:mb-8 fade-in-up stagger-3 px-2 font-medium bg-black/40 dark:bg-black/40 light:bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200/50 shadow-2xl [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_60%)] theme-transition">
              {t("Join the decentralized creative ecosystem where AI accelerates your ideas, community shapes decisions, and contributions are rewarded.")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 fade-in-up stagger-4 px-4">
              <Link to="/feed" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-2xl shadow-cyan-500/40 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 font-bold border border-cyan-400/30">
                  {t("Enter Creaverse")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/governance" className="w-full sm:w-auto">
                <Button variant="hero-outline" size="lg" className="w-full sm:w-auto border-2 border-cyan-400/70 hover:border-cyan-300 text-white hover:bg-cyan-500/20 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 font-bold bg-black/30 backdrop-blur-md shadow-xl">
                  {t("Explore Governance")}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-10 sm:mt-16 fade-in-up stagger-5">
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-black/70 dark:bg-black/70 light:bg-white/90 backdrop-blur-md border border-cyan-400/40 dark:border-cyan-400/40 light:border-cyan-500/30 hover:border-cyan-400/60 dark:hover:border-cyan-400/60 light:hover:border-cyan-500/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30 theme-transition">
                <p className="text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-purple-400 dark:from-cyan-300 dark:to-purple-400 light:from-cyan-600 light:to-purple-600 bg-clip-text text-transparent drop-shadow-lg [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_80%)]">
                  {isLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto text-cyan-400" /> : (
                    <AnimatedCounter value={formatNumber(stats?.activeMembers || 0)} suffix="+" />
                  )}
                </p>
                <p className="text-sm sm:text-base text-cyan-100 dark:text-cyan-100 light:text-cyan-700 mt-2 font-semibold [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_60%)]">{t("Active Members")}</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-black/70 dark:bg-black/70 light:bg-white/90 backdrop-blur-md border border-cyan-400/40 dark:border-cyan-400/40 light:border-cyan-500/30 hover:border-cyan-400/60 dark:hover:border-cyan-400/60 light:hover:border-cyan-500/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30 theme-transition">
                <p className="text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-purple-400 dark:from-cyan-300 dark:to-purple-400 light:from-cyan-600 light:to-purple-600 bg-clip-text text-transparent drop-shadow-lg [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_80%)]">
                  {isLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto text-cyan-400" /> : (
                    <AnimatedCounter value={String(stats?.proposalsPassed || 0)} suffix="+" />
                  )}
                </p>
                <p className="text-sm sm:text-base text-cyan-100 dark:text-cyan-100 light:text-cyan-700 mt-2 font-semibold [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_60%)]">{t("Proposals Passed")}</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-black/70 dark:bg-black/70 light:bg-white/90 backdrop-blur-md border border-cyan-400/40 dark:border-cyan-400/40 light:border-cyan-500/30 hover:border-cyan-400/60 dark:hover:border-cyan-400/60 light:hover:border-cyan-500/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30 theme-transition">
                <p className="text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-purple-400 dark:from-cyan-300 dark:to-purple-400 light:from-cyan-600 light:to-purple-600 bg-clip-text text-transparent drop-shadow-lg [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_80%)]">
                  {isLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto text-cyan-400" /> : (
                    <AnimatedCounter value={formatCurrency(stats?.treasuryValue || 0)} />
                  )}
                </p>
                <p className="text-sm sm:text-base text-cyan-100 dark:text-cyan-100 light:text-cyan-700 mt-2 font-semibold [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_60%)]">{t("Treasury Value")}</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-black/70 dark:bg-black/70 light:bg-white/90 backdrop-blur-md border border-cyan-400/40 dark:border-cyan-400/40 light:border-cyan-500/30 hover:border-cyan-400/60 dark:hover:border-cyan-400/60 light:hover:border-cyan-500/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30 theme-transition">
                <p className="text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-purple-400 dark:from-cyan-300 dark:to-purple-400 light:from-cyan-600 light:to-purple-600 bg-clip-text text-transparent drop-shadow-lg [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_80%)]">
                  {isLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto text-cyan-400" /> : (
                    <AnimatedCounter value={formatNumber(stats?.projectsCreated || 0)} suffix="+" />
                  )}
                </p>
                <p className="text-sm sm:text-base text-cyan-100 dark:text-cyan-100 light:text-cyan-700 mt-2 font-semibold [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] dark:[text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] light:[text-shadow:_1px_1px_2px_rgb(255_255_255_/_60%)]">{t("Projects Created")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">{t("Features")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("Everything You Need to")} <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">{t("Create & Govern")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("A complete ecosystem for creators, innovators, and community builders.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(feature.title)}</h3>
                  <p className="text-sm text-muted-foreground">{t(feature.description)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-card border border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("Ready to Join the")} <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">{t("Creative Revolution")}</span>?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                {t("Be part of a community that's redefining how creators collaborate, govern, and build together.")}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/feed">
                  <Button variant="hero">
                    {t("Get Started Now")}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 group">
              <img 
                src={creaverseLogo} 
                alt="CreaverseDAO" 
                className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                CreaverseDAO
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 Creaverse DAO. {t("All rights reserved.")}
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("Discord")}</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("Twitter")}</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("GitHub")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
