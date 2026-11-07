/**
 * LocalStorage Persistence Layer for GRANTLY 2.0
 * Provides safe JSON serialization, error boundaries, and default fallback mechanisms.
 */

import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_DOCUMENT_CHECKLIST,
  INITIAL_APPLICATIONS,
  INITIAL_SAVED_IDS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS
} from "../data/demoStudent.js";

const KEYS = {
  PROFILE: "grantly_student_profile_v2",
  SAVED_SCHOLARSHIPS: "grantly_saved_scholarship_ids_v2",
  APPLICATIONS: "grantly_applications_v2",
  DOCUMENTS: "grantly_documents_checklist_v2",
  ACTIVITIES: "grantly_recent_activities_v2",
  THEME: "grantly_theme_mode_v2",
  REMINDERS: "grantly_calendar_reminders_v2",
  COMPARE: "grantly_compare_scholarship_ids_v2",
  NOTIFICATIONS: "grantly_notifications_v2",
  REDUCED_MOTION: "grantly_reduced_motion_v2"
};

/**
 * Safe local storage reader
 */
export function getFromStorage(key, fallbackValue) {
  if (typeof window === "undefined") return fallbackValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallbackValue;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return fallbackValue;
  }
}

/**
 * Safe local storage writer
 */
export function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key "${key}" to localStorage:`, error);
  }
}

// Student Profile API
export function getStudentProfile() {
  return getFromStorage(KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
}

export function saveStudentProfile(profile) {
  saveToStorage(KEYS.PROFILE, profile);
  return profile;
}

// Saved Scholarships API
export function getSavedScholarshipIds() {
  return getFromStorage(KEYS.SAVED_SCHOLARSHIPS, INITIAL_SAVED_IDS);
}

export function saveSavedScholarshipIds(ids) {
  saveToStorage(KEYS.SAVED_SCHOLARSHIPS, ids);
  return ids;
}

// Compare Scholarships API (Max 3)
export function getCompareScholarshipIds() {
  return getFromStorage(KEYS.COMPARE, ["sch-001", "sch-003", "sch-009"]);
}

export function saveCompareScholarshipIds(ids) {
  saveToStorage(KEYS.COMPARE, ids);
  return ids;
}

// Applications API
export function getApplications() {
  return getFromStorage(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
}

export function saveApplications(applications) {
  saveToStorage(KEYS.APPLICATIONS, applications);
  return applications;
}

// Document Checklist API
export function getDocumentChecklist() {
  return getFromStorage(KEYS.DOCUMENTS, INITIAL_DOCUMENT_CHECKLIST);
}

export function saveDocumentChecklist(docs) {
  saveToStorage(KEYS.DOCUMENTS, docs);
  return docs;
}

// Notifications API
export function getNotifications() {
  return getFromStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

export function saveNotifications(notifications) {
  saveToStorage(KEYS.NOTIFICATIONS, notifications);
  return notifications;
}

// Recent Activities API
export function getRecentActivities() {
  return getFromStorage(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
}

export function saveRecentActivities(activities) {
  saveToStorage(KEYS.ACTIVITIES, activities);
  return activities;
}

// Reminders API
export function getReminders() {
  return getFromStorage(KEYS.REMINDERS, [
    {
      id: "rem-1",
      title: "Apex Fellowship Shortlist Verification",
      date: "2026-11-20",
      scholarshipId: "sch-001",
      completed: false
    },
    {
      id: "rem-2",
      title: "Collect Tahsildar Counter-signed Income Slip",
      date: "2026-11-24",
      scholarshipId: "sch-003",
      completed: true
    },
    {
      id: "rem-3",
      title: "Renew College Bonafide Student Certificate",
      date: "2026-12-01",
      scholarshipId: null,
      completed: false
    }
  ]);
}

export function saveReminders(reminders) {
  saveToStorage(KEYS.REMINDERS, reminders);
  return reminders;
}

// Theme API
export function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(KEYS.THEME) || "light";
}

export function saveStoredTheme(theme) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch (e) {
    console.error("Failed to store theme", e);
  }
}

// Reset data to defaults
export function resetAppToDemoDefaults() {
  saveToStorage(KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
  saveToStorage(KEYS.SAVED_SCHOLARSHIPS, INITIAL_SAVED_IDS);
  saveToStorage(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  saveToStorage(KEYS.DOCUMENTS, INITIAL_DOCUMENT_CHECKLIST);
  saveToStorage(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  saveToStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  saveToStorage(KEYS.COMPARE, ["sch-001", "sch-003", "sch-009"]);
}

// Reduced Motion API
export function getStoredReducedMotion() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(KEYS.REDUCED_MOTION);
  if (stored !== null) {
    return stored === "true";
  }
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function saveStoredReducedMotion(val) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.REDUCED_MOTION, String(Boolean(val)));
  } catch (e) {
    console.error("Failed to store reduced motion", e);
  }
}

// Full Backup Export API
export function exportAllGrantlyData() {
  const payload = {
    app: "GRANTLY",
    version: "3.0",
    exportedAt: new Date().toISOString(),
    data: {
      profile: getStudentProfile(),
      savedScholarshipIds: getSavedScholarshipIds(),
      compareScholarshipIds: getCompareScholarshipIds(),
      applications: getApplications(),
      documents: getDocumentChecklist(),
      reminders: getReminders(),
      recentActivities: getRecentActivities(),
      notifications: getNotifications(),
      theme: getStoredTheme(),
      reducedMotion: getStoredReducedMotion()
    }
  };
  return JSON.stringify(payload, null, 2);
}

// Full Backup Import API
export function importGrantlyData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const data = parsed.data || parsed;

    if (!data || (!data.profile && !data.applications && !data.documents)) {
      return { success: false, error: "Invalid GRANTLY backup: required student profile or application records missing." };
    }

    if (data.profile) saveStudentProfile(data.profile);
    if (Array.isArray(data.savedScholarshipIds)) saveSavedScholarshipIds(data.savedScholarshipIds);
    if (Array.isArray(data.compareScholarshipIds)) saveCompareScholarshipIds(data.compareScholarshipIds);
    if (Array.isArray(data.applications)) saveApplications(data.applications);
    if (Array.isArray(data.documents)) saveDocumentChecklist(data.documents);
    if (Array.isArray(data.reminders)) saveReminders(data.reminders);
    if (Array.isArray(data.recentActivities)) saveRecentActivities(data.recentActivities);
    if (Array.isArray(data.notifications)) saveNotifications(data.notifications);
    if (data.theme) saveStoredTheme(data.theme);
    if (typeof data.reducedMotion === "boolean") saveStoredReducedMotion(data.reducedMotion);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Failed to parse JSON backup file." };
  }
}

