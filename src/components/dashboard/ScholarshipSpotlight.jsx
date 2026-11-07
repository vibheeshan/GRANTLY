import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Calendar,
  Building2,
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { formatCurrency, formatDate, getDaysRemaining } from "../../utils/formatters.js";
import { useScholarships } from "../../context/ScholarshipContext.jsx";

export function ScholarshipSpotlight({ scholarships = [] }) {
  const { isSaved, toggleSaveScholarship, openMatchDna } = useScholarships();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Take top featured scholarships from demo catalog
  const spotlightList = scholarships.slice(0, 4);
  if (spotlightList.length === 0) return null;

  const currentSch = spotlightList[currentIndex] || spotlightList[0];
  const saved = isSaved(currentSch.id);
  const daysLeft = getDaysRemaining(currentSch.deadline);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? spotlightList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === spotlightList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#101935] via-[#151F38] to-[#0A1020] text-white border border-violet-500/30 p-6 sm:p-8 shadow-xl">
      {/* Abstract Geometric Graphic Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#6957E8]/20 to-[#14B8A6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        <div className="space-y-3.5 max-w-2xl">
          {/* Spotlight Tag & Pagination Indicators */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Scholarship Spotlight</span>
            </span>

            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} of {spotlightList.length}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
              {currentSch.provider}
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-heading leading-tight text-white">
              {currentSch.title}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-2">
              {currentSch.description}
            </p>
          </div>

          {/* Key Value Highlights */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Award</span>
              <span className="text-lg font-extrabold text-[#2DD4BF] font-heading">
                {formatCurrency(currentSch.awardAmount, currentSch.currency)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Deadline</span>
              <span className="text-sm font-bold text-white font-mono">
                {formatDate(currentSch.deadline)} ({daysLeft}d left)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Compatibility</span>
              <span className="text-sm font-bold text-violet-300 font-mono">
                {currentSch.isFullyEligible ? "100% Eligible" : `${currentSch.matchScore}% Match`}
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA and Carousel Navigation */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer"
              title="Previous spotlight"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer"
              title="Next spotlight"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toggleSaveScholarship(currentSch.id)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                saved
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
              }`}
              title={saved ? "Saved" : "Save scholarship"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={() => openMatchDna(currentSch)}
            >
              Match DNA
            </Button>

            <Link to={`/scholarship/${currentSch.id}`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#6957E8] hover:bg-[#5846db] text-white shadow-lg shadow-violet-900/40"
                icon={ArrowRight}
                iconPosition="right"
              >
                Explore Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
