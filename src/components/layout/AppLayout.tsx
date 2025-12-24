import { useState } from "react";
import { Sidebar, MobileNav, BottomNav } from "./Sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Mobile Navigation */}
      <MobileNav onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
      
      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300 overflow-x-hidden",
        "pt-14 pb-20 lg:pt-0 lg:pb-0",
        "lg:ml-72"
      )}>
        <div className="w-full max-w-2xl mx-auto lg:max-w-none lg:px-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
