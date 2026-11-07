/**
 * Event Logger for GRANTLY 2.0
 * Records timestamped local events in LocalStorage for activity and time analytics (A33–A40).
 * Strictly local, private, and zero remote tracking.
 */

const EVENT_LOG_KEY = "grantly_event_log_v2";
const MAX_LOG_ENTRIES = 500;

/**
 * Default seed events to ensure realistic historical activity is available
 * immediately for analytics calculation when starting demo.
 */
function getInitialSeedEvents() {
  const now = new Date();
  const makeDate = (daysAgo, hours = 10, minutes = 0) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "ev-seed-1",
      type: "page_visit",
      path: "/dashboard",
      section: "Overview",
      timestamp: makeDate(0, 9, 15),
      metadata: { durationSec: 180 }
    },
    {
      id: "ev-seed-2",
      type: "status_change",
      appId: "app-101",
      scholarshipId: "sch-001",
      fromStatus: "Submitted",
      toStatus: "Under Review",
      timestamp: makeDate(2, 14, 30),
      metadata: { scholarshipTitle: "Apex NextGen STEM Excellence Fellowship" }
    },
    {
      id: "ev-seed-3",
      type: "document_update",
      docId: "doc-5",
      docName: "Active Bank Account Passbook / Statement",
      isReady: true,
      timestamp: makeDate(5, 10, 15),
      metadata: { category: "Financial" }
    },
    {
      id: "ev-seed-4",
      type: "save",
      scholarshipId: "sch-012",
      scholarshipTitle: "Green Earth Sustainable Energy Scholarship",
      category: "Sustainability",
      timestamp: makeDate(6, 9, 0),
      metadata: { matchScore: 92 }
    },
    {
      id: "ev-seed-5",
      type: "status_change",
      appId: "app-102",
      scholarshipId: "sch-003",
      fromStatus: "Applying",
      toStatus: "Submitted",
      timestamp: makeDate(3, 11, 45),
      metadata: { scholarshipTitle: "Maharashtra Medha Rural Talent Grant" }
    },
    {
      id: "ev-seed-6",
      type: "search",
      query: "engineering",
      resultCount: 8,
      timestamp: makeDate(4, 16, 20),
      metadata: {}
    },
    {
      id: "ev-seed-7",
      type: "filter",
      filterName: "category",
      filterValue: "STEM",
      timestamp: makeDate(4, 16, 25),
      metadata: {}
    },
    {
      id: "ev-seed-8",
      type: "page_visit",
      path: "/explorer",
      section: "Discovery",
      timestamp: makeDate(1, 15, 30),
      metadata: { durationSec: 240 }
    },
    {
      id: "ev-seed-9",
      type: "page_visit",
      path: "/match-dna",
      section: "Intelligence",
      timestamp: makeDate(2, 11, 10),
      metadata: { durationSec: 320 }
    },
    {
      id: "ev-seed-10",
      type: "recommendation_feedback",
      scholarshipId: "sch-001",
      feedback: "up",
      timestamp: makeDate(7, 13, 0),
      metadata: { matchScore: 95 }
    },
    {
      id: "ev-seed-11",
      type: "recommendation_feedback",
      scholarshipId: "sch-003",
      feedback: "up",
      timestamp: makeDate(5, 12, 10),
      metadata: { matchScore: 88 }
    },
    {
      id: "ev-seed-12",
      type: "recommendation_feedback",
      scholarshipId: "sch-008",
      feedback: "down",
      timestamp: makeDate(4, 17, 0),
      metadata: { matchScore: 65, reason: "Relocation required" }
    },
    {
      id: "ev-seed-13",
      type: "page_visit",
      path: "/documents",
      section: "Dossier",
      timestamp: makeDate(3, 10, 0),
      metadata: { durationSec: 190 }
    },
    {
      id: "ev-seed-14",
      type: "page_visit",
      path: "/applications",
      section: "Management",
      timestamp: makeDate(1, 18, 0),
      metadata: { durationSec: 260 }
    },
    {
      id: "ev-seed-15",
      type: "search",
      query: "merit",
      resultCount: 11,
      timestamp: makeDate(6, 14, 0),
      metadata: {}
    }
  ];
}

/**
 * Read event log safely from LocalStorage
 */
export function getEventLog() {
  if (typeof window === "undefined") return getInitialSeedEvents();
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    if (!raw) {
      const seeded = getInitialSeedEvents();
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse event log from localStorage:", e);
    return getInitialSeedEvents();
  }
}

/**
 * Write event log safely to LocalStorage
 */
export function saveEventLog(events) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = events.slice(0, MAX_LOG_ENTRIES);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to save event log to localStorage:", e);
  }
}

/**
 * Record a single generic event
 */
export function logEvent(type, details = {}) {
  const event = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    timestamp: details.timestamp || new Date().toISOString(),
    ...details
  };
  const current = getEventLog();
  const updated = [event, ...current];
  saveEventLog(updated);
  return event;
}

/**
 * Specific typed logger helpers
 */
export function recordPageVisit(path, section = "General", durationSec = 60) {
  return logEvent("page_visit", { path, section, metadata: { durationSec } });
}

export function recordSave(scholarshipId, scholarshipTitle, category = "General") {
  return logEvent("save", {
    scholarshipId,
    scholarshipTitle,
    category,
    metadata: { action: "save" }
  });
}

export function recordStatusChange(appId, scholarshipId, fromStatus, toStatus, scholarshipTitle = "") {
  return logEvent("status_change", {
    appId,
    scholarshipId,
    fromStatus,
    toStatus,
    metadata: { scholarshipTitle }
  });
}

export function recordDocumentUpdate(docId, docName, isReady, category = "General") {
  return logEvent("document_update", {
    docId,
    docName,
    isReady,
    metadata: { category }
  });
}

export function recordSearch(query, resultCount = 0) {
  if (!query || !query.trim()) return null;
  return logEvent("search", {
    query: query.trim().toLowerCase(),
    resultCount,
    metadata: {}
  });
}

export function recordFilter(filterName, filterValue) {
  return logEvent("filter", {
    filterName,
    filterValue,
    metadata: {}
  });
}

export function recordRecommendationFeedback(scholarshipId, feedback, metadata = {}) {
  return logEvent("recommendation_feedback", {
    scholarshipId,
    feedback, // 'up' | 'down'
    metadata
  });
}

/**
 * Reset all event logs back to initial demonstration state
 */
export function resetEventLog() {
  const seeded = getInitialSeedEvents();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(seeded));
    } catch {}
  }
  return seeded;
}
