import React from "react";

export function Card({
  children,
  className = "",
  hover = false,
  glass = false,
  onClick,
  ...props
}) {
  const hoverClass = hover
    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
    : "";

  const bgClass = glass
    ? "bg-white/90 dark:bg-[rgba(21,31,51,0.7)] backdrop-blur-md"
    : "bg-white dark:bg-[rgba(21,31,51,0.65)] backdrop-blur-md";

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[#E6E9F2] dark:border-[rgba(255,255,255,0.08)] shadow-2xs ${bgClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-5 sm:p-6 pb-2 sm:pb-3 border-b border-slate-100 dark:border-slate-800/80 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", subtitle }) {
  return (
    <div>
      <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight ${className}`}>
        {children}
      </h3>
      {subtitle && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`p-5 sm:p-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 ${className}`}>
      {children}
    </div>
  );
}
