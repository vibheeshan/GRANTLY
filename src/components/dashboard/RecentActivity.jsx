import React from "react";
import { CheckCircle2, Bookmark, FileText, ArrowRight, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card.jsx";
import { formatDate } from "../../utils/formatters.js";

export function RecentActivity({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "saved":
      case "unsaved":
        return <Bookmark className="w-3.5 h-3.5 text-violet-500" />;
      case "document_checked":
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />;
      case "status_change":
      case "application_created":
        return <Activity className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle subtitle="Audit log of your interactions &amp; status changes">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardBody className="p-4 sm:p-5">
        <div className="space-y-4">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getIcon(act.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {act.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {act.subtitle}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {formatDate(act.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No recent activity recorded yet.
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
