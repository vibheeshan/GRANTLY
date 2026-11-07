/**
 * Share & Clipboard Utilities for GRANTLY
 * - Web Share API with automatic clipboard fallback.
 * - Formatted message templates (Provider inquiry, Professor document request, Review status check).
 * - Email-ready weekly digest generator.
 */

/**
 * Copies plain text to clipboard safely across modern and legacy browsers
 */
export async function copyToClipboard(text) {
  if (typeof window === "undefined") {
    return { success: false, method: "none", error: "No window context" };
  }

  // 1. Modern Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: "clipboard" };
    } catch (err) {
      console.warn("navigator.clipboard failed, attempting fallback:", err);
    }
  }

  // 2. Fallback using hidden textarea
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (successful) {
      return { success: true, method: "clipboard-legacy" };
    }
  } catch (err) {
    console.error("execCommand copy fallback failed:", err);
  }

  return { success: false, method: "none", error: "Clipboard write failed" };
}

/**
 * Shares via Web Share API when supported, falling back to clipboard copy
 */
export async function shareContent({ title, text, url }) {
  if (typeof window === "undefined") {
    return { success: false, method: "none" };
  }

  const shareUrl = url || window.location.href;
  const payload = {
    title: title || "GRANTLY Scholarship Opportunity",
    text: text || "Check out this scholarship opportunity on GRANTLY:",
    url: shareUrl
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return { success: true, method: "web-share" };
    } catch (err) {
      // User cancelled or share failed
      if (err.name === "AbortError") {
        return { success: false, method: "cancelled" };
      }
      console.warn("Web Share API threw error, switching to clipboard fallback:", err);
    }
  }

  // Fallback to clipboard
  const fallbackText = `${payload.title}\n${payload.text}\n${payload.url}`;
  const copyRes = await copyToClipboard(fallbackText);
  return {
    success: copyRes.success,
    method: "clipboard-fallback",
    fallbackText
  };
}

/**
 * Predefined Student Communication Message Templates
 */
export const MESSAGE_TEMPLATES = {
  providerInquiry: (data = {}) => ({
    subject: `Inquiry Regarding Eligibility Criteria: ${data.scholarshipTitle || "Scholarship"}`,
    body: `Respected Scholarship Committee,\n\nI am writing to inquire about the eligibility and document submission requirements for the ${data.scholarshipTitle || "Scholarship"} (Application Reference: ${data.id || "N/A"}).\n\nCould you kindly confirm if students currently pursuing ${data.course || "my course"} are eligible to apply, and whether the counter-signed income certificate must be from the current financial year?\n\nThank you for your guidance and support.\n\nWarm regards,\n${data.studentName || "Applicant"}\n${data.contactEmail || ""}`
  }),

  documentRequest: (data = {}) => ({
    subject: `Request for Recommendation Letter / Academic Bonafide Certificate`,
    body: `Respected Professor / Administration,\n\nI am preparing an application for the ${data.scholarshipTitle || "Scholarship"}, which has a submission deadline of ${data.deadline || "the upcoming month"}.\n\nAs part of the eligibility criteria, I require a verified ${data.documentName || "Institutional Bonafide Certificate / Letter of Recommendation"}.\n\nCould you please advise on the procedure or issue this certificate at your earliest convenience?\n\nStudent Name: ${data.studentName || "Applicant"}\nRoll No / Student ID: ${data.studentId || "Student"}\nCourse: ${data.course || "Degree"}\n\nThank you for your continuous mentorship.\n\nSincerely,\n${data.studentName || "Applicant"}`
  }),

  statusFollowUp: (data = {}) => ({
    subject: `Status Update Follow-up: Application for ${data.scholarshipTitle || "Scholarship"}`,
    body: `Dear Scholarship Scrutiny Desk,\n\nI submitted my application for the ${data.scholarshipTitle || "Scholarship"} on ${data.appliedDate || "recently"}.\n\nI would be grateful to know if all uploaded documents have passed preliminary scrutiny, or if any additional verification slips are required.\n\nApplication Reference: ${data.id || "N/A"}\nApplicant Name: ${data.studentName || "Applicant"}\n\nThank you for your time and assistance.\n\nSincerely,\n${data.studentName || "Applicant"}`
  })
};

/**
 * Builds email-ready weekly digest summary text
 */
export function buildWeeklyDigest({ studentName, activeApplications = [], upcomingDeadlines = [], readyDocsCount = 0, totalDocsCount = 0 }) {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const lines = [
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🎓 GRANTLY WEEKLY DIGEST — ${dateStr}`,
    `Student: ${studentName || "Scholar"}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    "",
    `📋 ACTIVE APPLICATION PIPELINE (${activeApplications.length} tracked):`,
    activeApplications.length > 0
      ? activeApplications.map(a => `  • [${a.status}] ${a.scholarshipTitle || a.title} — ${a.provider} (Deadline: ${a.deadline || "TBD"})`).join("\n")
      : "  • No applications currently active in the pipeline.",
    "",
    `⏰ CRITICAL UPCOMING DEADLINES:`,
    upcomingDeadlines.length > 0
      ? upcomingDeadlines.map(d => `  • ${d.title} (Closes ${d.deadline}) — Award: ₹${d.awardAmount || 0}`).join("\n")
      : "  • No imminent deadlines within the next 30 days.",
    "",
    `📁 DOCUMENT DOSSIER READINESS:`,
    `  • ${readyDocsCount} of ${totalDocsCount} critical certificates verified ready.`,
    "",
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Generated privately via GRANTLY Local Command Center`
  ];

  return lines.join("\n");
}
