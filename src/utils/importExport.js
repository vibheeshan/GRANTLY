/**
 * JSON Data Portability, Schema Validation, and Import/Export Utilities
 * - Exports backup with explicit schemaVersion ("2.1.0").
 * - Validates backup files before applying changes.
 * - Provides conflict resolution: Merge (deduplicating by ID) or Replace (full state overwrite).
 * - Validates custom scholarships JSON format provided by user.
 */

export const CURRENT_SCHEMA_VERSION = "2.1.0";
export const SUPPORTED_SCHEMA_VERSIONS = ["1.0", "2.0", "2.1.0", "3.0"];

/**
 * Creates standardized backup payload with metadata and schema version
 */
export function createBackupPayload(state = {}) {
  return {
    app: "GRANTLY",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      profile: state.profile || null,
      savedScholarshipIds: Array.isArray(state.savedScholarshipIds) ? state.savedScholarshipIds : [],
      compareScholarshipIds: Array.isArray(state.compareScholarshipIds) ? state.compareScholarshipIds : [],
      applications: Array.isArray(state.applications) ? state.applications : [],
      documents: Array.isArray(state.documents) ? state.documents : [],
      reminders: Array.isArray(state.reminders) ? state.reminders : [],
      recentActivities: Array.isArray(state.recentActivities) ? state.recentActivities : [],
      notifications: Array.isArray(state.notifications) ? state.notifications : [],
      eventLog: Array.isArray(state.eventLog) ? state.eventLog : [],
      calendarSync: {
        lastExportAt: state.lastExportAt || null
      }
    }
  };
}

/**
 * Validates a parsed JSON backup object.
 * Returns { valid: boolean, errors: string[], warnings: string[], preview: object }
 */
export function validateBackupFile(parsed) {
  const errors = [];
  const warnings = [];

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      valid: false,
      errors: ["File content is not a valid JSON object."],
      warnings: [],
      preview: null
    };
  }

  // Schema version validation
  const version = parsed.schemaVersion || parsed.version;
  if (!version) {
    errors.push("Missing schemaVersion field in backup file.");
  } else if (!SUPPORTED_SCHEMA_VERSIONS.some(v => String(version).startsWith(v.split(".")[0]))) {
    warnings.push(`File schema version (${version}) differs from current version (${CURRENT_SCHEMA_VERSION}). Compatibility conversion applied.`);
  }

  const payload = parsed.data || parsed;

  if (!payload.profile && !payload.applications && !payload.documents && !payload.savedScholarshipIds) {
    errors.push("No recognisable student profile, application, or document records found in payload.");
  }

  // Profile sanity check
  if (payload.profile) {
    if (typeof payload.profile !== "object") {
      errors.push("Invalid 'profile' structure (expected an object).");
    } else if (!payload.profile.name) {
      warnings.push("Student profile name is missing; default placeholder will be assigned.");
    }
  }

  // Check applications array and duplicate IDs
  let appCount = 0;
  if (payload.applications) {
    if (!Array.isArray(payload.applications)) {
      errors.push("Invalid 'applications' structure (expected an array).");
    } else {
      appCount = payload.applications.length;
      const seenIds = new Set();
      payload.applications.forEach((app, idx) => {
        if (!app.id) {
          warnings.push(`Application at row ${idx + 1} has no ID; one will be auto-generated.`);
        } else if (seenIds.has(app.id)) {
          warnings.push(`Duplicate application ID detected: "${app.id}". Merge will deduplicate.`);
        } else {
          seenIds.add(app.id);
        }
      });
    }
  }

  const preview = {
    schemaVersion: version || "Unknown",
    exportedAt: parsed.exportedAt || "Unknown date",
    studentName: payload.profile?.name || "Unspecified",
    applicationsCount: appCount,
    savedBookmarksCount: Array.isArray(payload.savedScholarshipIds) ? payload.savedScholarshipIds.length : 0,
    documentsCount: Array.isArray(payload.documents) ? payload.documents.length : 0,
    remindersCount: Array.isArray(payload.reminders) ? payload.reminders.length : 0
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    preview,
    data: payload
  };
}

/**
 * Resolves conflict between current and incoming data:
 * - strategy = 'replace': fully overwrites target records
 * - strategy = 'merge': preserves existing records and appends/updates unique records by ID
 */
