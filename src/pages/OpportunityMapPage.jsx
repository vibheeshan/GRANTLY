import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Compass,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Filter,
  TrendingUp,
  Globe,
  SlidersHorizontal
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency, formatDate } from "../utils/formatters.js";

// Regional groupings of Indian States
const REGIONS = [
  { id: "all", name: "All Regions" },
  { id: "national", name: "National (All-India)" },
  { id: "west", name: "Western Region", states: ["Maharashtra", "Gujarat", "Goa"] },
  { id: "south", name: "Southern Region", states: ["Karnataka", "Tamil Nadu", "Telangana", "Kerala", "Andhra Pradesh"] },
  { id: "north", name: "Northern Region", states: ["Delhi", "Uttar Pradesh", "Punjab", "Haryana", "Rajasthan"] },
  { id: "east", name: "Eastern Region", states: ["West Bengal", "Odisha", "Bihar", "Jharkhand", "Assam"] }
];

export function OpportunityMapPage() {
  const { allScholarships, studentProfile, openMatchDna } = useScholarships();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedState, setSelectedState] = useState(studentProfile.state || "Maharashtra");

  // Filter scholarships based on regional selection
  const filteredByRegion = allScholarships.filter(s => {
    if (selectedRegion === "all") return true;
    if (selectedRegion === "national") return s.states.includes("All India");
    const reg = REGIONS.find(r => r.id === selectedRegion);
    if (!reg?.states) return true;
    return s.states.some(st => st === "All India" || reg.states.includes(st));
  });

  // State counts
  const stateCounts = {};
  allScholarships.forEach(s => {
    s.states.forEach(st => {
      stateCounts[st] = (stateCounts[st] || 0) + 1;
    });
  });

  // Unique list of states in catalog
  const catalogStates = [
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "Delhi",
    "Gujarat",
    "West Bengal",
    "Uttar Pradesh",
    "Kerala",
    "Rajasthan"
  ];

  // Opportunities for the currently selected state
  const stateOpportunities = allScholarships.filter(s =>
    s.states.includes("All India") || s.states.includes(selectedState)
  );

  const totalStateFunding = stateOpportunities.reduce((sum, s) => sum + (Number(s.awardAmount) || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>State Domicile &amp; Geographic Opportunity Map</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Geographic Opportunity Distribution
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Explore state-specific welfare quotas and national merit programs. Demonstrates domicile-based quotas across Indian states and union territories.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 max-w-xs">
          <strong>Demo Geographic Data:</strong> Based on 14 demonstration scholarship quota rules.
        </div>
      </div>

      {/* Region Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {REGIONS.map(reg => (
          <button
            key={reg.id}
            onClick={() => setSelectedRegion(reg.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedRegion === reg.id
                ? "bg-[#6957E8] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {reg.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Regional State Matrix + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: State Selector Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select State to Inspect
              </span>
              <span className="text-xs text-slate-400">
                Your Profile Domicile: <strong className="text-teal-600 dark:text-teal-400">{studentProfile.state}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {catalogStates.map(stateName => {
                const count = allScholarships.filter(s => s.states.includes("All India") || s.states.includes(stateName)).length;
                const isSelected = selectedState === stateName;
                const isHomeState = studentProfile.state === stateName;

                return (
                  <button
                    key={stateName}
                    onClick={() => setSelectedState(stateName)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-[#6957E8] bg-violet-50/50 dark:bg-violet-950/30 ring-2 ring-[#6957E8]/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    {isHomeState && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        Home
                      </span>
                    )}

                    <span className="text-xs font-bold text-slate-900 dark:text-white block font-heading truncate">
                      {stateName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {count} opportunities
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Regional Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#131D32] border border-[#E8EAF2] dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Selected State
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-heading mt-0.5 block">
                {selectedState}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#131D32] border border-[#E8EAF2] dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Available Grants
              </span>
              <span className="text-base font-extrabold text-[#6957E8] dark:text-[#A78BFA] font-heading mt-0.5 block">
                {stateOpportunities.length} Grants
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#131D32] border border-[#E8EAF2] dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estimated Pool
              </span>
              <span className="text-base font-extrabold text-[#14B8A6] dark:text-[#2DD4BF] font-heading mt-0.5 block">
                {formatCurrency(totalStateFunding)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: State Opportunities List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                  Eligible for {selectedState} Domicile
                </h3>
                <p className="text-[11px] text-slate-400">
                  Includes All-India and state quota allocations
                </p>
              </div>
              <Badge variant="teal" size="sm">
                {stateOpportunities.length} Available
              </Badge>
            </div>

            <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
              {stateOpportunities.map(sch => {
                const isNational = sch.states.includes("All India");
                return (
                  <div
                    key={sch.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {sch.provider}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isNational
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                      }`}>
                        {isNational ? "All-India" : `${selectedState} Quota`}
                      </span>
                    </div>

                    <Link
                      to={`/scholarship/${sch.id}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-[#6957E8] block line-clamp-1 leading-tight font-heading"
                    >
                      {sch.title}
                    </Link>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-extrabold text-[#6957E8] dark:text-[#A78BFA]">
                        {formatCurrency(sch.awardAmount, sch.currency)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => openMatchDna(sch)}
                        >
                          DNA
                        </Button>
                        <Link to={`/scholarship/${sch.id}`}>
                          <Button size="xs" variant="primary">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
