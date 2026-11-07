import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  Plus,
  Send,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Modal } from "../ui/Modal.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { StatusBadge, APPLICATION_STATUSES } from "./StatusBadge.jsx";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { useScholarships } from "../../context/ScholarshipContext.jsx";

export function ApplicationJourneyModal({ application, isOpen, onClose }) {
  const {
    allScholarships,
    documents,
    toggleDocumentReady,
    toggleApplicationMilestone,
    updateApplicationStatus
  } = useScholarships();

  const [newLogText, setNewLogText] = useState("");

  if (!application || !isOpen) return null;

  const targetSch = allScholarships.find(s => s.id === application.scholarshipId);
  const requiredDocs = targetSch?.requiredDocuments || [];

  const milestones = application.milestones || [];
  const completedMilestones = milestones.filter(m => m.completed).length;

  // Calculate required docs ready for this application
  let readyDocsCount = 0;
  requiredDocs.forEach(reqDocName => {
    const isReady = documents.some(d =>
      (d.name.toLowerCase().includes(reqDocName.toLowerCase()) ||
       reqDocName.toLowerCase().includes(d.name.toLowerCase())) &&
      d.isReady
    );
    if (isReady) readyDocsCount++;
  });

  const totalSteps = milestones.length + requiredDocs.length;
  const completedSteps = completedMilestones + readyDocsCount;
  const journeyProgressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    updateApplicationStatus(application.id, application.status, newLogText.trim());
    setNewLogText("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Journey &amp; Milestones"
      subtitle={`Submission pipeline for ${application.scholarshipTitle}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Progress Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {application.provider}
              </span>
              <StatusBadge status={application.status} size="sm" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              {application.scholarshipTitle}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Award: <strong>{formatCurrency(application.awardAmount, application.currency)}</strong> • Deadline: {formatDate(application.deadline)}
            </p>
          </div>

          <div className="text-right shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Dossier &amp; Milestone Completion
            </span>
            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-heading">
              {journeyProgressPct}%
            </span>
            <div className="w-full sm:w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${journeyProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestone Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Application Milestones
            </span>
            <span className="text-xs text-slate-400">
              {completedMilestones} of {milestones.length} completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleApplicationMilestone(application.id, m.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  m.completed
                    ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-violet-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                    m.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600"
                  }`}>
                    {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`font-semibold truncate ${m.completed ? "line-through opacity-80" : ""}`}>
                    {m.label}
                  </span>
                </div>

                {m.date && (
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {formatDate(m.date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scholarship Document Dossier Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Required Dossier Documents ({readyDocsCount}/{requiredDocs.length} Verified)
            </span>
            <Link to="/documents" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
              Open Document Manager
            </Link>
          </div>

          <div className="space-y-2">
            {requiredDocs.map((docName, idx) => {
              const matchedUserDoc = documents.find(d =>
                d.name.toLowerCase().includes(docName.toLowerCase()) ||
                docName.toLowerCase().includes(d.name.toLowerCase())
              );
              const isReady = Boolean(matchedUserDoc?.isReady);

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isReady ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block truncate">
                        {docName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {matchedUserDoc?.fileDetails || (isReady ? "Verified on file" : "Pending upload or verification")}
                      </span>
                    </div>
                  </div>

                  {matchedUserDoc && (
                    <button
                      onClick={() => toggleDocumentReady(matchedUserDoc.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        isReady
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                      }`}
                    >
                      {isReady ? "Verified" : "Mark Ready"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* History Timeline Log */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Status Transition History
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {(application.history || []).map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Stage: {h.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(h.date)}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    {h.note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Note Append Form */}
          <form onSubmit={handleAddLog} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newLogText}
              onChange={(e) => setNewLogText(e.target.value)}
              placeholder="Add note or milestone log entry..."
              className="flex-1 text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <Button type="submit" variant="primary" size="xs">
              Log Note
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
