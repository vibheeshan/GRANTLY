import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  CheckCircle2,
  Clock,
  Send,
  Award,
  Bookmark,
  XCircle,
  FileCheck2,
  Calendar,
  Building2,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency, formatDate, getDaysRemaining } from "../utils/formatters.js";

const JOURNEY_STAGES = [
  { id: "Discovered", label: "1. Discovered", description: "Identified via Match DNA or Explorer" },
  { id: "Saved", label: "2. Saved", description: "Shortlisted in student bookmarks" },
  { id: "Applying", label: "3. Preparing", description: "Drafting essays & assembling records" },
  { id: "Documents Ready", label: "4. Documents Ready", description: "All required certificates verified" },
  { id: "Submitted", label: "5. Submitted", description: "Formally dispatched on provider portal" },
  { id: "Under Review", label: "6. Under Review", description: "Scrutiny committee evaluation" },
  { id: "Awarded", label: "7. Awarded / Decision", description: "Disbursement or formal outcome" }
];

export function ApplicationJourneyPage() {
  const {
    applications,
    allScholarships,
    documents,
    updateApplicationStatus,
    toggleApplicationMilestone
  } = useScholarships();

  const [selectedAppId, setSelectedAppId] = useState(() => applications[0]?.id || "");

  const activeApp = applications.find(a => a.id === selectedAppId) || applications[0];
  const targetScholarship = allScholarships.find(s => s.id === activeApp?.scholarshipId);

  // Map application status to stage index
  const getStageIndex = (status) => {
    switch (status) {
      case "Saved": return 1;
      case "Applying": return 2;
      case "Submitted": return 4;
      case "Under Review": return 5;
      case "Awarded":
      case "Rejected": return 6;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(activeApp?.status);

  // Calculate milestones completed
  const milestones = activeApp?.milestones || [];
  const completedMilestones = milestones.filter(m => m.completed).length;
  const progressPct = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  // Document readiness for this application
  const requiredDocs = targetScholarship?.requiredDocuments || [];
  const readyDocs = requiredDocs.filter(reqDoc =>
    documents.some(d => d.name.toLowerCase().includes(reqDoc.toLowerCase()) && d.isReady)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Application Journey Timeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Submission Journey &amp; Milestones
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Track each application's complete lifecycle—from initial discovery and dossier preparation to formal submission and final award disbursement.
          </p>
        </div>

        {/* Application Selector */}
        {applications.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full sm:w-72 text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#6957E8]/20 truncate"
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.scholarshipTitle || app.title} ({app.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeApp ? (
        <div className="space-y-6">
          {/* Active Application Overview Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400 font-semibold">{activeApp.provider}</span>
                  <Badge variant="teal" size="sm">
                    {activeApp.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  {activeApp.scholarshipTitle || activeApp.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Award: <strong className="text-violet-700 dark:text-violet-300">{formatCurrency(activeApp.awardAmount, activeApp.currency)}</strong> • Deadline: {formatDate(activeApp.deadline)} ({getDaysRemaining(activeApp.deadline)} days left)
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Milestone Completion
                </span>
                <span className="text-3xl font-extrabold text-[#6957E8] dark:text-[#A78BFA] font-heading">
                  {progressPct}%
                </span>
              </div>
            </div>

            {/* 7-Stage Horizontal Stepper */}
            <div className="pt-6 overflow-x-auto pb-2">
              <div className="min-w-[650px] grid grid-cols-7 gap-2 relative">
                {JOURNEY_STAGES.map((stg, idx) => {
                  const isCompleted = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={stg.id} className="flex flex-col items-center text-center space-y-2 relative">
                      {/* Step Indicator Circle */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? "bg-[#6957E8] text-white shadow-sm ring-4 ring-[#6957E8]/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <span className={`text-[11px] font-bold block leading-tight ${
                          isCurrent ? "text-[#6957E8] dark:text-[#A78BFA]" : "text-slate-700 dark:text-slate-300"
                        }`}>
                          {stg.label.split(". ")[1]}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5 max-w-[90px] leading-snug">
                          {stg.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Grid: Interactive Milestones & Activity History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Milestones Stepper Checklist (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    Application Milestones Checklist
                  </h4>
                  <span className="text-xs text-slate-400">
                    {completedMilestones} of {milestones.length} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleApplicationMilestone(activeApp.id, m.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        m.completed
                          ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                          m.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600"
                        }`}>
                          {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`font-semibold ${m.completed ? "line-through opacity-80" : ""}`}>
                          {m.label}
                        </span>
                      </div>

                      {m.date && (
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {formatDate(m.date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Status Switcher Toolbar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Update Stage:</span>
                  <select
                    value={activeApp.status}
                    onChange={(e) => updateApplicationStatus(activeApp.id, e.target.value)}
                    className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applying">Preparing</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </Card>

              {/* Required Documents Callout */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    Dossier Verification ({readyDocs.length}/{requiredDocs.length})
                  </h4>
                  <Link to="/documents" className="text-xs text-[#6957E8] dark:text-[#A78BFA] hover:underline font-semibold">
                    Document Center →
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {requiredDocs.map((docName, idx) => {
                    const isReady = documents.some(d => d.name.toLowerCase().includes(docName.toLowerCase()) && d.isReady);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                        <span className="text-slate-700 dark:text-slate-300">{docName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isReady ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}>
                          {isReady ? "Verified ✓" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right: Activity History Log (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    Stage Transition History
                  </h4>
                  <Badge variant="neutral" size="sm">
                    {(activeApp.history || []).length} Events
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1">
                  {(activeApp.history || []).map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Stage: {h.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(h.date)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {h.note}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-400 text-sm">
          No applications currently tracked. Visit the Explorer to start your first submission journey!
        </Card>
      )}
    </div>
  );
}
