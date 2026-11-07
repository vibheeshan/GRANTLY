import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Bookmark,
  Send,
  Calendar,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Calculator,
  Compass,
  Sliders,
  Plus,
  Search,
  ExternalLink
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { StatCard } from "../components/dashboard/StatCard.jsx";
import { ProgressChart } from "../components/dashboard/ProgressChart.jsx";
import { UpcomingDeadlines } from "../components/dashboard/UpcomingDeadlines.jsx";
import { RecommendedScholarships } from "../components/dashboard/RecommendedScholarships.jsx";
import { RecentActivity } from "../components/dashboard/RecentActivity.jsx";
import { ScholarshipSpotlight } from "../components/dashboard/ScholarshipSpotlight.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency } from "../utils/formatters.js";

export function DashboardPage() {
  const {
    studentProfile,
    stats,
    allScholarships,
    applications,
    activities,
    setIsOnboardingOpen
  } = useScholarships();

  // Profile completion calculation
  const profileFields = [
    Boolean(studentProfile.name),
    Boolean(studentProfile.email),
    Boolean(studentProfile.educationLevel),
    Boolean(studentProfile.course),
    Boolean(studentProfile.institution),
    Boolean(studentProfile.state),
    Boolean(studentProfile.academicPercentage),
    Boolean(studentProfile.familyIncome)
  ];
  const profileCompletedCount = profileFields.filter(Boolean).length;
  const profileCompletionPercentage = Math.round((profileCompletedCount / profileFields.length) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner with High-Tech HUD Corner Brackets */}
      <div className="rounded-3xl bg-[#0B1020]/90 dark:bg-[rgba(11,16,32,0.85)] backdrop-blur-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-teal-500/20 dark:border-white/10 group">
        {/* HUD Precision Corner Brackets */}
        <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#2DD4BF]/80 pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#2DD4BF]/80 pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#2DD4BF]/80 pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#2DD4BF]/80 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-[#8B5CF6]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-10 w-56 h-56 bg-[#2DD4BF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[#2DD4BF] text-xs font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-ping" />
              <span>COMMAND CENTER ACTIVE // {studentProfile.educationLevel?.toUpperCase()}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading">
              Welcome back, {studentProfile.name.split(" ")[0]}!
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Enrolled in <strong className="text-white">{studentProfile.course}</strong> at{" "}
              <span className="text-slate-200">{studentProfile.institution}</span>. Your academic profile ({studentProfile.academicPercentage}%) aligns with{" "}
              <strong className="text-[#2DD4BF] font-bold font-mono">{stats.eligibleCount} scholarships</strong> with 100% parameter compatibility.
            </p>

            <div className="pt-1 flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>STATE: {studentProfile.state}</span>
              </span>
              <span>•</span>
              <span>INCOME TIER: ≤ ₹{(studentProfile.familyIncome / 100000).toFixed(1)}L / YR</span>
            </div>
          </div>

          {/* Profile Completion Indicator & Quick Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 w-full lg:w-auto shrink-0">
            {/* Profile Progress Box */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 w-full sm:w-auto flex items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Profile Completeness
                </span>
                <span className="text-sm font-extrabold text-[#2DD4BF] font-heading">
                  {profileCompletionPercentage}% Verified
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-teal-400/30 flex items-center justify-center font-bold text-xs text-white">
                {profileCompletionPercentage}%
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20"
                icon={Sliders}
                onClick={() => setIsOnboardingOpen(true)}
              >
                Calibrate Profile
              </Button>
              <Link to="/match-dna" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto bg-[#6C5CE7] hover:bg-[#5b4bd8] text-white"
                  icon={Sparkles}
                >
                  Launch Match DNA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Fintech & Pipeline Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Eligible Scholarships"
          value={stats.eligibleCount}
          trend="100% criteria match"
          subtext="Satisfies all baseline requirements"
          icon={CheckCircle2}
          variant="teal"
          linkTo="/match-dna"
          linkText="Inspect Match DNA"
        />

        <StatCard
          title="Saved Scholarships"
          value={stats.savedCount}
          trend="Target opportunities"
          subtext="Bookmarked for preparation"
          icon={Bookmark}
          variant="violet"
          linkTo="/explorer?filter=saved"
          linkText="View saved grants"
        />

        <StatCard
          title="Active Applications"
          value={stats.activeApplicationsCount}
          trend={`${stats.submittedCount} submitted`}
          subtext={`${stats.awardedCount} official award(s) confirmed`}
          icon={Send}
          variant="blue"
          linkTo="/applications"
          linkText="Manage pipeline"
        />

        <StatCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlinesCount}
          trend="Next 30 days"
          subtext="Closing in current window"
          icon={Calendar}
          variant="amber"
          linkTo="/calendar"
          linkText="Open calendar view"
        />
      </div>

      {/* Your Immediate Next Step Recommendation Banner (Feature 98) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-900/10 via-teal-900/10 to-indigo-900/10 dark:from-violet-950/40 dark:via-teal-950/30 dark:to-indigo-950/40 border border-violet-200/80 dark:border-violet-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-teal-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block font-mono">
              ★ RECOMMENDED NEXT ACTION
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {stats.readyDocsCount < stats.totalDocsCount
                ? `Verify ${stats.totalDocsCount - stats.readyDocsCount} pending dossier documents to reach 100% readiness`
                : "Submit application for Apex NextGen STEM Fellowship (Closing in 9 days)"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Completing this milestone accelerates your submission readiness by +25% across 4 eligible grants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Link to={stats.readyDocsCount < stats.totalDocsCount ? "/documents" : "/applications"}>
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              {stats.readyDocsCount < stats.totalDocsCount ? "Review Dossier" : "Open Application"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Scholarship Spotlight Banner (Feature 10) */}
      <ScholarshipSpotlight scholarships={allScholarships} />

      {/* Quick Actions Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/explorer">
            <Button size="xs" variant="outline" icon={Search}>
              Discover Scholarships
            </Button>
          </Link>

          <Link to="/match-dna">
            <Button size="xs" variant="outline" icon={Sparkles}>
              Test Match DNA
            </Button>
          </Link>

          <Link to="/compare">
            <Button size="xs" variant="outline" icon={Layers}>
              Compare Opportunities
            </Button>
          </Link>

          <Link to="/calculator">
            <Button size="xs" variant="outline" icon={Calculator}>
              Funding Calculator
            </Button>
          </Link>

          <Link to="/documents">
            <Button size="xs" variant="outline" icon={FileCheck2}>
              Verify Documents
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Application Progress Pipeline + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressChart
            applications={applications}
            savedCount={stats.savedCount}
          />
        </div>
        <div className="lg:col-span-1">
          <UpcomingDeadlines scholarships={allScholarships} />
        </div>
      </div>

      {/* Secondary Grid: Recommended Scholarships + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecommendedScholarships scholarships={allScholarships} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* Document Readiness Callout Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#14B8A6] dark:text-[#2DD4BF] shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Document Readiness: {stats.documentReadinessPercentage}% Prepared
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {stats.readyDocsCount} of {stats.totalDocsCount} critical certificates verified in your offline dossier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/documents">
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              Manage Document Dossier
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
