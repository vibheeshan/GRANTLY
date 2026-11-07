/**
 * Formatting and Helper Utilities for GRANTLY
 */

/**
 * Format currency in Indian Rupees or specified symbol
 */
export function formatCurrency(amount, currency = "₹") {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${currency}0`;
  }
  return `${currency}${Number(amount).toLocaleString("en-IN")}`;
}

/**
 * Format date string into human readable format like "Nov 28, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculate days remaining until a deadline from reference date
 */
export function getDaysRemaining(deadlineDate) {
  if (!deadlineDate) return null;
  const now = new Date("2026-11-06T22:51:38-08:00"); // Use current context date
  const target = new Date(deadlineDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get deadline urgency badge styling
 */
export function getDeadlineUrgency(deadlineDate) {
  const days = getDaysRemaining(deadlineDate);
  if (days === null) {
    return { text: "No date", color: "gray", isUrgent: false };
  }
  if (days < 0) {
    return { text: "Closed", color: "rose", isUrgent: false, isClosed: true };
  }
  if (days === 0) {
    return { text: "Closes Today", color: "rose", isUrgent: true };
  }
  if (days <= 7) {
    return { text: `${days}d left (Closing Soon)`, color: "amber", isUrgent: true };
  }
  if (days <= 30) {
    return { text: `${days} days left`, color: "blue", isUrgent: false };
  }
  return { text: `${days} days left`, color: "emerald", isUrgent: false };
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
