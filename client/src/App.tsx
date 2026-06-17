import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import LoadingScreen from "./components/LoadingScreen";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import ReferralPage from "./pages/ReferralPage";
import WalletPage from "./pages/WalletPage";
import ProfilePage from "./pages/ProfilePage";
import { initializeTelegram, isTelegramEnvironment } from "./lib/telegram";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={HomePage} />
      <Route path={"/tasks"} component={TasksPage} />
      <Route path={"/referral"} component={ReferralPage} />
      <Route path={"/wallet"} component={WalletPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { loading, isBlocked, error } = useUser();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    const webApp = initializeTelegram();
    if (webApp) {
      setAppReady(true);
    }
  }, []);

  // Block access if not in Telegram environment
  if (isBlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">This app can only be accessed from Telegram</p>
          <p className="text-sm text-gray-500">
            Open this link in Telegram to use EarnHub
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingScreen isLoading={loading || !appReady} />
      <div className="bg-white">
        <Router />
        <BottomNav />
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <UserProvider>
            <AppContent />
          </UserProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
