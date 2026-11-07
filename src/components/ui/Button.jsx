import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = "left",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]";

  const sizes = {
    xs: "px-2.5 py-1 text-xs gap-1.5",
    sm: "px-3 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4 py-2 text-sm font-semibold gap-2",
    lg: "px-5 py-2.5 text-base font-semibold gap-2.5",
    icon: "p-2 aspect-square"
  };

  const variants = {
    primary:
      "bg-[#6C5CE7] hover:bg-[#5b4bd8] active:bg-[#4f3fc7] text-white shadow-xs focus:ring-[#6C5CE7]/40",
    teal:
      "bg-[#14B8A6] hover:bg-[#0f9f8f] active:bg-[#0d8a7c] text-white shadow-xs focus:ring-[#14B8A6]/40",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-400",
    outline:
      "border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60 focus:ring-slate-400",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70 focus:ring-slate-400",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-rose-500/20 focus:ring-rose-500",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-500/20 focus:ring-emerald-500"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === "left" && (
        <Icon className={size === "xs" || size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && (
        <Icon className={size === "xs" || size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      )}
    </button>
  );
}
