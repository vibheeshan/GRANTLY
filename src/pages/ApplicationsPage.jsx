import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Award,
  Bookmark,
  XCircle,
  Inbox,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  Calendar,
  Building2,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Layers,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  CheckSquare,
  Square,
  Search,
  X,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileJson,
  Printer
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { ApplicationCard } from "../components/applications/ApplicationCard.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { formatCurrency, formatDate, getDaysRemaining } from "../utils/formatters.js";
import { exportApplicationsToCsv, downloadCsv } from "../utils/csv.js";
import { exportAllGrantlyData } from "../utils/storage.js";

const KANBAN_COLUMNS = [
  { id: "Saved", label: "Saved", color: "border-slate-300 dark:border-slate-700", countBadge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  { id: "Applying", label: "Preparing", color: "border-blue-400 dark:border-blue-600", countBadge: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" },
  { id: "Submitted", label: "Submitted", color: "border-amber-400 dark:border-amber-600", countBadge: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" },
  { id: "Under Review", label: "Under Review", color: "border-purple-400 dark:border-purple-600", countBadge: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300" },
  { id: "Awarded", label: "Awarded", color: "border-emerald-400 dark:border-emerald-600", countBadge: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" },
  { id: "Rejected", label: "Rejected", color: "border-rose-400 dark:border-rose-600", countBadge: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" }
];

export function ApplicationsPage() {
  const {
    applications,
    allScholarships,
    addApplication,
    updateApplicationStatus,
    openApplicationJourney,
    deleteApplication,
    cloneApplication,
    toggleArchiveApplication,
    bulkUpdateApplicationStatus,
    bulkDeleteApplications,
    stats
  } = useScholarships();

  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "list"
  const [filterQuery, setFilterQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState("");
  const [initialNotes, setInitialNotes] = useState("");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleExportApplicationsCsv = () => {
    const csv = exportApplicationsToCsv(applications);
    downloadCsv(`grantly_applications_${Date.now()}.csv`, csv);
    setIsExportMenuOpen(false);
  };

  const handleExportJsonBackup = () => {
    const jsonStr = exportAllGrantlyData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grantly_applications_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handlePrintSummary = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  // Sum of awarded grants
  const awardedTotal = applications
    .filter(a => a.status === "Awarded" && !a.archived)
    .reduce((sum, a) => sum + (Number(a.awardAmount) || 0), 0);

  // Available scholarships not already tracked
  const availableToTrack = allScholarships.filter(
    sch => !applications.some(app => app.scholarshipId === sch.id)
  );

  const handleCreateApplication = (e) => {
    e.preventDefault();
    if (!selectedScholarshipId) return;
    const target = allScholarships.find(s => s.id === selectedScholarshipId);
    if (target) {
      addApplication(target, initialNotes);
      setIsAddModalOpen(false);
      setSelectedScholarshipId("");
      setInitialNotes("");
    }
  };

  const filteredApps = applications.filter((app) => {
    const isArchivedMatch = showArchived ? Boolean(app.archived) : !app.archived;
    if (!isArchivedMatch) return false;
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      (app.scholarshipTitle || app.title || "").toLowerCase().includes(q) ||
      (app.provider || "").toLowerCase().includes(q) ||
      (app.notes && app.notes.toLowerCase().includes(q))
    );
  });

  const toggleSelectApp = (id) => {
    setSelectedAppIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map(a => a.id));
    }
  };

  const handleBulkStatus = (status) => {
    bulkUpdateApplicationStatus(selectedAppIds, status);
    setSelectedAppIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedAppIds.length} application(s)?`)) {
      bulkDeleteApplications(selectedAppIds);
      setSelectedAppIds([]);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white font-heading tracking-tight">
            My Applications
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            End-to-end scholarship pipeline. Track preparation, official submission, document scrutiny, and awards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Archive Toggle */}
          <button
            onClick={() => {
              setShowArchived(!showArchived);
              setSelectedAppIds([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showArchived
                ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {showArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            <span>{showArchived ? "Viewing Archived" : "View Archived"}</span>
          </button>

          {/* View Mode Toggle: Kanban vs List */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-[#151F33] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#151F33] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E293B] shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Export Pipeline Data
                </div>
                <button
                  type="button"
                  onClick={handleExportApplicationsCsv}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export to CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJsonBackup}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5 text-violet-500" />
                  <span>Backup to JSON (v2.1)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSummary}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Print Summary View / PDF</span>
                </button>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              if (availableToTrack.length > 0) {
                setSelectedScholarshipId(availableToTrack[0].id);
              }
              setIsAddModalOpen(true);
            }}
          >
            Track Application
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Pipeline Volume
          </span>
          <span className="text-2xl font-extrabold text-[#172033] dark:text-white font-heading mt-1 block tabular-nums">
            {applications.filter(a => !a.archived).length} Tracked
          </span>
          <span className="text-xs text-slate-500">Active submissions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            In Preparation
          </span>
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-heading mt-1 block tabular-nums">
            {applications.filter(a => a.status === "Applying" && !a.archived).length} Drafting
          </span>
          <span className="text-xs text-slate-500">Readying documents</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Under Review
          </span>
          <span className="text-2xl font-extrabold text-[#6C5CE7] dark:text-[#A78BFA] font-heading mt-1 block tabular-nums">
            {applications.filter(a => (a.status === "Under Review" || a.status === "Submitted") && !a.archived).length} In Scrutiny
          </span>
          <span className="text-xs text-slate-500">Portal evaluation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Secured Grants
          </span>
          <span className="text-2xl font-extrabold text-[#14B8A6] dark:text-[#2DD4BF] font-heading mt-1 block tabular-nums">
            {formatCurrency(awardedTotal)}
          </span>
          <span className="text-xs text-slate-500">
            {applications.filter(a => a.status === "Awarded" && !a.archived).length} grant(s) won
          </span>
        </div>
      </div>

      {/* Filter & Bulk Actions Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search applications by title, provider, notes..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={selectAllFiltered}
            className="text-xs text-slate-600 dark:text-slate-300 hover:text-violet-600 flex items-center gap-1 font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {selectedAppIds.length === filteredApps.length && filteredApps.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-violet-600" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span>Select All ({selectedAppIds.length})</span>
          </button>

          {selectedAppIds.length > 0 && (
            <>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkStatus(e.target.value);
                }}
                defaultValue=""
                className="text-xs py-1.5 px-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none"
              >
                <option value="" disabled>Move {selectedAppIds.length} to...</option>
                {KANBAN_COLUMNS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              <button
                onClick={handleBulkDelete}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors"
                title={`Delete ${selectedAppIds.length} selected`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const colApps = filteredApps.filter(a => a.status === col.id);
            const colAmount = colApps.reduce((sum, a) => sum + (Number(a.awardAmount) || 0), 0);

            return (
              <div
                key={col.id}
                className="rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-[#E8EAF2] dark:border-[#27334A] p-3 flex flex-col min-h-[30rem] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                      {col.label}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.countBadge}`}>
                      {colApps.length}
                    </span>
                  </div>

                  {colAmount > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                      ₹{(colAmount / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>

                {/* Column Application Cards */}
                <div className="flex-1 space-y-3">
                  {colApps.map((app) => {
                    const daysLeft = getDaysRemaining(app.deadline);
                    const completedMilestones = app.milestones ? app.milestones.filter(m => m.completed).length : 2;
                    const totalMilestones = app.milestones ? app.milestones.length : 5;
                    const progressPct = Math.round((completedMilestones / totalMilestones) * 100);
                    const isSelected = selectedAppIds.includes(app.id);

                    return (
                      <div
                        key={app.id}
                        className={`p-3.5 rounded-xl bg-white dark:bg-[#151F33] border shadow-2xs hover:shadow-sm transition-all space-y-2.5 group relative ${
                          isSelected
                            ? "border-violet-500 ring-2 ring-violet-500/20"
                            : "border-[#E8EAF2] dark:border-[#27334A]"
                        }`}
                      >
                        {/* Select Checkbox & Provider */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              onClick={() => toggleSelectApp(app.id)}
                              className="text-slate-400 hover:text-violet-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-3.5 h-3.5 text-violet-600" />
                              ) : (
                                <Square className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="text-[10px] font-semibold text-slate-400 truncate block">
                              {app.provider}
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#6C5CE7] dark:text-[#A78BFA] tabular-nums shrink-0">
                            {formatCurrency(app.awardAmount, app.currency)}
                          </span>
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => openApplicationJourney(app)}
                          className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#6C5CE7] dark:hover:text-[#A78BFA] cursor-pointer leading-snug"
                        >
                          {app.scholarshipTitle || app.title}
                        </h4>

                        {/* Progress Stepper Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Progress</span>
                            <span className="font-bold tabular-nums">{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#14B8A6] rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Next Action Box */}
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[10px] text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">Next Action:</span>
                          <p className="truncate mt-0.5">{app.notes || "Compile bonafide and transcripts."}</p>
                        </div>

                        {/* Deadline & Status Switcher Footer */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{daysLeft}d left</span>
                          </span>

                          {/* Quick Stage Select */}
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                            className="text-[10px] py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                          >
                            {KANBAN_COLUMNS.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Action Buttons: Journey, Clone, Archive */}
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <button
                            onClick={() => openApplicationJourney(app)}
                            className="text-left font-bold text-[#6C5CE7] dark:text-[#A78BFA] hover:underline cursor-pointer"
                          >
                            Milestones →
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => cloneApplication(app.id)}
                              className="p-1 text-slate-400 hover:text-violet-600 cursor-pointer"
                              title="Clone application"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => toggleArchiveApplication(app.id)}
                              className="p-1 text-slate-400 hover:text-amber-600 cursor-pointer"
                              title={app.archived ? "Unarchive" : "Archive"}
                            >
                              {app.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => deleteApplication(app.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Delete application"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div className="h-28 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                      No cards
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}

      {/* Add New Application Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Track a Scholarship"
        subtitle="Select an opportunity to monitor in your application journey"
      >
        <form onSubmit={handleCreateApplication} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Select Opportunity
            </label>
            {availableToTrack.length > 0 ? (
              <select
                value={selectedScholarshipId}
                onChange={(e) => setSelectedScholarshipId(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                required
              >
                {availableToTrack.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.title} — {formatCurrency(sch.awardAmount, sch.currency)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-500">
                All demonstration scholarships are already tracked in your pipeline!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Initial Notes / Next Action
            </label>
            <textarea
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              placeholder="e.g. Need to request income certificate from Tahsildar..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={availableToTrack.length === 0}
            >
              Add to Pipeline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
