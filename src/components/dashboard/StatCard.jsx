import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = "violet",
  trend,
  linkTo,
  linkText
}) {
  const variants = {
    violet: {
      bg: "bg-white dark:bg-[#151F33]",
      iconBg: "bg-violet-50 text-[#6C5CE7] dark:bg-violet-950/60 dark:text-[#A78BFA]",
      accent: "text-[#6C5CE7] dark:text-[#A78BFA]",
      border: "border-[#E8EAF2] dark:border-[#27334A]"
    },
    teal: {
      bg: "bg-white dark:bg-[#151F33]",
      iconBg: "bg-teal-50 text-[#14B8A6] dark:bg-teal-950/60 dark:text-[#2DD4BF]",
      accent: "text-[#14B8A6] dark:text-[#2DD4BF]",
      border: "border-[#E8EAF2] dark:border-[#27334A]"
    },
    blue: {
      bg: "bg-white dark:bg-[#151F33]",
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
      accent: "text-blue-600 dark:text-blue-400",
      border: "border-[#E8EAF2] dark:border-[#27334A]"
    },
    amber: {
      bg: "bg-white dark:bg-[#151F33]",
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
      accent: "text-amber-600 dark:text-amber-400",
      border: "border-[#E8EAF2] dark:border-[#27334A]"
    }
  };

  const style = variants[variant] || variants.violet;

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <h4 className="text-3xl font-extrabold text-[#172033] dark:text-white mt-1.5 font-heading tracking-tight tabular-nums">
              {value}
            </h4>
          </div>

          <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Trend / Status Indicator & Subtext */}
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </span>
          )}
          {subtext && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>

      {linkTo && (
        <div className="mt-4 pt-3 border-t border-[#E8EAF2] dark:border-[#27334A] flex items-center justify-between text-xs">
          <Link
            to={linkTo}
            className={`font-semibold ${style.accent} hover:underline inline-flex items-center gap-1`}
          >
            <span>{linkText || "View details"}</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
