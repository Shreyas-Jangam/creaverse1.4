import { useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@/data/mockData";
import { useSettings, languageOptions } from "@/contexts/SettingsContext";
import { useAutoTranslate } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import creaverseNewLogo from "@/assets/creaverse-new-logo.png";
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Info, 
  LogOut,
  ChevronRight,
  ExternalLink,
  Shield,
  FileText,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const APP_VERSION = "1.0.0";

export default function Settings() {
  const { 
    theme, 
    setTheme, 
    notificationsEnabled, 
    setNotificationsEnabled,
    language,
    setLanguage,
    t 
  } = useSettings();
  const navigate = useNavigate();

  // Texts to translate with AI
  const textsToTranslate = useMemo(() => [
    "Customize your app experience",
    "Successfully logged out",
    "Light mode activated",
    "Dark mode activated",
    "Notifications disabled",
    "Notifications enabled",
    "All rights reserved.",
  ], []);

  const { t: aiT, isLoading: isTranslating } = useAutoTranslate(textsToTranslate);

  const handleLogout = () => {
    toast.success(aiT("Successfully logged out"));
    navigate('/');
  };

  const handleThemeToggle = (isDark: boolean) => {
    // isDark represents the new state of the toggle
    const newTheme = isDark ? 'dark' : 'light';
    
    // Update theme through context (handles all DOM updates)
    setTheme(newTheme);
    
    // Show success message with icons
    setTimeout(() => {
      toast.success(
        newTheme === 'light' 
          ? `☀️ ${aiT("Light mode activated")}`
          : `🌙 ${aiT("Dark mode activated")}`
      );
    }, 150);
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(
      notificationsEnabled 
        ? aiT("Notifications disabled")
        : aiT("Notifications enabled")
    );
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-6 px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('settings')}</h1>
            {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </div>
          <p className="text-muted-foreground text-sm">
            {aiT("Customize your app experience")}
          </p>
        </div>

        {/* Profile Section */}
        <section className="mb-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-card border border-border/50">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              {currentUser.displayName.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{currentUser.displayName}</h3>
              <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t('appearance')}
          </h2>
          <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
            <SettingsItem
              icon={theme === 'dark' ? Moon : Sun}
              iconColor={theme === 'dark' ? "text-blue-400" : "text-yellow-500"}
              title={t('theme')}
              description={t('themeDescription')}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sun className="w-3 h-3" />
                  <span className="hidden sm:inline">Light</span>
                </div>
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={handleThemeToggle}
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Moon className="w-3 h-3" />
                  <span className="hidden sm:inline">Dark</span>
                </div>
              </div>
            </SettingsItem>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t('notifications')}
          </h2>
          <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
            <SettingsItem
              icon={Bell}
              iconColor="text-warning"
              title={t('pushNotifications')}
              description={t('notificationsDescription')}
            >
              <Switch 
                checked={notificationsEnabled} 
                onCheckedChange={handleNotificationsToggle}
              />
            </SettingsItem>
          </div>
        </section>

        {/* Language Section */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t('language')}
          </h2>
          <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">{t('language')}</p>
                  <p className="text-xs text-muted-foreground">{t('languageDescription')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {languageOptions.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "justify-start gap-2 h-auto py-2 px-3",
                      language === lang.code && "bg-gradient-primary glow-primary"
                    )}
                    onClick={() => setLanguage(lang.code)}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-xs truncate">{lang.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t('about')}
          </h2>
          <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
            <SettingsItem
              icon={Info}
              iconColor="text-accent"
              title={t('appVersion')}
              description={`Creaverse DAO v${APP_VERSION}`}
            />
            <Separator className="bg-border/50" />
            <SettingsItem
              icon={FileText}
              iconColor="text-primary"
              title={t('termsOfService')}
              onClick={() => navigate('/terms-of-service')}
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </SettingsItem>
            <Separator className="bg-border/50" />
            <SettingsItem
              icon={Shield}
              iconColor="text-success"
              title={t('privacyPolicy')}
              onClick={() => navigate('/privacy-policy')}
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </SettingsItem>
          </div>
        </section>

        {/* Logout Section */}
        <section className="mb-6">
          <div className="rounded-xl bg-card border border-destructive/30 overflow-hidden">
            <button 
              onClick={handleLogout}
              className="w-full p-4 flex items-center gap-3 hover:bg-destructive/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-destructive">{t('logout')}</p>
                <p className="text-xs text-muted-foreground">{t('logoutDescription')}</p>
              </div>
            </button>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="logo-hover-glow cursor-pointer"
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/');
                }
              }}
              aria-label="Go to home page"
            >
              <img 
                src={creaverseNewLogo} 
                alt="Creaverse DAO Logo" 
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Creaverse. {aiT("All rights reserved.")}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

interface SettingsItemProps {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

function SettingsItem({ 
  icon: Icon, 
  iconColor = "text-foreground", 
  title, 
  description, 
  children,
  onClick 
}: SettingsItemProps) {
  const content = (
    <>
      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {children}
    </>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="p-4 flex items-center gap-3">
      {content}
    </div>
  );
}
