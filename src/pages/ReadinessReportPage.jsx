import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GraduationCap,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency, formatDate } from "../utils/formatters.js";

export function ReadinessReportPage() {
  const {
    studentProfile,
    allScholarships,
    applications,
    documents,
    stats
  } = useScholarships();

  const handlePrint = () => {
    window.print();
  };

  const eligibleScholarships = allScholarships.filter(s => s.isFullyEligible);
  const pendingDocs = documents.filter(d => !d.isReady);
  const readyDocs = documents.filter(d => d.isReady);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header Banner - with Print & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Official Student Readiness Dossier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Scholarship Readiness Report
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive audit of academic metrics, dossier readiness, application status, and personalized next actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white dark:bg-[#131D32] border border-[#E8EAF2] dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Report Official Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6957E8] to-[#14B8A6] text-white flex items-center justify-center font-bold text-xl font-heading shadow-md">
              G
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                GRANTLY ACADEMIC DOSSIER // VERIFIED DEMO REPORT
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                {studentProfile.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {studentProfile.course} • {studentProfile.institution}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
            <p>Report Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            <p>Report ID: GRN-{Date.now().toString().slice(-6)}</p>
          </div>
        </div>

        {/* Executive Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Academic Merit
            </span>
            <span className="text-2xl font-extrabold text-[#6957E8] dark:text-[#A78BFA] font-heading mt-1 block">
              {studentProfile.academicPercentage}%
            </span>
            <span className="text-[11px] text-slate-500">CGPA Compatible</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Document Readiness
            </span>
            <span className="text-2xl font-extrabold text-[#14B8A6] dark:text-[#2DD4BF] font-heading mt-1 block">
              {stats.documentReadinessPercentage}%
            </span>
            <span className="text-[11px] text-slate-500">{readyDocs.length} of {documents.length} Ready</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Eligible Scholarships
            </span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-heading mt-1 block">
              {eligibleScholarships.length} Grants
            </span>
            <span className="text-[11px] text-slate-500">100% Fit</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Tracked Pipeline
            </span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-heading mt-1 block">
              {applications.length} Active
            </span>
            <span className="text-[11px] text-slate-500">In Preparation</span>
          </div>
        </div>

        {/* Section 1: Academic & Demographic Passport */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#6957E8]" />
            <span>1. Student Profile &amp; Baseline Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Education Degree</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{studentProfile.course} ({studentProfile.educationLevel})</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Domicile State</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{studentProfile.state}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Family Income Tier</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">₹{(studentProfile.familyIncome / 100000).toFixed(1)} Lakhs / Year</span>
            </div>
          </div>
        </div>

        {/* Section 2: Document Verification Dossier */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
              <span>2. Document Dossier Verification Status</span>
            </h3>
            <span className="text-xs text-slate-400">
              {stats.documentReadinessPercentage}% Prepared
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  doc.isReady
                    ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${doc.isReady ? "text-emerald-600" : "text-slate-300 dark:text-slate-600"}`} />
                  <span className="font-semibold">{doc.name}</span>
                </div>
                <span className="text-[10px] font-bold uppercase font-mono">
                  {doc.isReady ? "Verified" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Recommended Next Best Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3. Recommended Next Best Actions</span>
          </h3>

          <div className="space-y-2 text-xs">
            {pendingDocs.length > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 dark:text-amber-200 block">Dossier Requirement:</strong>
                  <span className="text-amber-800 dark:text-amber-300">
                    Verify remaining certificates ({pendingDocs.map(d => d.name).join(", ")}) to unlock full submission clearance across 4 eligible scholarships.
                  </span>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl border border-violet-200 bg-violet-50/50 dark:border-violet-900/50 dark:bg-violet-950/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6957E8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-violet-900 dark:text-violet-200 block">Impending Deadline Alert:</strong>
                <span className="text-violet-800 dark:text-violet-300">
                  Apex NextGen STEM Excellence Fellowship closes on November 28, 2026. Prioritize college endorsement submission.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GRANTLY 3.0 • Demonstration Report Generated from Browser LocalStorage</span>
          <span>Not an official government or institutional eligibility certification</span>
        </div>
      </div>
    </div>
  );
}
