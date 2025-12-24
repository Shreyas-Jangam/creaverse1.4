import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User,
  Compass,
  Film,
  Palette,
  Code,
  BookOpen,
  Leaf,
  Music,
  Wallet,
  Trophy,
  Menu,
  X,
  Sparkles,
  Bell,
  Settings,
  Shield,
  LucideIcon,
  Loader2,
  LogIn,
  LogOut,
  MessageCircle
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useAutoTranslate } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import creaverseLogo from "@/assets/creaverse-logo.png";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainNavItems: NavItem[] = [
  // Priority items at the top
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Governance", href: "/governance", icon: Shield },
  { label: "Rewards", href: "/rewards", icon: Trophy },
  // Regular navigation items
  { label: "Home", href: "/feed", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Create", href: "/create", icon: PlusSquare },
  { label: "Activity", href: "/activity", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

const categoryNavItems: NavItem[] = [
  { label: "Cinema", href: "/category/cinema", icon: Film },
  { label: "Art", href: "/category/art", icon: Palette },
  { label: "Tech", href: "/category/tech", icon: Code },
  { label: "Books", href: "/category/books", icon: BookOpen },
  { label: "Nature", href: "/category/nature", icon: Leaf },
  { label: "Music", href: "/category/music", icon: Music },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Collect all texts that need translation
  const textsToTranslate = useMemo(() => [
    ...mainNavItems.map(item => item.label),
    ...categoryNavItems.map(item => item.label),
    "Categories",
    "Create And Govern",
    "Token Balance",
    "+120 this week",
    "Sign In",
    "Sign Out",
    "Sign in with Google",
  ], []);

  const { t, isLoading } = useAutoTranslate(textsToTranslate);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    await signInWithGoogle();
    setIsSigningIn(false);
    onClose();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    onClose();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <Link 
            to="/" 
            className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity relative z-10"
            onClick={onClose} // Close sidebar on mobile when logo is clicked
            style={{ pointerEvents: 'auto' }}
          >
            <div className="relative">
              <img 
                src={creaverseLogo} 
                alt="CreaverseDAO" 
                className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                CreaverseDAO
              </h1>
              <p className="text-xs text-muted-foreground">{t("Create And Govern")}</p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Main Nav */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={{ ...item, label: t(item.label) }}
                isActive={location.pathname === item.href}
              />
            ))}
          </div>

          {/* Categories */}
          <div className="pt-4 mt-4 border-t border-sidebar-border space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3 flex items-center gap-2">
              {t("Categories")}
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            </p>
            {categoryNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={{ ...item, label: t(item.label) }}
                isActive={location.pathname === item.href}
              />
            ))}
          </div>
        </nav>

        {/* Token Balance & Auth */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {/* Auth Section */}
          {authLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              {/* Token Balance */}
              <div className="p-4 rounded-xl bg-gradient-card border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{t("Token Balance")}</span>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-cyan-400 drop-shadow-sm">2,340</p>
                <p className="text-xs text-foreground mt-1">{t("+120 this week")}</p>
              </div>

              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full justify-start text-muted-foreground hover:text-destructive"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                {t("Sign Out")}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Google Sign In Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full justify-center gap-2"
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {t("Sign in with Google")}
              </Button>

              {/* Email Sign In Link */}
              <Link to="/auth" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t("Sign In")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
}

function NavLink({ item, isActive }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/15 text-white border border-primary/30 shadow-lg shadow-primary/20"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "")} />
      <span className={cn(isActive && "text-white font-semibold")}>{item.label}</span>
    </Link>
  );
}

export function MobileNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="min-w-[44px] min-h-[44px]"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <Link 
          to="/" 
          className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity relative z-10"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="relative">
            <img 
              src={creaverseLogo} 
              alt="CreaverseDAO" 
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/30 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            CreaverseDAO
          </span>
        </Link>

        <Link to="/notifications">
          <Button 
            variant="ghost" 
            size="icon"
            className="min-w-[44px] min-h-[44px]"
          >
            <Bell className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

// Bottom navigation items - simplified for mobile
const bottomNavItems: NavItem[] = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Create", href: "/create", icon: PlusSquare },
  { label: "Activity", href: "/activity", icon: Heart },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  const textsToTranslate = useMemo(() => 
    bottomNavItems.map(item => item.label), 
  []);

  const { t } = useAutoTranslate(textsToTranslate);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 px-1 pb-safe">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          const isCreate = item.href === "/create";
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] py-1 transition-all touch-manipulation",
                isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
              )}
            >
              {isCreate ? (
                <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center -mt-3 shadow-lg shadow-primary/30">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
              )}
              <span className={cn(
                "text-[10px] font-medium",
                isCreate && "mt-0.5"
              )}>{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
