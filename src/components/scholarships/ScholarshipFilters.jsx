import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal,
  Wallet,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import {
  SCHOLARSHIP_CATEGORIES,
  EDUCATION_LEVELS,
  STATES_LIST,
  DEMO_SCHOLARSHIPS
} from "../../data/scholarships.js";

const INCOME_OPTIONS = [
  { label: "Any Income", value: 0 },
  { label: "Up to ₹2.5 Lakhs", value: 250000 },
  { label: "Up to ₹5.0 Lakhs", value: 500000 },
  { label: "Up to ₹8.0 Lakhs", value: 800000 }
];

const AMOUNT_OPTIONS = [
  { label: "Any Amount", value: 0 },
  { label: "₹25k+", value: 25000 },
  { label: "₹50k+", value: 50000 },
  { label: "₹1 Lakh+", value: 100000 }
];

export function ScholarshipFilters({
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
  viewMode,
  onViewModeChange
}) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchWrapperRef = useRef(null);

  // Autocomplete suggestions based on query
  const suggestions = filters.search.trim().length >= 2
    ? DEMO_SCHOLARSHIPS.filter(s =>
        s.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.provider.toLowerCase().includes(filters.search.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters =
    filters.search ||
    filters.category !== "All Categories" ||
    filters.educationLevel !== "All Levels" ||
    filters.state !== "All India" ||
    (filters.maxIncome && filters.maxIncome > 0) ||
    filters.minAmount > 0 ||
    filters.onlyEligible ||
    filters.onlySaved;

  return (
    <div className="bg-white dark:bg-[#131D32] rounded-2xl border border-[#E8EAF2] dark:border-[#27334A] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Bar: Large Search Input & View Toggles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div ref={searchWrapperRef} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onFocus={() => setShowAutocomplete(true)}
            onChange={(e) => {
              onFilterChange("search", e.target.value);
              setShowAutocomplete(true);
            }}
            placeholder="Search by grant name, provider, discipline (e.g. STEM, Tata, Medha)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6957E8]/20 focus:border-[#6957E8]"
          />
          {filters.search && (
            <button
              onClick={() => {
                onFilterChange("search", "");
                setShowAutocomplete(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete Suggestions Popup */}
          {showAutocomplete && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#131D32] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onFilterChange("search", item.title);
                    setShowAutocomplete(false);
                  }}
                  className="p-3 hover:bg-violet-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.provider}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6957E8] dark:text-[#A78BFA] shrink-0 font-mono">
                    ₹{(item.awardAmount / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Mode & Quick Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onFilterChange("onlySaved", !filters.onlySaved)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              filters.onlySaved
                ? "bg-violet-50 border-violet-300 text-[#6957E8] dark:bg-violet-950/60 dark:border-violet-700 dark:text-[#A78BFA]"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${filters.onlySaved ? "fill-current" : ""}`} />
            <span>Saved Only</span>
          </button>

          <button
            onClick={() => onFilterChange("onlyEligible", !filters.onlyEligible)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              filters.onlyEligible
                ? "bg-teal-50 border-teal-300 text-[#14B8A6] dark:bg-teal-950/60 dark:border-teal-700 dark:text-[#2DD4BF]"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Eligible</span>
          </button>

          {/* Grid / List View Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/60">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips / Segmented Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SCHOLARSHIP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange("category", cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              filters.category === cat
                ? "bg-[#6C5CE7] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Detailed Filter Dropdowns: Education, State, Income, Amount, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Education Level
          </label>
          <select
            value={filters.educationLevel}
            onChange={(e) => onFilterChange("educationLevel", e.target.value)}
            className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
          >
            {EDUCATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Location / Domicile
          </label>
          <select
            value={filters.state}
            onChange={(e) => onFilterChange("state", e.target.value)}
            className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
          >
            {STATES_LIST.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Income Criteria
          </label>
          <select
            value={filters.maxIncome || 0}
            onChange={(e) => onFilterChange("maxIncome", Number(e.target.value))}
            className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
          >
            {INCOME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Min Award Amount
          </label>
          <select
            value={filters.minAmount || 0}
            onChange={(e) => onFilterChange("minAmount", Number(e.target.value))}
            className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
          >
            {AMOUNT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Sort Order
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
            className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
          >
            <option value="match">Match Score (High to Low)</option>
            <option value="deadline">Deadline (Earliest First)</option>
            <option value="award-desc">Award Amount (High to Low)</option>
            <option value="award-asc">Award Amount (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Active filters pill & Clear Button */}
      <div className="flex items-center justify-between text-xs pt-1 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-100 tabular-nums">{totalResults}</strong> opportunities
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-medium">
              Filters active
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-[#6C5CE7] dark:text-[#A78BFA] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
