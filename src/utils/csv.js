/**
 * CSV Generation Utility for GRANTLY
 * - Safe CSV cell escaping (quotes, commas, newlines).
 * - Mitigates CSV Formula Injection (CWE-1236): prefixes cells starting with '=', '+', '-', or '@' with a single quote.
 * - Prepends UTF-8 BOM (\uFEFF) for proper rendering in Microsoft Excel for currency symbols (₹) and international/Hindi scripts.
 */

/**
 * Neutralizes formula injection characters (=, +, -, @)
 */
export function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return "";
  let str = String(value);

  // If cell starts with formula characters, prefix with single quote
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  // If cell contains commas, quotes, or newlines, quote the cell and escape internal quotes
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Builds a CSV string from an array of header objects and rows
 */
export function buildCsv(columns, rows) {
  const headerLine = columns.map(c => sanitizeCsvCell(c.label || c.key)).join(",");
  const dataLines = rows.map(row => {
    return columns.map(col => {
      const val = typeof col.getValue === "function" ? col.getValue(row) : row[col.key];
      return sanitizeCsvCell(val);
    }).join(",");
  });

  // Prepend UTF-8 Byte Order Mark (\uFEFF) for Excel compatibility with Unicode (₹, Devanagari, etc.)
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

/**
 * Exports application list to safe CSV format
 */
export function exportApplicationsToCsv(applications = []) {
  const columns = [
    { key: "id", label: "Application ID" },
    { key: "scholarshipTitle", label: "Scholarship Name" },
    { key: "provider", label: "Provider" },
    { key: "awardAmount", label: "Award Amount (INR)" },
    { key: "status", label: "Status" },
    { key: "deadline", label: "Deadline" },
    { key: "appliedDate", label: "Applied Date" },
    { key: "notes", label: "Notes" },
    { key: "archived", label: "Archived" }
  ];

  return buildCsv(columns, applications);
}

/**
 * Exports scholarships to safe CSV format
 */
export function exportScholarshipsToCsv(scholarships = []) {
  const columns = [
    { key: "id", label: "Scholarship ID" },
    { key: "title", label: "Title" },
    { key: "provider", label: "Provider" },
    { key: "awardAmount", label: "Award Amount" },
    { key: "currency", label: "Currency" },
    { key: "deadline", label: "Deadline" },
    { key: "academicPercentageMin", label: "Min Percentage", getValue: (s) => s.criteria?.academicPercentageMin ?? "" },
    { key: "familyIncomeMax", label: "Max Family Income", getValue: (s) => s.criteria?.familyIncomeMax ?? "" },
    { key: "categories", label: "Categories", getValue: (s) => (s.categories || []).join("; ") },
    { key: "sourceType", label: "Source Type" },
    { key: "applicationUrl", label: "Application Link" }
  ];

  return buildCsv(columns, scholarships);
}

/**
 * Downloads CSV content as a file in the browser
 */
export function downloadCsv(filename = "grantly-export.csv", csvContent = "") {
  if (typeof window === "undefined") return;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
