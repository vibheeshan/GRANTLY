import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  Info,
  DollarSign
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency } from "../utils/formatters.js";

export function CalculatorPage() {
  const {
    studentProfile,
    applications,
    allScholarships,
    savedScholarships
  } = useScholarships();

  const targetGoal = studentProfile.targetFundingGoal || 300000;

  // Selected scholarship IDs in custom calculator model
  const [selectedSchIds, setSelectedSchIds] = useState(() => {
    // Default to active applications
    const activeIds = applications.filter(a => a.status !== "Rejected").map(a => a.scholarshipId);
    return activeIds.length > 0 ? activeIds : ["sch-001", "sch-003"];
  });

  const toggleSelectScholarship = (id) => {
    setSelectedSchIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 1. Conservative: only Awarded status
  const conservativeSum = useMemo(() => {
    return applications
      .filter(a => a.status === "Awarded")
      .reduce((sum, a) => sum + (Number(a.awardAmount) || 0), 0);
  }, [applications]);

  // 2. Realistic: Awarded + Submitted/Under Review with high match score (>=75%)
  const realisticSum = useMemo(() => {
    return applications
      .filter(a => (a.status === "Awarded" || a.status === "Submitted" || a.status === "Under Review") && a.status !== "Rejected")
      .reduce((sum, a) => {
        // Weight probabilities realistically
        const weight = a.status === "Awarded" ? 1.0 : (a.status === "Under Review" ? 0.75 : 0.5);
        return sum + Math.round((Number(a.awardAmount) || 0) * weight);
      }, 0);
  }, [applications]);

  // 3. Optimistic: All active applications + all eligible saved bookmarks
  const optimisticSum = useMemo(() => {
    const activeAppAmounts = applications
      .filter(a => a.status !== "Rejected")
      .map(a => Number(a.awardAmount) || 0);

    const savedEligibleAmounts = savedScholarships
      .filter(s => s.isFullyEligible && !applications.some(a => a.scholarshipId === s.id))
      .map(s => Number(s.awardAmount) || 0);

    return [...activeAppAmounts, ...savedEligibleAmounts].reduce((sum, v) => sum + v, 0);
  }, [applications, savedScholarships]);

  // Custom Simulator computation with Stackability conflict detection
  const customModel = useMemo(() => {
    const selectedRecords = allScholarships.filter(s => selectedSchIds.includes(s.id));

    // Check for stackability conflicts
    // Rule: More than one non-stackable scholarship in the same state or category cannot be combined
    const nonStackableSelected = selectedRecords.filter(s => s.stackable === false);
    const hasStackabilityConflict = nonStackableSelected.length > 1;

    let adjustedTotal = 0;
    const excludedForDoubleCount = [];

    selectedRecords.forEach(sch => {
      // If there are multiple non-stackable grants, only count the highest one
      if (hasStackabilityConflict && sch.stackable === false) {
        const highestNonStackable = [...nonStackableSelected].sort((a, b) => b.awardAmount - a.awardAmount)[0];
        if (sch.id === highestNonStackable.id) {
          adjustedTotal += sch.awardAmount;
        } else {
          excludedForDoubleCount.push(sch);
        }
      } else {
        adjustedTotal += sch.awardAmount;
      }
    });

    const coveragePct = targetGoal > 0 ? Math.min(Math.round((adjustedTotal / targetGoal) * 100), 100) : 0;

    return {
      selectedRecords,
      adjustedTotal,
      rawTotal: selectedRecords.reduce((sum, s) => sum + s.awardAmount, 0),
      hasStackabilityConflict,
      nonStackableSelected,
      excludedForDoubleCount,
      coveragePct
    };
  }, [selectedSchIds, allScholarships, targetGoal]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
          <Calculator className="w-3.5 h-3.5" />
          <span>Deterministic Opportunity Modeling</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Funding Opportunity Calculator
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Project potential scholarship funding using three scenario benchmarks (Conservative, Realistic, Optimistic).
          Built-in stackability rules automatically prevent unrealistic double-counting across overlapping grants.
        </p>
      </div>

      {/* 3 Scenario KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Scenario 1: Conservative */}
        <Card className="p-5 border-emerald-200/80 dark:border-emerald-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Conservative (Secured)
            </span>
            <Badge variant="emerald" size="sm">
              Confirmed Funds
            </Badge>
          </div>
          <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            {formatCurrency(conservativeSum)}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Consists strictly of scholarships officially marked as <strong>Awarded</strong> in your tracker.
          </p>
        </Card>

        {/* Scenario 2: Realistic */}
        <Card className="p-5 border-blue-200/80 dark:border-blue-900/60 relative overflow-hidden bg-blue-50/20 dark:bg-blue-950/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Realistic (Expected)
            </span>
            <Badge variant="blue" size="sm">
              Weighted Pipeline
            </Badge>
          </div>
          <h4 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-heading">
            {formatCurrency(realisticSum)}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Includes awarded awards + active submissions weighted by probability (Under Review 75%, Submitted 50%).
          </p>
        </Card>

        {/* Scenario 3: Optimistic */}
        <Card className="p-5 border-violet-200/80 dark:border-violet-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Optimistic (Ceiling)
            </span>
            <Badge variant="violet" size="sm">
              Total Potential
            </Badge>
          </div>
          <h4 className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 font-heading">
            {formatCurrency(optimisticSum)}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Full potential if all applications in progress and bookmarked 100% eligible opportunities succeed.
          </p>
        </Card>
      </div>

      {/* Custom Simulator & Stackability Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Custom Model Outcome (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle subtitle="Simulated based on selected scholarships">
                Projected Funding Package
              </CardTitle>
            </CardHeader>

            <CardBody className="p-0 pt-4 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Simulated Annual Award Total
                </span>
                <span className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 font-heading block mt-1">
                  {formatCurrency(customModel.adjustedTotal)}
                </span>
                {customModel.hasStackabilityConflict && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                    ⚠️ Adjusted for non-stackable grant overlap (excludes {formatCurrency(customModel.rawTotal - customModel.adjustedTotal)})
                  </span>
                )}
              </div>

              {/* Progress towards student's target funding goal */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Target Annual Tuition Goal ({formatCurrency(targetGoal)})
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {customModel.coveragePct}% Covered
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${customModel.coveragePct}%` }}
                  />
                </div>
              </div>

              {/* Stackability Rules Warning Banner */}
              {customModel.hasStackabilityConflict && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Stackability Conflict Detected</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You selected multiple non-stackable scholarships (e.g. state merit fee waivers).
                    To avoid double-counting, our engine counts only the highest-paying non-combinable grant ({formatCurrency(customModel.adjustedTotal)}).
                  </p>
                </div>
              )}

              {/* Disclaimer notice */}
              <p className="text-[10px] text-slate-400 italic">
                * Simulated estimation based on demonstration records. Does not represent official grant sanction or credit guarantee.
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Right: Selectable Scholarship Checklist (7 cols on lg) */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle subtitle="Toggle grants to model custom funding packages">
                Scholarship Opportunities in Model
              </CardTitle>
              <span className="text-xs font-bold text-slate-500">
                {selectedSchIds.length} Selected
              </span>
            </CardHeader>

            <CardBody className="p-0 pt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {allScholarships.map(sch => {
                const isSelected = selectedSchIds.includes(sch.id);
                return (
                  <div
                    key={sch.id}
                    onClick={() => toggleSelectScholarship(sch.id)}
                    className={`py-3.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-violet-50/50 dark:bg-violet-950/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {sch.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{sch.provider}</span>
                          <span>•</span>
                          <span className={sch.stackable ? "text-emerald-600" : "text-amber-600 font-medium"}>
                            {sch.stackable ? "Stackable" : "Non-Stackable"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-violet-700 dark:text-violet-300 font-heading block">
                        {formatCurrency(sch.awardAmount, sch.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
