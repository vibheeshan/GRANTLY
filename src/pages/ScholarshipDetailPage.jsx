import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Send,
  Share2,
  Layers,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Info,
  Clock,
  CalendarPlus,
  ChevronDown,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Download
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { formatCurrency, formatDate, getDeadlineUrgency } from "../utils/formatters.js";
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getWhatsAppShareUrl,
  getInstitutionMapUrl
} from "../utils/links.js";
import { buildIcsEvent, downloadIcsFile } from "../utils/ics.js";
import { shareContent, copyToClipboard } from "../utils/share.js";

export function ScholarshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    allScholarships,
    isSaved,
    toggleSaveScholarship,
    compareIds,
    toggleCompareScholarship,
    openMatchDna,
    addApplication,
    applications,
    documents,
    showToast
  } = useScholarships();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [customNotes, setCustomNotes] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isOfficialSourceModalOpen, setIsOfficialSourceModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const scholarship = allScholarships.find((s) => s.id === id);

  if (!scholarship) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Scholarship record not found
        </h2>
        <p className="text-sm text-slate-500">
          The requested opportunity identifier may have been removed or updated.
        </p>
        <Link to="/explorer">
          <Button variant="primary" size="sm">
            Return to Explorer
          </Button>
        </Link>
      </div>
    );
  }

  const saved = isSaved(scholarship.id);
  const isCompared = compareIds.includes(scholarship.id);
  const existingApp = applications.find((a) => a.scholarshipId === scholarship.id);
  const urgency = getDeadlineUrgency(scholarship.deadline);
  const evaluation = scholarship.evaluation;
  const isEligible = scholarship.isFullyEligible;
  const matchScore = scholarship.matchScore !== undefined ? scholarship.matchScore : 0;
  const docReadiness = scholarship.documentReadiness;

  const handleApplyClick = () => {
    if (existingApp) {
      navigate("/applications");
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleConfirmApplication = () => {
    addApplication(scholarship, customNotes);
    setIsApplyModalOpen(false);
    navigate("/applications");
  };

  const isVerifiedSource = scholarship.sourceType === "verified" && Boolean(scholarship.applicationUrl);
  const demoEmail = `helpdesk@${(scholarship.provider || "scholarship").toLowerCase().replace(/[^a-z0-9]/g, "")}-demo.org`;
  const demoPhone = "+91 11 2345 6789";
  const mapSearchUrl = getInstitutionMapUrl(scholarship.provider);

  const googleCalUrl = getGoogleCalendarUrl({
    title: scholarship.title,
    deadline: scholarship.deadline,
    provider: scholarship.provider,
    details: `Award: ${scholarship.currency || "INR"} ${scholarship.awardAmount}. Deadline: ${scholarship.deadline}`
  });

  const outlookCalUrl = getOutlookCalendarUrl({
    title: scholarship.title,
    deadline: scholarship.deadline,
    provider: scholarship.provider,
    details: `Award: ${scholarship.currency || "INR"} ${scholarship.awardAmount}. Deadline: ${scholarship.deadline}`
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://grantly.app/scholarship/${scholarship.id}`;
  const shareText = `Check out this scholarship opportunity on GRANTLY: ${scholarship.title} by ${scholarship.provider} (Award: ₹${scholarship.awardAmount}, Deadline: ${scholarship.deadline}).`;
  const waShareUrl = getWhatsAppShareUrl({ text: `${shareText}\n${shareUrl}` });

  const handleShareClick = async () => {
    const res = await shareContent({
      title: scholarship.title,
      text: shareText,
      url: shareUrl
    });
    if (res.method === "web-share" && res.success) {
      showToast?.("Shared successfully!", "success");
    } else if (res.method === "clipboard-fallback" && res.success) {
      showToast?.("Scholarship link copied to clipboard!", "info");
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleCopyDirectLink = async () => {
    const res = await copyToClipboard(shareUrl);
    if (res.success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showToast?.("Link copied to clipboard!", "success");
    }
  };

  const handleDownloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GRANTLY//Deadline//EN",
      buildIcsEvent({
        id: scholarship.id,
        title: scholarship.title,
        provider: scholarship.provider,
        deadline: scholarship.deadline,
        awardAmount: scholarship.awardAmount,
        currency: scholarship.currency || "INR",
        url: scholarship.applicationUrl || "https://grantly.app"
      }),
      "END:VCALENDAR"
    ].join("\r\n");
    downloadIcsFile(`deadline-${scholarship.id}.ics`, icsContent);
    showToast?.("Downloaded deadline .ICS with T-7 and T-1 reminders!", "success");
    setIsCalendarDropdownOpen(false);
  };

  const handleOfficialSourceClick = (e) => {
    e.preventDefault();
    if (isVerifiedSource) {
      window.open(scholarship.applicationUrl, "_blank", "noopener,noreferrer");
    } else {
      setIsOfficialSourceModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scholarships</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add to Calendar Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={CalendarPlus}
              onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
              className="flex items-center gap-1.5"
            >
              <span>Add to Calendar</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>

            {isCalendarDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#1E293B] shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Calendar Sync
                </div>
                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsCalendarDropdownOpen(false)}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Calendar</span>
                </a>
                <a
                  href={outlookCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsCalendarDropdownOpen(false)}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                  <span>Outlook Web</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-500" />
                  <span>Download .ICS File</span>
                </button>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleCompareScholarship(scholarship.id)}
            icon={Layers}
          >
            {isCompared ? "In Comparison (Remove)" : "Compare Studio"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareClick}
            icon={Share2}
          >
            Share
          </Button>

          <Button
            variant={saved ? "primary" : "outline"}
            size="sm"
            onClick={() => toggleSaveScholarship(scholarship.id)}
            icon={Bookmark}
          >
            {saved ? "Bookmarked" : "Save Opportunity"}
          </Button>
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-400" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-2">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {scholarship.provider}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                {scholarship.sourceType}
              </span>
              <Badge variant="slate" size="sm">
                Demonstration Record
              </Badge>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                scholarship.stackable
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
              }`}>
                {scholarship.stackable ? "✓ Stackable Grant" : "⚠️ Specific Stackability Rules"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight leading-tight">
              {scholarship.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {scholarship.description}
            </p>

            {scholarship.recommendationReason && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Recommendation Reason:</strong>{" "}
                {scholarship.recommendationReason}
              </div>
            )}
          </div>

          {/* Award Box & Direct Action */}
          <div className="w-full lg:w-72 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-4 shrink-0">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Annual Grant Amount
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-violet-700 dark:text-violet-300 font-heading block mt-1">
                {formatCurrency(scholarship.awardAmount, scholarship.currency)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Direct bank transfer / tuition grant
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {existingApp ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                    ✓ Tracked: Status is "{existingApp.status}"
                  </span>
                  <Link to="/applications" className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      View in Tracker
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full shadow-lg"
                  onClick={handleApplyClick}
                  icon={Send}
                >
                  Track / Apply
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => openMatchDna(scholarship)}
                icon={Sparkles}
              >
                Inspect Match DNA
              </Button>
            </div>

            <div className="text-[11px] text-slate-400">
              Deadline: <strong>{formatDate(scholarship.deadline)}</strong> ({urgency.text})
            </div>
          </div>
        </div>
      </div>

      {/* Demo Disclosure Box */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm">Demonstration Notice:</strong>
          This record is a verified demonstration scholarship created for the GRANTLY hackathon showcase.
          Application links simulate the workflow without navigating to fictional external government portals.
        </div>
      </div>

      {/* Grid: Criteria Breakdown + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Eligibility Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deterministic Match Assessment */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle subtitle="Simulated using your student profile parameters">
                Eligibility Evaluation &amp; Match DNA
              </CardTitle>
              {isEligible ? (
                <Badge variant="teal" size="md" dot>
                  100% Eligible
                </Badge>
              ) : (
                <Badge variant={matchScore >= 60 ? "amber" : "rose"} size="md">
                  {matchScore}% Match
                </Badge>
              )}
            </CardHeader>

            <CardBody className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {evaluation?.explanation}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  {evaluation?.disclaimer}
                </p>
              </div>

              {/* Matched Criteria List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Verified Criteria ({evaluation?.matchedCriteria?.length || 0})
                </h5>
                <div className="space-y-2">
                  {evaluation?.matchedCriteria?.map((crit, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 flex items-start gap-2.5 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-900 dark:text-emerald-300 font-semibold">
                          {crit.criterion}:
                        </strong>{" "}
                        <span className="text-slate-700 dark:text-slate-300">{crit.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unmatched Criteria List */}
              {evaluation?.unmatchedCriteria?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Unmatched Requirements ({evaluation.unmatchedCriteria.length})
                  </h5>
                  <div className="space-y-2">
                    {evaluation.unmatchedCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 flex items-start gap-2.5 text-xs"
                      >
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-rose-900 dark:text-rose-300 font-semibold">
                            {crit.criterion}:
                          </strong>{" "}
                          <span className="text-slate-700 dark:text-slate-300">{crit.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openMatchDna(scholarship)}
                  icon={Sparkles}
                >
                  Inspect Full Match DNA Radar
                </Button>

                <Link to="/matcher" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                  Tune Profile Parameters →
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Required Documents Checklist with Readiness Cross-referencing */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle subtitle="Dossier certificates required for submission">
                  Required Verification Documents
                </CardTitle>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                {docReadiness?.readyCount}/{docReadiness?.totalCount} Ready
              </span>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {scholarship.requiredDocuments.map((doc, idx) => {
                  const isReady = documents.some(d =>
                    (d.name.toLowerCase().includes(doc.toLowerCase()) ||
                     doc.toLowerCase().includes(d.name.toLowerCase())) &&
                    d.isReady
                  );

                  return (
                    <li
                      key={idx}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {doc}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Scanned PDF or original attested copy
                          </span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        isReady
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {isReady ? "Ready" : "Pending"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Ensure all files are prepared in your Document Manager.
                </span>
                <Link
                  to="/documents"
                  className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Open Document Manager →
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Application Instructions */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Standardized 4-step workflow">
                Application Instructions
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 dark:text-white block">
                    Verify Baseline Eligibility
                  </strong>
                  Review that your percentage meets the {scholarship.minimumPercentage}% mark and family income is within ₹{scholarship.maximumFamilyIncome.toLocaleString("en-IN")}.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 dark:text-white block">
                    Compile Certificates
                  </strong>
                  Gather the {scholarship.requiredDocuments.length} required documents and confirm readiness in the Document Manager.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 dark:text-white block">
                    Log Opportunity into Application Tracker
                  </strong>
                  Click "Track / Apply" above to initiate a tracking card and update status notes as you progress.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 dark:text-white block">
                    Selection Process &amp; Verification
                  </strong>
                  {scholarship.selectionProcess}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Key Parameters & Source Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Parameters</CardTitle>
            </CardHeader>
            <CardBody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Education Levels</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {scholarship.educationLevels.join(", ")}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Eligible Disciplines</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {scholarship.eligibleCourses.join(", ")}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Geographic Eligibility</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {scholarship.states.join(", ")}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Minimum Academic Score</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {scholarship.minimumPercentage}%
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Max Family Income</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  ₹{scholarship.maximumFamilyIncome.toLocaleString("en-IN")}/yr
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Stackability Policy</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {scholarship.stackable ? "Stackable" : "Restrictions Apply"}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Scholarship Slots</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {scholarship.slotsAvailable} Awards Available
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Application Deadline</span>
                <span className="font-bold text-violet-700 dark:text-violet-300 text-right">
                  {formatDate(scholarship.deadline)}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle>Features &amp; Highlights</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {scholarship.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    ★ {tag}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Source & Authenticity Box */}
          <Card className="bg-slate-50/70 dark:bg-slate-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle subtitle="Provenance &amp; integrity notice">
                Provider Integrity
              </CardTitle>
              {isVerifiedSource ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  ✓ Verified Source
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Demo Record
                </span>
              )}
            </CardHeader>
            <CardBody className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <p>
                <strong>Provider:</strong> {scholarship.provider}
              </p>
              <p>
                <strong>Category:</strong> {scholarship.categories.join(", ")}
              </p>
              <p className="text-[11px] leading-relaxed">
                GRANTLY standardizes scholarship schemas to remove predatory fees and obscure guidelines. Never pay an application processing charge for merit grants.
              </p>

              {/* Action Buttons for External Integrations */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <button
                  type="button"
                  onClick={handleOfficialSourceClick}
                  className="w-full py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/50 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isVerifiedSource ? "Visit Official Portal" : "Official Source (Demo)"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-center font-medium text-[11px] flex items-center justify-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Map Search</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-center font-medium text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-500" />
                    <span>Contact (Demo)</span>
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Similar Scholarships Section (Requirement 3) */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Similar Opportunities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Other grants matching similar disciplines and eligibility profiles
            </p>
          </div>
          <Link to="/explorer" className="text-xs font-semibold text-[#6957E8] dark:text-[#A78BFA] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allScholarships
            .filter(s => s.id !== scholarship.id && (s.categories.some(c => scholarship.categories.includes(c)) || s.eligibleCourses.some(c => scholarship.eligibleCourses.includes(c))))
            .slice(0, 3)
            .map(sim => (
              <Card key={sim.id} className="p-4 flex flex-col justify-between hover:border-violet-300 transition-all text-xs space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate block">
                    {sim.provider}
                  </span>
                  <Link to={`/scholarship/${sim.id}`} className="font-bold text-slate-900 dark:text-white hover:text-[#6957E8] block line-clamp-1 leading-snug font-heading text-sm">
                    {sim.title}
                  </Link>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {sim.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-[#6957E8] dark:text-[#A78BFA] font-heading">
                    {formatCurrency(sim.awardAmount, sim.currency)}
                  </span>
                  <Link to={`/scholarship/${sim.id}`}>
                    <Button size="xs" variant="primary">
                      Inspect
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Sticky Bottom Action Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-white/95 dark:bg-[#131D32]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-2xl sm:rounded-none">
        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#6957E8] dark:text-[#A78BFA] flex items-center justify-center font-bold shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              {scholarship.title}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatCurrency(scholarship.awardAmount, scholarship.currency)} • Deadline: {formatDate(scholarship.deadline)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => toggleSaveScholarship(scholarship.id)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              saved
                ? "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950 dark:text-violet-300"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            <span className="hidden md:inline">{saved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={() => toggleCompareScholarship(scholarship.id)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isCompared
                ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">{isCompared ? "In Compare" : "Compare"}</span>
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => openMatchDna(scholarship)}
            icon={Sparkles}
          >
            Match DNA
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleApplyClick}
            icon={Send}
            className="bg-[#6957E8] hover:bg-[#5846db] text-white"
          >
            {existingApp ? "Manage Application" : "Start Application"}
          </Button>
        </div>
      </div>

      {/* Track / Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Add to Application Tracker"
        subtitle={`Track your submission pipeline for ${scholarship.title}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60 text-xs">
            <p className="font-semibold text-violet-900 dark:text-violet-200">
              Grant Amount: {formatCurrency(scholarship.awardAmount, scholarship.currency)}
            </p>
            <p className="text-violet-700 dark:text-violet-300 mt-0.5">
              Deadline: {formatDate(scholarship.deadline)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Personal Notes or Initial Task
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Need to request Dean's recommendation letter by next Tuesday..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmApplication}
            >
              Confirm &amp; Start Tracking
            </Button>
          </div>
        </div>
      </Modal>
      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Scholarship Opportunity"
        subtitle={scholarship.title}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Direct Link
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyDirectLink}
                icon={copiedLink ? Check : Copy}
              >
                {copiedLink ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Share via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleCopyDirectLink}
              className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300 flex items-center justify-center gap-2 text-xs font-bold hover:bg-violet-100 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-violet-600" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Official Source Warning Modal for Demo Records (Feature 27) */}
      <Modal
        isOpen={isOfficialSourceModalOpen}
        onClose={() => setIsOfficialSourceModalOpen(false)}
        title="External Provider Website"
        subtitle="Demo Integration Notice"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Placeholder link – demo only</p>
              <p className="mt-1">
                This scholarship is a demonstration record. Official government or philanthropic provider portals require verified external API integration.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOfficialSourceModalOpen(false)}
            >
              Cancel
            </Button>
            <a
              href={scholarship.applicationUrl || "https://grantly.app"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOfficialSourceModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Open Simulated Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Modal>

      {/* Provider Contact Card Modal (Feature 29) */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={`Provider Contact: ${scholarship.provider}`}
        subtitle="Fictional Contact Data – Demo Only"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
            <p className="font-bold">Demo Integration Notice</p>
            <p className="mt-0.5">
              The contact details below are simulated for demonstration workflows.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-violet-500" />
                <span>{demoEmail}</span>
              </span>
              <a
                href={`mailto:${demoEmail}?subject=Inquiry%20regarding%20${encodeURIComponent(scholarship.title)}`}
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                Send Email
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>{demoPhone}</span>
              </span>
              <a
                href={`tel:${demoPhone}`}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Call Desk
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{scholarship.provider} HQ</span>
              </span>
              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
