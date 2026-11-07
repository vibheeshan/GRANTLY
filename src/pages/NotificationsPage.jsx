import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck2,
  Send,
  Trash2,
  Check,
  Filter,
  ArrowRight,
  Bookmark
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatDate } from "../utils/formatters.js";

const CATEGORIES = [
  { id: "ALL", label: "All Alerts" },
  { id: "UNREAD", label: "Unread" },
  { id: "recommendation", label: "Matches" },
  { id: "deadline", label: "Deadlines" },
  { id: "application", label: "Applications" },
  { id: "document", label: "Documents" }
];

export function NotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications
  } = useScholarships();

  const [activeCategory, setActiveCategory] = useState("ALL");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === "ALL") return true;
    if (activeCategory === "UNREAD") return !n.read;
    return n.category === activeCategory;
  });

  const getCategoryBadge = (category) => {
    switch (category) {
      case "deadline":
        return <Badge variant="amber" size="xs">Deadline Alert</Badge>;
      case "application":
        return <Badge variant="blue" size="xs">Application</Badge>;
      case "document":
        return <Badge variant="teal" size="xs">Document Dossier</Badge>;
      case "recommendation":
        return <Badge variant="purple" size="xs">Match DNA</Badge>;
      default:
        return <Badge variant="neutral" size="xs">System Notice</Badge>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Real-Time Alert Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Notification Center 2.0
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay informed with automated alerts on deadline proximity, document requirements, and Match DNA recalculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Check}
              onClick={markAllNotificationsAsRead}
            >
              Mark all read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={clearNotifications}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#6957E8] text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {cat.label}
              {cat.id === "UNREAD" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-teal-400 text-slate-900 font-bold text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => markNotificationAsRead(notif.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              !notif.read
                ? "bg-violet-50/40 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/60 shadow-xs"
                : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                !notif.read ? "bg-[#6957E8]" : "bg-transparent"
              }`} />

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(notif.category)}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(notif.timestamp)}
                  </span>
                </div>

                <h4 className={`text-sm font-bold leading-snug ${
                  !notif.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                }`}>
                  {notif.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>

            {notif.link && (
              <Link to={notif.link} className="shrink-0">
                <Button size="xs" variant="outline" icon={ArrowRight} iconPosition="right">
                  Open
                </Button>
              </Link>
            )}
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <Card className="p-12 text-center text-slate-400 text-sm space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p>No notifications found in this view.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
