import React from "react";

export function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  className = "",
  disabled = false,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl border ${
            error
              ? "border-rose-400 focus:ring-rose-400 focus:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20"
              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 focus:border-violet-500 focus:ring-violet-500/20"
          } py-2.5 ${
            Icon ? "pl-10" : "pl-3.5"
          } pr-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}

export function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  helperText,
  className = "",
  disabled = false,
  required = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none rounded-xl border ${
            error
              ? "border-rose-400 focus:ring-rose-400 focus:border-rose-500"
              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 focus:border-violet-500 focus:ring-violet-500/20"
          } py-2.5 pl-3.5 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
          {...props}
        >
          {options.map((opt, idx) => {
            if (typeof opt === "string") {
              return (
                <option key={idx} value={opt} className="dark:bg-slate-900">
                  {opt}
                </option>
              );
            }
            return (
              <option key={idx} value={opt.value} className="dark:bg-slate-900">
                {opt.label}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  helperText,
  className = "",
  disabled = false,
  required = false,
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl border ${
          error
            ? "border-rose-400 focus:ring-rose-400 focus:border-rose-500"
            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 focus:border-violet-500 focus:ring-violet-500/20"
        } p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}
