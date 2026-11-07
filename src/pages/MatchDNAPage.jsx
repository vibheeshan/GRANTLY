import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Bookmark,
  ShieldCheck,
  RotateCcw,
  Check,
  FileCheck2,
  Building2,
  GraduationCap,
  Percent,
  Wallet,
  MapPin,
  Info,
  Layers,
  Sliders,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import {
  EDUCATION_LEVELS,
  STATES_LIST,
  COURSES_LIST
} from "../data/scholarships.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { evaluateMatchDNA } from "../utils/eligibility.js";

export function MatchDNAPage() {
  const {
    studentProfile,
    updateProfile,
    allScholarships,
    documents,
    isSaved,
    toggleSaveScholarship,
    addApplication,
    compareIds,
    toggleCompareScholarship,
    setIsOnboardingOpen
  } = useScholarships();

  // Active scholarship being evaluated (defaults to the first scholarship)
  const [selectedSchId, setSelectedSchId] = useState(
    allScholarships[0]?.id || "apex-stem-ug-2026"
  );

  // Simulation mode toggler
  const [isSimulating, setIsSimulating] = useState(false);
  const [simData, setSimData] = useState({
    academicPercentage: studentProfile.academicPercentage ?? 82.5,
    familyIncome: studentProfile.familyIncome ?? 450000,
    educationLevel: studentProfile.educationLevel || "Undergraduate",
    course: studentProfile.course || "Engineering",
    state: studentProfile.state || "Maharashtra"
  });

  const activeScholarship =
    allScholarships.find((s) => s.id === selectedSchId) || allScholarships[0];

  // Current profile being evaluated (either live profile or simulated profile)
  const currentProfileToEvaluate = useMemo(() => {
    if (!isSimulating) return studentProfile;
    return {
      ...studentProfile,
      academicPercentage: Number(simData.academicPercentage),
      familyIncome: Number(simData.familyIncome),
      educationLevel: simData.educationLevel,
      course: simData.course,
      state: simData.state
    };
  }, [studentProfile, isSimulating, simData]);

  // Evaluate Match DNA
  const matchDna = useMemo(() => {
    if (!activeScholarship) return null;
    return evaluateMatchDNA(activeScholarship, currentProfileToEvaluate, documents);
  }, [activeScholarship, currentProfileToEvaluate, documents]);

  const overallScore = matchDna ? matchDna.overallScore : 0;
  const isFullyEligible = matchDna ? matchDna.isFullyEligible : false;

  const handleApplySimulation = (e) => {
    e.preventDefault();
    updateProfile({
      academicPercentage: Number(simData.academicPercentage),
      familyIncome: Number(simData.familyIncome),
      educationLevel: simData.educationLevel,
      course: simData.course,
      state: simData.state
    });
    setIsSimulating(false);
  };

  const handleResetSimulation = () => {
    setSimData({
      academicPercentage: studentProfile.academicPercentage ?? 82.5,
      familyIncome: studentProfile.familyIncome ?? 450000,
      educationLevel: studentProfile.educationLevel || "Undergraduate",
      course: studentProfile.course || "Engineering",
      state: studentProfile.state || "Maharashtra"
    });
  };

  // SVG Radial Gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Signature Intelligence Feature</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Scholarship Match DNA
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Multi-vector deterministic compatibility analysis. Breaks down academic thresholds, income ceilings, domicile eligibility, and verified document dossier readiness.
          </p>
        </div>

        {/* Opportunity Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Target Opportunity:
          </label>
          <select
            value={selectedSchId}
            onChange={(e) => setSelectedSchId(e.target.value)}
            className="text-xs py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 max-w-xs sm:max-w-md truncate shadow-xs"
          >
            {allScholarships.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.title} ({sch.provider})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Demonstration Rule-Based Estimate:</strong> Match DNA calculates deterministic compatibility against published demonstration criteria and your offline document dossier. It does not represent an official awarding decision by government portals or private trusts.
        </div>
      </div>

      {/* Top Section: Radial Score Gauge & Scholarship Target Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Overall Score Radial Visualizer with HUD Corner Brackets (5 cols) */}
        <Card className="lg:col-span-5 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          {/* HUD Corner Brackets */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#2DD4BF] pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#2DD4BF] pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#2DD4BF] pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#2DD4BF] pointer-events-none" />

          <div className="absolute -top-12 -left-12 w-48 h-48 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Composite Match DNA
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase">
              Illustrative estimate
            </span>
          </div>

          {/* SVG Circular Radial Progress */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100 dark:text-slate-800/80"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  overallScore >= 90
                    ? "text-[#2DD4BF]"
                    : overallScore >= 70
                    ? "text-[#A78BFA]"
                    : overallScore >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
                }`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
                {overallScore}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {isFullyEligible ? "100% Eligible" : overallScore >= 70 ? "Strong Fit" : "Partial Match"}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mb-3 leading-relaxed">
            {matchDna?.summaryExplanation || "Calculating real-time vector alignment..."}
          </p>

          {/* Next Best Action Banner */}
          <div className="w-full p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 mb-3 text-left flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block font-mono">
                → Next Best Action:
              </span>
              <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate block">
                {matchDna?.vectors.documentDossier.score < 100
                  ? "Upload Tahsildar income certificate (+8 pts)"
                  : "Verify college enrollment bonafide (+5 pts)"}
              </span>
            </div>
            <Link to="/documents">
              <Button size="xs" variant="teal">
                Fix
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full text-xs">
            <button
              onClick={() => toggleSaveScholarship(activeScholarship.id)}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 font-semibold ${
                isSaved(activeScholarship.id)
                  ? "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-300"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved(activeScholarship.id) ? "fill-current" : ""}`} />
              <span>{isSaved(activeScholarship.id) ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={() => toggleCompareScholarship(activeScholarship.id)}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 font-semibold ${
                compareIds.includes(activeScholarship.id)
                  ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{compareIds.includes(activeScholarship.id) ? "Comparing" : "Compare"}</span>
            </button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => addApplication(activeScholarship)}
            >
              Track Application
            </Button>
          </div>
        </Card>

        {/* Right: Target Opportunity Profile Card (7 cols) */}
        <Card className="lg:col-span-7 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-violet-500" />
                {activeScholarship.provider}
              </span>
              <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 font-heading">
                {formatCurrency(activeScholarship.awardAmount, activeScholarship.currency)} / year
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight mb-2">
              {activeScholarship.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {activeScholarship.description}
            </p>

            {/* Program Specs Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Min Marks</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeScholarship.minimumPercentage}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Income Ceiling</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{(activeScholarship.maximumFamilyIncome / 100000).toFixed(1)}L / yr</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Deadline</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(activeScholarship.deadline)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Stackability</span>
                <span className={activeScholarship.stackable ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                  {activeScholarship.stackable ? "Stackable" : "Sole Award"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Simulation Trigger */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {isSimulating ? "⚡ Simulating custom profile parameters" : "Using current student profile"}
            </span>

            <Button
              size="xs"
              variant={isSimulating ? "outline" : "ghost"}
              icon={Sliders}
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? "Close Simulator" : "Simulate What-If Parameters"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Interactive What-If Parameter Simulator (When Opened) */}
      {isSimulating && (
        <Card className="p-6 bg-gradient-to-r from-violet-50/50 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-2 border-violet-300 dark:border-violet-700 animate-in slide-in-from-top-2 duration-200">
          <CardHeader className="p-0 pb-4">
            <CardTitle subtitle="Adjust parameters temporarily to view Match DNA score responsiveness">
              Interactive What-If Profile Simulator
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleApplySimulation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Academic %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="100"
                  value={simData.academicPercentage}
                  onChange={(e) => setSimData(prev => ({ ...prev, academicPercentage: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Annual Income (₹)
                </label>
                <input
                  type="number"
                  step="25000"
                  min="0"
                  value={simData.familyIncome}
                  onChange={(e) => setSimData(prev => ({ ...prev, familyIncome: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Education Level
                </label>
                <select
                  value={simData.educationLevel}
                  onChange={(e) => setSimData(prev => ({ ...prev, educationLevel: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {EDUCATION_LEVELS.filter(l => l !== "All Levels").map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Discipline
                </label>
                <select
                  value={simData.course}
                  onChange={(e) => setSimData(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {COURSES_LIST.filter(c => c !== "All Courses").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Domicile State
                </label>
                <select
                  value={simData.state}
                  onChange={(e) => setSimData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {STATES_LIST.filter(s => s !== "All India").map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                icon={RotateCcw}
                onClick={handleResetSimulation}
              >
                Reset Simulation Defaults
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setIsSimulating(false)}
                >
                  Done
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="xs"
                  icon={Check}
                >
                  Save as Actual Profile
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Visual Section: Why This Scholarship Matches You (Requirement 4) */}
      <Card className="p-6 bg-gradient-to-r from-violet-50/60 via-teal-50/40 to-slate-50 dark:from-violet-950/20 dark:via-teal-950/20 dark:to-slate-900 border border-violet-200/80 dark:border-violet-800/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6957E8] dark:text-[#A78BFA]" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Why This Scholarship Matches You
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Transparent Demo Criteria Evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <strong className="text-slate-900 dark:text-white font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
              Academic Alignment
            </strong>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Your {currentProfileToEvaluate.academicPercentage}% marks satisfy the minimum cutoff of {activeScholarship.minimumPercentage}%, earning maximum merit weight.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <strong className="text-slate-900 dark:text-white font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
              Course &amp; Level Fit
            </strong>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Enrolled in {currentProfileToEvaluate.course} ({currentProfileToEvaluate.educationLevel}), explicitly matching the provider's target STEM cohort.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <strong className="text-slate-900 dark:text-white font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
              Income &amp; Location Clearance
            </strong>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Family income under ₹{(activeScholarship.maximumFamilyIncome / 100000).toFixed(1)}L ceiling and {currentProfileToEvaluate.state} domicile falls within quota.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 italic">
          Disclaimer: Match DNA scores are estimated using transparent demonstration rules and profile parameters. They do not constitute official scholarship awards or legal eligibility decisions.
        </p>
      </Card>

      {/* 5 Individual Compatibility Vectors Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading mb-4">
          5-Vector Compatibility Assessment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Vector 1: Education Level */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-bold uppercase tracking-wider">Education</span>
                {matchDna?.vectors.educationLevel.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                {matchDna?.vectors.educationLevel.score}%
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {matchDna?.vectors.educationLevel.detail}
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${
                  matchDna?.vectors.educationLevel.passed ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${matchDna?.vectors.educationLevel.score}%` }}
              />
            </div>
          </Card>

          {/* Vector 2: Academic Standing */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-bold uppercase tracking-wider">Academics</span>
                {matchDna?.vectors.academicMerit.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                {matchDna?.vectors.academicMerit.score}%
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {matchDna?.vectors.academicMerit.detail}
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${
                  matchDna?.vectors.academicMerit.passed ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${matchDna?.vectors.academicMerit.score}%` }}
              />
            </div>
          </Card>

          {/* Vector 3: Financial Eligibility */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-bold uppercase tracking-wider">Income Limit</span>
                {matchDna?.vectors.familyIncome.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                {matchDna?.vectors.familyIncome.score}%
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {matchDna?.vectors.familyIncome.detail}
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${
                  matchDna?.vectors.familyIncome.passed ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${matchDna?.vectors.familyIncome.score}%` }}
              />
            </div>
          </Card>

          {/* Vector 4: Location / State Domicile */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-bold uppercase tracking-wider">Domicile</span>
                {matchDna?.vectors.stateDomicile.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                {matchDna?.vectors.stateDomicile.score}%
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {matchDna?.vectors.stateDomicile.detail}
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${
                  matchDna?.vectors.stateDomicile.passed ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${matchDna?.vectors.stateDomicile.score}%` }}
              />
            </div>
          </Card>

          {/* Vector 5: Document Dossier Readiness */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-bold uppercase tracking-wider">Document Dossier</span>
                <FileCheck2 className="w-4 h-4 text-teal-500" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                {matchDna?.vectors.documentDossier.score}%
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {matchDna?.vectors.documentDossier.detail}
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${
                  (matchDna?.vectors.documentDossier.score ?? 0) >= 80 ? "bg-teal-500" : "bg-amber-500"
                }`}
                style={{ width: `${matchDna?.vectors.documentDossier.score}%` }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Matched vs Unmatched Requirements & Recommendations 2-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched & Satisfied Criteria */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <CardTitle subtitle="Criteria fully satisfied by your profile parameters">
              Satisfied Parameters
            </CardTitle>
            <Badge variant="teal" size="sm">
              {matchDna?.matchedRequirements.length || 0} Passed
            </Badge>
          </CardHeader>

          <CardBody className="p-0 pt-3 space-y-2.5">
            {matchDna?.matchedRequirements.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block font-semibold">
                    {item.label}
                  </strong>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}

            {matchDna?.matchedRequirements.length === 0 && (
              <p className="text-xs text-slate-400 italic">No parameters fully satisfied yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Unmatched Barriers & Missing Info */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <CardTitle subtitle="Gaps preventing full 100% eligibility">
              Deficits &amp; Pending Scrutiny
            </CardTitle>
            <Badge variant={matchDna?.unmatchedRequirements.length > 0 ? "rose" : "teal"} size="sm">
              {matchDna?.unmatchedRequirements.length || 0} Deficits
            </Badge>
          </CardHeader>

          <CardBody className="p-0 pt-3 space-y-2.5">
            {matchDna?.unmatchedRequirements.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs flex items-start gap-2.5"
              >
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block font-semibold">
                    {item.label}
                  </strong>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                    {item.reason}
                  </span>
                </div>
              </div>
            ))}

            {matchDna?.unmatchedRequirements.length === 0 && (
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Zero eligibility barriers! Your profile satisfies all baseline constraints.</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Readiness Improvement Recommendations */}
      <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          <h3 className="text-base sm:text-lg font-bold font-heading">
            Action Steps to Maximize Opportunity Readiness
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
              1. Document Attestation
            </span>
            <p className="leading-relaxed">
              Verify your Tahsildar Income Certificate before the FY deadline to clear scrutiny barriers immediately.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">
              2. Academic Threshold
            </span>
            <p className="leading-relaxed">
              Maintaining an 80%+ cumulative grade average maintains qualification for all 4 tier-1 STEM grants.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              3. Deadline Priority
            </span>
            <p className="leading-relaxed">
              Submit your preliminary draft 7 days before {formatDate(activeScholarship.deadline)} to prevent portal downtime delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
