import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  escapeIcsText,
  formatIcsDate,
  buildIcsEvent,
  buildAllDeadlinesIcs
} from "./ics.js";

import {
  sanitizeCsvCell,
  buildCsv,
  exportApplicationsToCsv,
  exportScholarshipsToCsv
} from "./csv.js";

import {
  formatGoogleCalendarDate,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getMailtoUrl,
  getWhatsAppShareUrl,
  getInstitutionMapUrl
} from "./links.js";

import {
  CURRENT_SCHEMA_VERSION,
  createBackupPayload,
  validateBackupFile,
  resolveImportMerge,
  validateCustomScholarships
} from "./importExport.js";

describe("ICS Generation (src/utils/ics.js)", () => {
  it("escapes special characters (commas, semicolons, backslashes, newlines)", () => {
    const raw = "Note: test; with, special \\ chars\nSecond line\r\nThird line";
    const escaped = escapeIcsText(raw);
    assert.ok(escaped.includes("\\,"));
    assert.ok(escaped.includes("\\;"));
    assert.ok(escaped.includes("\\\\"));
    assert.ok(escaped.includes("\\n"));
    assert.ok(!escaped.includes("\r"));
  });

  it("handles empty and null values gracefully", () => {
    assert.equal(escapeIcsText(null), "");
    assert.equal(escapeIcsText(undefined), "");
    assert.equal(escapeIcsText(""), "");
  });

  it("preserves Unicode characters including ₹ and Hindi text", () => {
    const textWithUnicode = "पुरस्कार: ₹50,000 छात्रवृत्ति";
    const escaped = escapeIcsText(textWithUnicode);
    assert.ok(escaped.includes("₹50\\,000"));
    assert.ok(escaped.includes("छात्रवृत्ति"));
  });

  it("builds valid VEVENT with VALARM at T-7 and T-1", () => {
    const event = buildIcsEvent({
      id: "test-sch-101",
      title: "Apex STEM Fellowship, Govt of India",
      provider: "Ministry of Science & Tech",
      deadline: "2026-11-28",
      awardAmount: 75000,
      currency: "INR"
    });

    assert.ok(event.includes("BEGIN:VEVENT"));
    assert.ok(event.includes("UID:grantly-test-sch-101@grantly.app"));
    assert.ok(event.includes("SUMMARY:Deadline: Apex STEM Fellowship\\, Govt of India"));
    assert.ok(event.includes("BEGIN:VALARM"));
    assert.ok(event.includes("TRIGGER:-P7D"));
    assert.ok(event.includes("TRIGGER:-P1D"));
    assert.ok(event.includes("END:VEVENT"));
  });

  it("builds full VCALENDAR document containing multiple scholarships", () => {
    const ics = buildAllDeadlinesIcs([
      { id: "sch-1", title: "National Merit", provider: "Govt", deadline: "2026-11-20", awardAmount: 50000 },
      { id: "sch-2", title: "Tech Grant", provider: "Foundation", deadline: "2026-12-15", awardAmount: 100000 }
    ]);

    assert.ok(ics.startsWith("BEGIN:VCALENDAR"));
    assert.ok(ics.includes("VERSION:2.0"));
    assert.ok(ics.includes("SUMMARY:Deadline: National Merit"));
    assert.ok(ics.includes("SUMMARY:Deadline: Tech Grant"));
    assert.ok(ics.endsWith("END:VCALENDAR"));
  });
});

describe("Safe CSV Generation & Formula Injection Mitigation (src/utils/csv.js)", () => {
  it("neutralizes formula injection characters (=, +, -, @)", () => {
    assert.equal(sanitizeCsvCell("=SUM(A1:A10)"), "'=SUM(A1:A10)");
    assert.equal(sanitizeCsvCell("+cmd|' /C calc'!A0"), "'+cmd|' /C calc'!A0");
    assert.equal(sanitizeCsvCell("-123+456"), "'-123+456");
    assert.equal(sanitizeCsvCell("@IMPORT(http://evil.com)"), "'@IMPORT(http://evil.com)");
  });

  it("quotes cells with commas, double quotes, and line breaks", () => {
    const cellWithComma = sanitizeCsvCell("New Delhi, India");
    assert.equal(cellWithComma, '"New Delhi, India"');

    const cellWithQuote = sanitizeCsvCell('Awarded "Best" Scholar');
    assert.equal(cellWithQuote, '"Awarded ""Best"" Scholar"');

    const cellWithNewline = sanitizeCsvCell("Line 1\nLine 2");
    assert.equal(cellWithNewline, '"Line 1\nLine 2"');
  });

  it("handles Hindi and Currency Unicode (₹) with UTF-8 BOM", () => {
    const columns = [{ key: "title", label: "छात्रवृत्ति" }, { key: "amount", label: "राशि" }];
    const rows = [{ title: "राष्ट्रीय मेरिट छात्रवृत्ति", amount: "₹50,000" }];
    const csv = buildCsv(columns, rows);

    // Checks UTF-8 BOM
    assert.equal(csv.charCodeAt(0), 0xFEFF);
    assert.ok(csv.includes("राष्ट्रीय मेरिट छात्रवृत्ति"));
    assert.ok(csv.includes('"₹50,000"'));
  });

  it("safely exports applications and scholarships lists", () => {
    const apps = [
      { id: "app-1", scholarshipTitle: "=Formula Injection Test", provider: "Test Org", awardAmount: 20000, status: "Submitted" }
    ];
    const csv = exportApplicationsToCsv(apps);
    assert.ok(csv.includes("Application ID,Scholarship Name"));
    assert.ok(csv.includes("'=Formula Injection Test"));
  });
});

