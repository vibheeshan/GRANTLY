import React, { useState } from "react";
import {
  User,
  GraduationCap,
  MapPin,
  Wallet,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  X
} from "lucide-react";
import { Modal } from "../ui/Modal.jsx";
import { Input, Select, Textarea } from "../ui/Input.jsx";
import { Button } from "../ui/Button.jsx";
import {
  EDUCATION_LEVELS,
  STATES_LIST,
  COURSES_LIST,
  SCHOLARSHIP_CATEGORIES
} from "../../data/scholarships.js";
import { useScholarships } from "../../context/ScholarshipContext.jsx";
import { formatCurrency } from "../../utils/formatters.js";

export function OnboardingWizardModal({ isOpen, onClose }) {
  const { studentProfile, updateProfile, showToast } = useScholarships();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: studentProfile.name || "",
    email: studentProfile.email || "",
    phone: studentProfile.phone || "",
    educationLevel: studentProfile.educationLevel || "Undergraduate",
    course: studentProfile.course || "Engineering",
    institution: studentProfile.institution || "",
    specialization: studentProfile.specialization || "Computer Science",
    state: studentProfile.state || "Maharashtra",
    academicPercentage: studentProfile.academicPercentage !== undefined ? studentProfile.academicPercentage : 82.5,
    familyIncome: studentProfile.familyIncome !== undefined ? studentProfile.familyIncome : 450000,
    category: studentProfile.category || "STEM",
    targetFundingGoal: studentProfile.targetFundingGoal || 300000,
    bio: studentProfile.bio || ""
  });

  if (!isOpen) return null;

  const totalSteps = 4;
  const progressPct = Math.round((step / totalSteps) * 100);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const handleSaveAndResume = () => {
    updateProfile({
      ...formData,
      academicPercentage: Number(formData.academicPercentage),
      familyIncome: Number(formData.familyIncome),
      targetFundingGoal: Number(formData.targetFundingGoal)
    });
    onClose();
    showToast("Progress saved! You can resume the wizard anytime.", "info");
  };

  const handleComplete = () => {
    updateProfile({
      ...formData,
      academicPercentage: Number(formData.academicPercentage),
      familyIncome: Number(formData.familyIncome),
      targetFundingGoal: Number(formData.targetFundingGoal),
      completedProfile: true
    });
    onClose();
    showToast("Profile Onboarding Complete! Personalized Match DNA updated.", "success");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profile Onboarding Wizard"
      subtitle={`Step ${step} of ${totalSteps} • Smart Parameter Calibration`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Progress Bar & Stepper Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">
              Profile Completeness
            </span>
            <span className="font-extrabold text-teal-600 dark:text-teal-400">
              {progressPct}% Completed
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] text-center font-bold">
            <span className={step >= 1 ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}>
              1. Identity
            </span>
            <span className={step >= 2 ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}>
              2. Academics
            </span>
            <span className={step >= 3 ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}>
              3. Financials
            </span>
            <span className={step >= 4 ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}>
              4. Target Goals
            </span>
          </div>
        </div>

        {/* Step 1: Personal & Identity */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-900 dark:text-violet-200">
              Enter your basic student demographic identity. This helps verify eligibility for gender and first-generation scholarships.
            </div>

            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. Aarav Sharma"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Student Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="aarav.sharma@demo.edu"
                required
              />
              <Input
                label="Mobile Contact"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <Textarea
              label="Brief Bio &amp; Aspirations"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="e.g. Pre-final year engineering student passionate about AI..."
              rows={2}
            />
          </div>
        )}

        {/* Step 2: Academic Standing */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200">
              Provide your current educational tier, enrolled discipline, and score. These directly power the deterministic merit matching engine.
            </div>

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
                  Enrolled Course / Discipline
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
              label="College / Institute Name"
              value={formData.institution}
              onChange={(e) => handleInputChange("institution", e.target.value)}
              placeholder="e.g. Apex Institute of Technology, Pune"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange("specialization", e.target.value)}
                placeholder="e.g. Computer Science"
              />
              <Input
                label="Qualifying / Cumulative Score (%)"
                type="number"
                step="0.1"
                min="40"
                max="100"
                value={formData.academicPercentage}
                onChange={(e) => handleInputChange("academicPercentage", e.target.value)}
                helperText="Minimum thresholds evaluate against this score"
                required
              />
            </div>
          </div>
        )}

        {/* Step 3: Demographics & Financials */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
              State domicile and annual family income certificates are required by need-based and state-specific quota programs.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                State Domicile / Permanent Residence
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
                label="Annual Family Income (₹)"
                type="number"
                step="10000"
                min="0"
                value={formData.familyIncome}
                onChange={(e) => handleInputChange("familyIncome", e.target.value)}
                helperText="Ceiling thresholds check this value"
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Primary Demographic Focus
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {SCHOLARSHIP_CATEGORIES.filter(c => c !== "All Categories").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Target Funding Goals */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200">
              Set your annual scholarship target goal. The Funding Opportunity Calculator will track your pipeline against this objective.
            </div>

            <Input
              label="Target Annual Scholarship Funding Goal (₹)"
              type="number"
              step="25000"
              min="20000"
              value={formData.targetFundingGoal}
              onChange={(e) => handleInputChange("targetFundingGoal", e.target.value)}
              helperText="e.g. ₹3,00,000 for college tuition, hostel & laptop"
              required
            />

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Ready to Launch Your Personalized Cockpit</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Completing this onboarding will immediately refresh all 14 scholarship match scores, personalize your dashboard recommendations, and configure your dossier checklist.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSaveAndResume}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            Save &amp; Resume Later
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                icon={ArrowLeft}
              >
                Back
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              icon={step === totalSteps ? Check : ArrowRight}
              iconPosition="right"
            >
              {step === totalSteps ? "Finish & Calibrate" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
