/**
 * UI Localization dictionary (English default) - Feature 147
 * Centralized strings enabling multi-lingual extension and consistent accessibility phrasing.
 */

export const STRINGS_EN = {
  app: {
    title: "GRANTLY",
    tagline: "Unified Student Financial Intelligence Platform",
    localNotice: "All calculations computed locally from LocalStorage state"
  },
  nav: {
    overview: "Dashboard Cockpit",
    discovery: "Scholarship Explorer",
    intelligence: "Match DNA Assessment",
    comparison: "Comparison Studio",
    finance: "Funding Calculator",
    management: "My Applications",
    planning: "Application Calendar",
    dossier: "Document Readiness Dossier",
    analytics: "Student Success Insights",
    settings: "Student Profile & Domicile"
  },
  analytics: {
    pageTitle: "INSIGHTS & ANALYTICS",
    pageSubtitle: "Deterministic performance metrics computed directly from your local state without server tracking.",
    filterDateRange: "Date Range",
    filterProvider: "Provider",
    filterCategory: "Category",
    allProviders: "All Providers",
    allCategories: "All Categories",
    last30Days: "Last 30 Days",
    last60Days: "Last 60 Days",
    last90Days: "Last 90 Days",
    allTime: "All Time",
    customRange: "Custom Range",
    exportJson: "Export JSON Snapshot",
    exportCsv: "Export Data (CSV)",
    printReport: "Print Report",
    periodComparison: "Period Comparison (vs Prev 30d)",
    colorBlindMode: "Color-Blind Safe Palette",
    reducedDataMode: "Reduced Data / Low Bandwidth",
    estFunding: "Est. Total Funding",
    readinessAvg: "Readiness Index",
    stalledApps: "Stalled Applications",
    daysToDeadline: "Days to Next Deadline",
    needReview: "need review",
    estimatedBadge: "Estimated",
    insightEngineTitle: "Insight Engine Observations",
    insightEngineSubtitle: "Rule-based observations derived from your dossier. Never phrased as predictions.",
    conversionFunnelTitle: "Application Conversion Funnel",
    conversionFunnelDesc: "Progression through Saved, Preparing, Submitted, In Review, and Awarded stages.",
    matchHistogramTitle: "Catalogue Match Score Distribution",
    fundingPipelineTitle: "Funding Pipeline by Tracker Stage",
    deadlineLoadTitle: "Deadline Horizon (Next 12 Weeks)",
    activityHeatmapTitle: "Weekly Activity Heatmap",
    expiringDocsTitle: "Document Expiration Forecast",
    fundingByCategoryTitle: "Estimated Funding by Category",
    mandatoryFailuresTitle: "Unmet Criteria Leaderboard",
    velocityMetricsTitle: "Velocity & Application Timelines",
    showTable: "Show Data Table",
    showChart: "Show Chart",
    srPrefix: "Screen reader chart summary: "
  },
  goals: {
    personalGoalTitle: "Personal Monthly Goal",
    personalGoalDisclaimer: "Your goal is personal and private, not a benchmark against others.",
    targetLabel: "Target Applications / Month",
    benchmarkLabel: "Self-Paced Progress vs Past Periods"
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    close: "Close",
    loading: "Computing metrics...",
    emptyData: "No data recorded for this timeframe.",
    actionRequired: "Action Required"
  }
};

export default STRINGS_EN;
