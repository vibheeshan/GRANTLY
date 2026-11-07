import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Building2,
  Trash2,
  Edit3,
  ExternalLink,
  Check,
  X,
  FileText,
  Clock,
  Compass,
  Sparkles
} from "lucide-react";
import { Card } from "../ui/Card.jsx";
import { StatusBadge, APPLICATION_STATUSES } from "./StatusBadge.jsx";
import { Button } from "../ui/Button.jsx";
import { formatCurrency, formatDate, getDeadlineUrgency } from "../../utils/formatters.js";
import { useScholarships } from "../../context/ScholarshipContext.jsx";

export function ApplicationCard({ application }) {
  const {
    updateApplicationStatus,
    deleteApplication,
    openApplicationJourney,
    openMatchDna,
    allScholarships
  } = useScholarships();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(application.notes || "");
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const urgency = getDeadlineUrgency(application.deadline);
  const targetSch = allScholarships.find(s => s.id === application.scholarshipId);

  const milestones = application.milestones || [];
  const completedMilestones = milestones.filter(m => m.completed).length;

  const handleSaveNotes = () => {
    updateApplicationStatus(application.id, application.status, notesText);
    setIsEditingNotes(false);
  };

  const handleStatusSelect = (newStatus) => {
    updateApplicationStatus(application.id, newStatus);
    setIsChangingStatus(false);
  };

  return (
    <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate mb-0.5">
              <Building2 className="w-3.5 h-3.5" />
              {application.provider}
            </span>
            <Link
              to={`/scholarship/${application.scholarshipId}`}
              className="text-base font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-1 leading-snug font-heading"
            >
              {application.scholarshipTitle}
            </Link>
          </div>

          {!isConfirmingDelete ? (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete application"
              aria-label="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-lg border border-rose-200 dark:border-rose-900/60">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 px-1">Delete?</span>
              <button
                onClick={() => deleteApplication(application.id)}
                className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded cursor-pointer hover:bg-rose-700"
              >
                Yes
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="text-[10px] text-slate-500 px-1 py-0.5 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
              >
                No
              </button>
            </div>
          )}
        </div>

        {/* Amount & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-3 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Grant Amount
            </span>
            <span className="text-base font-extrabold text-violet-700 dark:text-violet-300 font-heading">
              {formatCurrency(application.awardAmount, application.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isChangingStatus ? (
              <div
                onClick={() => setIsChangingStatus(true)}
                className="cursor-pointer group flex items-center gap-1.5"
                title="Click to change status"
              >
                <StatusBadge status={application.status} size="sm" />
                <span className="text-[10px] text-violet-600 dark:text-violet-400 underline font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Change
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <select
                  value={application.status}
                  onChange={(e) => handleStatusSelect(e.target.value)}
                  className="text-xs py-1 px-2 rounded-lg border border-violet-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  autoFocus
                >
                  {APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsChangingStatus(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submission / Deadline Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Deadline: <strong>{formatDate(application.deadline)}</strong>
            </span>
          </div>
          <div className="text-right">
            <span className={urgency.isUrgent ? "text-amber-600 font-bold" : ""}>
              {urgency.text}
            </span>
          </div>
        </div>

        {/* Milestones Quick Counter */}
        <div className="mb-3 flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>{completedMilestones}/{milestones.length} Milestones Cleared</span>
          </span>
          <button
            onClick={() => openApplicationJourney(application)}
            className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            Open Journey Stepper →
          </button>
        </div>

        {/* Custom Application Notes */}
        <div className="mt-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes &amp; Action items
            </span>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-1.5">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                rows={2}
                placeholder="Add checklist notes, interview dates, submission numbers..."
              />
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setNotesText(application.notes || "");
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </Button>
                <Button size="xs" variant="primary" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          ) : (
            <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 italic text-[11px] min-h-[2.5rem]">
              {application.notes || "No notes added yet. Click edit to record application checklist or interview schedule."}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={() => {
            if (targetSch) openMatchDna(targetSch);
          }}
          className="text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-teal-500" />
          <span>Match DNA</span>
        </button>

        <button
          onClick={() => openApplicationJourney(application)}
          className="text-violet-600 dark:text-violet-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Manage Journey</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
}
