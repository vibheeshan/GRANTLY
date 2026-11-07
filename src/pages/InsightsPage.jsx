import React from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
  Layers,
  Calculator,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  Download,
  Printer,
  ChevronDown,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency, formatDate, getDaysRemaining } from "../utils/formatters.js";
import { exportApplicationsToCsv, exportScholarshipsToCsv, downloadCsv } from "../utils/csv.js";
import { exportAllGrantlyData } from "../utils/storage.js";

const STAGE_COLORS = {
  Saved: "#94A3B8",
  Applying: "#3B82F6",
  Submitted: "#F59E0B",
  "Under Review": "#8B5CF6",
  Awarded: "#10B981",
  Rejected: "#EF4444"
};

const CATEGORY_COLORS = ["#6C5CE7", "#14B8A6", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];

export function InsightsPage() {
  const {
    studentProfile,
    applications,
    allScholarships,
    documents,
    stats,
    activities,
    setIsOnboardingOpen
  } = useScholarships();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const totalTracked = applications.length;
  const submittedCount = applications.filter(
    (a) => a.status === "Submitted" || a.status === "Under Review" || a.status === "Awarded"
  ).length;
  const awardedCount = applications.filter((a) => a.status === "Awarded").length;

  const completionRate = totalTracked > 0 ? Math.round((submittedCount / totalTracked) * 100) : 0;

  // Pipeline by Stage data for Recharts (properly coerced)
  const savedCount = Number(stats?.savedCount ?? 0) || applications.filter(a => a.status === "Saved").length;
  const pipelineStages = [
    { stage: "Saved", count: Number(savedCount) || 0, fill: "#94A3B8" },
    { stage: "Preparing", count: Number(applications.filter(a => a.status === "Applying").length) || 0, fill: "#3B82F6" },
    { stage: "Submitted", count: Number(applications.filter(a => a.status === "Submitted").length) || 0, fill: "#F59E0B" },
    { stage: "In Review", count: Number(applications.filter(a => a.status === "Under Review").length) || 0, fill: "#8B5CF6" },
    { stage: "Awarded", count: Number(applications.filter(a => a.status === "Awarded").length) || 0, fill: "#10B981" },
    { stage: "Rejected", count: Number(applications.filter(a => a.status === "Rejected").length) || 0, fill: "#EF4444" }
  ];
  const totalPipelineCount = pipelineStages.reduce((sum, s) => sum + s.count, 0);

  // Category Distribution data for Recharts Pie
  const categoryCounts = {};
  allScholarships.forEach(sch => {
    sch.categories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  const categoryPieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value: Number(value) || 0
  }));

  const handleExportApplicationsCsv = () => {
    const csv = exportApplicationsToCsv(applications);
    downloadCsv(`grantly_applications_${Date.now()}.csv`, csv);
    setIsExportMenuOpen(false);
  };

  const handleExportScholarshipsCsv = () => {
    const csv = exportScholarshipsToCsv(allScholarships);
    downloadCsv(`grantly_scholarships_${Date.now()}.csv`, csv);
    setIsExportMenuOpen(false);
  };

  const handleExportJsonBackup = () => {
    const jsonStr = exportAllGrantlyData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grantly_backup_v2_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handlePrintSummary = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  // Document categories breakdown
  const docCategories = ["Academic", "Financial", "Identity", "Institutional"];
  const categoryBreakdown = docCategories.map(cat => {
    const inCat = documents.filter(d => d.category === cat);
    const readyInCat = inCat.filter(d => d.isReady).length;
    const pct = inCat.length > 0 ? Math.round((readyInCat / inCat.length) * 100) : 0;
    return { category: cat, total: inCat.length, ready: readyInCat, pct };
  });

  // Funding goal progress
  const targetGoal = studentProfile.targetFundingGoal || 300000;
  const goalCoveragePct = Math.min(Math.round((stats.totalPotentialFunding / targetGoal) * 100), 100);

  // Sorted upcoming deadlines
  const upcomingDeadlines = [...allScholarships]
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Student Success Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Insights &amp; Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Application pipeline velocity, conversion analytics, document dossier health, and funding goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Menu Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5"
            >
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E293B] shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Data &amp; Report Portability
                </div>
                <button
                  type="button"
                  onClick={handleExportApplicationsCsv}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export Applications (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportScholarshipsCsv}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                  <span>Export Catalog (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJsonBackup}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5 text-violet-500" />
                  <span>Full Backup (JSON v2.1)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSummary}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Print View / PDF</span>
                </button>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOnboardingOpen(true)}
            icon={Sparkles}
          >
            Calibrate Profile Target
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading tabular-nums">
            {completionRate}%
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {submittedCount} of {totalTracked} applications advanced beyond drafting
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Secured Grants</span>
            <Award className="w-4 h-4 text-[#14B8A6]" />
          </div>
          <h4 className="text-3xl font-extrabold text-[#14B8A6] dark:text-[#2DD4BF] font-heading tabular-nums">
            {formatCurrency(stats.securedAwardedFunding)}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {awardedCount} official award(s) confirmed
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Pipeline Potential</span>
            <Clock className="w-4 h-4 text-[#6C5CE7]" />
          </div>
          <h4 className="text-3xl font-extrabold text-[#6C5CE7] dark:text-[#A78BFA] font-heading tabular-nums">
            {formatCurrency(stats.totalPotentialFunding)}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {stats.activeApplicationsCount} active opportunities in scrutiny
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Dossier Health</span>
            <FileCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <h4 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-heading tabular-nums">
            {stats.documentReadinessPercentage}%
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {stats.readyDocsCount} of {stats.totalDocsCount} critical certificates verified
          </p>
        </Card>
      </div>

      {/* Main Charts Row: Pipeline Funnel BarChart + Category Distribution PieChart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Application Stage Distribution (7 cols) */}
        <Card className="lg:col-span-7 p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <CardTitle subtitle="Distribution of tracked submissions across pipeline milestones">
              Application Stage Pipeline
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </CardHeader>

          <CardBody className="p-0 pt-4">
            <div className="h-72 w-full min-h-[288px]">
              {totalPipelineCount === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                  <Activity className="w-8 h-8 mb-2 opacity-30" />
                  <p>No applications yet. Save a scholarship to start your pipeline.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineStages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px"
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {pipelineStages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Right: Scholarship Category Distribution (5 cols) */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <CardTitle subtitle="Catalog split across eligibility categories">
              Category Distribution
            </CardTitle>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </CardHeader>

          <CardBody className="p-0 pt-2 flex flex-col items-center">
            <div className="h-64 w-full min-h-[256px]">
              {categoryPieData.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                  <PieIcon className="w-8 h-8 mb-2 opacity-30" />
                  <p>No category distribution available.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px"
                      }}
                    />
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-xs pt-2">
              {categoryPieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 truncate">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Secondary Row: Document Readiness by Category & Upcoming Deadline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Readiness by Category */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle subtitle="Preparedness breakdown across certificate classifications">
              Document Readiness by Classification
            </CardTitle>
          </CardHeader>

          <CardBody className="p-0 pt-4 space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.category} ({item.ready}/{item.total} Ready)
                  </span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">
                    {item.pct}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.pct === 100
                        ? "bg-emerald-500"
                        : item.pct >= 50
                        ? "bg-teal-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-2 text-right">
              <Link
                to="/documents"
                className="text-xs font-semibold text-[#6C5CE7] dark:text-[#A78BFA] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Document Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Upcoming Deadline Summary */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <CardTitle subtitle="Chronological queue of imminent grant deadlines">
              Upcoming Deadline Summary
            </CardTitle>
            <Calendar className="w-4 h-4 text-slate-400" />
          </CardHeader>

          <CardBody className="p-0 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingDeadlines.map((sch) => {
              const daysLeft = getDaysRemaining(sch.deadline);
              return (
                <div key={sch.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <Link
                      to={`/scholarship/${sch.id}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-[#6C5CE7] truncate block"
                    >
                      {sch.title}
                    </Link>
                    <span className="text-[11px] text-slate-400">
                      {sch.provider} • {formatCurrency(sch.awardAmount, sch.currency)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-bold block ${daysLeft <= 14 ? "text-amber-600" : "text-slate-600 dark:text-slate-300"}`}>
                      {daysLeft} days left
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(sch.deadline)}</span>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Student Activity Timeline */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <CardTitle subtitle="Audit log of recent scholarship actions, bookmarks, and document updates">
            Student Activity Timeline
          </CardTitle>
          <Activity className="w-4 h-4 text-slate-400" />
        </CardHeader>

        <CardBody className="p-0 pt-4">
          <div className="space-y-3">
            {activities.slice(0, 6).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-[#6C5CE7] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {act.title}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {act.description}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatDate(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
