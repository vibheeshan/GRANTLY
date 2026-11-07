import React, { useState, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Funnel, FunnelChart,
  LabelList, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar,
  Treemap, Legend, ScatterChart, Scatter
} from "recharts";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, FileCheck2, Sparkles,
  Info, Download, Calendar, Layers, Target, Activity, BarChart3, PieChart as PieIcon,
  ArrowRight, ChevronDown, ChevronUp, Eye, Lightbulb, Zap, Award, FileWarning,
  Search, Filter, RefreshCw, Printer, ArrowUpRight, ArrowDownRight, Gauge,
  X, ChevronRight, Minus
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import {
  computeAllAnalytics,
  generateInsightEngineObservations,
  METRIC_DEFINITIONS
} from "../utils/analytics.js";
import { STRINGS_EN as T } from "../i18n/en.js";

// ─── Colour Palettes ─────────────────────────────────────────────────────────
const VIOLET_PALETTE = ["#6C5CE7", "#A78BFA", "#7C3AED", "#DDD6FE", "#4C1D95"];
const TEAL_PALETTE = ["#14B8A6", "#2DD4BF", "#0D9488", "#99F6E4", "#134E4A"];
const STATUS_COLORS = {
  Saved: "#94A3B8", Preparing: "#3B82F6", Submitted: "#F59E0B",
  "Under Review": "#8B5CF6", Awarded: "#10B981", Rejected: "#EF4444"
};
const STANDARD_PALETTE = ["#6C5CE7", "#14B8A6", "#3B82F6", "#F59E0B", "#EC4899", "#10B981", "#EF4444", "#8B5CF6"];
const COLORBLIND_PALETTE = ["#2166AC", "#D95F02", "#1B9E77", "#E7298A", "#66A61E", "#7570B3", "#E6AB02", "#A6761D"];

// ─── Period Comparison Helper ─────────────────────────────────────────────────
function PeriodDelta({ value, prevValue, unit = "" }) {
  if (!prevValue || prevValue === 0) return null;
  const pct = Math.round(((value - prevValue) / prevValue) * 100);
  const isUp = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(pct)}% vs prev {unit}
    </span>
  );
}

// ─── Anomaly Flag Helper ───────────────────────────────────────────────────────
function AnomalyFlag({ condition, message }) {
  if (!condition) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 dark:text-amber-400">
      <Zap className="w-3.5 h-3.5" />
      <span>{message}</span>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyChartState({ reason }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400 dark:text-slate-500">
      <Activity className="w-8 h-8 mb-2 opacity-30" />
      <p className="max-w-xs">{reason || T.common.emptyData}</p>
    </div>
  );
}

