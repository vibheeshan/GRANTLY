import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Bookmark, Building2, CheckCircle2, Layers, ThumbsUp, ThumbsDown, X, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { useScholarships } from "../../context/ScholarshipContext.jsx";

export function RecommendedScholarships({ scholarships = [] }) {
  const {
    isSaved,
    toggleSaveScholarship,
    openMatchDna,
    compareIds,
    toggleCompareScholarship,
    recordRecommendationFeedback,
    showToast
  } = useScholarships();

  const [dismissedIds, setDismissedIds] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [lastDismissed, setLastDismissed] = useState(null);

  const visibleScholarships = scholarships
    .filter(s => !dismissedIds.includes(s.id))
    .slice(0, 3);

  const handleFeedback = (scholarshipId, isPositive) => {
    setFeedbackMap(prev => ({ ...prev, [scholarshipId]: isPositive }));
    if (recordRecommendationFeedback) {
      recordRecommendationFeedback(scholarshipId, isPositive);
    }
    showToast(
      isPositive ? "Thanks! We will recommend more opportunities like this." : "Feedback recorded. We will refine future matches.",
      "info"
    );
  };

  const handleDismiss = (sch) => {
    setDismissedIds(prev => [...prev, sch.id]);
    setLastDismissed(sch);
    showToast(`Dismissed "${sch.title.slice(0, 20)}...". Click Undo to restore.`, "info");
  };

  const handleUndoDismiss = () => {
    if (!lastDismissed) return;
    setDismissedIds(prev => prev.filter(id => id !== lastDismissed.id));
    showToast(`Restored "${lastDismissed.title.slice(0, 20)}..."`, "success");
    setLastDismissed(null);
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle subtitle="Curated based on your degree, state, and academic percentage">
            Recommended Opportunities
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {lastDismissed && (
            <button
              onClick={handleUndoDismiss}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo Dismiss</span>
            </button>
          )}
          <Link
            to="/matcher"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Matcher</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>

      <CardBody className="space-y-3.5 p-4 sm:p-5">
        {visibleScholarships.map((sch) => {
          const saved = isSaved(sch.id);
          const isCompared = compareIds.includes(sch.id);
          const isEligible = sch.isFullyEligible;
          const score = sch.matchScore || 0;
          const currentFeedback = feedbackMap[sch.id];

          return (
            <div
              key={sch.id}
              className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-300 dark:hover:border-violet-700/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs relative group"
            >
              <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                <div className="flex items-center gap-2 mb-1">
                  {isEligible ? (
                    <Badge variant="teal" size="sm" dot>
                      100% Eligible
                    </Badge>
                  ) : (
                    <Badge variant="amber" size="sm">
                      {score}% Match
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400 truncate">
                    {sch.provider}
                  </span>
                </div>

                <Link
                  to={`/scholarship/${sch.id}`}
                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-1 font-heading"
                >
                  {sch.title}
                </Link>

                <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-violet-700 dark:text-violet-300">
                    {formatCurrency(sch.awardAmount, sch.currency)}
                  </span>
                  <span>•</span>
                  <span>Deadline: {formatDate(sch.deadline)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                {/* Thumbs Feedback */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 mr-1">
                  <button
                    onClick={() => handleFeedback(sch.id, true)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      currentFeedback === true
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "text-slate-400 hover:text-emerald-600"
                    }`}
                    title="Good recommendation"
                    aria-label="Thumbs up recommendation"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(sch.id, false)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      currentFeedback === false
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : "text-slate-400 hover:text-rose-600"
                    }`}
                    title="Not relevant"
                    aria-label="Thumbs down recommendation"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => openMatchDna(sch)}
                  icon={Sparkles}
                  title="Inspect Match DNA"
                >
                  DNA
                </Button>

                <button
                  onClick={() => toggleCompareScholarship(sch.id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isCompared
                      ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                      : "border-slate-200 text-slate-400 hover:text-slate-600 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={isCompared ? "In comparison" : "Add to comparison"}
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => toggleSaveScholarship(sch.id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    saved
                      ? "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800"
                      : "border-slate-200 text-slate-400 hover:text-slate-600 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={saved ? "Remove bookmark" : "Save opportunity"}
                  aria-label="Toggle bookmark"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
                </button>

                <button
                  onClick={() => handleDismiss(sch)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Dismiss recommendation"
                  aria-label="Dismiss recommendation"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <Link to={`/scholarship/${sch.id}`}>
                  <Button size="xs" variant="primary">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}

        {visibleScholarships.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400 space-y-2">
            <p>All recommendations in this view have been dismissed or filtered.</p>
            {lastDismissed && (
              <button
                onClick={handleUndoDismiss}
                className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline cursor-pointer"
              >
                Restore dismissed opportunities
              </button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
