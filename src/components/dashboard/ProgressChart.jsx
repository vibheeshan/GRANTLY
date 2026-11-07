import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Send,
  Award,
  Bookmark,
  ArrowRight,
  BarChart3,
  Layers,
  Sparkles,
  Inbox
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { formatCurrency } from "../../utils/formatters.js";

/**
 * Custom Tooltip for Recharts Pipeline Funnel
 * Supports both mouse hover and touch tap on mobile devices.
 */
function PipelineTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1E293B] text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.fill }}
          />
          <span className="font-bold text-sm">{data.stage}</span>
        </div>
        <p className="text-slate-300">
          <strong className="text-white">{data.count}</strong> {data.count === 1 ? "opportunity" : "opportunities"}
        </p>
        <p className="text-[10px] text-slate-400">
          {data.percentage}% of overall pipeline activity
        </p>
      </div>
    );
  }
  return null;
}

export function ProgressChart({ applications = [], savedCount = 0 }) {
  // Mount state guard to prevent Recharts 0x0 measure issues before DOM paint
  const [isMounted, setIsMounted] = useState(false);
  // View toggle: "chart" (Recharts) or "funnel" (CSS command-center bars)
  const [viewMode, setViewMode] = useState("chart");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Coerce every count with Number(x) || 0
  const bookmarkedCount = Number(savedCount) || 0;
  const applyingCount = applications.filter((a) => a.status === "Applying").length;
  const submittedCount = applications.filter((a) => a.status === "Submitted").length;
  const underReviewCount = applications.filter((a) => a.status === "Under Review").length;
  const awardedCount = applications.filter((a) => a.status === "Awarded").length;

  const totalTracked = applications.length;

  // Calculate potential funds (coerced)
  const potentialAmount = applications
    .filter((a) => a.status !== "Rejected")
    .reduce((sum, a) => sum + (Number(a.awardAmount) || 0), 0);

  const stages = [
    {
      stage: "Bookmarked",
      label: "Bookmarked",
      count: Number(bookmarkedCount) || 0,
      fill: "#8B5CF6",
      colorClass: "bg-violet-500",
      textColor: "text-violet-600 dark:text-violet-400",
      icon: Bookmark
    },
    {
      stage: "Preparing",
      label: "Preparing",
      count: Number(applyingCount) || 0,
      fill: "#3B82F6",
      colorClass: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      icon: Clock
    },
    {
      stage: "Submitted",
      label: "Submitted",
      count: Number(submittedCount) || 0,
      fill: "#F59E0B",
      colorClass: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      icon: Send
    },
    {
      stage: "In Review",
      label: "In Review",
      count: Number(underReviewCount) || 0,
      fill: "#6366F1",
      colorClass: "bg-indigo-500",
      textColor: "text-indigo-600 dark:text-indigo-400",
      icon: CheckCircle2
    },
    {
      stage: "Awarded",
      label: "Awarded",
      count: Number(awardedCount) || 0,
      fill: "#14B8A6",
      colorClass: "bg-teal-500",
      textColor: "text-teal-600 dark:text-teal-400",
      icon: Award
    }
  ];

  const totalPipelineCount = stages.reduce((sum, s) => sum + (Number(s.count) || 0), 0);
  const maxStageCount = Math.max(...stages.map((s) => s.count), 1);

  // Compute percentage of each stage
  const chartData = stages.map((stg) => ({
    ...stg,
    percentage: totalPipelineCount > 0 ? Math.round((stg.count / totalPipelineCount) * 100) : 0,
    widthPercentOfMax: Math.max(Math.round((stg.count / maxStageCount) * 100), stg.count > 0 ? 10 : 0)
  }));

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle subtitle="Real-time application lifecycle distribution">
            Pipeline Funnel &amp; Grant Potential
          </CardTitle>
        </div>
        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          {totalPipelineCount > 0 && (
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("chart")}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === "chart"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Interactive Recharts Bar View"
              >
                <BarChart3 className="w-3 h-3" />
                <span>Bar Chart</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("funnel")}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === "funnel"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="CSS Command Center Funnel View"
              >
                <Layers className="w-3 h-3" />
                <span>Funnel</span>
              </button>
            </div>
          )}

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Potential Grants
            </span>
            <span className="text-base sm:text-lg font-extrabold text-teal-600 dark:text-teal-400 font-heading">
              {formatCurrency(potentialAmount)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Main Chart Area with explicit height wrapper */}
        <div className="h-72 w-full min-h-[288px] relative">
          {totalPipelineCount === 0 ? (
            /* Explicit Empty State when total of all stages is 0 */
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No applications yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
                Save a scholarship to start your pipeline and visualize application conversion milestones.
              </p>
              <Link to="/explorer">
                <Button size="sm" variant="primary" icon={Sparkles}>
                  Discover Scholarships
                </Button>
              </Link>
            </div>
          ) : viewMode === "chart" && isMounted ? (
            /* Recharts Vertical Pipeline Bar Chart */
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 35, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="rgba(148, 163, 184, 0.15)"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                  width={80}
                />
                <Tooltip
                  content={<PipelineTooltip />}
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            /* CSS-based Funnel: 5 horizontal bars proportional to largest stage */
            <div className="h-full w-full flex flex-col justify-between py-2 space-y-2.5">
              {chartData.map((stg, idx) => {
                const Icon = stg.icon;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Icon className={`w-3.5 h-3.5 ${stg.textColor}`} />
                        <span>{stg.stage}</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {stg.count} ({stg.percentage}%)
                      </span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        style={{ width: `${stg.widthPercentOfMax}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${stg.colorClass} shadow-xs flex items-center justify-end pr-1.5`}
                      >
                        {stg.count > 0 && (
                          <span className="text-[9px] font-bold text-white leading-none">
                            {stg.count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stage Grid Metrics (5 bottom tiles) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center mb-1">
                  <Icon className={`w-4 h-4 ${stg.textColor}`} />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white block font-heading">
                  {stg.count}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick hint & CTA */}
        <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 flex items-center justify-between text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Keep your document checklist updated to expedite verification.
          </p>
          <Link
            to="/applications"
            className="font-bold text-violet-700 dark:text-violet-400 hover:underline shrink-0 ml-2 inline-flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
