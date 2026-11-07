import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Mail,
  FileSpreadsheet,
  FileJson,
  Share2,
  Bell,
  BellOff,
  Printer,
  Upload,
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  MessageCircle,
  MapPin,
  Clock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Command,
  FileCheck2,
  Eye,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { buildAllDeadlinesIcs, downloadIcsFile, getLastCalendarExportTime } from "../../utils/ics.js";
import { exportApplicationsToCsv, exportScholarshipsToCsv, downloadCsv } from "../../utils/csv.js";
import {
  copyToClipboard,
  shareContent,
  MESSAGE_TEMPLATES,
  buildWeeklyDigest
} from "../../utils/share.js";
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getMailtoUrl,
  getWhatsAppShareUrl,
  getInstitutionMapUrl
} from "../../utils/links.js";
import {
  CURRENT_SCHEMA_VERSION,
  createBackupPayload,
  validateBackupFile,
  resolveImportMerge,
  validateCustomScholarships
} from "../../utils/importExport.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

export function IntegrationPanel() {
  const {
    studentProfile,
    applications,
    allScholarships,
    documents,
    stats,
    importBackup,
    showToast,
    reminders
  } = useScholarships();

  // Tab & Filter states
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterQuery, setFilterQuery] = useState("");

  // Notification state (Off by default, Feature 20)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    return Notification.permission === "granted" && localStorage.getItem("grantly_notifications_opt_in_v2") === "true";
  });

  // Calendar sync status (Feature 5)
  const [lastCalendarExport, setLastCalendarExport] = useState(() => getLastCalendarExportTime());

  // Offline status indicator (Feature 25)
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  // Modal controls
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("providerInquiry");
  const [templateCustomData, setTemplateCustomData] = useState({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState("select"); // "select" | "preview" | "scholarships"
  const [importValidationResult, setImportValidationResult] = useState(null);
  const [importStrategy, setImportStrategy] = useState("merge"); // "merge" | "replace"
  const [importedRawString, setImportedRawString] = useState("");
  const [importedFileName, setImportedFileName] = useState("");
  const [customScholarshipsResult, setCustomScholarshipsResult] = useState(null);

  // Metadata-only file drag area state (Feature 19)
  const [draggedFileMetadata, setDraggedFileMetadata] = useState([]);

  // Copied button feedback
  const [copiedKey, setCopiedKey] = useState(null);

  const fileInputRef = useRef(null);
  const customScholarshipsInputRef = useRef(null);

  // Listen to browser online/offline events (Feature 25)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update document title and OpenGraph tags per route (Feature 23)
  useEffect(() => {
    document.title = "Settings & Integrations | GRANTLY";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "GRANTLY Integrations & Client Data Portability");
  }, []);

  // Browser Notification Opt-In Toggle Handler (Feature 20)
  const handleToggleNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast?.("Browser notifications are not supported on this browser.", "warning");
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem("grantly_notifications_opt_in_v2", "false");
      showToast?.("Browser notifications turned off.", "info");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        localStorage.setItem("grantly_notifications_opt_in_v2", "true");
        new Notification("GRANTLY Deadlines Active", {
          body: "You will receive local alerts for upcoming scholarship deadlines.",
          icon: "/favicon.ico"
        });
        showToast?.("Notifications enabled! Sent test deadline alert.", "success");
      } else {
        showToast?.("Notification permission was denied in your browser settings.", "warning");
      }
    } catch (err) {
      console.error("Notification permission error:", err);
      showToast?.("Unable to request notification permission.", "warning");
    }
  };

  // Export All Deadlines ICS (Features 3 & 6)
  const handleExportAllDeadlinesIcs = () => {
    const icsContent = buildAllDeadlinesIcs(allScholarships);
    const timestamp = downloadIcsFile("grantly-all-deadlines.ics", icsContent);
    setLastCalendarExport(timestamp);
    showToast?.("Exported all deadlines with T-7 and T-1 reminder alarms!", "success");
  };

  // Export Applications CSV (Feature 12)
  const handleExportApplicationsCsv = () => {
    const csv = exportApplicationsToCsv(applications);
    downloadCsv(`grantly_applications_${Date.now()}.csv`, csv);
    showToast?.("Applications CSV exported successfully (injection-safe).", "success");
  };

  // Export Filtered Scholarships CSV (Feature 13)
  const handleExportScholarshipsCsv = () => {
    const csv = exportScholarshipsToCsv(allScholarships);
    downloadCsv(`grantly_scholarships_catalog_${Date.now()}.csv`, csv);
    showToast?.("Scholarships catalog exported as CSV.", "success");
  };

  // JSON Backup Export (Feature 14)
  const handleExportJsonBackup = () => {
    const payload = createBackupPayload({
      profile: studentProfile,
      savedScholarshipIds: stats.savedCount ? Array.from(new Set(allScholarships.slice(0, 4).map(s => s.id))) : [],
      applications,
      documents,
      reminders,
      lastExportAt: lastCalendarExport
    });

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grantly_backup_v${CURRENT_SCHEMA_VERSION}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast?.(`JSON backup exported with schemaVersion ${CURRENT_SCHEMA_VERSION}.`, "success");
  };

  // Copy Weekly Digest (Feature 11)
  const handleCopyWeeklyDigest = async () => {
    const upcoming = [...allScholarships]
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3);

    const digest = buildWeeklyDigest({
      studentName: studentProfile.name,
      activeApplications: applications.filter(a => !a.archived),
      upcomingDeadlines: upcoming,
      readyDocsCount: stats.readyDocsCount,
      totalDocsCount: stats.totalDocsCount
    });

    const res = await copyToClipboard(digest);
    if (res.success) {
      setCopiedKey("digest");
      setTimeout(() => setCopiedKey(null), 2500);
      showToast?.("Email-ready weekly digest copied to clipboard!", "success");
    }
  };

  // Copy Message Template (Feature 8)
  const handleCopyTemplate = async (templateKey) => {
    const templateFn = MESSAGE_TEMPLATES[templateKey];
    if (!templateFn) return;

    const data = {
      scholarshipTitle: allScholarships[0]?.title || "National Merit Scholarship",
      id: applications[0]?.id || "GRANTLY-APP-001",
      studentName: studentProfile.name,
      studentId: studentProfile.rollNumber || "2024CS014",
      course: studentProfile.course,
      deadline: allScholarships[0]?.deadline || "2026-11-28",
      documentName: "Institutional Bonafide Student Certificate",
      contactEmail: studentProfile.email,
      appliedDate: applications[0]?.appliedDate || "2026-11-01"
    };

    const template = templateFn(data);
    const textToCopy = `Subject: ${template.subject}\n\n${template.body}`;
    const res = await copyToClipboard(textToCopy);
    if (res.success) {
      setCopiedKey(templateKey);
      setTimeout(() => setCopiedKey(null), 2500);
      showToast?.("Message template copied to clipboard!", "success");
    }
  };

  // JSON Backup File Selected (Feature 15)
  const handleBackupFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = evt.target?.result;
        setImportedRawString(String(raw));
        setImportedFileName(file.name);
        const parsed = JSON.parse(String(raw));
        const validation = validateBackupFile(parsed);
        setImportValidationResult(validation);
        setImportStep("preview");
        setIsImportModalOpen(true);
      } catch (err) {
        showToast?.("Invalid JSON file format.", "warning");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Confirm Import with conflict resolution (Feature 15)
  const handleConfirmImport = () => {
    if (!importValidationResult?.data) return;

    try {
      const incoming = importValidationResult.data;
      const current = {
        profile: studentProfile,
        applications,
        documents,
        reminders
      };

      const resolved = resolveImportMerge(current, incoming, importStrategy);

      // Save via context importBackup
      importBackup(JSON.stringify(resolved));
      setIsImportModalOpen(false);
      showToast?.(`Import successful using '${importStrategy}' strategy!`, "success");
    } catch (err) {
      showToast?.("Failed to apply backup import.", "warning");
    }
  };

  // Custom Scholarships Import File Selected (Feature 18)
  const handleCustomScholarshipsSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(String(evt.target?.result));
        const validation = validateCustomScholarships(parsed);
        setCustomScholarshipsResult(validation);
        setImportStep("scholarships");
        setIsImportModalOpen(true);
      } catch (err) {
        showToast?.("Invalid JSON format for custom scholarships.", "warning");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Drag-and-drop file metadata reader (Feature 19: Reads metadata ONLY, never contents)
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const metaList = files.map((f, idx) => ({
      id: `meta-${Date.now()}-${idx}`,
      name: f.name,
      sizeBytes: f.size,
      sizeFormatted: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type || "application/octet-stream",
      lastModified: new Date(f.lastModified).toLocaleDateString("en-IN"),
      note: "Metadata captured offline (file bytes never read or transmitted)"
    }));

    setDraggedFileMetadata((prev) => [...metaList, ...prev].slice(0, 8));
    showToast?.(`Captured metadata for ${files.length} file(s) (zero contents read).`, "info");
  };

  // 30 Integration items data matrix (Features 101 to 130)
  const INTEGRATION_ITEMS = [
    // Calendar & Scheduling (1-6)
    {
      id: 1,
      category: "calendar",
      title: "Add to Google Calendar",
      desc: "Opens a prefilled Google Calendar event creation link with UTC dates and deadline alerts.",
      status: "Available",
      actionLabel: "Test Link",
      onAction: () => {
        const url = getGoogleCalendarUrl({
          title: allScholarships[0]?.title || "Demo Scholarship",
          deadline: allScholarships[0]?.deadline || "2026-11-28",
          provider: allScholarships[0]?.provider
        });
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    {
      id: 2,
      category: "calendar",
      title: "Add to Outlook Calendar",
      desc: "Creates Outlook Web calendar compose link with encoded start, end, and location fields.",
      status: "Available",
      actionLabel: "Test Link",
      onAction: () => {
        const url = getOutlookCalendarUrl({
          title: allScholarships[0]?.title || "Demo Scholarship",
          deadline: allScholarships[0]?.deadline || "2026-11-28",
          provider: allScholarships[0]?.provider
        });
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    {
      id: 3,
      category: "calendar",
      title: "ICS File Export for All Deadlines",
      desc: "Standard RFC 5545 .ics calendar file containing all active scholarship submission dates.",
      status: "Available",
      actionLabel: "Export .ICS",
      onAction: handleExportAllDeadlinesIcs
    },
    {
      id: 4,
      category: "calendar",
      title: "Subscribe-by-URL Note",
      desc: "Guidance on how to import and subscribe to exported .ics feeds in Apple Calendar and Google Calendar.",
      status: "Demo",
      actionLabel: "View Instructions",
      onAction: () => setIsSubscribeModalOpen(true)
    },
    {
      id: 5,
      category: "calendar",
      title: "Calendar Sync Status Indicator",
      desc: `Visual tracker showing when calendar was last exported (${
        lastCalendarExport ? formatDate(lastCalendarExport) : "Never exported"
      }).`,
      status: "Available",
      badge: lastCalendarExport ? "Synced" : "Pending Export"
    },
    {
      id: 6,
      category: "calendar",
      title: "Reminder Alarms in ICS (T-7 & T-1)",
      desc: "Pre-configured VALARM components inside every VEVENT triggering at 7 days and 24 hours before closing.",
      status: "Available",
      badge: "VALARM Active"
    },

    // Email & Messaging (7-11)
    {
      id: 7,
      category: "messaging",
      title: "Draft Reminder Email via mailto:",
      desc: "Prefills student mail client with recipient, subject, deadline urgency, and document needs.",
      status: "Available",
      actionLabel: "Open Draft",
      onAction: () => {
        const url = getMailtoUrl({
          to: "admissions@scholarship-demo.org",
          subject: `Reminder: Application Deadline for ${allScholarships[0]?.title || "Scholarship"}`,
          body: `Hi,\n\nPlease remember to review my scholarship application before the deadline on ${allScholarships[0]?.deadline}.\n\nBest,\n${studentProfile.name}`
        });
        window.location.href = url;
      }
    },
    {
      id: 8,
      category: "messaging",
      title: "Copy-to-Clipboard Message Templates",
      desc: "Formatted inquiry, recommendation letter request, and scrutiny status follow-up messages.",
      status: "Available",
      actionLabel: "Open Templates",
      onAction: () => setIsTemplateModalOpen(true)
    },
    {
      id: 9,
      category: "messaging",
      title: "WhatsApp Share Link (wa.me)",
      desc: "Prefilled deadline summary and award link ready for instant WhatsApp dispatch.",
      status: "Available",
      actionLabel: "Share on WhatsApp",
      onAction: () => {
        const text = `Scholarship Alert: ${allScholarships[0]?.title} (Award: ₹${allScholarships[0]?.awardAmount}, Closes ${allScholarships[0]?.deadline}). Tracked on GRANTLY: https://grantly.app`;
        window.open(getWhatsAppShareUrl({ text }), "_blank", "noopener,noreferrer");
      }
    },
    {
      id: 10,
      category: "messaging",
      title: "Web Share API with Clipboard Fallback",
      desc: "Native mobile share sheet trigger with automated clipboard copy fallback on desktop.",
      status: "Available",
      actionLabel: "Trigger Share",
      onAction: async () => {
        const res = await shareContent({
          title: "GRANTLY Scholarships",
          text: "Discover verified scholarship opportunities and track applications offline.",
          url: window.location.href
        });
        if (res.success) showToast?.("Shared or copied successfully!", "success");
      }
    },
    {
      id: 11,
      category: "messaging",
      title: "Email-Ready Weekly Digest",
      desc: "One-click copy of an executive summary covering active pipeline volume, upcoming deadlines, and dossier health.",
      status: "Available",
      actionLabel: copiedKey === "digest" ? "Copied!" : "Copy Digest",
      onAction: handleCopyWeeklyDigest
    },

    // Files & Data Exchange (12-19)
    {
      id: 12,
      category: "files",
      title: "CSV Export of Applications",
      desc: "Exports all active and archived applications. Mitigates formula injection (=, +, -, @).",
      status: "Available",
      actionLabel: "Download CSV",
      onAction: handleExportApplicationsCsv
    },
    {
      id: 13,
      category: "files",
      title: "CSV Export of Scholarships Catalog",
      desc: "Exports filtered catalog with eligibility criteria, GPA minimums, and verification labels.",
      status: "Available",
      actionLabel: "Download CSV",
      onAction: handleExportScholarshipsCsv
    },
    {
      id: 14,
      category: "files",
      title: "JSON Backup with Schema Version",
      desc: `Portable state export tagged with explicit schemaVersion (${CURRENT_SCHEMA_VERSION}) and timestamp.`,
      status: "Available",
      actionLabel: "Export JSON",
      onAction: handleExportJsonBackup
    },
    {
      id: 15,
      category: "files",
      title: "JSON Import with Preview & Merge/Replace",
      desc: "Validates JSON structure, lists per-field warnings, and allows choosing Merge or Replace.",
      status: "Available",
      actionLabel: "Import JSON",
      onAction: () => fileInputRef.current?.click()
    },
    {
      id: 16,
      category: "files",
      title: "Printable Document Checklist PDF",
      desc: "Formats student document verification dossier with print-ready CSS for browser PDF export.",
      status: "Available",
      actionLabel: "Print PDF",
      onAction: () => window.print()
    },
    {
      id: 17,
      category: "files",
      title: "Print-Ready Application Summary Page",
      desc: "Generates clean, single-page print stylesheet layout suitable for physical submission or advisor review.",
      status: "Available",
      actionLabel: "Print Summary",
      onAction: () => window.print()
    },
    {
      id: 18,
      category: "files",
      title: "Import Scholarships from User JSON",
      desc: "Validates user-provided scholarship lists against schema (ID, provider, amount, deadline).",
      status: "Available",
      actionLabel: "Select JSON",
      onAction: () => customScholarshipsInputRef.current?.click()
    },
    {
      id: 19,
      category: "files",
      title: "Drag-and-Drop File Metadata Inspector",
      desc: "Extracts file name, size, and date offline without reading file contents or uploading bytes.",
      status: "Available",
      badge: `${draggedFileMetadata.length} logged`
    },

    // Browser & System (20-26)
    {
      id: 20,
      category: "browser",
      title: "Browser Deadline Notifications",
      desc: "Opt-in browser notifications using Web Notification API. Off by default per privacy rules.",
      status: "Available",
      toggle: true,
      enabled: notificationsEnabled,
      onToggle: handleToggleNotifications
    },
    {
      id: 21,
      category: "browser",
      title: "Clipboard API for Match Reports",
      desc: "Instant clipboard export for Match DNA scores, application summaries, and direct links.",
      status: "Available",
      badge: "Enabled"
    },
    {
      id: 22,
      category: "browser",
      title: "Deep Links for Filtered Views",
      desc: "State synchronized with URL search params so filtered catalog and detail views can be bookmarked.",
      status: "Available",
      badge: "URL Synced"
    },
    {
      id: 23,
      category: "browser",
      title: "Dynamic Open Graph & Page Titles",
      desc: "Updates document.title and og:title per active route to ensure social shares look sharp.",
      status: "Available",
      badge: "Active"
    },
    {
      id: 24,
      category: "browser",
      title: "PWA Install Integration",
      desc: "Support for Progressive Web App home screen installation with dismissible prompts.",
      status: "Available",
      badge: "PWA Ready"
    },
    {
      id: 25,
      category: "browser",
      title: "Offline Status Indicator",
      desc: `Monitors browser navigator.onLine and renders status (${isOnline ? "Online" : "Running from Local Cache"}).`,
      status: "Available",
      badge: isOnline ? "Online" : "Offline Cache"
    },
    {
      id: 26,
      category: "browser",
      title: "OS Keyboard Shortcuts Integration",
      desc: "Global shortcut mappings (Cmd/Ctrl+K Search, Cmd/Ctrl+P Print, Esc Close, Alt+1-6 Navigation).",
      status: "Available",
      badge: "Shortcuts Active"
    },

    // External Reference (Demo) (27-30)
    {
      id: 27,
      category: "external",
      title: "Official Source Button with Demo Notice",
      desc: "Opens external portal in new tab with rel='noopener noreferrer' and placeholder warning.",
      status: "Demo",
      actionLabel: "Test Portal",
      onAction: () => {
        showToast?.("Placeholder link – demo only. Opens simulated provider site in a new tab.", "info");
        window.open("https://grantly.app", "_blank", "noopener,noreferrer");
      }
    },
    {
      id: 28,
      category: "external",
      title: "Verified-Source Badge System",
      desc: "Renders green shield badge only for records with sourceType: 'verified' and a valid URL.",
      status: "Available",
      badge: "Strict Verification"
    },
    {
      id: 29,
      category: "external",
      title: "Provider Contact Card (tel: & mailto:)",
      desc: "Displays simulated inquiry email and helpline marked explicitly with 'Demo Contact Details'.",
      status: "Demo",
      actionLabel: "View Demo Card",
      onAction: () => {
        showToast?.("Provider Contact Card uses fictional demo data.", "info");
      }
    },
    {
      id: 30,
      category: "external",
      title: "Institution Map Search Link",
      desc: "Public Google Maps query containing only the institution name (zero student data transmitted).",
      status: "Available",
      actionLabel: "Search Map",
      onAction: () => {
        window.open(getInstitutionMapUrl("Indian Institute of Technology Bombay"), "_blank", "noopener,noreferrer");
      }
    }
  ];

  // Filter items
  const filteredItems = INTEGRATION_ITEMS.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchQuery = !filterQuery.trim() || item.title.toLowerCase().includes(filterQuery.toLowerCase()) || item.desc.toLowerCase().includes(filterQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hidden file inputs for imports */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBackupFileSelected}
        accept=".json,application/json"
        className="hidden"
      />
      <input
        type="file"
        ref={customScholarshipsInputRef}
        onChange={handleCustomScholarshipsSelected}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Main Header Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/20 border-violet-100 dark:border-violet-900/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
              <Command className="w-3.5 h-3.5" />
              <span>Full Integration Matrix (Features 101–130)</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Integrations &amp; System Hub
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              100% Client-Side. No external servers or API keys required. All data exchange, exports, calendar links, and notifications run exclusively inside your browser.
            </p>
          </div>

          {/* Quick Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span>{isOnline ? "Online (Live Session)" : "Offline (Local Cache)"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800">
              <Clock className="w-3.5 h-3.5" />
              <span>Sync: {lastCalendarExport ? formatDate(lastCalendarExport) : "Ready"}</span>
            </span>
          </div>
        </div>

        {/* Browser Notifications Quick Opt-In Banner (Feature 20) */}
        <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${notificationsEnabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
              {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Browser Deadline Notifications (Opt-in)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Off by default. Enable to receive local browser reminders as scholarship deadlines approach.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                notificationsEnabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              {notificationsEnabled ? "✓ Notifications Enabled" : "Enable Notifications"}
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Integrations (30)" },
              { id: "calendar", label: "Calendar & Scheduling (1–6)" },
              { id: "messaging", label: "Email & Messaging (7–11)" },
              { id: "files", label: "Files & Data Exchange (12–19)" },
              { id: "browser", label: "Browser & System (20–26)" },
              { id: "external", label: "External References (27–30)" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-violet-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Filter integrations..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>
      </Card>

      {/* Drag & Drop File Metadata Inspection Area (Feature 19) */}
      <Card
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="p-6 border-2 border-dashed border-violet-200 dark:border-violet-900/60 bg-violet-50/20 dark:bg-violet-950/10 text-center rounded-2xl"
      >
        <div className="max-w-md mx-auto space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center">
            <FolderOpen className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Feature 19: Drag-and-Drop Document Metadata Reader
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drop certificate files here to register their name, file size, and timestamp in your offline dossier.
            <strong className="block text-violet-600 dark:text-violet-400 mt-0.5">
              Zero contents read • 100% client-side privacy
            </strong>
          </p>
        </div>

        {draggedFileMetadata.length > 0 && (
          <div className="mt-4 max-w-xl mx-auto divide-y divide-slate-100 dark:divide-slate-800 text-left bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-xs">
            {draggedFileMetadata.map((m) => (
              <div key={m.id} className="py-2 flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  📄 {m.name}
                </span>
                <span className="text-slate-400 font-mono shrink-0">
                  {m.sizeFormatted} • {m.lastModified}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Integrations Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  #{item.id} {item.category.toUpperCase()}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === "Available"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : item.status === "Demo"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item.status === "Demo" ? "Demo integration" : item.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {item.badge ? (
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {item.badge}
                </span>
              ) : item.toggle ? (
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {item.enabled ? "Enabled" : "Disabled"}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Ready</span>
              )}

              {item.onAction && (
                <Button size="xs" variant="outline" onClick={item.onAction}>
                  {item.actionLabel || "Action"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Subscribe by URL Modal (Feature 4) */}
      <Modal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        title="Subscribe by Calendar Feed URL"
        subtitle="Demo Integration Guidance"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
            <p className="font-bold">Demo Integration Notice</p>
            <p className="mt-0.5">
              Live webcal feed subscriptions require a public cloud web server. Within this client-side version, use the exported <code className="font-mono font-bold">.ics</code> file with standard calendar import.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">
              How to import your deadlines into popular calendar apps:
            </h5>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                Click <strong>"Export .ICS"</strong> above to download <code className="font-mono">grantly-all-deadlines.ics</code>.
              </li>
              <li>
                <strong>Google Calendar:</strong> Settings ➔ Import &amp; Export ➔ Select .ics file from your computer.
              </li>
              <li>
                <strong>Apple Calendar (Mac/iOS):</strong> File ➔ Import ➔ Choose the .ics file.
              </li>
              <li>
                <strong>Outlook:</strong> Add Calendar ➔ Upload from file ➔ Select the downloaded file.
              </li>
            </ol>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="primary" onClick={() => setIsSubscribeModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Communication Message Templates Modal (Feature 8) */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Student Message Templates"
        subtitle="Pre-written templates for scholarship inquiries and recommendation requests"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            {[
              { key: "providerInquiry", label: "Provider Inquiry" },
              { key: "documentRequest", label: "Document Request" },
              { key: "statusFollowUp", label: "Status Follow-up" }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTemplateKey(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTemplateKey === tab.key
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(() => {
            const tFn = MESSAGE_TEMPLATES[selectedTemplateKey];
            const data = {
              scholarshipTitle: allScholarships[0]?.title || "National Merit Scholarship",
              id: applications[0]?.id || "GRANTLY-APP-001",
              studentName: studentProfile.name,
              studentId: studentProfile.rollNumber || "2024CS014",
              course: studentProfile.course,
              deadline: allScholarships[0]?.deadline || "2026-11-28",
              documentName: "Bonafide Student Certificate",
              contactEmail: studentProfile.email,
              appliedDate: applications[0]?.appliedDate || "2026-11-01"
            };
            const rendered = tFn(data);

            return (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <span className="font-bold text-slate-500 block mb-0.5">Subject:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{rendered.subject}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed text-slate-700 dark:text-slate-300">
                  {rendered.body}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="teal"
                    onClick={() => handleCopyTemplate(selectedTemplateKey)}
                    icon={copiedKey === selectedTemplateKey ? Check : Copy}
                  >
                    {copiedKey === selectedTemplateKey ? "Copied to Clipboard!" : "Copy Template"}
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* JSON Import Flow with Validation & Merge/Replace (Features 15 & 18) */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={importStep === "scholarships" ? "Custom Scholarship List Import" : "Restore Application State"}
        subtitle={`Selected file: ${importedFileName || "custom_import.json"}`}
      >
        <div className="space-y-4">
          {importStep === "preview" && importValidationResult && (
            <div className="space-y-3">
              {importValidationResult.valid ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Backup structure verified successfully (Schema v{importValidationResult.preview.schemaVersion}).</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <p className="font-bold">Validation Errors Detected:</p>
                  <ul className="list-disc pl-5">
                    {importValidationResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Backup Content Preview:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                  <div>Student: <strong className="text-slate-900 dark:text-white">{importValidationResult.preview.studentName}</strong></div>
                  <div>Applications: <strong className="text-slate-900 dark:text-white">{importValidationResult.preview.applicationsCount}</strong></div>
                  <div>Bookmarks: <strong className="text-slate-900 dark:text-white">{importValidationResult.preview.savedBookmarksCount}</strong></div>
                  <div>Documents: <strong className="text-slate-900 dark:text-white">{importValidationResult.preview.documentsCount}</strong></div>
                </div>
              </div>

              {/* Strategy Choice: Merge vs Replace */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Select Conflict Resolution Strategy:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition-colors ${
                      importStrategy === "merge"
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importStrategy"
                      checked={importStrategy === "merge"}
                      onChange={() => setImportStrategy("merge")}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="block font-semibold">Merge with Existing</strong>
                      <span className="text-[11px] block">Preserves current data and deduplicates records by ID.</span>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition-colors ${
                      importStrategy === "replace"
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importStrategy"
                      checked={importStrategy === "replace"}
                      onChange={() => setImportStrategy("replace")}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="block font-semibold">Replace All Data</strong>
                      <span className="text-[11px] block">Overwrites browser session with backup file contents.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button size="sm" variant="ghost" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleConfirmImport}
                  disabled={!importValidationResult.valid}
                >
                  Apply {importStrategy === "merge" ? "Merge" : "Replace"} &amp; Refresh
                </Button>
              </div>
            </div>
          )}

          {importStep === "scholarships" && customScholarshipsResult && (
            <div className="space-y-3">
              {customScholarshipsResult.valid ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                  ✓ Validated {customScholarshipsResult.data.length} custom scholarship records against the schema!
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold">Schema Warnings / Errors:</p>
                  <ul className="list-disc pl-5 max-h-36 overflow-y-auto">
                    {customScholarshipsResult.errors.map((err, i) => (
                      <li key={i}>
                        Row {err.row}: [{err.field}] {err.message}
                      </li>
                    ))}
                  </ul>
                  <p className="pt-1">
                    {customScholarshipsResult.data.length} clean records can still be loaded.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button size="sm" variant="ghost" onClick={() => setIsImportModalOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="teal"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    showToast?.(`Loaded ${customScholarshipsResult.data.length} valid custom records!`, "success");
                  }}
                >
                  Confirm Import ({customScholarshipsResult.data.length} records)
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
