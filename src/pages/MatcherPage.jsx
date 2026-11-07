import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Bookmark,
  Sliders,
  ShieldCheck,
  RotateCcw,
  Check,
  Info,
  Layers
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select } from "../components/ui/Input.jsx";
import {
  EDUCATION_LEVELS,
  STATES_LIST,
  COURSES_LIST
} from "../data/scholarships.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";

export function MatcherPage() {
  const {
    studentProfile,
    updateProfile,
    allScholarships,
    isSaved,
    toggleSaveScholarship,
    addApplication,
    openMatchDna,
    toggleCompareScholarship,
    compareIds
  } = useScholarships();

  // Local form state initialized from student profile
  const [formData, setFormData] = useState({
    name: studentProfile.name || "",
    educationLevel: studentProfile.educationLevel || "Undergraduate",
    course: studentProfile.course || "Engineering",
    institution: studentProfile.institution || "",
    state: studentProfile.state || "Maharashtra",
    academicPercentage: studentProfile.academicPercentage !== undefined ? studentProfile.academicPercentage : 82.5,
    familyIncome: studentProfile.familyIncome !== undefined ? studentProfile.familyIncome : 450000
  });

  const [activeTab, setActiveTab] = useState("eligible"); // "eligible" | "partial" | "all"
  const [selectedSchForModal, setSelectedSchForModal] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyToProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      educationLevel: formData.educationLevel,
      course: formData.course,
      institution: formData.institution,
      state: formData.state,
      academicPercentage: Number(formData.academicPercentage),
      familyIncome: Number(formData.familyIncome)
    });
  };

  const handleResetDefaults = () => {
    setFormData({
      name: studentProfile.name,
      educationLevel: studentProfile.educationLevel,
      course: studentProfile.course,
      institution: studentProfile.institution,
      state: studentProfile.state,
      academicPercentage: studentProfile.academicPercentage,
      familyIncome: studentProfile.familyIncome
    });
  };

  // Group scholarships by full eligibility vs partial
  const fullyEligibleList = allScholarships.filter(s => s.isFullyEligible);
  const partialMatchesList = allScholarships.filter(s => !s.isFullyEligible && (s.matchScore || 0) >= 40);
  const allList = allScholarships;

  const displayList =
    activeTab === "eligible"
      ? fullyEligibleList
      : activeTab === "partial"
      ? partialMatchesList
      : allList;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Explanation */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic Rule-Based Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Smart Eligibility Matcher
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Test your real-time academic standing, state domicile, and income threshold against all demonstration scholarships.
          Unlike vague recommendations, our deterministic engine breaks down every passing and failing criterion transparently.
        </p>
      </div>

      {/* 2-Column: Form Panel & Live Matches Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Profile Parameters Form (4 cols on lg) */}
        <div className="lg:col-span-5">
          <Card className="sticky top-20 shadow-sm">
            <CardHeader>
              <CardTitle subtitle="Adjust parameters to re-run instant simulation">
                Student Profile Parameters
              </CardTitle>
            </CardHeader>

            <CardBody>
              <form onSubmit={handleApplyToProfile} className="space-y-4">
                <Input
                  label="Student Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Education Level
                    </label>
                    <select
                      value={formData.educationLevel}
                      onChange={(e) => handleInputChange("educationLevel", e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                      {EDUCATION_LEVELS.filter(l => l !== "All Levels").map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Enrolled Discipline
                    </label>
                    <select
                      value={formData.course}
                      onChange={(e) => handleInputChange("course", e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                      {COURSES_LIST.filter(c => c !== "All Courses").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Current Institution / University"
                  value={formData.institution}
                  onChange={(e) => handleInputChange("institution", e.target.value)}
                  placeholder="e.g. Apex Institute of Technology"
                  required
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    State Domicile / Residency
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    {STATES_LIST.filter(s => s !== "All India").map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Academic Percentage (%)"
                    type="number"
                    step="0.1"
                    min="40"
                    max="100"
                    value={formData.academicPercentage}
                    onChange={(e) => handleInputChange("academicPercentage", e.target.value)}
                    helperText="Cumulative or qualifying %"
                    required
                  />

                  <Input
                    label="Annual Family Income (₹)"
                    type="number"
                    step="10000"
                    min="0"
                    value={formData.familyIncome}
                    onChange={(e) => handleInputChange("familyIncome", e.target.value)}
                    helperText="Total household income"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetDefaults}
                    icon={RotateCcw}
                  >
                    Revert
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1"
                    icon={Check}
                  >
                    Save &amp; Recalculate
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right: Results & Detailed Breakdown List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Summary Strip */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("eligible")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "eligible"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Fully Eligible ({fullyEligibleList.length})
              </button>
              <button
                onClick={() => setActiveTab("partial")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "partial"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Partial Match ({partialMatchesList.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "all"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                All Programs ({allList.length})
              </button>
            </div>

            <span className="text-xs text-slate-400">
              {displayList.length} results listed
            </span>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {displayList.map((sch) => {
              const evalRes = sch.evaluation;
              const saved = isSaved(sch.id);
              const isEligible = sch.isFullyEligible;
              const score = sch.matchScore || 0;

              return (
                <Card
                  key={sch.id}
                  className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                      <span className="text-xs text-slate-400 font-semibold block truncate">
                        {sch.provider}
                      </span>
                      <Link
                        to={`/scholarship/${sch.id}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-1 font-heading"
                      >
                        {sch.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEligible ? (
                        <Badge variant="teal" size="md" dot>
                          100% Eligible
                        </Badge>
                      ) : (
                        <Badge variant={score >= 60 ? "amber" : "rose"} size="md">
                          {score}% Match
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Explanation statement */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 my-3 leading-relaxed">
                    {evalRes?.explanation}
                  </p>

                  {/* Criteria Checklist Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs">
                    {/* Education Level */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                      {evalRes?.matchedCriteria?.some(c => c.criterion === "Education Level") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          Education Level
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Req: {sch.educationLevels.join(", ")}
                        </span>
                      </div>
                    </div>

                    {/* Course */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                      {evalRes?.matchedCriteria?.some(c => c.criterion === "Eligible Course") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          Course Discipline
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Req: {sch.eligibleCourses.join(", ")}
                        </span>
                      </div>
                    </div>

                    {/* State */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                      {evalRes?.matchedCriteria?.some(c => c.criterion === "State Domicile") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          State Residency
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Req: {sch.states.join(", ")}
                        </span>
                      </div>
                    </div>

                    {/* Academic Marks */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                      {evalRes?.matchedCriteria?.some(c => c.criterion === "Academic Merit") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          Marks Required
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Min: {sch.minimumPercentage}% (You: {studentProfile.academicPercentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Income Limit */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2 sm:col-span-2">
                      {evalRes?.matchedCriteria?.some(c => c.criterion === "Family Income Limit") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          Annual Family Income Ceiling
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Max allowable: ₹{sch.maximumFamilyIncome.toLocaleString("en-IN")} (You: ₹{studentProfile.familyIncome.toLocaleString("en-IN")})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Award Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Award Amount
                      </span>
                      <span className="text-sm font-extrabold text-violet-700 dark:text-violet-300 font-heading">
                        {formatCurrency(sch.awardAmount, sch.currency)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => openMatchDna(sch)}
                        icon={Sparkles}
                      >
                        Match DNA
                      </Button>

                      <button
                        onClick={() => toggleCompareScholarship(sch.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          compareIds.includes(sch.id)
                            ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                            : "border-slate-200 text-slate-400 hover:text-slate-600 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title={compareIds.includes(sch.id) ? "Remove from comparison" : "Add to comparison studio"}
                        aria-label="Toggle comparison"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleSaveScholarship(sch.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          saved
                            ? "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800"
                            : "border-slate-200 text-slate-400 hover:text-slate-600 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title={saved ? "Remove bookmark" : "Save opportunity"}
                        aria-label="Toggle bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
                      </button>

                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => addApplication(sch)}
                      >
                        Track
                      </Button>

                      <Link to={`/scholarship/${sch.id}`}>
                        <Button size="xs" variant="primary">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}

            {displayList.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                No scholarships match this sub-filter. Select "All Programs" to view the complete catalog.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
