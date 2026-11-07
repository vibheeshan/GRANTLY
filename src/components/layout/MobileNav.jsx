import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  ClipboardList,
  FileCheck2,
  X
} from "lucide-react";
import { Sidebar } from "./Sidebar.jsx";
import { useScholarships } from "../../context/ScholarshipContext.jsx";

export function MobileDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <Sidebar onCloseMobile={onClose} />
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const { stats } = useScholarships();

  const items = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/explorer", label: "Explore", icon: Search },
    { to: "/match-dna", label: "Match DNA", icon: Sparkles, badge: stats.eligibleCount },
    { to: "/applications", label: "Track", icon: ClipboardList, badge: stats.activeApplicationsCount },
    { to: "/documents", label: "Docs", icon: FileCheck2 }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-xs font-semibold relative transition-colors ${
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
