/**
 * URL Builder Utility for Calendar, Messaging, and External References
 * - Google Calendar event links
 * - Microsoft Outlook Calendar event links
 * - mailto: links with encoded subject & body
 * - WhatsApp wa.me links with encoded text
 * - Google Maps search URL with institution name only (never includes student data)
 */

/**
 * Format date for Google Calendar (YYYYMMDDTHHmmssZ)
 */
export function formatGoogleCalendarDate(dateInput, isEnd = false) {
  if (!dateInput) {
    const d = new Date();
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number);
    // 09:00:00 UTC start or 23:59:00 UTC end
    const dt = new Date(Date.UTC(y, m - 1, d, isEnd ? 23 : 9, isEnd ? 59 : 0, 0));
    return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  const dt = new Date(dateInput);
  return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Builds a direct Google Calendar event creation link
 */
export function getGoogleCalendarUrl({
  title = "Scholarship Deadline",
  deadline,
  details = "",
  provider = "",
  location = "Online Portal"
}) {
  const start = formatGoogleCalendarDate(deadline, false);
  const end = formatGoogleCalendarDate(deadline, true);

  const fullDetails = [
    details,
    provider ? `Provider: ${provider}` : "",
    "Managed via GRANTLY Scholarship Hub"
  ]
    .filter(Boolean)
    .join("\n\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Deadline: ${title}`,
    dates: `${start}/${end}`,
    details: fullDetails,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Builds an Outlook Live calendar compose link
 */
export function getOutlookCalendarUrl({
  title = "Scholarship Deadline",
  deadline,
  details = "",
  provider = "",
  location = "Online Portal"
}) {
  // Outlook format: YYYY-MM-DDTHH:mm:ssZ
  let startIso = new Date().toISOString();
  let endIso = new Date().toISOString();

  if (deadline) {
    if (typeof deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      const [y, m, d] = deadline.split("-").map(Number);
      startIso = new Date(Date.UTC(y, m - 1, d, 9, 0, 0)).toISOString();
      endIso = new Date(Date.UTC(y, m - 1, d, 23, 59, 0)).toISOString();
    } else {
      const dt = new Date(deadline);
      startIso = dt.toISOString();
      endIso = dt.toISOString();
    }
  }

  const fullDetails = [
    details,
    provider ? `Provider: ${provider}` : "",
    "Managed via GRANTLY Scholarship Hub"
  ]
    .filter(Boolean)
    .join("\n\n");

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `Deadline: ${title}`,
    startdt: startIso,
    enddt: endIso,
    body: fullDetails,
    location: location
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Builds a prefilled mailto: link for reminders or inquiries
 */
export function getMailtoUrl({ to = "", subject = "", body = "" }) {
  const params = new URLSearchParams();
  if (subject) params.append("subject", subject);
  if (body) params.append("body", body);

  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${encodeURIComponent(to)}?${query}`;
}

/**
 * Builds a prefilled WhatsApp (wa.me) share link
 */
export function getWhatsAppShareUrl({ text = "" }) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Builds a public Google Maps search link using the institution name only.
 * Privacy rule: NEVER includes student address or private student parameters.
 */
export function getInstitutionMapUrl(institutionName = "") {
  if (!institutionName) return "https://www.google.com/maps";
  const cleanName = institutionName.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName)}`;
}
