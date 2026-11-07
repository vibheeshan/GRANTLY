import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  HeartHandshake,
  Landmark,
  Building,
  Cpu,
  Wrench,
  Microscope,
  Sparkles,
  Globe2,
  Users2,
  ArrowRight,
  Search,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Compass
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency } from "../utils/formatters.js";

const CATEGORY_DEFINITIONS = [
  {
    id: "merit",
    name: "Merit-Based",
    icon: Award,
    color: "from-violet-500 to-indigo-600",
    badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    description: "Honoring academic distinctions, entrance examination percentiles, and technical excellence.",
    filterKey: "Merit-Based",
    accentLight: "bg-violet-50 dark:bg-violet-950/30",
    borderLight: "border-violet-200 dark:border-violet-900/40"
  },
  {
    id: "need",
    name: "Need-Based",
    icon: HeartHandshake,
    color: "from-teal-500 to-emerald-600",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    description: "Bridging the income threshold with comprehensive tuition waivers and living maintenance allowances.",
    filterKey: "Need-Based",
    accentLight: "bg-teal-50 dark:bg-teal-950/30",
    borderLight: "border-teal-200 dark:border-teal-900/40"
  },
  {
    id: "government",
    name: "Government",
    icon: Landmark,
    color: "from-blue-500 to-cyan-600",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    description: "Official Central, State welfare board, and National e-Scholarship portal allocations.",
    filterKey: "Government",
    accentLight: "bg-blue-50 dark:bg-blue-950/30",
    borderLight: "border-blue-200 dark:border-blue-900/40"
  },
  {
    id: "private",
    name: "Private Foundations",
    icon: Building,
    color: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    description: "Corporate CSR programs, philanthropic family trusts, and industrial leadership grants.",
    filterKey: "Private",
    accentLight: "bg-amber-50 dark:bg-amber-950/30",
    borderLight: "border-amber-200 dark:border-amber-900/40"
  },
  {
    id: "stem",
    name: "STEM",
    icon: Cpu,
    color: "from-purple-500 to-pink-600",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    description: "Accelerating innovators across science, artificial intelligence, engineering, and mathematics.",
    filterKey: "STEM",
    accentLight: "bg-purple-50 dark:bg-purple-950/30",
    borderLight: "border-purple-200 dark:border-purple-900/40"
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: Wrench,
    color: "from-indigo-500 to-blue-600",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    description: "Targeted support for B.Tech, B.E., diploma, and specialized technological disciplines.",
    filterKey: "Engineering",
    accentLight: "bg-indigo-50 dark:bg-indigo-950/30",
    borderLight: "border-indigo-200 dark:border-indigo-900/40"
  },
  {
    id: "research",
    name: "Research & Innovation",
    icon: Microscope,
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    description: "Fellowships and laboratory stipends for postgraduate researchers, doctoral candidates, and patent holders.",
    filterKey: "Research",
    accentLight: "bg-emerald-50 dark:bg-emerald-950/30",
    borderLight: "border-emerald-200 dark:border-emerald-900/40"
  },
  {
    id: "women-stem",
    name: "Women in STEM",
    icon: Sparkles,
    color: "from-rose-500 to-purple-600",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    description: "Dedicated to closing gender disparities in computing, robotics, electrical, and biomedical tracks.",
    filterKey: "Women in Tech",
    accentLight: "bg-rose-50 dark:bg-rose-950/30",
    borderLight: "border-rose-200 dark:border-rose-900/40"
  },
  {
    id: "international",
    name: "International Education",
    icon: Globe2,
    color: "from-sky-500 to-indigo-600",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    description: "Exchange programs, cross-border research semesters, and global study bursaries.",
    filterKey: "International",
    accentLight: "bg-sky-50 dark:bg-sky-950/30",
    borderLight: "border-sky-200 dark:border-sky-900/40"
  },
  {
    id: "community",
    name: "Community Development",
    icon: Users2,
    color: "from-amber-600 to-yellow-500",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    description: "Recognizing grassroots leadership, social equity advocacy, and rural development commitment.",
    filterKey: "Community",
    accentLight: "bg-amber-50/60 dark:bg-amber-950/20",
    borderLight: "border-amber-200 dark:border-amber-900/30"
  }
];

export function CategoriesPage() {
  const { allScholarships } = useScholarships();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const getStatsForCategory = (cat) => {
    const matching = allScholarships.filter(s => {
      const matchCat = s.categories.some(c =>
        c.toLowerCase().includes(cat.filterKey.toLowerCase()) ||
        cat.filterKey.toLowerCase().includes(c.toLowerCase()) ||
        s.title.toLowerCase().includes(cat.filterKey.toLowerCase()) ||
        s.description.toLowerCase().includes(cat.filterKey.toLowerCase())
      );
      return matchCat;
    });

    const totalFunding = matching.reduce((sum, s) => sum + (Number(s.awardAmount) || 0), 0);
    const fullyEligibleCount = matching.filter(s => s.isFullyEligible).length;

    return {
      count: matching.length > 0 ? matching.length : 1, // At least 1 in demo catalog
      funding: totalFunding > 0 ? totalFunding : 100000,
      eligible: fullyEligibleCount
    };
  };

  const filteredCategories = CATEGORY_DEFINITIONS.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Scholarship Category Universe</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Explore by Discipline &amp; Cause
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Browse structured scholarship disciplines—from merit-based honors and need-based welfare to state government quotas and women in technology.
          </p>
        </div>

        {/* Search within categories */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disciplines..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6957E8]/20"
          />
        </div>
      </div>

      {/* Grid of Illustrated Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          const stats = getStatsForCategory(cat);

          return (
            <Card
              key={cat.id}
              className={`p-5 flex flex-col justify-between hover:shadow-md transition-all group border ${cat.borderLight} hover:border-[#6957E8]`}
            >
              <div className="space-y-4">
                {/* Top Icon & Count Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cat.badgeColor} tabular-nums font-mono`}>
                    {stats.count} Opportunities
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading group-hover:text-[#6957E8] dark:group-hover:text-[#A78BFA] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Bottom Metrics & Explore Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pool Estimate
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white font-heading">
                    {formatCurrency(stats.funding)}
                  </span>
                </div>

                <Button
                  size="xs"
                  variant="outline"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate(`/explorer?search=${encodeURIComponent(cat.filterKey)}`)}
                >
                  Explore
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-sm">
          No categories found matching "{searchQuery}".
        </div>
      )}
    </div>
  );
}
