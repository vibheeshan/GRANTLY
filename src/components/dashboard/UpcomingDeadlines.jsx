import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ArrowRight,
  Clock,
  AlertTriangle,
  CalendarPlus,
  ChevronDown,
  Download,
  ExternalLink,
  Check
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { formatDate, formatCurrency, getDeadlineUrgency } from "../../utils/formatters.js";
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from "../../utils/links.js";
import { buildIcsEvent, downloadIcsFile } from "../../utils/ics.js";

export function UpcomingDeadlines({ scholarships = [] }) {
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState(null);

  // Sort by deadline date ascending
  const sorted = [...scholarships]
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  const handleDownloadIcs = (sch) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GRANTLY//Deadline//EN",
      buildIcsEvent({
        id: sch.id,
        title: sch.title,
        provider: sch.provider,
        deadline: sch.deadline,
        awardAmount: sch.awardAmount,
        currency: sch.currency || "INR",
        url: sch.applicationUrl || "https://grantly.app"
      }),
      "END:VCALENDAR"
    ].join("\r\n");

    downloadIcsFile(`deadline-${sch.id}.ics`, icsContent);
    setDownloadSuccessId(sch.id);
    setTimeout(() => setDownloadSuccessId(null), 2500);
    setActiveDropdownId(null);
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle subtitle="Prioritize imminent scholarship submissions">
          Upcoming Deadlines
        </CardTitle>
        <Link
          to="/calendar"
          className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Calendar</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardBody className="divide-y divide-slate-100 dark:divide-slate-800/80 p-0">
        {sorted.map((sch) => {
          const urgency = getDeadlineUrgency(sch.deadline);
          const isDropdownOpen = activeDropdownId === sch.id;
          const googleUrl = getGoogleCalendarUrl({
            title: sch.title,
            deadline: sch.deadline,
            provider: sch.provider,
            details: `Grant Award: ${sch.currency || "INR"} ${sch.awardAmount}. Official Deadline: ${sch.deadline}`
          });
          const outlookUrl = getOutlookCalendarUrl({
            title: sch.title,
            deadline: sch.deadline,
            provider: sch.provider,
            details: `Grant Award: ${sch.currency || "INR"} ${sch.awardAmount}. Official Deadline: ${sch.deadline}`
          });

          return (
            <div
              key={sch.id}
              className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-3 relative"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      urgency.isUrgent
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {urgency.text}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {sch.provider}
                  </span>
                </div>

                <Link
                  to={`/scholarship/${sch.id}`}
                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-1 block leading-snug"
                >
                  {sch.title}
                </Link>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {formatCurrency(sch.awardAmount, sch.currency)}
                  </span>
                  <span>•</span>
                  <span>Closes {formatDate(sch.deadline)}</span>
                </div>
              </div>

              {/* Actions & Calendar Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdownId(isDropdownOpen ? null : sch.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                    title="Add deadline to calendar"
                    aria-label="Add deadline to calendar"
                  >
                    <CalendarPlus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1E293B] shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        Add to Calendar
                      </div>
                      <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setActiveDropdownId(null)}
                        className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        <span>Google Calendar</span>
                      </a>
                      <a
                        href={outlookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setActiveDropdownId(null)}
                        className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                        <span>Outlook Web</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownloadIcs(sch)}
                        className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-500" />
                        <span>{downloadSuccessId === sch.id ? "Downloaded!" : "Download .ICS File"}</span>
                      </button>
                    </div>
                  )}
                </div>

                <Link to={`/scholarship/${sch.id}`}>
                  <Button size="xs" variant="outline">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No active upcoming deadlines found.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