describe("URL Builders (src/utils/links.js)", () => {
  it("builds valid Google Calendar URL with encoded parameters", () => {
    const url = getGoogleCalendarUrl({
      title: "Tata Merit Scholarship",
      deadline: "2026-11-28",
      details: "Apply online with marksheets",
      provider: "Tata Trusts"
    });

    assert.ok(url.startsWith("https://calendar.google.com/calendar/render?"));
    assert.ok(url.includes("action=TEMPLATE"));
    assert.ok(url.includes("Tata+Merit+Scholarship") || url.includes("Tata%20Merit%20Scholarship"));
  });

  it("builds valid Outlook Calendar URL", () => {
    const url = getOutlookCalendarUrl({
      title: "Reliance Foundation Grant",
      deadline: "2026-12-05",
      provider: "Reliance Foundation"
    });

    assert.ok(url.startsWith("https://outlook.live.com/calendar/0/deeplink/compose?"));
    assert.ok(url.includes("Reliance"));
  });

  it("builds valid mailto: link with prefilled subject and body", () => {
    const url = getMailtoUrl({
      to: "scholarships@provider.org",
      subject: "Question about eligibility & deadline",
      body: "Hello,\nI would like to ask about the family income ceiling."
    });

    assert.ok(url.startsWith("mailto:scholarships%40provider.org?"));
    assert.ok(url.includes("subject=Question%20about%20eligibility%20%26%20deadline"));
  });

  it("builds valid WhatsApp share URL", () => {
    const url = getWhatsAppShareUrl({ text: "Check out this ₹50,000 scholarship!" });
    assert.ok(url.startsWith("https://wa.me/?text="));
    assert.ok(url.includes("%E2%82%B950%2C000"));
  });

  it("builds Google Maps URL containing only institution name (zero student data)", () => {
    const url = getInstitutionMapUrl("IIT Bombay, Powai, Mumbai");
    assert.ok(url.includes("google.com/maps/search/?api=1&query="));
    assert.ok(url.includes("IIT%20Bombay"));
    // Ensure no student keywords or private parameters
    assert.ok(!url.includes("student"));
    assert.ok(!url.includes("gpa"));
  });
});

describe("Data Import & Export Validation (src/utils/importExport.js)", () => {
  it("validates a healthy backup file with schemaVersion", () => {
    const payload = createBackupPayload({
      profile: { name: "Aarav Sharma", course: "B.Tech" },
      applications: [{ id: "app-1", scholarshipTitle: "National Scholarship" }],
      savedScholarshipIds: ["sch-001", "sch-002"]
    });

    const res = validateBackupFile(payload);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.preview.studentName, "Aarav Sharma");
    assert.equal(res.preview.applicationsCount, 1);
    assert.equal(res.preview.savedBookmarksCount, 2);
  });

  it("rejects backup file missing schemaVersion", () => {
    const invalid = {
      app: "GRANTLY",
      data: { profile: { name: "Test" } }
    };
    const res = validateBackupFile(invalid);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Missing schemaVersion")));
  });

  it("detects and flags duplicate application IDs", () => {
    const duplicateData = {
      schemaVersion: "2.1.0",
      data: {
        profile: { name: "Test Student" },
        applications: [
          { id: "app-101", title: "First" },
          { id: "app-101", title: "Duplicate First" }
        ]
      }
    };
    const res = validateBackupFile(duplicateData);
    assert.ok(res.warnings.some(w => w.includes("Duplicate application ID")));
  });

  it("correctly resolves merge vs replace strategies", () => {
    const current = {
      profile: { name: "Current Name", state: "Delhi" },
      applications: [{ id: "app-1", status: "Applying", notes: "Old" }],
      savedScholarshipIds: ["sch-1"]
    };
    const incoming = {
      profile: { name: "Updated Name" },
      applications: [
        { id: "app-1", status: "Submitted", notes: "New" },
        { id: "app-2", status: "Applying", notes: "Fresh" }
      ],
      savedScholarshipIds: ["sch-2"]
    };

    // Merge: combines items, updates matching ID, unions saved IDs
    const merged = resolveImportMerge(current, incoming, "merge");
    assert.equal(merged.profile.name, "Updated Name");
    assert.equal(merged.profile.state, "Delhi");
    assert.equal(merged.applications.length, 2);
    assert.equal(merged.applications.find(a => a.id === "app-1").status, "Submitted");
    assert.ok(merged.savedScholarshipIds.includes("sch-1"));
    assert.ok(merged.savedScholarshipIds.includes("sch-2"));

    // Replace: completely overwrites
    const replaced = resolveImportMerge(current, incoming, "replace");
    assert.equal(replaced.savedScholarshipIds.length, 1);
    assert.equal(replaced.savedScholarshipIds[0], "sch-2");
  });

  it("validates custom scholarships JSON format and catches field errors", () => {
    const customList = [
      { id: "custom-1", title: "Valid Grant", provider: "Trust", awardAmount: 25000, deadline: "2026-12-01" },
      { id: "", title: "Missing ID", provider: "Trust", awardAmount: 10000, deadline: "2026-12-01" },
      { id: "custom-3", title: "", provider: "Trust", awardAmount: -50, deadline: "invalid-date" }
    ];

    const res = validateCustomScholarships(customList);
    assert.equal(res.valid, false);
    assert.equal(res.data.length, 1); // Only 1 valid record
    assert.ok(res.errors.some(e => e.field === "id"));
    assert.ok(res.errors.some(e => e.field === "title"));
    assert.ok(res.errors.some(e => e.field === "awardAmount"));
    assert.ok(res.errors.some(e => e.field === "deadline"));
  });
});
