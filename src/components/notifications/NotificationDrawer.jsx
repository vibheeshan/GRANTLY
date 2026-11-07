import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Sparkles,
  CheckCheck,
  Trash2,
  ExternalLink
} from "lucide-react";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { formatDate } from "../../utils/formatters.js";
import { Button } from "../ui/Button.jsx";

export function NotificationDrawer({ isOpen, onClose }) {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    stats
  } = useScholarships();

  const [activeTab, setActiveTab] = useState("ALL");

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "UNREAD") return !n.read;
    return n.category === activeTab.toLowerCase();
  });

  const getIcon = (category) => {
    switch (category) {
      case "deadline":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case "application":
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case "document":
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case "recommendation":
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-violet-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200/90 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Notification Center
              </h3>
              <p className="text-xs text-slate-400">
                {stats.unreadNotificationsCount} unread alert(s)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close notification panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Category Tabs */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            {["ALL", "UNREAD", "DEADLINE", "APPLICATION", "DOCUMENT"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark Read</span>
            </button>
          </div>
        </div>

        {/* Notification Feed */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                !notif.read
                  ? "bg-violet-50/50 dark:bg-violet-950/20 border-l-4 border-violet-600"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getIcon(notif.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold leading-tight ${
                      !notif.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                    }`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDate(notif.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="mt-2">
                      <Link
                        to={notif.link}
                        onClick={onClose}
                        className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredNotifs.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                You're all caught up!
              </p>
              <p>No notifications under selected filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={clearNotifications}
              className="text-xs text-slate-400 hover:text-rose-500 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all notifications</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
