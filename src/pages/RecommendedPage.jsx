import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ThumbsUp,
  Bookmark,
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Filter,
  Percent,
  Wallet,
  Clock
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency, formatDate, getDaysRemaining } from "../utils/formatters.js";

export function RecommendedPage() {
  const {
    allScholarships,
    studentProfile,
    isSaved,
    toggleSaveScholarship,
    openMatchDna,
    compareIds,
    toggleCompareScholarship,
    addApplication
  } = useScholarships();

  // Ranked scholarships based on eligibility and match score
  const recommendedList = [...allScholarships].sort((a, b) => {
    if (a.isFullyEligible && !b.isFullyEligible) return -1;
    if (!a.isFullyEligible && b.isFullyEligible) return 1;
    return (b.matchScore || 0) - (a.matchScore || 0);
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Personalized Match Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Curated Recommendations For You
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Ranked by deterministic parameter compatibility against your degree in <strong>{studentProfile.course}</strong>, {studentProfile.state} domicile, and {studentProfile.academicPercentage}% academic marks.
          </p>
        </div>

        <Link to="/match-dna">
          <Button variant="primary" size="sm" icon={Sparkles}>
            Inspect Full Match DNA
          </Button>
        </Link>
      </div>

      {/* Recommended Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendedList.map((sch) => {
          const saved = isSaved(sch.id);
          const isCompared = compareIds.includes(sch.id);
          const daysLeft = getDaysRemaining(sch.deadline);

          return (
            <Card
              key={sch.id}
              className="p-5 flex flex-col justify-between hover:shadow-md transition-all group border border-slate-200/90 dark:border-slate-800"
            >
              <div className="space-y-3">
                {/* Provider and Status Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400 truncate">
                    {sch.provider}
                  </span>
                  {sch.isFullyEligible ? (
                    <Badge variant="teal" size="sm" dot>
                      100% Eligible
                    </Badge>
                  ) : (
                    <Badge variant="amber" size="sm">
                      {sch.matchScore}% Match
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <Link
                  to={`/scholarship/${sch.id}`}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-[#6957E8] transition-colors line-clamp-2 leading-snug font-heading"
                >
                  {sch.title}
                </Link>

                {/* Award and Deadline Info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Award Amount:</span>
                    <strong className="text-sm font-extrabold text-[#6957E8] dark:text-[#A78BFA] font-heading">
                      {formatCurrency(sch.awardAmount, sch.currency)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Deadline:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(sch.deadline)} ({daysLeft}d left)
                    </span>
                  </div>
                </div>

                {/* Match Reasoning Callout */}
                <div className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 text-[11px] text-teal-800 dark:text-teal-300 leading-snug">
                  <strong>Why it matches:</strong> {sch.recommendationReason || "Matches degree and academic percentage criteria."}
                </div>
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleSaveScholarship(sch.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      saved
                        ? "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950 dark:text-violet-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title={saved ? "Remove bookmark" : "Save scholarship"}
                  >
                    <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  </button>

                  <button
                    onClick={() => toggleCompareScholarship(sch.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isCompared
                        ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title={isCompared ? "In comparison" : "Add to comparison"}
                  >
                    <Layers className="w-4 h-4" />
                  </button>

                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => openMatchDna(sch)}
                  >
                    DNA
                  </Button>
                </div>

                <Link to={`/scholarship/${sch.id}`}>
                  <Button size="xs" variant="primary">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