// ─── Data Table Toggle ────────────────────────────────────────────────────────
function DataTableToggle({ data, columns }) {
  const [show, setShow] = useState(false);
  if (!data || data.length === 0) return null;
  return (
    <div className="mt-3">
      <button
        onClick={() => setShow((p) => !p)}
        className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
        aria-expanded={show}
      >
        <Eye className="w-3.5 h-3.5" />
        {show ? T.analytics.showChart : T.analytics.showTable}
      </button>
      {show && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11px] text-slate-700 dark:text-slate-300 border-collapse" role="table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-2 py-1.5 text-left font-semibold bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-2 py-1.5">{String(row[c.key] ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Chart Card wrapper ────────────────────────────────────────────────────────
function ChartCard({ id, title, subtitle, tooltip, srSummary, children, tableData, tableColumns, className = "" }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <section className={`glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/60 shadow-xs ${className}`} aria-labelledby={`chart-heading-${id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 id={`chart-heading-${id}`} className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          {/* Feature 141: Screen reader summary */}
          {srSummary && <p className="sr-only">{T.analytics.srPrefix}{srSummary}</p>}
        </div>
        {tooltip && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowTooltip((p) => !p)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label={`Information about ${title}`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 mt-1 w-56 glass-panel rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 text-[11px] text-slate-600 dark:text-slate-300 z-20">
                {tooltip}
                <button className="mt-1 text-violet-600 dark:text-violet-400 cursor-pointer" onClick={() => setShowTooltip(false)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {children}
      {tableData && <DataTableToggle data={tableData} columns={tableColumns} />}
    </section>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, iconColor = "text-violet-600 dark:text-violet-400", isEstimated, warning, to }) {
  const content = (
    <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/60 shadow-xs group hover:border-violet-300/60 dark:hover:border-violet-700/50 transition-all">
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
        {isEstimated && (
          <span className="ml-auto text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{T.analytics.estimatedBadge}</span>
        )}
      </div>
      <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sub}</div>}
      {warning && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
  if (to) return <Link to={to} className="block">{content}</Link>;
  return content;
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ insight }) {
  const colorMap = {
    warning: "border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/20",
    alert: "border-rose-300 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/20",
    info: "border-violet-300 dark:border-violet-700 bg-violet-50/80 dark:bg-violet-950/20",
    success: "border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/20"
  };
  const iconMap = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    alert: <FileWarning className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    info: <Lightbulb className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[insight.type] || colorMap.info}`}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">{iconMap[insight.type] || iconMap.info}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{insight.title}</div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{insight.observation}</p>
          {insight.actionPath && (
            <Link
              to={insight.actionPath}
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:underline"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              {insight.actionLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, labelKey = "name", formatter }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-2.5 text-[11px]">
      <div className="font-semibold text-slate-900 dark:text-white mb-1">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span style={{ background: entry.color || entry.fill }} className="inline-block w-2.5 h-2.5 rounded-sm" />
          <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Analytics Page ────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const navigate = useNavigate();
  const {
    studentProfile,
    applications,
    allScholarships,
    documents,
    savedIds,
    activities,
    eventLog
  } = useScholarships();

  // ─── Filter state ──────────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [showPeriodComparison, setShowPeriodComparison] = useState(false);

  const palette = colorBlindMode ? COLORBLIND_PALETTE : STANDARD_PALETTE;

  // ─── Build analytics state ─────────────────────────────────────────────────
  const analyticsState = useMemo(() => ({
    applications,
    scholarships: allScholarships,
    documents,
    studentProfile,
    eventLog: eventLog || [],
    savedIds
  }), [applications, allScholarships, documents, studentProfile, eventLog, savedIds]);

  const metrics = useMemo(() => computeAllAnalytics(analyticsState), [analyticsState]);
  const insights = useMemo(() => generateInsightEngineObservations(metrics, analyticsState), [metrics, analyticsState]);

  // ─── Derived convenience values ────────────────────────────────────────────
  const daysToNextDeadline = useMemo(() => {
    const now = Date.now();
    let nearest = Infinity;
    allScholarships.forEach((s) => {
      if (s.deadline) {
        const d = new Date(s.deadline).getTime();
        if (d > now) nearest = Math.min(nearest, Math.ceil((d - now) / (1000 * 60 * 60 * 24)));
      }
    });
    return nearest === Infinity ? "—" : nearest;
  }, [allScholarships]);

  const stalledCount = metrics.A7?.stalledCount ?? 0;

  // Unique providers list for filter dropdown
  const providers = useMemo(() => {
    const ps = new Set(applications.map((a) => a.provider).filter(Boolean));
    return Array.from(ps);
  }, [applications]);

  const categories = useMemo(() => {
    const cs = new Set();
    allScholarships.forEach((s) => (s.categories || []).forEach((c) => cs.add(c)));
    return Array.from(cs);
  }, [allScholarships]);

  // ─── Export Helpers ────────────────────────────────────────────────────────
  const exportJson = useCallback(() => {
    const snap = JSON.stringify(metrics, null, 2);
    const blob = new Blob([snap], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grantly-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [metrics]);

  const exportCsv = useCallback((dataArr, filename) => {
    if (!dataArr || !dataArr.length) return;
    const header = Object.keys(dataArr[0]).join(",");
    const rows = dataArr.map((r) => Object.values(r).join(",")).join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ─── Chart drill-down navigation ───────────────────────────────────────────
  const handleChartDrillDown = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // ─── Prep chart data ───────────────────────────────────────────────────────
  const funnelData = metrics.A1?.stages?.map((s) => ({ name: s.stage, value: s.count })) || [];
  const matchHistData = metrics.A21?.histogram?.map((b) => ({ name: b.range, count: b.count, label: b.label })) || [];
  const fundingPipeData = metrics.A30?.pipeline?.filter((p) => p.estimatedAmount > 0) || [];
  const deadlineLoadData = (metrics.A36?.weeks || []).filter((_, i) => i < 12);
  const heatmapData = metrics.A33?.heatmapMatrix || [];
  const expiringData = metrics.A13?.chartData || [];
  const fundingCatData = metrics.A26?.categories?.slice(0, 8) || [];
  const unmetData = metrics.A22?.failureFrequency?.filter((f) => f.count > 0) || [];
  const readinessTrendData = metrics.A9?.trendPoints || [];
  const awardSizeData = metrics.A31?.distribution || [];
  const timePerSection = metrics.A38?.sections || [];
  const searchTerms = metrics.A20?.searchTerms?.slice(0, 8) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {T.analytics.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {T.analytics.pageSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setColorBlindMode((p) => !p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${colorBlindMode ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            🎨 {T.analytics.colorBlindMode}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {T.analytics.exportJson}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{T.analytics.filterDateRange}:</span>
          {["Last 30 Days", "Last 60 Days", "Last 90 Days", "All Time"].map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${dateRange === r ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              {r}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 cursor-pointer"
          >
            <option value="all">{T.analytics.allProviders}</option>
            {providers.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 cursor-pointer"
          >
            <option value="all">{T.analytics.allCategories}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showPeriodComparison}
              onChange={(e) => setShowPeriodComparison(e.target.checked)}
              className="accent-violet-600"
            />
            {T.analytics.periodComparison}
          </label>
        </div>
      </div>

      {/* KPI Row (A25, A9, A7, next deadline) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={T.analytics.estFunding}
          value={metrics.A25?.formatted || "₹0"}
          sub={`${metrics.A25?.opportunityCount || 0} saved opportunities`}
          icon={Award}
          iconColor="text-violet-600 dark:text-violet-400"
          isEstimated
          to="/calculator"
        />
        <KPICard
          label={T.analytics.readinessAvg}
          value={`${metrics.A9?.currentScore || 0}%`}
          sub={`Trend: ${metrics.A9?.trendDirection === "increasing" ? "↗ Improving" : "→ Steady"}`}
          icon={Gauge}
          iconColor="text-teal-600 dark:text-teal-400"
          warning={metrics.A9?.currentScore < 60 ? "Low readiness — complete your profile" : null}
        />
        <KPICard
          label={T.analytics.stalledApps}
          value={stalledCount}
          sub={stalledCount > 0 ? T.analytics.needReview : "All applications progressing"}
          icon={Clock}
          iconColor={stalledCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}
          warning={stalledCount > 0 ? `${stalledCount} stalled 14+ days` : null}
          to="/applications"
        />
        <KPICard
          label={T.analytics.daysToDeadline}
          value={daysToNextDeadline}
          sub="until nearest upcoming deadline"
          icon={Calendar}
          iconColor="text-rose-600 dark:text-rose-400"
          to="/calendar"
        />
      </div>

      {/* Insight Engine */}
      {insights.length > 0 && (
        <section className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <Lightbulb className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">{T.analytics.insightEngineTitle}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{T.analytics.insightEngineSubtitle}</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins) => <InsightCard key={ins.id} insight={ins} />)}
          </div>
        </section>
      )}

      {/* Chart Grid Row 1: Conversion Funnel + Match Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          id="funnel"
          title={T.analytics.conversionFunnelTitle}
          subtitle="Applications by pipeline stage (click a bar to drill down)"
          tooltip={METRIC_DEFINITIONS.A1}
          srSummary={`Application funnel: ${funnelData.map((s) => `${s.name} ${s.value}`).join(", ")}`}
          tableData={funnelData}
          tableColumns={[{ key: "name", label: "Stage" }, { key: "value", label: "Applications" }]}
        >
          {metrics.A1?.hasData ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnelData} margin={{ top: 4, right: 10, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="transparent" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} onClick={(data) => handleChartDrillDown("/applications")} cursor="pointer">
                    {funnelData.map((e, i) => (
                      <Cell key={i} fill={Object.values(STATUS_COLORS)[i] || palette[i % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex items-center gap-3 text-[11px] flex-wrap">
                {funnelData.map((s, i) => (
                  <span key={s.name} className="flex items-center gap-1">
                    <span style={{ background: Object.values(STATUS_COLORS)[i] || palette[i] }} className="w-2.5 h-2.5 rounded-full inline-block" />
                    {s.name}: <strong>{s.value}</strong>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Rejection Rate: <span className="font-bold text-rose-500">{metrics.A4?.rejectionRatePercent ?? 0}%</span></span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500 dark:text-slate-400">Award Rate: <span className="font-bold text-emerald-500">{metrics.A4?.awardRatePercent ?? 0}%</span></span>
                <span className="text-[9px] italic text-slate-400 ml-1">(separate figures, never combined)</span>
              </div>
            </>
          ) : <EmptyChartState />}
        </ChartCard>

        <ChartCard
          id="match-histogram"
          title={T.analytics.matchHistogramTitle}
          subtitle="Distribution of estimated match scores across the full catalogue"
          tooltip={METRIC_DEFINITIONS.A21}
          srSummary={`Match score distribution: ${matchHistData.map((b) => `${b.name}: ${b.count} scholarships`).join("; ")}`}
          tableData={matchHistData}
          tableColumns={[{ key: "name", label: "Score Range" }, { key: "count", label: "Count" }, { key: "label", label: "Category" }]}
        >
          {metrics.A21?.hasData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={matchHistData} margin={{ top: 4, right: 10, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={palette[0]} onClick={() => handleChartDrillDown("/explorer")} cursor="pointer">
                  {matchHistData.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                  <LabelList dataKey="count" position="top" style={{ fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChartState />}
        </ChartCard>
      </div>

      {/* Chart Grid Row 2: Funding Pipeline + Deadline Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          id="funding-pipeline"
          title={T.analytics.fundingPipelineTitle}
          subtitle="Estimated funding value at each tracker stage (all amounts estimated)"
          tooltip={METRIC_DEFINITIONS.A29}
          srSummary={`Funding pipeline total: ${metrics.A30?.totalPipelineFunding?.toLocaleString("en-IN") || 0} rupees`}
          tableData={fundingPipeData}
          tableColumns={[{ key: "stage", label: "Stage" }, { key: "formatted", label: "Est. Funding" }]}
        >
          {metrics.A30?.hasData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fundingPipeData} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} width={60} />
                <Tooltip content={<CustomTooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />} />
                <Bar dataKey="estimatedAmount" radius={[0, 6, 6, 0]} fill={palette[1]}>
                  {fundingPipeData.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                  <LabelList dataKey="formatted" position="right" style={{ fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChartState />}
        </ChartCard>

        <ChartCard
          id="deadline-load"
          title={T.analytics.deadlineLoadTitle}
          subtitle="Number of scholarship deadlines falling per week in the next 12 weeks"
          tooltip={METRIC_DEFINITIONS.A36}
          srSummary={`Deadline load over 12 weeks; busiest is Week ${metrics.A37?.busiestWeekNumber} with ${metrics.A37?.deadlineCount} deadlines.`}
          tableData={deadlineLoadData}
          tableColumns={[{ key: "label", label: "Week" }, { key: "deadlineCount", label: "Deadlines" }]}
        >
          {metrics.A36?.hasData ? (
            <>
              {metrics.A37?.isOverloaded && (
                <div className="mb-2 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {metrics.A37.warning}
                </div>
              )}
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={deadlineLoadData} margin={{ top: 4, right: 10, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="transparent" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="deadlineCount" radius={[4, 4, 0, 0]}>
                    {deadlineLoadData.map((w, i) => (
                      <Cell key={i} fill={w.deadlineCount > 3 ? "#EF4444" : palette[2]} />
                    ))}
                    <LabelList dataKey="deadlineCount" position="top" style={{ fontSize: 10 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : <EmptyChartState />}
        </ChartCard>
      </div>

      {/* Chart Grid Row 3: Activity Heatmap + Expiring Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          id="activity-heatmap"
          title={T.analytics.activityHeatmapTitle}
          subtitle="Local interaction events by day and time of day"
          tooltip={METRIC_DEFINITIONS.A33}
          srSummary={`Activity heatmap shows ${metrics.A33?.totalEventsTracked || 0} tracked local interactions.`}
        >
          {metrics.A33?.hasData ? (
            <div className="mt-2">
              <div className="grid grid-cols-5 gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <div /> {/* spacer */}
                {["Night", "Morning", "Afternoon", "Evening"].map((b) => (
                  <div key={b} className="text-center font-semibold truncate">{b}</div>
                ))}
              </div>
              {heatmapData.map((dayRow) => {
                const max = Math.max(...dayRow.blocks.map((b) => b.count), 1);
                return (
                  <div key={dayRow.day} className="grid grid-cols-5 gap-1.5 mt-1 items-center">
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{dayRow.day}</div>
                    {dayRow.blocks.map((block, bi) => {
                      const intensity = block.count / max;
                      return (
                        <div
                          key={bi}
                          title={`${dayRow.day} ${block.label}: ${block.count} events`}
                          aria-label={`${dayRow.day} ${block.label}: ${block.count} events`}
                          className="h-7 rounded-md transition-all"
                          style={{
                            background: colorBlindMode
                              ? `rgba(33,102,172,${0.08 + intensity * 0.9})`
                              : `rgba(108,92,231,${0.08 + intensity * 0.9})`
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
              <p className="mt-2 text-[10px] text-slate-400 italic">Darker cells indicate higher local activity. Local interactions only — no server tracking.</p>
            </div>
          ) : <EmptyChartState />}
        </ChartCard>

        <ChartCard
          id="expiring-docs"
          title={T.analytics.expiringDocsTitle}
          subtitle="Certified documents approaching expiration (30 / 60 / 90-day windows)"
          tooltip={METRIC_DEFINITIONS.A13}
          srSummary={`${metrics.A13?.within30Days?.count || 0} documents expire within 30 days, ${metrics.A13?.within60Days?.count || 0} within 60, ${metrics.A13?.within90Days?.count || 0} within 90.`}
          tableData={expiringData}
          tableColumns={[{ key: "window", label: "Window" }, { key: "count", label: "Documents" }]}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expiringData} margin={{ top: 10, right: 10, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="window" tick={{ fontSize: 11 }} stroke="transparent" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {expiringData.map((_, i) => (
                  <Cell key={i} fill={[palette[3], palette[2], palette[0]][i] || palette[i % palette.length]} />
                ))}
                <LabelList dataKey="count" position="top" style={{ fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {metrics.A13?.within30Days?.items?.length > 0 && (
            <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
              <strong>{metrics.A13.within30Days.items[0]?.name}</strong> expires in {metrics.A13.within30Days.items[0]?.daysRemaining} days.{" "}
              <Link to="/documents" className="underline font-semibold">Renew now →</Link>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Chart Grid Row 4: Funding by Category + Unmet Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          id="funding-category"
          title={T.analytics.fundingByCategoryTitle}
          subtitle="Estimated funding distribution across scholarship categories (all amounts estimated)"
          tableData={fundingCatData}
          tableColumns={[{ key: "category", label: "Category" }, { key: "formattedAmount", label: "Est. Funding" }]}
          srSummary={`Top category by funding: ${fundingCatData[0]?.category || "N/A"} with ${fundingCatData[0]?.formattedAmount || "0"}`}
        >
          {fundingCatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={fundingCatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="amount"
                  nameKey="category"
                  onClick={(d) => handleChartDrillDown("/explorer")}
                  cursor="pointer"
                >
                  {fundingCatData.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChartState />}
          {fundingCatData.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {fundingCatData.slice(0, 5).map((c, i) => (
                <span key={c.category} className="flex items-center gap-1 text-[11px]">
                  <span style={{ background: palette[i % palette.length] }} className="w-2.5 h-2.5 rounded-full inline-block" />
                  {c.category}
                </span>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard
          id="unmet-criteria"
          title={T.analytics.mandatoryFailuresTitle}
          subtitle="Criteria that most frequently rule out scholarships from your catalogue"
          tooltip={METRIC_DEFINITIONS.A22}
          tableData={unmetData}
          tableColumns={[{ key: "criteria", label: "Criteria" }, { key: "count", label: "Scholarships Blocked" }]}
          srSummary={`Top blocking criterion: ${unmetData[0]?.criteria || "None"} blocks ${unmetData[0]?.count || 0} scholarships.`}
        >
          {unmetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={unmetData} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="criteria" tick={{ fontSize: 9 }} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {unmetData.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                  <LabelList dataKey="count" position="right" style={{ fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState reason="No matching scholarships analysed. Add scholarships to the Explorer to see criteria analysis." />
          )}
        </ChartCard>
      </div>

      {/* Chart Grid Row 5: Readiness Trend + Time Per Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          id="readiness-trend"
          title="Readiness Score Trend"
          subtitle="Composite readiness computed from profile (35%), documents (45%), preparation steps (20%)"
          tooltip={METRIC_DEFINITIONS.A9}
          tableData={readinessTrendData}
          tableColumns={[{ key: "period", label: "Period" }, { key: "score", label: "Readiness Score (%)" }]}
          srSummary={`Current readiness: ${metrics.A9?.currentScore || 0}%. Trend: ${metrics.A9?.trendDirection}`}
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={readinessTrendData} margin={{ top: 10, right: 10, bottom: 4, left: -20 }}>
              <defs>
                <linearGradient id="readinessGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={palette[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={palette[0]} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="transparent" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
              <Area type="monotone" dataKey="score" stroke={palette[0]} fill="url(#readinessGradient)" strokeWidth={2.5} dot={{ r: 4, fill: palette[0] }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="time-per-section"
          title="Time Spent Per Section"
          subtitle="Estimated minutes in each module derived from local navigation event timestamps"
          tooltip={METRIC_DEFINITIONS.A38}
          tableData={timePerSection}
          tableColumns={[{ key: "section", label: "Section" }, { key: "minutes", label: "Est. Minutes" }, { key: "percentage", label: "Share %" }]}
        >
          {timePerSection.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timePerSection} margin={{ top: 4, right: 10, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="section" tick={{ fontSize: 10 }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {timePerSection.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                  <LabelList dataKey="minutes" position="top" style={{ fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChartState />}
        </ChartCard>
      </div>

      {/* Scenario Comparison + Award Size Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          id="scenario-comparison"
          title="Scenario Comparison (Top 3 / 5 / 10 Opportunities)"
          subtitle="Estimated aggregate funding if applying to top scholarships by award size"
          tableData={metrics.A32?.scenarios}
          tableColumns={[{ key: "scenario", label: "Scenario" }, { key: "formatted", label: "Est. Funding" }, { key: "count", label: "Scholarships" }]}
          srSummary={`Top 10 scenario: ${metrics.A32?.scenarios?.[2]?.formatted || "N/A"}`}
        >
          {metrics.A32?.hasData ? (
            <div className="space-y-3 mt-2">
              {(metrics.A32?.scenarios || []).map((sc, i) => (
                <div key={sc.scenario} className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-32 shrink-0">{sc.scenario}</div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (sc.estimatedFunding / (metrics.A32?.scenarios?.[2]?.estimatedFunding || 1)) * 100)}%`,
                        background: palette[i]
                      }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white shrink-0 w-28 text-right">{sc.formatted}</div>
                </div>
              ))}
              <p className="text-[10px] text-slate-400 italic mt-1">All amounts estimated. Stacking rules may limit actual totals.</p>
            </div>
          ) : <EmptyChartState />}
        </ChartCard>

        <ChartCard
          id="award-size-dist"
          title={T.analytics.fundingPipelineTitle + " — Award Size Distribution"}
          subtitle="All catalogue scholarships grouped by award amount"
          tableData={awardSizeData}
          tableColumns={[{ key: "range", label: "Award Range" }, { key: "count", label: "Scholarships" }]}
          srSummary={`Award size distribution: ${awardSizeData.map((b) => `${b.range}: ${b.count}`).join("; ")}`}
        >
          {metrics.A31?.hasData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={awardSizeData} margin={{ top: 10, right: 10, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {awardSizeData.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                  <LabelList dataKey="count" position="top" style={{ fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChartState />}
        </ChartCard>
      </div>

      {/* Activity Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Active Days Streak</h3>
          <div className="text-4xl font-black text-violet-600 dark:text-violet-400">
            {metrics.A34?.currentStreakDays ?? 1}
            <span className="text-lg font-bold text-slate-500 ml-1">days</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Longest streak: <strong>{metrics.A34?.longestStreakDays ?? 1} days</strong>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Session Metrics</h3>
          <div className="text-4xl font-black text-teal-600 dark:text-teal-400">
            {metrics.A35?.avgSessionMinutes ?? "—"}
            <span className="text-lg font-bold text-slate-500 ml-1">min avg</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Across <strong>{metrics.A35?.sessionCount ?? 1} estimated sessions</strong>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Submission Timing</h3>
          <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.A8?.onTimeRatePercent ?? 100}%
            <span className="text-lg font-bold text-slate-500 ml-1">on-time</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.A8?.onTimeCount ?? 0} on-time • {metrics.A8?.lateCount ?? 0} late submissions
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <ChartCard
        id="activity-timeline"
        title="Activity Timeline"
        subtitle="Recent status changes, document updates, and saves across your applications"
      >
        {metrics.A40?.hasData ? (
          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-2">
            {metrics.A40.timeline.map((ev, i) => (
              <div key={ev.id || i} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-violet-500" />
                <div className="flex-1">
                  <div className="text-slate-700 dark:text-slate-200 font-medium">{ev.description}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    {ev.timestamp ? new Date(ev.timestamp).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyChartState reason="No activity events recorded yet. Activity is tracked from saves, status changes, and document updates." />
        )}
      </ChartCard>

      {/* Footer Data Notice */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/60 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 shrink-0 text-violet-500" />
          <span>
            All metrics computed locally from your GRANTLY LocalStorage state only.{" "}
            <strong className="text-slate-700 dark:text-slate-200">No data leaves your device.</strong>{" "}
            Funding amounts are labelled as estimated and are never presented as confirmed awards.
          </span>
        </div>
      </div>
    </div>
  );
}
