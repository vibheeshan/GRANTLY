import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldAlert,
  Layers,
  FileCheck2,
  Share2,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  Copy,
  Check,
  MessageCircle
} from "lucide-react";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";
import { formatCurrency, formatDate, getDeadlineUrgency } from "../../utils/formatters.js";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { shareContent, copyToClipboard } from "../../utils/share.js";
import { getWhatsAppShareUrl, getInstitutionMapUrl } from "../../utils/links.js";

export function ScholarshipCard({ scholarship, viewMode = "grid" }) {
  const {
    isSaved,
    toggleSaveScholarship,
    addApplication,
    compareIds,
    toggleCompareScholarship,
    openMatchDna,
    showToast
  } = useScholarships();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isOfficialSourceModalOpen, setIsOfficialSourceModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const saved = isSaved(scholarship.id);
  const isCompared = compareIds.includes(scholarship.id);
  const urgency = getDeadlineUrgency(scholarship.deadline);
  const matchScore = scholarship.matchScore !== undefined ? scholarship.matchScore : 0;
  const isEligible = scholarship.isFullyEligible;
  const docReadiness = scholarship.documentReadiness;

  // Verification checks for Features 27 & 28
  const isVerifiedSource = scholarship.sourceType === "verified" && Boolean(scholarship.applicationUrl);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/scholarship/${scholarship.id}`
    : `https://grantly.app/scholarship/${scholarship.id}`;

  const shareText = `Check out this scholarship opportunity on GRANTLY: ${scholarship.title} by ${scholarship.provider} (Award: ₹${scholarship.awardAmount}, Closes ${scholarship.deadline}).`;

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

  const handleOfficialSourceClick = (e) => {
    e.preventDefault();
    if (isVerifiedSource) {
      window.open(scholarship.applicationUrl, "_blank", "noopener,noreferrer");
    } else {
      setIsOfficialSourceModalOpen(true);
    }
  };

  // Demo contact data (Feature 29)
  const demoEmail = `admissions@${(scholarship.provider || "scholarship").toLowerCase().replace(/[^a-z0-9]/g, "")}-demo.org`;
  const demoPhone = "+91 11 2345 6789";
  const mapSearchUrl = getInstitutionMapUrl(scholarship.provider);

  if (viewMode === "list") {
    return (
      <Card hover className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {scholarship.provider}
            </span>

            {/* Feature 28: Verified-source badge */}
            {isVerifiedSource ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                ✓ Verified Source
              </span>
            ) : (
              <Badge variant="slate" size="sm">
                Demo Record
              </Badge>
            )}

            {isEligible ? (
              <Badge variant="teal" size="sm" dot>
                100% Eligible
              </Badge>
            ) : matchScore >= 60 ? (
              <Badge variant="amber" size="sm">
                {matchScore}% Match
              </Badge>
            ) : (
              <Badge variant="rose" size="sm">
                Unmatched Criteria
              </Badge>
            )}

            {docReadiness && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  docReadiness.percentage >= 80
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {docReadiness.readyCount}/{docReadiness.totalCount} Docs Ready
              </span>
            )}
          </div>

          <Link
            to={`/scholarship/${scholarship.id}`}
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors block leading-snug"
          >
            {scholarship.title}
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
            {scholarship.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-violet-700 dark:text-violet-300 text-sm">
              {formatCurrency(scholarship.awardAmount, scholarship.currency)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Deadline: {formatDate(scholarship.deadline)} ({urgency.text})
            </span>
            <span>•</span>
            {/* Map link for institution */}
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400"
              title="Search institution on Google Maps (Institution name only)"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map Search</span>
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 underline cursor-pointer"
            >
              Contact (Demo)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Share button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShareClick}
            icon={Share2}
            title="Share scholarship"
          >
            Share
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => openMatchDna(scholarship)}
            icon={Sparkles}
            title="Inspect Match DNA"
          >
            DNA
          </Button>

          <button
            onClick={() => toggleCompareScholarship(scholarship.id)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isCompared
                ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                : "border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison studio"}
            aria-label="Toggle comparison"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleSaveScholarship(scholarship.id)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              saved
                ? "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800"
                : "border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400"
            }`}
            title={saved ? "Remove bookmark" : "Save opportunity"}
            aria-label="Toggle bookmark"
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => addApplication(scholarship)}
          >
            Track
          </Button>

          <Link to={`/scholarship/${scholarship.id}`}>
            <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right">
              View
            </Button>
          </Link>
        </div>

        {/* Share Modal Dialog */}
        {renderModals()}
      </Card>
    );
  }

  // Grid Card Layout
  const borderHighlight = isEligible
    ? "border-teal-300 dark:border-teal-700/80 shadow-teal-500/5"
    : saved
    ? "border-violet-300 dark:border-violet-800/80"
    : urgency.isUrgent
    ? "border-amber-300 dark:border-amber-700/80"
    : "border-[#E8EAF2] dark:border-[#27334A]";

  function renderModals() {
    const waUrl = getWhatsAppShareUrl({ text: `${shareText}\n${shareUrl}` });

    return (
      <>
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
                href={waUrl}
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
                <span>Copy Summary Link</span>
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
                  This scholarship is a demonstration record. Official government or philanthropic provider portals require verified API integration.
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

        {/* Provider Contact Card (Feature 29) */}
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
      </>
    );
  }

  return (
    <Card
      hover
      className={`flex flex-col justify-between overflow-hidden relative group transition-all duration-200 ${borderHighlight}`}
    >
      {/* Top Banner & Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{scholarship.provider}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Feature 28: Verified Source Badge */}
              {isVerifiedSource ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  ✓ Verified Source
                </span>
              ) : (
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                  DEMO
                </span>
              )}

              {isEligible ? (
                <Badge variant="teal" size="sm" dot>
                  100% Eligible
                </Badge>
              ) : (
                <Badge
                  variant={matchScore >= 60 ? "amber" : "slate"}
                  size="sm"
                >
                  {matchScore}% Match
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Share button */}
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Share scholarship"
              aria-label="Share scholarship"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleCompareScholarship(scholarship.id)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isCompared
                  ? "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isCompared ? "Remove from comparison" : "Add to comparison studio"}
              aria-label="Toggle comparison"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleSaveScholarship(scholarship.id)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                saved
                  ? "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={saved ? "Remove bookmark" : "Save opportunity"}
              aria-label="Toggle bookmark"
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/scholarship/${scholarship.id}`}
          className="text-base font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 leading-tight min-h-[2.5rem]"
        >
          {scholarship.title}
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {scholarship.description}
        </p>
      </div>

      {/* Middle Specs */}
      <div className="px-5 py-3 border-y border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Annual Award
            </span>
            <span className="text-base font-extrabold text-violet-700 dark:text-violet-300 font-heading">
              {formatCurrency(scholarship.awardAmount, scholarship.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Deadline
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
              {formatDate(scholarship.deadline)}
            </span>
            <span
              className={`text-[10px] font-medium ${
                urgency.isUrgent ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-400"
              }`}
            >
              {urgency.text}
            </span>
          </div>
        </div>

        {/* Quick Links Row: Official Source & Institution Map */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
          <button
            type="button"
            onClick={handleOfficialSourceClick}
            className="text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>{isVerifiedSource ? "Official Portal" : "Official Source"}</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <a
            href={mapSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
            title="Locate provider on Google Maps (Institution name only)"
          >
            <MapPin className="w-3 h-3" />
            <span>Map</span>
          </a>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 flex items-center justify-between gap-2">
        <Button
          size="xs"
          variant="ghost"
          onClick={() => openMatchDna(scholarship)}
          icon={Sparkles}
          className="flex-1"
        >
          Match DNA
        </Button>
        <Button
          size="xs"
          variant="outline"
          className="flex-1"
          onClick={() => addApplication(scholarship)}
        >
          Track App
        </Button>
        <Link to={`/scholarship/${scholarship.id}`} className="flex-1">
          <Button size="xs" variant="primary" className="w-full">
            Details
          </Button>
        </Link>
      </div>

      {renderModals()}
    </Card>
  );
}
