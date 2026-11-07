import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export function NotificationToast({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900",
    warning: "border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-900",
    info: "border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900",
    error: "border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900"
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${
          borders[notification.type] || borders.info
        }`}
      >
        {icons[notification.type] || icons.info}
        <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
          {notification.message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5 rounded-lg"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
