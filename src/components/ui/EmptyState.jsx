import React from "react";
import { Inbox, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "./Button.jsx";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "No items match your selected parameters or criteria.",
  actionLabel,
  onAction,
  actionIcon: ActionIcon = RotateCcw,
  className = ""
}) {
  return (
    <div
      className={`p-10 sm:p-14 text-center rounded-3xl bg-white dark:bg-[#151F33] border border-[#E8EAF2] dark:border-[#27334A] space-y-4 shadow-2xs max-w-xl mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 shadow-2xs">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[#172033] dark:text-white font-heading">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            icon={ActionIcon}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
