import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bookmark,
  Send,
  FileCheck2,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { formatDate } from "../utils/formatters.js";

const ACTIVITY_FILTERS = [
  { id: "ALL", label: "All Activity" },
  { id: "saved", label: "Bookmarks" },
  { id: "application", label: "Applications" },
  { id: "document", label: "Documents" },
  { id: "profile", label: "Profile" }
];

export function ActivityFeedPage() {
  const { activities } = useScholarships();
  const [activeFilter, setActiveFilter] = useState("ALL");

  const getActivityIcon = (type) => {
    switch (type) {
      case "saved":
      case "unsaved":
        return <Bookmark className="w-4 h-4 text-violet-500" />;
      case "application_created":
      case "status_change":
      case "application_removed":
        return <Send className="w-4 h-4 text-blue-500" />;
      case "document_checked":
        return <FileCheck2 className="w-4 h-4 text-teal-500" />;
      case "profile_update":
        return <User className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredActivities = activities.filter(act => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "saved") return act.type.includes("saved");
    if (activeFilter === "application") return act.type.includes("application") || act.type.includes("status");
    if (activeFilter === "document") return act.type.includes("document");
    if (activeFilter === "profile") return act.type.includes("profile");
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
          <Activity className="w-3.5 h-3.5" />
          <span>Local Audit Trail</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Interaction &amp; Activity Feed
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete chronological record of all local interactions: scholarship saves, application status updates, dossier verifications, and profile adjustments.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ACTIVITY_FILTERS.map(f => {
          const isSelected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#6957E8] text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Activity Timeline List */}
      <Card className="p-6">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
          {filteredActivities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 z-10 shadow-xs">
                {getActivityIcon(act.type)}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight font-heading">
                    {act.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(act.timestamp)}
                  </span>
                </div>

                {act.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {act.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent activities recorded under this filter.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
