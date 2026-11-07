import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  Building2,
  Bookmark,
  Send,
  RotateCcw,
  FileCheck2,
  ArrowRight,
  Share2,
  Download,
  Check
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { formatCurrency, formatDate, getDeadlineUrgency } from "../utils/formatters.js";

export function ComparePage() {
  const {
    allScholarships,
    compareIds,
    compareScholarships,
    toggleCompareScholarship,
    clearCompare,
    openMatchDna,
    addApplication,
    isSaved,
    toggleSaveScholarship,
    documents,
    showToast
  } = useScholarships();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedToAdd, setSelectedToAdd] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync compareIds from URL on initial load if provided
  useEffect(() => {
    const paramIds = searchParams.get("compare");
    if (paramIds) {
      const ids = paramIds.split(",").filter(id => allScholarships.some(s => s.id === id));
      ids.slice(0, 3).forEach(id => {
        if (!compareIds.includes(id)) {
          toggleCompareScholarship(id);
        }
      });
    }
  }, []);

  const availableToAdd = allScholarships.filter(s => !compareIds.includes(s.id));

  const handleAddSelect = (e) => {
    const id = e.target.value;
    if (id) {
      toggleCompareScholarship(id);
      setSelectedToAdd("");
    }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/compare?compare=${compareIds.join(",")}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      showToast("Comparison link copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      showToast("Could not copy link to clipboard.", "warning");
    });
  };

  const handleExportShortlist = () => {
    if (compareScholarships.length === 0) return;
    const exportData = {
      exportedAt: new Date().toISOString(),
      source: "GRANTLY Comparison Studio",
      count: compareScholarships.length,
      scholarships: compareScholarships.map(s => ({
        id: s.id,
        title: s.title,
        provider: s.provider,
        awardAmount: s.awardAmount,
        currency: s.currency,
        deadline: s.deadline,
        matchScore: s.matchScore,
        isFullyEligible: s.isFullyEligible,
        minimumPercentage: s.minimumPercentage,
        maximumFamilyIncome: s.maximumFamilyIncome,
        stackable: s.stackable,
        stackableRule: s.stackableRule,
        requiredDocuments: s.requiredDocuments
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grantly_shortlist_comparison_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Shortlist exported as JSON.", "success");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side Comparison Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Scholarship Comparison Studio
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Evaluate funding amounts, Match DNA scores, academic ceilings, stackability rules, and required documentation side by side.
          </p>
        </div>

        {compareScholarships.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
              icon={copiedLink ? Check : Share2}
            >
              {copiedLink ? "Link Copied" : "Share Matrix"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportShortlist}
              icon={Download}
            >
              Export Shortlist
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
              icon={RotateCcw}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Selector Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Selected Opportunities:
          </span>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
            {compareScholarships.length} / 3 Max
          </span>
        </div>

        {compareScholarships.length < 3 && availableToAdd.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedToAdd}
              onChange={handleAddSelect}
              className="text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 max-w-xs truncate"
            >
              <option value="">+ Add scholarship to compare...</option>
              {availableToAdd.map(sch => (
                <option key={sch.id} value={sch.id}>
                  {sch.title} ({formatCurrency(sch.awardAmount, sch.currency)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Grid Matrix */}
      {compareScholarships.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[750px] space-y-4">
            {/* Header Columns */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Evaluation Metric
              </div>

              {compareScholarships.map(sch => {
                const saved = isSaved(sch.id);
                const urgency = getDeadlineUrgency(sch.deadline);

                return (
                  <Card key={sch.id} className="p-4 flex flex-col justify-between relative group">
                    <button
                      onClick={() => toggleCompareScholarship(sch.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-2 pr-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                        {sch.provider}
                      </span>
                      <Link
                        to={`/scholarship/${sch.id}`}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-violet-600 block line-clamp-2 leading-tight"
                      >
                        {sch.title}
                      </Link>
                      <div className="flex items-center gap-1.5">
                        {sch.isFullyEligible ? (
                          <Badge variant="teal" size="sm" dot>
                            100% Eligible
                          </Badge>
                        ) : (
                          <Badge variant="amber" size="sm">
                            {sch.matchScore}% Match
                          </Badge>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {urgency.text}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => openMatchDna(sch)}
                        icon={Sparkles}
                      >
                        DNA
                      </Button>
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => addApplication(sch)}
                      >
                        Track
                      </Button>
                    </div>
                  </Card>
                );
              })}

              {/* Blank placeholder slots if < 3 */}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div
                  key={`blank-${i}`}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-2"
                >
                  <Plus className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  <span>Select scholarship to compare</span>
                </div>
              ))}
            </div>

            {/* Matrix Row 0: Best Value & Auto Pros/Cons Highlight */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50/70 to-teal-50/70 dark:from-violet-950/20 dark:to-teal-950/20 border border-violet-200/80 dark:border-violet-800/80 text-xs items-center shadow-xs">
              <div className="font-bold text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Advantage Analysis</span>
              </div>
              {compareScholarships.map(sch => {
                const maxAward = Math.max(...compareScholarships.map(s => s.awardAmount));
                const isHighestAward = sch.awardAmount === maxAward && compareScholarships.length > 1;
                const isBestMatch = sch.isFullyEligible;

                return (
                  <div key={sch.id} className="space-y-1">
                    {isHighestAward && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 mr-1">
                        ★ Highest Award
                      </span>
                    )}
                    {isBestMatch && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                        ✓ 100% Fit
                      </span>
                    )}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                      {sch.stackable ? "✓ Freely stackable with college waivers." : "⚠️ Mutually exclusive with other state grants."}
                    </p>
                  </div>
                );
              })}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 1: Funding Amount */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Annual Award Amount
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="text-base font-extrabold text-violet-700 dark:text-violet-300 font-heading">
                  {formatCurrency(sch.awardAmount, sch.currency)}
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 2: Match DNA Score */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Match DNA Score
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {sch.isFullyEligible ? "100%" : `${sch.matchScore}%`}
                  </span>
                  <button
                    onClick={() => openMatchDna(sch)}
                    className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                  >
                    View Radar
                  </button>
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 3: Minimum Percentage Required */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Min Academic Score
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="text-slate-800 dark:text-slate-200 font-semibold">
                  {sch.minimumPercentage}% Marks
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 4: Maximum Family Income Ceiling */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Max Income Ceiling
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="text-slate-800 dark:text-slate-200 font-semibold">
                  ₹{sch.maximumFamilyIncome.toLocaleString("en-IN")}/yr
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 5: Eligible Courses */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Eligible Disciplines
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="text-slate-600 dark:text-slate-300 text-[11px] leading-tight">
                  {sch.eligibleCourses.join(", ")}
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 6: State Domicile */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                State Domicile Quota
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="text-slate-800 dark:text-slate-200 font-semibold">
                  {sch.states.join(", ")}
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 7: Stackability Rules */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Stackability Policy
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="space-y-1">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    sch.stackable ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}>
                    {sch.stackable ? "Stackable" : "Restrictions Apply"}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {sch.stackableRule || "Subject to foundation verification."}
                  </p>
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 8: Document Requirements */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-start shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Required Certificates
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="space-y-1.5 text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {sch.requiredDocuments.length} Documents Required:
                  </span>
                  {sch.requiredDocuments.map((doc, idx) => {
                    const isReady = documents.some(d => d.name.toLowerCase().includes(doc.toLowerCase()) && d.isReady);
                    return (
                      <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                        {isReady ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <span className={isReady ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400"}>
                          {doc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>

            {/* Matrix Row 9: Deadline */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs items-center shadow-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Submission Deadline
              </div>
              {compareScholarships.map(sch => (
                <div key={sch.id} className="font-bold text-slate-900 dark:text-white">
                  {formatDate(sch.deadline)}
                </div>
              ))}
              {Array.from({ length: 3 - compareScholarships.length }).map((_, i) => (
                <div key={i} className="text-slate-300">—</div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={Layers}
          title="No scholarships currently in comparison"
          description="Select scholarships from the Explorer or choose from the dropdown above to compare funding awards, eligibility rules, and required certificates side-by-side."
          actionLabel="Browse Scholarship Catalog"
          onAction={() => window.location.href = "/explorer"}
          actionIcon={ArrowRight}
        />
      )}
    </div>
  );
}
