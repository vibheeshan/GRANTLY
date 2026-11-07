import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Building2,
  MapPin,
  Percent,
  Wallet,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Check,
  Sun,
  Moon,
  Download,
  Upload,
  Zap,
  AlertTriangle,
  FileJson,
  Layers,
  Settings as SettingsIcon,
  Command
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select, Textarea } from "../components/ui/Input.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { IntegrationPanel } from "../components/integrations/IntegrationPanel.jsx";
import {
  EDUCATION_LEVELS,
  STATES_LIST,
  COURSES_LIST,
  SCHOLARSHIP_CATEGORIES
} from "../data/scholarships.js";
import { formatCurrency } from "../utils/formatters.js";

export function ProfilePage({ defaultTab }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || defaultTab || "profile";
  const [activeTab, setActiveTab] = useState(initialTab === "integrations" ? "integrations" : "profile");

  useEffect(() => {
    const tabParam = searchParams.get("tab") || defaultTab;
    if (tabParam === "integrations") {
      setActiveTab("integrations");
    }
  }, [searchParams, defaultTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const {
    studentProfile,
    updateProfile,
    resetAllData,
    exportBackup,
    importBackup,
    showToast,
    stats
  } = useScholarships();
  const { theme, toggleTheme, reducedMotion, toggleReducedMotion } = useTheme();

  const [formData, setFormData] = useState({ ...studentProfile });
  const [avatarError, setAvatarError] = useState(false);
  const [fontScale, setFontScale] = useState(() => localStorage.getItem("grantly_font_scale_v2") || "normal");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState("Feature Suggestion");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedJsonContent, setImportedJsonContent] = useState("");
  const [importFileName, setImportFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFontScaleChange = (scale) => {
    setFontScale(scale);
    localStorage.setItem("grantly_font_scale_v2", scale);
    if (scale === "large") {
      document.documentElement.style.fontSize = "18px";
    } else {
      document.documentElement.style.fontSize = "16px";
    }
    showToast(`Font scale updated to ${scale}.`, "info");
  };

  const handleSaveFeedback = (e) => {
    e.preventDefault();
    if (!feedbackComments.trim()) return;
    const entry = {
      id: `fb-${Date.now()}`,
      rating: feedbackRating,
      category: feedbackCategory,
      comments: feedbackComments.trim(),
      student: studentProfile.name,
      timestamp: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem("grantly_local_feedback_v2") || "[]");
      existing.unshift(entry);
      localStorage.setItem("grantly_local_feedback_v2", JSON.stringify(existing));

      // Export file
      const blob = new Blob([JSON.stringify(existing, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `grantly_user_feedback_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setFeedbackComments("");
      showToast("Feedback stored locally & exported as JSON!", "success");
    } catch (err) {
      showToast("Could not save feedback.", "warning");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      showToast("Please select a valid .json backup file.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        setImportedJsonContent(text);
        setImportFileName(file.name);
        setIsImportModalOpen(true);
      } catch (err) {
        showToast("Error reading the selected file.", "warning");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = () => {
    if (!importedJsonContent) return;
    const success = importBackup(importedJsonContent);
    if (success) {
      setIsImportModalOpen(false);
      setImportedJsonContent("");
      setImportFileName("");
      setTimeout(() => {
        setFormData(studentProfile);
      }, 50);
    }
  };

  const handleConfirmReset = () => {
    resetAllData();
    setIsResetModalOpen(false);
    setFormData(studentProfile);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      academicPercentage: Number(formData.academicPercentage),
      familyIncome: Number(formData.familyIncome)
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header & Section Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Settings &amp; System Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Student criteria calibrate the match engine, while Integrations handle client-side data exchange.
          </p>
        </div>

        {/* Top Tab Bar: Profile vs Integrations */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Profile</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("integrations")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "integrations"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Command className="w-3.5 h-3.5 text-violet-500" />
            <span>Integrations (101–130)</span>
          </button>
        </div>
      </div>

      {/* Conditional Content based on Active Tab */}
      {activeTab === "integrations" ? (
        <IntegrationPanel />
      ) : (
        <>
          {/* Profile Overview Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarError ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-teal-500 text-white flex items-center justify-center font-bold font-heading text-xl sm:text-2xl ring-4 ring-violet-500/20 shadow-md">
                  {studentProfile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              ) : (
                <img
                  src={studentProfile.avatar}
                  alt={studentProfile.name}
                  onError={() => setAvatarError(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-violet-500/20"
                />
              )}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                {studentProfile.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {studentProfile.course} • {studentProfile.institution}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold">
                  {studentProfile.state} Domicile
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold">
                  {studentProfile.academicPercentage}% Academic Score
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              icon={theme === "dark" ? Sun : Moon}
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Eligible Opportunities
            </span>
            <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-0.5 block font-heading">
              {stats.eligibleCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saved Bookmarks
            </span>
            <span className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-0.5 block font-heading">
              {stats.savedCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Applications
            </span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block font-heading">
              {stats.activeApplicationsCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Document Readiness
            </span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-heading">
              {stats.documentReadinessPercentage}%
            </span>
          </div>
        </div>
      </Card>

      {/* Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Update demographic and academic metrics">
            Edit Profile Parameters
          </CardTitle>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                icon={User}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                icon={Mail}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Education Level
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => handleChange("educationLevel", e.target.value)}
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
                  Degree / Course
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => handleChange("course", e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {COURSES_LIST.filter(c => c !== "All Courses").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  State of Residence
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {STATES_LIST.filter(s => s !== "All India").map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institution Name"
                value={formData.institution}
                onChange={(e) => handleChange("institution", e.target.value)}
                icon={Building2}
                required
              />

              <Input
                label="Specialization / Branch"
                value={formData.specialization || ""}
                onChange={(e) => handleChange("specialization", e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Academic Cumulative Percentage (%)"
                type="number"
                step="0.1"
                min="40"
                max="100"
                value={formData.academicPercentage}
                onChange={(e) => handleChange("academicPercentage", e.target.value)}
                icon={Percent}
                required
              />

              <Input
                label="Annual Family Income (₹)"
                type="number"
                step="10000"
                min="0"
                value={formData.familyIncome}
                onChange={(e) => handleChange("familyIncome", e.target.value)}
                icon={Wallet}
                required
              />
            </div>

            <Textarea
              label="Bio / Academic Aspirations"
              value={formData.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell providers about your goals and achievements..."
              rows={3}
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Demo State</span>
              </button>

              <Button type="submit" variant="primary" size="md" icon={Check}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Display & Accessibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Fine-tune animations, visual transitions, and cognitive load">
            Display &amp; Accessibility Preferences
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Reduced Motion Mode
                </span>
                {reducedMotion && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Minimizes animations, spinning radars, and decorative transitions for users sensitive to motion or seeking high performance.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleReducedMotion}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                reducedMotion ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
              role="switch"
              aria-checked={reducedMotion}
              aria-label="Toggle reduced motion"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  reducedMotion ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Color Theme (Dark / Light)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-mono uppercase">
                  {theme}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toggle between the dark "Command Center Glass" UI palette and the crisp high-contrast light theme.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              icon={theme === "dark" ? Sun : Moon}
            >
              Switch to {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>

          {/* Font Scale Preference */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Font Scale / Display Typography
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust root font size for enhanced legibility across all data dashboards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFontScaleChange("normal")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  fontScale === "normal"
                    ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                Normal (100%)
              </button>
              <button
                type="button"
                onClick={() => handleFontScaleChange("large")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  fontScale === "large"
                    ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                Large (115%)
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Achievement Badges & Engagement Milestones Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle subtitle="Milestones unlocked through active scholarship search & dossier curation">
              Achievement Badges &amp; Streak
            </CardTitle>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              🔥 5-DAY ACTIVE STREAK
            </span>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl block">📁</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block font-heading">
                Dossier Ready
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">
                {stats.documentReadinessPercentage}% Verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl block">🚀</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block font-heading">
                Pipeline Pioneer
              </span>
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold block">
                {stats.activeApplicationsCount} Applications Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl block">🔖</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block font-heading">
                Smart Curator
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                {stats.savedCount} Grants Bookmarked
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl block">🎯</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block font-heading">
                Merit Match
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                {studentProfile.academicPercentage}% Academic Score
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Local Feedback Form with JSON Export */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Privately record product suggestions or feedback and export locally">
            Student Feedback &amp; Feature Wishlist
          </CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                        star <= feedbackRating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 font-bold ml-2">
                    {feedbackRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Feedback Category
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="Usability / Design">Usability / Design</option>
                  <option value="Scholarship Data Quality">Scholarship Data Quality</option>
                  <option value="Accessibility">Accessibility</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Your Thoughts / Comments
              </label>
              <textarea
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                placeholder="Share your thoughts on what could make GRANTLY more helpful for your scholarship journey..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="teal" size="sm" icon={Download}>
                Save Feedback &amp; Download JSON
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Local Storage & Data Backup Studio */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Export or import your full application state locally without external servers">
            Data Portability &amp; Backup Studio
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
            <div className="text-xs text-violet-900 dark:text-violet-200 space-y-1">
              <p className="font-bold">100% Client-Side Privacy Guarantee</p>
              <p className="text-violet-700 dark:text-violet-300">
                GRANTLY stores all profile attributes, bookmarked scholarships, application pipelines, and verified document dossiers exclusively in your browser’s LocalStorage. No student information is ever broadcast to third-party databases.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Export Action Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Download className="w-4 h-4 text-violet-500" />
                  <span>Export JSON Backup</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Downloads a complete copy of your profile, applications, documents, notes, and milestones as a portable <code className="font-mono text-violet-600 dark:text-violet-400">.json</code> file.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={exportBackup}
                className="w-full justify-center"
              >
                Download grantly_backup.json
              </Button>
            </div>

            {/* Import Action Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Upload className="w-4 h-4 text-teal-500" />
                  <span>Restore from Backup</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Restores previously exported GRANTLY data back into your browser session with automated structure verification.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json,application/json"
                  className="hidden"
                  id="backup-file-upload"
                />
                <Button
                  variant="teal"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full justify-center"
                >
                  Select Backup .json File
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      </>
      )}

      {/* Confirmation Modal for Reset */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset to Factory Demonstration State?"
        subtitle="This will restore all student profile fields, demo applications, documents, and bookmarks to initial defaults."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-800 dark:text-rose-300">
              Any custom applications, notes, or uploaded simulated documents created during this session will be replaced by the default Aarav Sharma demonstration profile.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Backup Import */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Restore GRANTLY Backup"
        subtitle={`Selected file: ${importFileName}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-start gap-3">
            <FileJson className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800 dark:text-teal-300">
              Restoring this backup will replace current LocalStorage tables with the profile, bookmarks, application stages, and documents from the file.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={handleConfirmImport}
            >
              Apply Backup &amp; Refresh
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
