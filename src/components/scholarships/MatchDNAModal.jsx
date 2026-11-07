import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileCheck2,
  Send,
  Bookmark,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { Modal } from "../ui/Modal.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { useScholarships } from "../../context/ScholarshipContext.jsx";

export function MatchDNAModal({ scholarship, isOpen, onClose }) {
  const {
    studentProfile,
    isSaved,
    toggleSaveScholarship,
    compareIds,
    toggleCompareScholarship,
    addApplication,
    applications
  } = useScholarships();

  if (!scholarship || !isOpen) return null;

  const evaluation = scholarship.evaluation;
  const dna = evaluation?.dna;
  const docReadiness = evaluation?.documentReadiness;
  const saved = isSaved(scholarship.id);
  const isCompared = compareIds.includes(scholarship.id);
  const isTracked = applications.some(a => a.scholarshipId === scholarship.id);

  const vectors = [
    {
      key: "education",
      label: "Education Compatibility",
      score: dna?.education?.score || 0,
      maxScore: 20,
      passed: dna?.education?.passed,
      required: dna?.education?.required,
      actual: dna?.education?.actual,
      details: dna?.education?.details
    },
    {
      key: "course",
      label: "Discipline Compatibility",
      score: dna?.course?.score || 0,
      maxScore: 20,
      passed: dna?.course?.passed,
      required: dna?.course?.required,
      actual: dna?.course?.actual,
      details: dna?.course?.details
    },
    {
      key: "location",
      label: "Domicile & Location",
      score: dna?.location?.score || 0,
      maxScore: 20,
      passed: dna?.location?.passed,
      required: dna?.location?.required,
      actual: dna?.location?.actual,
      details: dna?.location?.details
    },
    {
      key: "academic",
      label: "Academic Merit Compatibility",
      score: dna?.academic?.score || 0,
      maxScore: 20,
      passed: dna?.academic?.passed,
      required: dna?.academic?.required,
      actual: dna?.academic?.actual,
      details: dna?.academic?.details
    },
    {
      key: "income",
      label: "Income Limit Compatibility",
      score: dna?.income?.score || 0,
      maxScore: 20,
      passed: dna?.income?.passed,
      required: dna?.income?.required,
      actual: dna?.income?.actual,
      details: dna?.income?.details
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scholarship Match DNA Analysis"
      subtitle={`Deterministic breakdown for ${scholarship.title}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-teal-500/10 border border-violet-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {scholarship.provider}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                Demo
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              {scholarship.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Annual Award: <strong className="text-violet-700 dark:text-violet-300 font-bold">{formatCurrency(scholarship.awardAmount, scholarship.currency)}</strong> • Deadline: {formatDate(scholarship.deadline)}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Match DNA Score
            </span>
            <span className={`text-3xl font-extrabold font-heading ${
              scholarship.isFullyEligible ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"
            }`}>
              {scholarship.isFullyEligible ? "100%" : `${scholarship.matchScore}%`}
            </span>
          </div>
        </div>

        {/* Explainable recommendation rationale */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
          <strong className="text-slate-900 dark:text-white block font-semibold mb-1">
            Engine Recommendation Rationale:
          </strong>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {scholarship.recommendationReason || evaluation?.explanation}
          </p>
        </div>

        {/* 5 Core Compatibility Vectors Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5 Mandatory Compatibility Checks
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {vectors.filter(v => v.passed).length}/5 Vectors Passed
            </span>
          </div>

          <div className="space-y-2">
            {vectors.map((vec) => (
              <div
                key={vec.key}
                className={`p-3 rounded-xl border transition-colors ${
                  vec.passed
                    ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {vec.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {vec.label}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                        {vec.details}
                      </p>
                    </div>
                  </div>

                  <span className={`font-bold text-xs shrink-0 ${vec.passed ? "text-emerald-600" : "text-rose-600"}`}>
                    +{vec.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Readiness Specific To This Scholarship */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Dossier Document Readiness: {docReadiness?.percentage || 0}%
              </span>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {docReadiness?.readyCount} of {docReadiness?.totalCount} Required Ready
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${docReadiness?.percentage || 0}%` }}
            />
          </div>

          {docReadiness?.missingDocs?.length > 0 ? (
            <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
              <strong>Pending action:</strong> The following documents are needed for this opportunity:{" "}
              <span className="font-semibold">{docReadiness.missingDocs.join(", ")}</span>.
            </div>
          ) : (
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              ✓ All required documents for this scholarship are verified and marked ready!
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleCompareScholarship(scholarship.id)}
              icon={Layers}
            >
              {isCompared ? "In Comparison" : "Add to Compare"}
            </Button>

            <Button
              variant={saved ? "secondary" : "outline"}
              size="sm"
              onClick={() => toggleSaveScholarship(scholarship.id)}
              icon={Bookmark}
            >
              {saved ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                addApplication(scholarship);
              }}
              icon={Send}
            >
              {isTracked ? "View in Tracker" : "Track Application"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
