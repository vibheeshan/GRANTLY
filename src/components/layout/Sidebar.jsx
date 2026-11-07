import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Layers,
  Calculator,
  ClipboardList,
  Calendar,
  FileCheck2,
  Compass,
  Bot,
  User,
  GraduationCap,
  Bookmark,
  Sun,
  Moon,
  RotateCcw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  Settings,
  Globe,
  FileText,
  Bell,
  Activity
} from "lucide-react";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export function Sidebar({ onCloseMobile, isCollapsed = false, onToggleCollapse }) {
  const { studentProfile, stats, resetAllData, setIsOnboardingOpen } = useScholarships();
  const { theme, toggleTheme } = useTheme();

  // Accordion state for expandable sidebar groups
  const [openGroups, setOpenGroups] = useState({
    discovery: true,
    applications: true,
    studentHub: true
  });

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const navGroups = [
    {
      id: "discovery",
      title: "Discovery & Matching",
      items: [
        {
          to: "/",
          label: "Overview",
          icon: LayoutDashboard,
          badge: null
        },
        {
          to: "/explorer",
          label: "Discover Scholarships",
          icon: Search,
          badge: null
        },
        {
          to: "/recommended",
          label: "Recommended For You",
          icon: ThumbsUp,
          badge: stats.eligibleCount > 0 ? stats.eligibleCount : null,
          badgeColor: "bg-teal-500/20 text-teal-300"
        },
        {
          to: "/match-dna",
          label: "Match DNA",
          icon: Sparkles,
          badge: "Signature",
          badgeColor: "bg-violet-500/20 text-violet-300"
        },
        {
          to: "/compare",
          label: "Compare Scholarships",
          icon: Layers,
          badge: stats.compareCount > 0 ? stats.compareCount : null,
          badgeColor: "bg-purple-500/20 text-purple-300"
        },
        {
          to: "/categories",
          label: "Scholarship Categories",
          icon: Compass,
          badge: "10",
          badgeColor: "bg-blue-500/20 text-blue-300"
        },
        {
          to: "/opportunity-map",
          label: "Opportunity Map",
          icon: Globe,
          badge: "Regional",
          badgeColor: "bg-teal-500/20 text-teal-300"
        }
      ]
    },
    {
      id: "applications",
      title: "Applications & Timeline",
      items: [
        {
          to: "/applications",
          label: "My Applications",
          icon: ClipboardList,
          badge: stats.activeApplicationsCount > 0 ? stats.activeApplicationsCount : null,
          badgeColor: "bg-blue-500/20 text-blue-300"
        },
        {
          to: "/journey",
          label: "Application Journey",
          icon: Compass,
          badge: "Timeline",
          badgeColor: "bg-purple-500/20 text-purple-300"
        },
        {
          to: "/calendar",
          label: "Deadline Center",
          icon: Calendar,
          badge: stats.upcomingDeadlinesCount > 0 ? stats.upcomingDeadlinesCount : null,
          badgeColor: "bg-amber-500/20 text-amber-300"
        },
        {
          to: "/documents",
          label: "Document Center",
          icon: FileCheck2,
          badge: `${stats.documentReadinessPercentage}%`,
          badgeColor: stats.documentReadinessPercentage >= 80 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
        }
      ]
    },
    {
      id: "studentHub",
      title: "Student Hub & Tools",
      items: [
        {
          to: "/profile",
          label: "Student Passport",
          icon: User,
          badge: null
        },
        {
          to: "/notifications",
          label: "Notifications",
          icon: Bell,
          badge: stats.unreadNotificationsCount > 0 ? stats.unreadNotificationsCount : null,
          badgeColor: "bg-rose-500/20 text-rose-300"
        },
        {
          to: "/activity",
          label: "Activity Feed",
          icon: Activity,
          badge: null
        },
        {
          to: "/analytics",
          label: "Insights Studio",
          icon: Compass,
          badge: "Analytics",
          badgeColor: "bg-emerald-500/20 text-emerald-300"
        },
        {
          to: "/assistant",
          label: "Scholarship Assistant",
          icon: Bot,
          badge: "Local",
          badgeColor: "bg-purple-500/20 text-purple-300"
        },
        {
          to: "/readiness-report",
          label: "Readiness Report",
          icon: FileText,
          badge: "Print",
          badgeColor: "bg-teal-500/20 text-teal-300"
        },
        {
          to: "/profile?tab=settings",
          label: "Settings",
          icon: Settings,
          badge: null
        },
        {
          to: "/settings/integrations",
          label: "Integrations Hub",
          icon: Layers,
          badge: "30 APIs",
          badgeColor: "bg-teal-500/20 text-teal-300"
        }
      ]
    }
  ];

  return (
    <aside
      className={`h-full bg-[#0F172A] text-slate-300 flex flex-col border-r border-[#27334A] select-none transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80 min-h-[4.25rem]">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group transition-transform active:scale-95 min-w-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6957E8] to-[#14B8A6] p-0.5 shadow-lg shadow-violet-900/30 shrink-0">
            <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center text-[#2DD4BF] group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white font-heading">
                  GRANTLY
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase tracking-wider">
                  3.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight font-medium truncate">
                Your Future Deserves Funding.
              </p>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-none">
        {navGroups.map((group) => {
          const isOpen = openGroups[group.id] !== false;

          return (
            <div key={group.id} className="space-y-1">
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? "transform rotate-0" : "transform -rotate-90"
                    }`}
                  />
                </button>
              )}

              {/* Group items (shown if expanded or collapsed sidebar) */}
              {(isOpen || isCollapsed) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center ${
                            isCollapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-2"
                          } rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                            isActive
                              ? "bg-[#6957E8] text-white shadow-md shadow-violet-900/40"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                          }`
                        }
                        title={isCollapsed ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "min-w-0"}`}>
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  isActive ? "text-white" : "text-slate-400 group-hover:text-[#A78BFA]"
                                }`}
                              />
                              {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </div>
                            {!isCollapsed && item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  isActive ? "bg-white/20 text-white" : item.badgeColor
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {/* Dot indicator for collapsed view */}
                            {isCollapsed && item.badge && (
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#14B8A6]" />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Profile & Theme Toggle */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0A1020]">
        <div
          className={`flex items-center ${
            isCollapsed ? "flex-col gap-2 p-1.5" : "justify-between p-2"
          } rounded-xl bg-slate-800/40 border border-slate-700/50`}
        >
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 group cursor-pointer"
            title={studentProfile.name}
          >
            <div className="relative shrink-0">
              <img
                src={studentProfile.avatar}
                alt={studentProfile.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-teal-400 ring-1 ring-[#0F172A]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                  {studentProfile.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {studentProfile.course}
                </p>
              </div>
            )}
          </NavLink>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer shrink-0"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