export function resolveImportMerge(currentData = {}, incomingData = {}, strategy = "merge") {
  if (strategy === "replace") {
    return {
      profile: incomingData.profile || currentData.profile,
      savedScholarshipIds: incomingData.savedScholarshipIds || [],
      compareScholarshipIds: incomingData.compareScholarshipIds || [],
      applications: incomingData.applications || [],
      documents: incomingData.documents || [],
      reminders: incomingData.reminders || [],
      recentActivities: incomingData.recentActivities || [],
      notifications: incomingData.notifications || []
    };
  }

  // Strategy === 'merge':
  // 1. Profile: take incoming fields if present
  const mergedProfile = { ...(currentData.profile || {}), ...(incomingData.profile || {}) };

  // 2. Saved IDs: set union
  const savedSet = new Set([...(currentData.savedScholarshipIds || []), ...(incomingData.savedScholarshipIds || [])]);

  // 3. Compare IDs: set union (cap at 3)
  const compareSet = new Set([...(currentData.compareScholarshipIds || []), ...(incomingData.compareScholarshipIds || [])]);

  // 4. Applications: merge by ID (incoming overrides existing match, new ones added)
  const appMap = new Map();
  (currentData.applications || []).forEach(a => appMap.set(a.id, a));
  (incomingData.applications || []).forEach(a => {
    const id = a.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    appMap.set(id, { ...appMap.get(id), ...a, id });
  });

  // 5. Documents: merge by ID
  const docMap = new Map();
  (currentData.documents || []).forEach(d => docMap.set(d.id, d));
  (incomingData.documents || []).forEach(d => {
    const id = d.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    docMap.set(id, { ...docMap.get(id), ...d, id });
  });

  // 6. Reminders: merge by ID
  const remMap = new Map();
  (currentData.reminders || []).forEach(r => remMap.set(r.id, r));
  (incomingData.reminders || []).forEach(r => {
    const id = r.id || `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    remMap.set(id, { ...remMap.get(id), ...r, id });
  });

  return {
    profile: mergedProfile,
    savedScholarshipIds: Array.from(savedSet),
    compareScholarshipIds: Array.from(compareSet).slice(0, 3),
    applications: Array.from(appMap.values()),
    documents: Array.from(docMap.values()),
    reminders: Array.from(remMap.values()),
    recentActivities: incomingData.recentActivities || currentData.recentActivities || [],
    notifications: incomingData.notifications || currentData.notifications || []
  };
}

/**
 * Validates a custom scholarship list JSON provided by a user
 */
export function validateCustomScholarships(rawList) {
  if (!Array.isArray(rawList)) {
    return {
      valid: false,
      errors: [{ row: 0, field: "root", message: "Expected a JSON array of scholarship objects." }],
      data: []
    };
  }

  const errors = [];
  const seenIds = new Set();
  const validRecords = [];

  rawList.forEach((item, idx) => {
    const rowNum = idx + 1;
    if (!item || typeof item !== "object") {
      errors.push({ row: rowNum, field: "item", message: "Invalid record item." });
      return;
    }

    const id = item.id ? String(item.id).trim() : "";
    const title = item.title || item.name;
    const provider = item.provider;
    const amount = Number(item.awardAmount || item.amount);
    const deadline = item.deadline;

    if (!id) {
      errors.push({ row: rowNum, field: "id", message: "Missing required 'id' field." });
    } else if (seenIds.has(id)) {
      errors.push({ row: rowNum, field: "id", message: `Duplicate ID detected: '${id}'.` });
    } else {
      seenIds.add(id);
    }

    if (!title) {
      errors.push({ row: rowNum, field: "title", message: "Missing required 'title' or 'name' field." });
    }

    if (!provider) {
      errors.push({ row: rowNum, field: "provider", message: "Missing required 'provider' field." });
    }

    if (isNaN(amount) || amount < 0) {
      errors.push({ row: rowNum, field: "awardAmount", message: "Invalid 'awardAmount' (must be a positive number)." });
    }

    if (!deadline || isNaN(new Date(deadline).getTime())) {
      errors.push({ row: rowNum, field: "deadline", message: "Invalid 'deadline' (must be a valid date, e.g. YYYY-MM-DD)." });
    }

    if (errors.filter(e => e.row === rowNum).length === 0) {
      validRecords.push({
        id,
        title,
        provider,
        awardAmount: amount,
        currency: item.currency || "INR",
        deadline,
        description: item.description || "Custom imported scholarship opportunity.",
        categories: Array.isArray(item.categories) ? item.categories : ["General"],
        sourceType: item.sourceType === "verified" ? "verified" : "community",
        applicationUrl: item.applicationUrl || "https://grantly.app",
        criteria: item.criteria || {}
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: validRecords
  };
}
