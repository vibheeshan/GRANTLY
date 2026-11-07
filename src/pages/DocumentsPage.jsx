import React, { useState } from "react";
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Calendar,
  Filter,
  Check,
  Layers,
  Sparkles,
  Printer
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select, Textarea } from "../components/ui/Input.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { formatDate } from "../utils/formatters.js";

export function DocumentsPage() {
  const {
    documents,
    toggleDocumentReady,
    updateDocument,
    uploadSimulatedDocument,
    addCustomDocument,
    allScholarships,
    stats
  } = useScholarships();

  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL" | "READY" | "PENDING"
  const [scholarshipFilter, setScholarshipFilter] = useState("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocCat, setNewDocCat] = useState("Academic");
  const [newDocDesc, setNewDocDesc] = useState("");
  const [newDocExpiry, setNewDocExpiry] = useState("2027-12-31");

  const [uploadDocTarget, setUploadDocTarget] = useState(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadAuthority, setUploadAuthority] = useState("");

  const categories = ["ALL", "Academic", "Financial", "Identity", "Institutional", "General"];

  // Selected scholarship's required document names (if filtered)
  const targetSch = allScholarships.find(s => s.id === scholarshipFilter);
  const targetSchRequiredDocs = targetSch ? targetSch.requiredDocuments : [];

  const filteredDocs = documents.filter((doc) => {
    // Scholarship specific checklist filter
    if (scholarshipFilter !== "ALL") {
      const isReqForSch = targetSchRequiredDocs.some(reqName =>
        doc.name.toLowerCase().includes(reqName.toLowerCase()) ||
        reqName.toLowerCase().includes(doc.name.toLowerCase())
      );
      if (!isReqForSch) return false;
    }

    if (filterCategory !== "ALL" && doc.category !== filterCategory) return false;
    if (filterStatus === "READY" && !doc.isReady) return false;
    if (filterStatus === "PENDING" && doc.isReady) return false;
    return true;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    addCustomDocument(newDocName.trim(), newDocCat, newDocDesc.trim(), newDocExpiry);
    setNewDocName("");
    setNewDocDesc("");
    setIsAddModalOpen(false);
  };

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    if (!uploadDocTarget || !uploadFileName.trim()) return;
    uploadSimulatedDocument(
      uploadDocTarget.id,
      uploadFileName.trim().endsWith(".pdf") ? uploadFileName.trim() : `${uploadFileName.trim()}.pdf`,
      "1.2 MB",
      uploadAuthority || "Verified Registrar / Revenue Office"
    );
    setUploadDocTarget(null);
    setUploadFileName("");
    setUploadAuthority("");
  };

  // Helper for document status: Available, Missing, Expiring Soon, Needs Attention
  const getDocStatus = (doc) => {
    if (!doc.isReady) {
      return {
        label: "Missing",
        variant: "rose",
        color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300"
      };
    }
    if (!doc.expiryDate) {
      return {
        label: "Available",
        variant: "teal",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
      };
    }
    const now = new Date("2026-11-07");
    const exp = new Date(doc.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Needs Attention",
        variant: "rose",
        color: "text-rose-700 bg-rose-100 border-rose-300 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-300 font-bold"
      };
    }
    if (diffDays <= 60) {
      return {
        label: "Expiring Soon",
        variant: "amber",
        color: "text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300 font-semibold"
      };
    }
    return {
      label: "Available",
      variant: "teal",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Document Readiness &amp; Verification Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Document Center
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain verified academic transcripts, tahsildar income proofs, and bonafides with expiry tracking and scholarship-specific checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={Printer}
            onClick={() => window.print()}
            title="Print or export checklist as PDF"
          >
            Print Checklist (PDF)
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Custom Certificate
          </Button>
        </div>
      </div>

      {/* LocalStorage Privacy Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            <strong>Client-Side Storage:</strong> All files and verification records are persisted exclusively in your browser's LocalStorage. No documents are transferred to external cloud servers.
          </span>
        </div>
      </div>

      {/* Readiness Progress Bar Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 space-y-2 w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Personal Dossier Preparedness
            </span>
            <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400 font-heading">
              {stats.documentReadinessPercentage}% Complete ({stats.readyDocsCount}/{stats.totalDocsCount} Ready)
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${stats.documentReadinessPercentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.documentReadinessPercentage >= 80
              ? "🌟 Excellent! Your core credentials are ready for rapid application submission."
              : "⚠️ Complete the remaining pending documents to avoid disqualification during scrutiny."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
          <button
            onClick={() => setFilterStatus(filterStatus === "READY" ? "ALL" : "READY")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              filterStatus === "READY"
                ? "bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-300"
                : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Ready ({stats.readyDocsCount})
          </button>
          <button
            onClick={() => setFilterStatus(filterStatus === "PENDING" ? "ALL" : "PENDING")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              filterStatus === "PENDING"
                ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300"
                : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Pending ({stats.totalDocsCount - stats.readyDocsCount})
          </button>
        </div>
      </div>

      {/* Scholarship-Specific Checklist Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-violet-500 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Filter Checklist by Opportunity:
          </span>
        </div>

        <select
          value={scholarshipFilter}
          onChange={(e) => setScholarshipFilter(e.target.value)}
          className="text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 max-w-sm truncate"
        >
          <option value="ALL">Show All General Dossier Records ({documents.length})</option>
          {allScholarships.map(sch => (
            <option key={sch.id} value={sch.id}>
              Requirements for: {sch.title}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              filterCategory === cat
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const status = getDocStatus(doc);

          return (
            <Card
              key={doc.id}
              className={`p-5 transition-all flex flex-col justify-between ${
                doc.isReady
                  ? "border-emerald-200/80 dark:border-emerald-900/40 bg-white dark:bg-slate-900"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        doc.category === "Academic"
                          ? "blue"
                          : doc.category === "Financial"
                          ? "emerald"
                          : doc.category === "Identity"
                          ? "violet"
                          : "slate"
                      }
                      size="sm"
                    >
                      {doc.category}
                    </Badge>
                    <Badge variant={status.variant} size="sm" dot>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Readiness Toggle Button */}
                  <button
                    onClick={() => toggleDocumentReady(doc.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      doc.isReady
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                    title="Click to toggle document readiness"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${doc.isReady ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>{doc.isReady ? "Mark Pending" : "Mark Ready"}</span>
                  </button>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {doc.name}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {doc.description}
                </p>

                {/* Expiry Pill & Issuing Authority */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-md ${exp.color}`}>
                    {exp.text}
                  </span>
                  {doc.issuingAuthority && (
                    <span className="text-slate-400">
                      • Authority: {doc.issuingAuthority}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">
                  {doc.fileDetails ? `📄 ${doc.fileDetails}` : "No file attached"}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setUploadDocTarget(doc);
                      setUploadFileName(doc.name.replace(/\s+/g, "_"));
                      setUploadAuthority(doc.issuingAuthority || "Competent Authority");
                    }}
                    icon={UploadCloud}
                  >
                    {doc.isReady ? "Replace" : "Upload"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No documents found matching selected filters.
        </div>
      )}

      {/* Helpful Document Scrutiny Guidelines */}
      <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
            Government &amp; CSR Scrutiny Tips
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div>
            <strong className="text-slate-800 dark:text-slate-100 block mb-1">
              • Income Certificates
            </strong>
            Must be issued in the current financial year by a designated Revenue Authority (Tahsildar / Sub-Divisional Magistrate).
          </div>
          <div>
            <strong className="text-slate-800 dark:text-slate-100 block mb-1">
              • Academic Transcripts
            </strong>
            Semester marksheets must include the college stamp and signature of the Controller of Examinations.
          </div>
          <div>
            <strong className="text-slate-800 dark:text-slate-100 block mb-1">
              • Bank Account Verification
            </strong>
            Must be in the student's primary name (single holder preferred) and seeded with Aadhaar for direct benefit transfers (DBT).
          </div>
        </div>
      </div>

      {/* Simulated Document Upload Modal */}
      <Modal
        isOpen={Boolean(uploadDocTarget)}
        onClose={() => setUploadDocTarget(null)}
        title="Simulate Document Verification Upload"
        subtitle={uploadDocTarget ? `Attach certificate for: ${uploadDocTarget.name}` : ""}
      >
        <form onSubmit={handleSimulateUpload} className="space-y-4">
          <div className="p-6 rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/30 dark:bg-violet-950/20 text-center space-y-2">
            <UploadCloud className="w-10 h-10 text-violet-600 dark:text-violet-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Drag &amp; drop attested PDF scan here, or customize metadata below
            </p>
            <p className="text-[11px] text-slate-400">
              Max file size 5MB • Formats: PDF, PNG, JPG (Local simulated storage)
            </p>
          </div>

          <Input
            label="File Name"
            value={uploadFileName}
            onChange={(e) => setUploadFileName(e.target.value)}
            placeholder="e.g. Income_Certificate_FY26.pdf"
            required
          />

          <Input
            label="Issuing Office / Authority"
            value={uploadAuthority}
            onChange={(e) => setUploadAuthority(e.target.value)}
            placeholder="e.g. Tahsildar Office, Pune District"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUploadDocTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Check}>
              Attach &amp; Verify
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Custom Document Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Certificate to Checklist"
        subtitle="Track special requirement records required by your provider"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Document Name"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="e.g. Caste Validity Certificate / Disability Card"
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={newDocCat}
                onChange={(e) => setNewDocCat(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {categories.filter(c => c !== "ALL").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Expiry / Validity Date"
              type="date"
              value={newDocExpiry}
              onChange={(e) => setNewDocExpiry(e.target.value)}
            />
          </div>

          <Textarea
            label="Description &amp; Issuing Authority"
            value={newDocDesc}
            onChange={(e) => setNewDocDesc(e.target.value)}
            placeholder="e.g. Attested copy from District Social Welfare Officer..."
            rows={3}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Certificate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
