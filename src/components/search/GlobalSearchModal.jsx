import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Sparkles,
  GraduationCap,
  ClipboardList,
  FileText,
  Calendar,
  Layers,
  Calculator,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Compass
} from "lucide-react";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

export function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    allScholarships,
    applications,
    documents,
    openMatchDna,
    setIsOnboardingOpen
  } = useScholarships();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Quick Action Shortcuts
  const quickActions = useMemo(() => [
    {
      id: "act-matcher",
      type: "action",
      title: "Smart Eligibility Matcher",
      subtitle: "Deterministic criteria simulation & parameters",
      icon: Sparkles,
      color: "text-teal-500",
      link: "/matcher"
    },
    {
      id: "act-compare",
      type: "action",
      title: "Scholarship Comparison Studio",
      subtitle: "Compare up to 3 opportunities side-by-side",
      icon: Layers,
      color: "text-violet-500",
      link: "/compare"
    },
    {
      id: "act-calculator",
      type: "action",
      title: "Funding Opportunity Calculator",
      subtitle: "Estimate potential grants & stackability scenarios",
      icon: Calculator,
      color: "text-blue-500",
      link: "/calculator"
    },
    {
      id: "act-insights",
      type: "action",
      title: "Student Success Insights",
      subtitle: "Analytics, pipeline velocity & document readiness",
      icon: Compass,
      color: "text-emerald-500",
      link: "/insights"
    },
    {
      id: "act-onboarding",
      type: "action",
      title: "Profile Onboarding Wizard",
      subtitle: "Review multi-step profile completeness",
      icon: GraduationCap,
      color: "text-purple-500",
      onSelect: () => {
        onClose();
        setIsOnboardingOpen(true);
      }
    }
  ], [onClose, setIsOnboardingOpen]);

  // Compute live search matches
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    // Scholarships
    let schMatches = allScholarships.map(s => ({
      id: `sch-${s.id}`,
      originalId: s.id,
      type: "scholarship",
      title: s.title,
      subtitle: `${s.provider} • ${formatCurrency(s.awardAmount, s.currency)}`,
      badge: s.isFullyEligible ? "100% Eligible" : `${s.matchScore}% Match`,
      badgeColor: s.isFullyEligible ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      icon: GraduationCap,
      link: `/scholarship/${s.id}`,
      raw: s
    }));

    // Applications
    let appMatches = applications.map(a => ({
      id: `app-${a.id}`,
      originalId: a.id,
      type: "application",
      title: a.scholarshipTitle,
      subtitle: `Stage: ${a.status} • Deadline: ${formatDate(a.deadline)}`,
      badge: a.status,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      icon: ClipboardList,
      link: `/applications`
    }));

    // Documents
    let docMatches = documents.map(d => ({
      id: `doc-${d.id}`,
      originalId: d.id,
      type: "document",
      title: d.name,
      subtitle: `${d.category} • ${d.fileDetails || d.description}`,
      badge: d.isReady ? "Ready" : "Pending",
      badgeColor: d.isReady ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
      icon: FileText,
      link: `/documents`
    }));

    if (q) {
      schMatches = schMatches.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.raw.eligibleCourses.some(c => c.toLowerCase().includes(q)) ||
        s.raw.states.some(st => st.toLowerCase().includes(q)) ||
        s.raw.categories.some(cat => cat.toLowerCase().includes(q))
      );
      appMatches = appMatches.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q)
      );
      docMatches = docMatches.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q)
      );
    }

    const filteredActions = q
      ? quickActions.filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q))
      : quickActions;

    // Filter by tab
    if (selectedCategory === "SCHOLARSHIPS") return schMatches;
    if (selectedCategory === "APPLICATIONS") return appMatches;
    if (selectedCategory === "DOCUMENTS") return docMatches;
    if (selectedCategory === "ACTIONS") return filteredActions;

    // ALL: grouped or interleaved
    return [...filteredActions, ...schMatches, ...appMatches, ...docMatches];
  }, [query, selectedCategory, allScholarships, applications, documents, quickActions]);

  // Handle keyboard arrow navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter" && searchResults[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(searchResults[selectedIndex]);
    }
  };

  const handleSelectResult = (item) => {
    onClose();
    if (item.onSelect) {
      item.onSelect();
    } else if (item.link) {
      navigate(item.link);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 lg:p-20"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative mx-auto max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 transition-all">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200/80 dark:border-slate-800">
          <Search className="pointer-events-none absolute left-5 top-4 h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search scholarships, applications, certificates, or tools... (Esc to exit)"
            className="h-13 w-full border-0 bg-transparent pl-13 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-800/30">
          {["ALL", "SCHOLARSHIPS", "APPLICATIONS", "DOCUMENTS", "ACTIONS"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100/80 dark:divide-slate-800/60">
          {searchResults.map((item, index) => {
            const Icon = item.icon;
            const isSelected = selectedIndex === index;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectResult(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-violet-50/80 dark:bg-violet-950/40 text-violet-900 dark:text-violet-100"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 ${item.color || "text-slate-500"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}

          {searchResults.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                No matching results found for "{query}"
              </p>
              <p>Try searching by degree (Engineering), location (Maharashtra), or document name.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><strong>↑↓</strong> Navigate</span>
            <span><strong>Enter</strong> Select</span>
            <span><strong>Esc</strong> Close</span>
          </div>
          <span>Showing {searchResults.length} items</span>
        </div>
      </div>
    </div>
  );
}
