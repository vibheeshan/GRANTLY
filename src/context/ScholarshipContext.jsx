import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { DEMO_SCHOLARSHIPS } from "../data/scholarships.js";
import {
  getStudentProfile,
  saveStudentProfile,
  getSavedScholarshipIds,
  saveSavedScholarshipIds,
  getApplications,
  saveApplications,
  getDocumentChecklist,
  saveDocumentChecklist,
  getRecentActivities,
  saveRecentActivities,
  getReminders,
  saveReminders,
  getCompareScholarshipIds,
  saveCompareScholarshipIds,
  getNotifications,
  saveNotifications,
  resetAppToDemoDefaults,
  exportAllGrantlyData,
  importGrantlyData
} from "../utils/storage.js";
import { evaluateEligibility, rankScholarshipsForStudent } from "../utils/eligibility.js";
import { getDaysRemaining } from "../utils/formatters.js";
import {
  getEventLog,
  saveEventLog,
  recordSave,
  recordStatusChange,
  recordDocumentUpdate,
  recordSearch,
  recordFilter,
  recordRecommendationFeedback,
  recordPageVisit,
  resetEventLog
} from "../utils/eventLog.js";

const ScholarshipContext = createContext(null);

export function ScholarshipProvider({ children }) {
  // Core state from storage
  const [studentProfile, setStudentProfileState] = useState(() => getStudentProfile());
  const [savedIds, setSavedIdsState] = useState(() => getSavedScholarshipIds());
  const [compareIds, setCompareIdsState] = useState(() => getCompareScholarshipIds());
  const [applications, setApplicationsState] = useState(() => getApplications());
  const [documents, setDocumentsState] = useState(() => getDocumentChecklist());
  const [notifications, setNotificationsState] = useState(() => getNotifications());
  const [activities, setActivitiesState] = useState(() => getRecentActivities());
  const [reminders, setRemindersState] = useState(() => getReminders());
  const [eventLog, setEventLogState] = useState(() => getEventLog());

  // Interactive UI modal controls
  const [toastNotification, setToastNotification] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedDnaScholarship, setSelectedDnaScholarship] = useState(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [selectedJourneyApp, setSelectedJourneyApp] = useState(null);

  // Helper to trigger toast
  const showToast = useCallback((message, type = "success") => {
    setToastNotification({
      id: Date.now(),
      message,
      type
    });
  }, []);

  const closeToast = useCallback(() => {
    setToastNotification(null);
  }, []);

  // Helper to log activity
  const logActivity = useCallback((type, title, subtitle) => {
    const newAct = {
      id: `act-${Date.now()}`,
      type,
      title,
      subtitle,
      timestamp: new Date().toISOString()
    };
    setActivitiesState(prev => {
      const updated = [newAct, ...prev.slice(0, 24)];
      saveRecentActivities(updated);
      return updated;
    });
  }, []);

  // Notification methods
  const addNotification = useCallback((category, title, message, link = null) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      category,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      link
    };
    setNotificationsState(prev => {
      const updated = [newNotif, ...prev.slice(0, 19)];
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markNotificationAsRead = useCallback((notifId) => {
    setNotificationsState(prev => {
      const updated = prev.map(n => n.id === notifId ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotificationsState(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
    showToast("All notifications marked as read.", "info");
  }, [showToast]);

  const clearNotifications = useCallback(() => {
    setNotificationsState([]);
    saveNotifications([]);
    showToast("Notifications cleared.", "info");
  }, [showToast]);

  // Update Student Profile
  const updateProfile = useCallback((updatedFields) => {
    setStudentProfileState(prev => {
      const newProfile = { ...prev, ...updatedFields };
      saveStudentProfile(newProfile);
      return newProfile;
    });
    logActivity("profile_update", "Updated Student Profile", "Academic parameters & Match DNA refreshed.");
    addNotification("recommendation", "Match DNA Recalculated", "Your eligibility criteria were updated based on new academic records.", "/matcher");
    showToast("Profile updated successfully. Match DNA updated.", "success");
  }, [logActivity, addNotification, showToast]);

  // Toggle Save Scholarship
  const toggleSaveScholarship = useCallback((scholarshipId) => {
    setSavedIdsState(prev => {
      const isAlreadySaved = prev.includes(scholarshipId);
      const targetSch = DEMO_SCHOLARSHIPS.find(s => s.id === scholarshipId);
      let updated;
      if (isAlreadySaved) {
        updated = prev.filter(id => id !== scholarshipId);
        logActivity("unsaved", "Removed opportunity from bookmarks", targetSch ? targetSch.title : scholarshipId);
        showToast("Opportunity removed from saved list", "info");
      } else {
        updated = [...prev, scholarshipId];
        recordSave(scholarshipId, targetSch ? targetSch.title : scholarshipId, targetSch?.categories?.[0]);
        setEventLogState(getEventLog());
        logActivity("saved", "Saved opportunity", targetSch ? targetSch.title : scholarshipId);
        showToast("Opportunity bookmarked to saved list", "success");
      }
      saveSavedScholarshipIds(updated);
      return updated;
    });
  }, [logActivity, showToast]);

  const isSaved = useCallback((scholarshipId) => {
    return savedIds.includes(scholarshipId);
  }, [savedIds]);

  // Comparison Studio State & Actions (Max 3)
  const toggleCompareScholarship = useCallback((scholarshipId) => {
    setCompareIdsState(prev => {
      const targetSch = DEMO_SCHOLARSHIPS.find(s => s.id === scholarshipId);
      if (prev.includes(scholarshipId)) {
        const updated = prev.filter(id => id !== scholarshipId);
        saveCompareScholarshipIds(updated);
        showToast(`Removed from Comparison Studio`, "info");
        return updated;
      }
      if (prev.length >= 3) {
        showToast("Comparison Studio limit is 3 scholarships. Remove one to add another.", "warning");
        return prev;
      }
      const updated = [...prev, scholarshipId];
      saveCompareScholarshipIds(updated);
      showToast(`Added "${targetSch?.title?.slice(0, 24)}..." to Comparison Studio`, "success");
      return updated;
    });
  }, [showToast]);

  const clearCompare = useCallback(() => {
    setCompareIdsState([]);
    saveCompareScholarshipIds([]);
    showToast("Comparison Studio cleared.", "info");
  }, [showToast]);

  // Application CRUD with Milestones & Journey History
  const addApplication = useCallback((scholarship, customNotes = "") => {
    const existing = applications.find(a => a.scholarshipId === scholarship.id);
    if (existing) {
      showToast("Application already exists in your tracker.", "warning");
      return existing;
    }

    const evaluation = evaluateEligibility(studentProfile, scholarship, documents);

    const defaultMilestones = [
      { id: "m-1", label: "Application Initiated", completed: true, date: new Date().toISOString().split("T")[0] },
      { id: "m-2", label: "Dossier Documents Verified", completed: false, date: null },
      { id: "m-3", label: "College Endorsement Acquired", completed: false, date: null },
      { id: "m-4", label: "Formal Portal Submission", completed: false, date: null },
      { id: "m-5", label: "Committee Scrutiny & Interview", completed: false, date: null },
      { id: "m-6", label: "Final Award Disbursement", completed: false, date: null }
    ];

    const newApp = {
      id: `app-${Date.now()}`,
      scholarshipId: scholarship.id,
      scholarshipTitle: scholarship.title,
      provider: scholarship.provider,
      awardAmount: scholarship.awardAmount,
      currency: scholarship.currency || "₹",
      status: "Applying",
      appliedDate: null,
      deadline: scholarship.deadline,
      notes: customNotes || "Drafting application requirements.",
      matchScore: evaluation.matchScore,
      milestones: defaultMilestones,
      history: [
        {
          status: "Applying",
          date: new Date().toISOString().split("T")[0],
          note: "Application record initiated in GRANTLY tracker."
        }
      ]
    };

    setApplicationsState(prev => {
      const updated = [newApp, ...prev];
      saveApplications(updated);
      return updated;
    });

    logActivity("application_created", "Initiated new application", scholarship.title);
    addNotification("application", "Application Started", `Started tracking submission for ${scholarship.title}`, "/applications");
    showToast(`Added "${scholarship.title}" to Application Tracker.`, "success");
    return newApp;
  }, [applications, studentProfile, documents, logActivity, addNotification, showToast]);

  const updateApplicationStatus = useCallback((appId, newStatus, newNotes) => {
    setApplicationsState(prev => {
      const updated = prev.map(app => {
        if (app.id === appId) {
          const appliedDate = (newStatus === "Submitted" || newStatus === "Under Review" || newStatus === "Awarded") && !app.appliedDate
            ? new Date().toISOString().split("T")[0]
            : app.appliedDate;

          const newHistoryItem = {
            status: newStatus,
            date: new Date().toISOString().split("T")[0],
            note: newNotes || `Status updated to ${newStatus}`
          };

          return {
            ...app,
            status: newStatus,
            appliedDate,
            notes: newNotes !== undefined ? newNotes : app.notes,
            history: [newHistoryItem, ...(app.history || [])]
          };
        }
        return app;
      });
      saveApplications(updated);
      return updated;
    });

    const targetApp = applications.find(a => a.id === appId);
    recordStatusChange(appId, targetApp?.scholarshipId, targetApp?.status, newStatus, targetApp?.scholarshipTitle);
    setEventLogState(getEventLog());
    logActivity("status_change", `Status updated to ${newStatus}`, targetApp ? targetApp.scholarshipTitle : appId);
    addNotification("application", `Application Status: ${newStatus}`, `${targetApp?.scholarshipTitle || "Scholarship"} transitioned to ${newStatus}`, "/applications");
    showToast(`Status updated to "${newStatus}"`, "success");
  }, [applications, logActivity, addNotification, showToast]);

  const toggleApplicationMilestone = useCallback((appId, milestoneId) => {
    setApplicationsState(prev => {
      const updated = prev.map(app => {
        if (app.id === appId) {
          const updatedMilestones = (app.milestones || []).map(m => {
            if (m.id === milestoneId) {
              const nowCompleted = !m.completed;
              return {
                ...m,
                completed: nowCompleted,
                date: nowCompleted ? new Date().toISOString().split("T")[0] : null
              };
            }
            return m;
          });
          return { ...app, milestones: updatedMilestones };
        }
        return app;
      });
      saveApplications(updated);
      return updated;
    });
    showToast("Application milestone progress updated.", "success");
  }, [showToast]);

  const deleteApplication = useCallback((appId) => {
    const targetApp = applications.find(a => a.id === appId);
    setApplicationsState(prev => {
      const updated = prev.filter(a => a.id !== appId);
      saveApplications(updated);
      return updated;
    });
    logActivity("application_removed", "Deleted application from tracker", targetApp ? targetApp.scholarshipTitle : appId);
    showToast("Application removed from tracker.", "info");
  }, [applications, logActivity, showToast]);

  const cloneApplication = useCallback((appId) => {
    const sourceApp = applications.find(a => a.id === appId);
    if (!sourceApp) return;
    const cloned = {
      ...sourceApp,
      id: `app-clone-${Date.now()}`,
      scholarshipTitle: `${sourceApp.scholarshipTitle} (Duplicate / Next Cycle)`,
      status: "Saved",
      appliedDate: null,
      history: [
        {
          status: "Saved",
          date: new Date().toISOString().split("T")[0],
          note: `Cloned from existing submission (${sourceApp.scholarshipTitle}).`
        }
      ]
    };
    setApplicationsState(prev => {
      const updated = [cloned, ...prev];
      saveApplications(updated);
      return updated;
    });
    logActivity("application_created", "Cloned application", cloned.scholarshipTitle);
    showToast(`Cloned application: "${cloned.scholarshipTitle.slice(0, 24)}..."`, "success");
  }, [applications, logActivity, showToast]);

  const toggleArchiveApplication = useCallback((appId) => {
    let nowArchived = false;
    setApplicationsState(prev => {
      const updated = prev.map(a => {
        if (a.id === appId) {
          nowArchived = !a.archived;
          return { ...a, archived: nowArchived };
        }
        return a;
      });
      saveApplications(updated);
      return updated;
    });
    showToast(nowArchived ? "Application archived." : "Application unarchived.", "info");
  }, [showToast]);

  const bulkUpdateApplicationStatus = useCallback((appIds, newStatus) => {
    if (!appIds || appIds.length === 0) return;
    setApplicationsState(prev => {
      const updated = prev.map(a => {
        if (appIds.includes(a.id)) {
          return {
            ...a,
            status: newStatus,
            history: [
              {
                status: newStatus,
                date: new Date().toISOString().split("T")[0],
                note: `Bulk updated to ${newStatus}`
              },
              ...(a.history || [])
            ]
          };
        }
        return a;
      });
      saveApplications(updated);
      return updated;
    });
    showToast(`Updated ${appIds.length} application(s) to "${newStatus}".`, "success");
  }, [showToast]);

  const bulkDeleteApplications = useCallback((appIds) => {
    if (!appIds || appIds.length === 0) return;
    setApplicationsState(prev => {
      const updated = prev.filter(a => !appIds.includes(a.id));
      saveApplications(updated);
      return updated;
    });
    showToast(`Deleted ${appIds.length} application(s) from tracker.`, "info");
  }, [showToast]);

  // Document Checklist Methods
  const toggleDocumentReady = useCallback((docId) => {
    setDocumentsState(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          const isReady = !doc.isReady;
          return {
            ...doc,
            isReady,
            lastUpdated: isReady ? new Date().toISOString().split("T")[0] : null
          };
        }
        return doc;
      });
      saveDocumentChecklist(updated);
      return updated;
    });
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      recordDocumentUpdate(docId, doc.name, !doc.isReady, doc.category);
      setEventLogState(getEventLog());
      logActivity(
        "document_checked",
        `Document ${!doc.isReady ? "marked ready" : "marked incomplete"}`,
        doc.name
      );
      showToast(`${doc.name} marked as ${!doc.isReady ? "Ready" : "Pending"}.`, "success");
    }
  }, [documents, logActivity, showToast]);

  const updateDocument = useCallback((docId, updates) => {
    setDocumentsState(prev => {
      const updated = prev.map(d => (d.id === docId ? { ...d, ...updates } : d));
      saveDocumentChecklist(updated);
      return updated;
    });
    showToast("Document details updated.", "success");
  }, [showToast]);

  const uploadSimulatedDocument = useCallback((docId, fileName, fileSize = "1.1 MB", authority = "Certified Authority") => {
    setDocumentsState(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            isReady: true,
            fileDetails: `${fileName} (${fileSize})`,
            lastUpdated: new Date().toISOString().split("T")[0],
            issuingAuthority: authority
          };
        }
        return doc;
      });
      saveDocumentChecklist(updated);
      return updated;
    });
    const doc = documents.find(d => d.id === docId);
    logActivity("document_uploaded", "Uploaded verified document", doc ? doc.name : fileName);
    showToast(`Uploaded and verified "${fileName}" successfully.`, "success");
  }, [documents, logActivity, showToast]);

  const addCustomDocument = useCallback((name, category, description, expiryDate = null) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name,
      category: category || "General",
      description: description || "User custom required document",
      isReady: false,
      fileDetails: null,
      lastUpdated: null,
      expiryDate: expiryDate || "2027-12-31",
      issuingAuthority: "Self / Regional Bureau"
    };
    setDocumentsState(prev => {
      const updated = [...prev, newDoc];
      saveDocumentChecklist(updated);
      return updated;
    });
    showToast(`Added "${name}" to Document Manager`, "success");
  }, [showToast]);

  // Reminders / Calendar Methods
  const addReminder = useCallback((title, date, scholarshipId = null) => {
    const newRem = {
      id: `rem-${Date.now()}`,
      title,
      date,
      scholarshipId,
      completed: false
    };
    setRemindersState(prev => {
      const updated = [newRem, ...prev];
      saveReminders(updated);
      return updated;
    });
    addNotification("deadline", "Deadline Reminder Scheduled", title, "/calendar");
    showToast("Deadline task scheduled.", "success");
  }, [addNotification, showToast]);

  const toggleReminder = useCallback((reminderId) => {
    setRemindersState(prev => {
      const updated = prev.map(r => r.id === reminderId ? { ...r, completed: !r.completed } : r);
      saveReminders(updated);
      return updated;
    });
  }, []);

  const deleteReminder = useCallback((reminderId) => {
    setRemindersState(prev => {
      const updated = prev.filter(r => r.id !== reminderId);
      saveReminders(updated);
      return updated;
    });
    showToast("Reminder deleted.", "info");
  }, [showToast]);

  // Match DNA Modal Opener
  const openMatchDna = useCallback((scholarship) => {
    setSelectedDnaScholarship(scholarship);
  }, []);

  const closeMatchDna = useCallback(() => {
    setSelectedDnaScholarship(null);
  }, []);

  // Application Journey Modal Opener
  const openApplicationJourney = useCallback((app) => {
    setSelectedJourneyApp(app);
    setIsJourneyModalOpen(true);
  }, []);

  const closeApplicationJourney = useCallback(() => {
    setIsJourneyModalOpen(false);
    setSelectedJourneyApp(null);
  }, []);

  // Reset to Demo Defaults
  const resetAllData = useCallback(() => {
    resetAppToDemoDefaults();
    resetEventLog();
    setEventLogState(getEventLog());
    setStudentProfileState(getStudentProfile());
    setSavedIdsState(getSavedScholarshipIds());
    setCompareIdsState(getCompareScholarshipIds());
    setApplicationsState(getApplications());
    setDocumentsState(getDocumentChecklist());
    setNotificationsState(getNotifications());
    setActivitiesState(getRecentActivities());
    setRemindersState(getReminders());
    showToast("All data reset to initial demonstration state.", "info");
  }, [showToast]);

  // Export Local Data Backup
  const exportBackup = useCallback(() => {
    try {
      const json = exportAllGrantlyData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `grantly_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      logActivity("backup_exported", "Exported Local JSON Backup", `grantly_backup_${dateStr}.json saved.`);
      showToast("GRANTLY backup exported successfully.", "success");
      return true;
    } catch (err) {
      showToast("Failed to export backup file.", "warning");
      return false;
    }
  }, [logActivity, showToast]);

  // Import Local Data Backup
  const importBackup = useCallback((jsonString) => {
    const res = importGrantlyData(jsonString);
    if (!res.success) {
      showToast(res.error || "Failed to restore backup.", "warning");
      return false;
    }
    setStudentProfileState(getStudentProfile());
    setSavedIdsState(getSavedScholarshipIds());
    setCompareIdsState(getCompareScholarshipIds());
    setApplicationsState(getApplications());
    setDocumentsState(getDocumentChecklist());
    setNotificationsState(getNotifications());
    setActivitiesState(getRecentActivities());
    setRemindersState(getReminders());
    logActivity("backup_imported", "Restored JSON Backup", "All database tables synchronized from file.");
    showToast("GRANTLY backup imported successfully! All records refreshed.", "success");
    return true;
  }, [logActivity, showToast]);


  // Evaluated Scholarships list with live document cross-referencing
  const evaluatedScholarships = useMemo(() => {
    return rankScholarshipsForStudent(studentProfile, DEMO_SCHOLARSHIPS, documents);
  }, [studentProfile, documents]);

  // Saved scholarship objects
  const savedScholarships = useMemo(() => {
    return evaluatedScholarships.filter(s => savedIds.includes(s.id));
  }, [evaluatedScholarships, savedIds]);

  // Compared scholarship objects
  const compareScholarships = useMemo(() => {
    return evaluatedScholarships.filter(s => compareIds.includes(s.id));
  }, [evaluatedScholarships, compareIds]);

  // Eligible scholarship objects
  const eligibleScholarships = useMemo(() => {
    return evaluatedScholarships.filter(s => s.isFullyEligible);
  }, [evaluatedScholarships]);

  // Unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Stats computed for Dashboard & Insights
  const stats = useMemo(() => {
    const activeApplications = applications.filter(a => a.status !== "Rejected");
    const upcomingDeadlines = DEMO_SCHOLARSHIPS.filter(s => {
      const days = getDaysRemaining(s.deadline);
      return days !== null && days >= 0 && days <= 30;
    });
    const readyDocsCount = documents.filter(d => d.isReady).length;
    const readinessPct = documents.length > 0 ? Math.round((readyDocsCount / documents.length) * 100) : 0;

    const totalPotentialFunding = applications
      .filter(a => a.status !== "Rejected")
      .reduce((sum, a) => sum + (Number(a.awardAmount) || 0), 0);

    const securedAwardedFunding = applications
      .filter(a => a.status === "Awarded")
      .reduce((sum, a) => sum + (Number(a.awardAmount) || 0), 0);

    return {
      eligibleCount: eligibleScholarships.length,
      savedCount: savedIds.length,
      compareCount: compareIds.length,
      activeApplicationsCount: activeApplications.length,
      submittedCount: applications.filter(a => a.status === "Submitted" || a.status === "Under Review" || a.status === "Awarded").length,
      awardedCount: applications.filter(a => a.status === "Awarded").length,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      documentReadinessPercentage: readinessPct,
      readyDocsCount,
      totalDocsCount: documents.length,
      unreadNotificationsCount,
      totalPotentialFunding,
      securedAwardedFunding
    };
  }, [eligibleScholarships, savedIds, compareIds, applications, documents, unreadNotificationsCount]);

  const value = {
    studentProfile,
    updateProfile,
    allScholarships: evaluatedScholarships,
    savedIds,
    savedScholarships,
    toggleSaveScholarship,
    isSaved,
    compareIds,
    compareScholarships,
    toggleCompareScholarship,
    clearCompare,
    applications,
    addApplication,
    updateApplicationStatus,
    toggleApplicationMilestone,
    deleteApplication,
    cloneApplication,
    toggleArchiveApplication,
    bulkUpdateApplicationStatus,
    bulkDeleteApplications,
    documents,
    toggleDocumentReady,
    updateDocument,
    uploadSimulatedDocument,
    addCustomDocument,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    activities,
    eventLog,
    recordRecommendationFeedback: useCallback((schId, feedback, meta) => {
      recordRecommendationFeedback(schId, feedback, meta);
      setEventLogState(getEventLog());
    }, []),
    recordPageVisit: useCallback((path, section, dur) => {
      recordPageVisit(path, section, dur);
      setEventLogState(getEventLog());
    }, []),
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    stats,
    toastNotification,
    showToast,
    closeToast,
    // Modals
    isOnboardingOpen,
    setIsOnboardingOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    selectedDnaScholarship,
    openMatchDna,
    closeMatchDna,
    isJourneyModalOpen,
    selectedJourneyApp,
    openApplicationJourney,
    closeApplicationJourney,
    resetAllData,
    exportBackup,
    importBackup
  };

  return (
    <ScholarshipContext.Provider value={value}>
      {children}
    </ScholarshipContext.Provider>
  );
}

export function useScholarships() {
  const context = useContext(ScholarshipContext);
  if (!context) {
    throw new Error("useScholarships must be used within a ScholarshipProvider");
  }
  return context;
}
