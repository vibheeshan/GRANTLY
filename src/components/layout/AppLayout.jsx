import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { TopNavigation } from "./TopNavigation.jsx";
import { MobileDrawer, MobileBottomNav } from "./MobileNav.jsx";
import { NotificationToast } from "../ui/NotificationToast.jsx";
import { MatchDNAModal } from "../scholarships/MatchDNAModal.jsx";
import { OnboardingWizardModal } from "../onboarding/OnboardingWizardModal.jsx";
import { ApplicationJourneyModal } from "../applications/ApplicationJourneyModal.jsx";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { ShieldCheck, Info, WifiOff, Download, X, Laptop } from "lucide-react";

export function AppLayout() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(() => {
    try {
      return localStorage.getItem("grantly_pwa_dismissed") !== "true";
    } catch {
      return true;
    }
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("grantly_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Offline detection (Feature 25)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // PWA Install prompt listener (Feature 24)
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Dynamic OpenGraph and Title per route (Feature 23)
  useEffect(() => {
    const path = location.pathname;
    let title = "GRANTLY - Fund Your Future";
    let desc = "Student financial intelligence, offline-first application tracking, and scholarship match engine.";

    if (path === "/") {
      title = "Dashboard | GRANTLY Student Command Center";
    } else if (path.includes("/explorer")) {
      title = "Discover Scholarships | GRANTLY";
      desc = "Search and filter verified and institutional scholarships tailored to your academic profile.";
    } else if (path.includes("/applications")) {
      title = "My Applications Tracker | GRANTLY";
      desc = "Track scholarship pipeline stages from preparation to award verification.";
    } else if (path.includes("/calendar")) {
      title = "Deadlines Calendar | GRANTLY";
      desc = "Sync and export deadlines with T-7 and T-1 calendar alarms.";
    } else if (path.includes("/documents")) {
      title = "Document Dossier | GRANTLY";
      desc = "Manage verified certificates, marksheets, and income affidavits locally.";
    } else if (path.includes("/insights") || path.includes("/analytics")) {
      title = "Insights & Analytics | GRANTLY";
    } else if (path.includes("/settings") || path.includes("/profile") || path.includes("/integrations")) {
      title = "Settings & Integrations | GRANTLY";
      desc = "Client-side integrations, CSV/JSON data exchange, and notification preferences.";
    }

    document.title = title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    if (ogDesc) ogDesc.setAttribute("content", desc);
  }, [location.pathname]);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPwaBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismissPwa = () => {
    setShowPwaBanner(false);
    try {
      localStorage.setItem("grantly_pwa_dismissed", "true");
    } catch {}
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem("grantly_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const {
    toastNotification,
    closeToast,
    selectedDnaScholarship,
    closeMatchDna,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isJourneyModalOpen,
    selectedJourneyApp,
    closeApplicationJourney
  } = useScholarships();

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] dark:bg-[#070A12] text-[#172033] dark:text-[#F1F5F9] transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-40">
        <Sidebar
          onCloseMobile={() => {}}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopNavigation onOpenMobile={() => setIsMobileOpen(true)} />

        {/* Feature 25: Offline Status Indicator */}
        {!isOnline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top-1">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Offline Mode: Operating from local cache. Applications, documents, and match scores remain fully functional.</span>
          </div>
        )}

        {/* Feature 24: PWA Install Prompt Banner */}
        {deferredPrompt && showPwaBanner && (
          <div className="bg-gradient-to-r from-violet-600 to-teal-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 shrink-0" />
              <span>Install GRANTLY as an offline desktop/mobile app for fast access.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallPwa}
                className="px-3 py-1 bg-white text-violet-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Install App
              </button>
              <button
                type="button"
                onClick={handleDismissPwa}
                className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* High-Tech HUD System Status Banner */}
        <div className="bg-slate-100/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/5 px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                SYSTEM STATUS:
              </span>
              <span className="truncate">
                Local Data Engine Synced • Deterministic Match DNA Active • Offline Storage
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 shrink-0 text-[10px] text-slate-400">
              <span>LATENCY: 0ms (LOCAL)</span>
              <span>•</span>
              <span>14 DEMO RECORDS</span>
            </div>
          </div>
        </div>

        {/* Routed Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-bold text-slate-900 dark:text-white font-heading">
                GRANTLY
              </span>
              <span>— Unified Student Financial Intelligence Platform</span>
            </div>
            <div className="flex items-center gap-4 text-center">
              <Link to="/compare" className="text-violet-600 dark:text-violet-400 hover:underline">
                Comparison Studio
              </Link>
              <Link to="/calculator" className="text-violet-600 dark:text-violet-400 hover:underline">
                Funding Calculator
              </Link>
              <Link to="/matcher" className="text-violet-600 dark:text-violet-400 hover:underline">
                Match DNA
              </Link>
              <Link to="/insights" className="text-violet-600 dark:text-violet-400 hover:underline">
                Insights
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      <MatchDNAModal
        scholarship={selectedDnaScholarship}
        isOpen={Boolean(selectedDnaScholarship)}
        onClose={closeMatchDna}
      />

      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <ApplicationJourneyModal
        application={selectedJourneyApp}
        isOpen={isJourneyModalOpen}
        onClose={closeApplicationJourney}
      />

      {/* Global Action Toast Notification */}
      <NotificationToast
        notification={toastNotification}
        onClose={closeToast}
      />
    </div>
  );
}
