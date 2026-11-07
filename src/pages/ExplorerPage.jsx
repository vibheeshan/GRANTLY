import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Sparkles, Filter, Bookmark, Inbox, RotateCcw } from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { ScholarshipCard } from "../components/scholarships/ScholarshipCard.jsx";
import { ScholarshipFilters } from "../components/scholarships/ScholarshipFilters.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

export function ExplorerPage() {
  const { allScholarships, savedIds } = useScholarships();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState("grid");

  // Filters state initialized from URL or defaults
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: "All Categories",
    educationLevel: "All Levels",
    state: "All India",
    sortBy: "match", // "match" | "deadline" | "award-desc" | "award-asc"
    onlySaved: searchParams.get("filter") === "saved",
    onlyEligible: searchParams.get("filter") === "eligible",
    minAmount: 0
  });

  // Keep in sync if search param changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlFilter = searchParams.get("filter");
    if (urlSearch !== null) {
      setFilters(prev => ({ ...prev, search: urlSearch }));
    }
    if (urlFilter === "saved") {
      setFilters(prev => ({ ...prev, onlySaved: true, onlyEligible: false }));
    } else if (urlFilter === "eligible" || urlFilter === "recommended") {
      setFilters(prev => ({ ...prev, onlyEligible: true, onlySaved: false }));
    }
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "All Categories",
      educationLevel: "All Levels",
      state: "All India",
      sortBy: "match",
      onlySaved: false,
      onlyEligible: false,
      minAmount: 0,
      maxIncome: 0
    });
    setSearchParams({});
  };

  // Filter & sort logic
  const filteredScholarships = useMemo(() => {
    return allScholarships
      .filter((sch) => {
        // Keyword Search
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const inTitle = sch.title.toLowerCase().includes(q);
          const inProvider = sch.provider.toLowerCase().includes(q);
          const inDesc = sch.description.toLowerCase().includes(q);
          const inCats = sch.categories.some(c => c.toLowerCase().includes(q));
          const inCourses = sch.eligibleCourses.some(c => c.toLowerCase().includes(q));
          if (!inTitle && !inProvider && !inDesc && !inCats && !inCourses) {
            return false;
          }
        }

        // Category
        if (filters.category !== "All Categories") {
          if (!sch.categories.includes(filters.category)) {
            return false;
          }
        }

        // Education Level
        if (filters.educationLevel !== "All Levels") {
          if (
            !sch.educationLevels.includes("All Levels") &&
            !sch.educationLevels.includes(filters.educationLevel)
          ) {
            return false;
          }
        }

        // State Domicile
        if (filters.state !== "All India") {
          if (!sch.states.includes("All India") && !sch.states.includes(filters.state)) {
            return false;
          }
        }

        // Income Criteria Filter
        if (filters.maxIncome && filters.maxIncome > 0) {
          if (sch.maximumFamilyIncome < filters.maxIncome) {
            return false;
          }
        }

        // Minimum Award Amount Filter
        if (filters.minAmount && filters.minAmount > 0) {
          if (sch.awardAmount < filters.minAmount) {
            return false;
          }
        }

        // Only Saved
        if (filters.onlySaved && !savedIds.includes(sch.id)) {
          return false;
        }

        // Only Eligible
        if (filters.onlyEligible && !sch.isFullyEligible) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "deadline":
            return new Date(a.deadline) - new Date(b.deadline);
          case "award-desc":
            return b.awardAmount - a.awardAmount;
          case "award-asc":
            return a.awardAmount - b.awardAmount;
          case "match":
          default:
            if (a.isFullyEligible !== b.isFullyEligible) {
              return a.isFullyEligible ? -1 : 1;
            }
            return (b.matchScore || 0) - (a.matchScore || 0);
        }
      });
  }, [allScholarships, filters, savedIds]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Scholarship Explorer
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover verified demonstration scholarships, test match eligibility, and bookmark for submission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filters.onlySaved && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Viewing Bookmarked Only ({filteredScholarships.length})</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <ScholarshipFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalResults={filteredScholarships.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Results Listing */}
      {filteredScholarships.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-4"
          }
        >
          {filteredScholarships.map((sch) => (
            <ScholarshipCard
              key={sch.id}
              scholarship={sch}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          title="No scholarships matched your criteria"
          description="Try adjusting your category, education level, or resetting search filters to see all available demonstration opportunities."
          actionLabel="Reset All Filters"
          onAction={handleClearFilters}
        />
      )}
    </div>
  );
}
