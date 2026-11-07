import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  User,
  Sliders,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  Keyboard,
  Target,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { GlobalSearchModal } from "../search/GlobalSearchModal.jsx";
import { NotificationDrawer } from "../notifications/NotificationDrawer.jsx";

const BREADCRUMB_MAP = {
  "/": { section: "Overview", title: "Dashboard Cockpit" },
  "/explorer": { section: "Discovery", title: "Scholarship Explorer" },
  "/match-dna": { section: "Intelligence", title: "Match DNA Assessment" },
  "/matcher": { section: "Intelligence", title: "Match DNA Assessment" },
  "/compare": { section: "Intelligence", title: "Comparison Studio" },
  "/calculator": { section: "Finance", title: "Funding Opportunity Calculator" },
  "/applications": { section: "Management", title: "My Applications" },
  "/calendar": { section: "Planning", title: "Application Calendar" },
  "/documents": { section: "Dossier", title: "Document Readiness Center" },
  "/insights": { section: "Analytics", title: "Student Success Insights" },
  "/assistant": { section: "AI Assistant", title: "GRANTLY Assistant" },
  "/profile": { section: "Settings", title: "Student Profile & Domicile" }
};

export function TopNavigation({ onOpenMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    studentProfile,
    stats,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setIsOnboardingOpen,
    resetAllData
  } = useScholarships();
  const { theme, toggleTheme } = useTheme();

  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K for search, ? for shortcuts panel
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "?" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
        if (isResetConfirmOpen) setIsResetConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [setIsCommandPaletteOpen, isShortcutsOpen, isProfileDropdownOpen, isResetConfirmOpen]);

  const breadcrumb = BREADCRUMB_MAP[location.pathname] || {
    section: "Opportunity",
    title: "Scholarship Details"
  };

  const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;

  return (
    <>
      <header className="sticky top-0 z-30 glass-panel border-b border-[#E8EAF2]/80 dark:border-[#27334A]/80 transition-all shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 gap-4">
          {/* Left: Mobile Drawer Trigger & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenMobile}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 truncate font-medium">
              <Link
                to="/"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-bold tracking-tight text-slate-900 dark:text-white"
              >
                GRANTLY
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              <span className="hidden sm:inline hover:text-slate-700 dark:hover:text-slate-200 transition-colors font-medium">
                {breadcrumb.section}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:inline shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                {breadcrumb.title}
              </span>
            </nav>
          </div>

          {/* Center: Streamlined Search Bar with Keyboard Hint */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200/90 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700/60 transition-all cursor-pointer shadow-2xs group"
              aria-label="Global search command palette"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors shrink-0" />
                <span className="truncate text-slate-500 dark:text-slate-400 font-normal">
                  Search opportunities, documents, tracker...
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <span>{isMac ? "⌘" : "Ctrl"}</span>
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right: Actions, Notifications, Theme, Refined Profile Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile search trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Search"
              aria-label="Global search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Match DNA Status Pill */}
            <Link
              to="/match-dna"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/80 text-violet-700 dark:text-violet-300 text-xs font-semibold hover:bg-violet-100/70 transition-colors"
              title="Open Match DNA Assessment"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
              <span>{stats.eligibleCount} Eligible Matches</span>
            </Link>

            {/* Keyboard shortcuts trigger */}
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hidden sm:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Keyboard Shortcuts (?)"
              aria-label="View keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Notification Drawer Toggle */}
            <button
              onClick={() => setIsNotifDrawerOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Toggle notifications drawer"
            >
              <Bell className="w-4 h-4" />
              {stats.unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-[#151F33] animate-pulse" />
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
              aria-label="Toggle dark and light theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Refined User Profile Dropdown */}
            <div className="relative pl-1" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-transparent hover:ring-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer transition-all"
                aria-label="User account menu"
                aria-expanded={isProfileDropdownOpen}
              >
                <div className="relative">
                  <img
                    src={studentProfile.avatar}
                    alt={studentProfile.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30 shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-[#151F33]" />
                </div>
              </button>

              {/* Refined Dropdown Menu with Glassmorphism */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-white/95 dark:bg-[#151F33]/95 glass-panel border border-[#E8EAF2] dark:border-[#27334A] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {/* User Profile Card Header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={studentProfile.avatar}
                        alt={studentProfile.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/40"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {studentProfile.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {studentProfile.course}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Academic Merit:</span>
                      <span className="flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {studentProfile.academicPercentage}% CGPA
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1 text-xs text-slate-700 dark:text-slate-200">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsOnboardingOpen(true);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-violet-50 dark:hover:bg-violet-950/30 flex items-center gap-2.5 transition-colors cursor-pointer group"
                    >
                      <Sliders className="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">Profile Calibration</div>
                        <div className="text-[10px] text-slate-400">Adjust marks, domicile, income parameters</div>
                      </div>
                    </button>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors group"
                    >
                      <User className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">Account &amp; Domicile</div>
                        <div className="text-[10px] text-slate-400">Manage student ID &amp; residency records</div>
                      </div>
                    </Link>

                    <Link
                      to="/documents"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full px-4 py-2.5 text-left hover:bg-teal-50/50 dark:hover:bg-teal-950/20 flex items-center gap-2.5 transition-colors group"
                    >
                      <FileCheck2 className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">Document Dossier</div>
                        <div className="text-[10px] text-slate-400">Verify marksheets, income slips, IDs</div>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsShortcutsOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Keyboard className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">Keyboard Shortcuts</span>
                      </div>
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">?</kbd>
                    </button>
                  </div>

                  {/* Reset Demo Data Action */}
                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsResetConfirmOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="font-medium">Reset Demo Defaults</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal / Command Palette */}
      <GlobalSearchModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      {/* Feature 144: Keyboard Shortcuts Panel */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#151F33] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 glass-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Keyboard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span>Global Command Palette / Search</span>
                <kbd className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{isMac ? "⌘" : "Ctrl"} + K</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span>Open Keyboard Shortcuts Dialog</span>
                <kbd className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">?</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span>Close any open modal or flyout</span>
                <kbd className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">Esc</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span>Quick switch theme</span>
                <span className="text-slate-400">Header button</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Demo Data */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#151F33] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full shadow-2xl p-6 glass-panel">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Demo Defaults?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              This will restore Aarav Sharma's sample profile, original documents checklist, sample applications, and demonstration event logs.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
