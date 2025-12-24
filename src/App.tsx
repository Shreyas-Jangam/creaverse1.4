import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Web3Provider } from "@/contexts/Web3Context";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Category from "./pages/Category";
import Create from "./pages/Create";
import Activity from "./pages/Activity";
import Wallet from "./pages/Wallet";
import Rewards from "./pages/Rewards";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Governance from "./pages/Governance";
import PostDetail from "./pages/PostDetail";
import Review from "./pages/Review";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetail from "./pages/ProposalDetail";
import AITools from "./pages/AITools";
import Projects from "./pages/Projects";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <Web3Provider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/search" element={<Search />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/category/:id" element={<Category />} />
              <Route path="/create" element={<Create />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/governance/create" element={<CreateProposal />} />
              <Route path="/governance/:id" element={<ProposalDetail />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/post/:id/review" element={<Review />} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </Web3Provider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
