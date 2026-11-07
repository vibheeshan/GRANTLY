import test from "node:test";
import assert from "node:assert/strict";

import {
  getApplicationConversionFunnel,
  getAvgDaysSavedToSubmitted,
  getAvgDaysSubmittedToFirstStatusChange,
  getRejectionAndAwardRates,
  getApplicationsPerProvider,
  getApplicationsPerEducationLevel,
  getStalledApplications,
  getSubmissionOnTimeRate,
  getReadinessTrend,
  getReadinessBreakdown,
  getDocumentsReadyRatioByScholarship,
  getMostMissingDocument,
  getExpiringDocumentsForecast,
  getProfileCompletenessBySection,
  getTimeToReady,
  getPreparationTaskCompletionRate,
  getSaveThroughRate,
  getMostViewedCategories,
  getFilterUsageHeatmap,
  getSearchTermFrequency,
  getMatchScoreHistogram,
  getMandatoryFailureFrequency,
  getUnmetCriteriaLeaderboard,
  getRecommendationAcceptanceRate,
  getTotalEstimatedFunding,
  getFundingByCategory,
  getFundingByDeadlineMonth,
  getAvgAwardSavedVsSubmitted,
  getFundingAtRisk,
  getFundingPipeline,
  getAwardSizeDistribution,
  getScenarioComparisonFunding,
  getWeeklyActivityHeatmap,
  getActiveDaysStreak,
  getSessionMetrics,
  getDeadlineLoad12Weeks,
  getBusiestDeadlineWeek,
  getTimeSpentPerSection,
  getCalendarLeadTime,
  getActivityTimeline,
  computeAllAnalytics,
  generateInsightEngineObservations
} from "./analytics.js";

// Test Fixtures
const EMPTY_STATE = {
  applications: [],
  scholarships: [],
  documents: [],
  studentProfile: {},
  eventLog: [],
  savedIds: []
};

const ONE_APP_STATE = {
  studentProfile: {
    educationLevel: "Undergraduate",
    course: "Computer Science",
    institution: "Tech University",
    familyIncome: 400000,
    academicPercentage: 85,
    state: "Maharashtra",
    completedProfile: true
  },
  savedIds: ["sch-1"],
  scholarships: [
    {
      id: "sch-1",
      title: "Alpha Tech Merit Grant",
      provider: "Tech Corp",
      awardAmount: 50000,
      educationLevels: ["Undergraduate"],
      minimumPercentage: 80,
      maximumFamilyIncome: 500000,
      categories: ["STEM"],
      requiredDocuments: ["Marksheet", "Income Certificate"],
      deadline: "2026-12-01",
      stackable: true
    }
  ],
  documents: [
    { id: "d1", name: "Marksheet", isReady: true, expiryDate: "2027-01-01" },
    { id: "d2", name: "Income Certificate", isReady: false, expiryDate: "2026-11-20" }
  ],
  applications: [
    {
      id: "app-1",
      scholarshipId: "sch-1",
      scholarshipTitle: "Alpha Tech Merit Grant",
      provider: "Tech Corp",
      awardAmount: 50000,
      status: "Submitted",
      appliedDate: "2026-11-01",
      deadline: "2026-12-01",
      history: [
        { status: "Applying", date: "2026-10-20" },
        { status: "Submitted", date: "2026-11-01" }
      ],
      milestones: [
        { id: "m1", label: "Draft", completed: true, date: "2026-10-25" },
        { id: "m2", label: "Submit", completed: true, date: "2026-11-01" }
      ]
    }
  ],
  eventLog: [
    { id: "ev-1", type: "page_visit", path: "/scholarship/sch-1", section: "Discovery", timestamp: "2026-11-01T10:00:00Z" },
    { id: "ev-2", type: "save", scholarshipId: "sch-1", timestamp: "2026-11-01T10:05:00Z" }
  ]
};

const MANY_APPS_STATE = {
  studentProfile: {
    educationLevel: "Undergraduate",
    course: "Engineering",
    institution: "Apex Tech",
    familyIncome: 450000,
    academicPercentage: 82,
    state: "Maharashtra",
    completedProfile: true
  },
  savedIds: ["sch-1", "sch-2", "sch-3"],
  scholarships: [
    {
      id: "sch-1",
      title: "Alpha Tech Grant",
      provider: "Tech Corp",
      awardAmount: 50000,
      educationLevels: ["Undergraduate"],
      categories: ["STEM"],
      requiredDocuments: ["Marksheet", "Income Certificate"],
      deadline: "2026-11-25",
      stackable: false
    },
    {
      id: "sch-2",
      title: "Beta Science Fellowship",
      provider: "Tech Corp", // same provider for non-stackable test
      awardAmount: 75000,
      educationLevels: ["Undergraduate"],
      categories: ["STEM", "Research"],
      requiredDocuments: ["Marksheet", "Income Certificate", "ID Card"],
      deadline: "2026-12-10",
      stackable: false
    },
    {
      id: "sch-3",
      title: "Delta Leadership Award",
      provider: "Delta NGO",
      awardAmount: 100000,
      educationLevels: ["Undergraduate"],
      categories: ["Leadership"],
      requiredDocuments: ["Essay", "Marksheet"],
      deadline: "2027-01-15",
      stackable: true
    }
  ],
  documents: [
    { id: "d1", name: "Marksheet", isReady: true, expiryDate: "2027-06-01" },
    { id: "d2", name: "Income Certificate", isReady: false, expiryDate: "2026-11-20" },
    { id: "d3", name: "ID Card", isReady: true, expiryDate: "2029-01-01" }
  ],
  applications: [
    {
      id: "app-1",
      scholarshipId: "sch-1",
      scholarshipTitle: "Alpha Tech Grant",
      provider: "Tech Corp",
      awardAmount: 50000,
      status: "Awarded",
      appliedDate: "2026-10-15",
      deadline: "2026-11-01",
      history: [
        { status: "Applying", date: "2026-10-01" },
        { status: "Submitted", date: "2026-10-15" },
        { status: "Under Review", date: "2026-10-20" },
        { status: "Awarded", date: "2026-10-28" }
      ],
      milestones: [{ completed: true }]
    },
    {
      id: "app-2",
      scholarshipId: "sch-2",
      scholarshipTitle: "Beta Science Fellowship",
      provider: "Tech Corp",
      awardAmount: 75000,
      status: "Rejected",
      appliedDate: "2026-10-18",
      deadline: "2026-11-05",
      history: [
        { status: "Applying", date: "2026-10-05" },
        { status: "Submitted", date: "2026-10-18" },
        { status: "Rejected", date: "2026-10-25" }
      ],
      milestones: [{ completed: true }]
    },
    {
      id: "app-3",
      scholarshipId: "sch-3",
      scholarshipTitle: "Delta Leadership Award",
      provider: "Tech Corp", // Causes concentration > 50% (3 out of 4)
      awardAmount: 100000,
      status: "Under Review",
      appliedDate: "2026-10-01",
      deadline: "2027-01-15",
      history: [
        { status: "Submitted", date: "2026-10-01" } // > 14 days ago, stalled!
      ],
      milestones: [{ completed: false }]
    },
    {
      id: "app-4",
      scholarshipId: "sch-4",
      scholarshipTitle: "Gamma Arts Fund",
      provider: "Arts Guild",
      awardAmount: 40000,
      status: "Applying",
      appliedDate: null,
      deadline: "2026-10-01", // Passed deadline!
      history: [
        { status: "Applying", date: "2026-09-15" }
      ],
      milestones: [{ completed: false }]
    }
  ],
  eventLog: [
    { type: "recommendation_feedback", feedback: "up", timestamp: "2026-11-01" },
    { type: "recommendation_feedback", feedback: "up", timestamp: "2026-11-02" },
    { type: "recommendation_feedback", feedback: "down", timestamp: "2026-11-03" },
    { type: "search", query: "engineering", timestamp: "2026-11-01" },
    { type: "filter", filterName: "category", filterValue: "STEM", timestamp: "2026-11-01" }
  ]
};

// Tests
test("A1: getApplicationConversionFunnel handles empty and many state", () => {
  const emptyRes = getApplicationConversionFunnel(EMPTY_STATE);
  assert.strictEqual(emptyRes.totalTracked, 0);

  const manyRes = getApplicationConversionFunnel(MANY_APPS_STATE);
  assert.strictEqual(manyRes.hasData, true);
  assert.strictEqual(manyRes.stages[0].stage, "Saved");
  assert.strictEqual(manyRes.rejectedCount, 1);
});

test("A2 & A3: getAvgDaysSavedToSubmitted and getAvgDaysSubmittedToFirstStatusChange", () => {
  const emptyRes = getAvgDaysSavedToSubmitted(EMPTY_STATE);
  assert.strictEqual(emptyRes.hasData, false);
  assert.ok(emptyRes.emptyReason);

  const oneRes = getAvgDaysSavedToSubmitted(ONE_APP_STATE);
  assert.strictEqual(oneRes.hasData, true);
  assert.strictEqual(oneRes.averageDays, 12); // Oct 20 to Nov 1 = 12 days

  const a3Empty = getAvgDaysSubmittedToFirstStatusChange(EMPTY_STATE);
  assert.strictEqual(a3Empty.hasData, false);

  const a3Many = getAvgDaysSubmittedToFirstStatusChange(MANY_APPS_STATE);
  assert.strictEqual(a3Many.hasData, true);
  // Oct 15 to Oct 20 = 5 days; Oct 18 to Oct 25 = 7 days => avg 6 days
  assert.strictEqual(a3Many.averageDays, 6);
});

test("A4: getRejectionAndAwardRates strictly separates rejection and award rates", () => {
  const res = getRejectionAndAwardRates(MANY_APPS_STATE);
  assert.strictEqual(res.awardedCount, 1);
  assert.strictEqual(res.rejectedCount, 1);
  assert.strictEqual(res.totalCompleted, 2);
  assert.strictEqual(res.awardRatePercent, 50);
  assert.strictEqual(res.rejectionRatePercent, 50);
  // Must verify rule notice
  assert.ok(res.ruleNotice.includes("strictly separate figures and never combined"));
});

test("A5: getApplicationsPerProvider triggers concentration warning if > 50%", () => {
  const res = getApplicationsPerProvider(MANY_APPS_STATE);
  assert.strictEqual(res.totalApplications, 4);
  assert.strictEqual(res.concentrationWarning, true);
  assert.strictEqual(res.dominantProvider.name, "Tech Corp");
  assert.strictEqual(res.dominantProvider.percentage, 75);
});

test("A7: getStalledApplications identifies applications stalled > 14 days", () => {
  const res = getStalledApplications(MANY_APPS_STATE, 14);
  assert.strictEqual(res.needsReview, true);
  assert.ok(res.stalledCount >= 1);
  const found = res.stalledApplications.some((a) => a.id === "app-3");
  assert.strictEqual(found, true);
});

test("A8: getSubmissionOnTimeRate calculates on-time vs late", () => {
  const res = getSubmissionOnTimeRate(ONE_APP_STATE);
  assert.strictEqual(res.hasData, true);
  assert.strictEqual(res.onTimeCount, 1);
  assert.strictEqual(res.lateCount, 0);
  assert.strictEqual(res.onTimeRatePercent, 100);
});

test("A12: getMostMissingDocument identifies most missing document across saved scholarships", () => {
  const res = getMostMissingDocument(MANY_APPS_STATE);
  assert.strictEqual(res.hasData, true);
  assert.strictEqual(res.mostMissing.documentName, "Income Certificate");
  assert.strictEqual(res.mostMissing.count, 2);
});

test("A13: getExpiringDocumentsForecast calculates 30, 60, and 90 day windows", () => {
  const res = getExpiringDocumentsForecast(MANY_APPS_STATE);
  assert.strictEqual(res.hasData, true);
  assert.strictEqual(res.chartData.length, 3);
});

test("A24: getRecommendationAcceptanceRate computes thumbs up/down ratio", () => {
  const res = getRecommendationAcceptanceRate(MANY_APPS_STATE);
  assert.strictEqual(res.thumbsUpCount, 2);
  assert.strictEqual(res.thumbsDownCount, 1);
  assert.strictEqual(res.acceptanceRatePercent, 67);
});

test("A25: getTotalEstimatedFunding counts mutually exclusive groups once and labels as estimated", () => {
  const res = getTotalEstimatedFunding(MANY_APPS_STATE);
  assert.strictEqual(res.label, "estimated");
  // Tech Corp has two non-stackable scholarships: sch-1 (50000) and sch-2 (75000).
  // Highest is 75000. Plus sch-3 stackable (100000) = 175000.
  assert.strictEqual(res.totalEstimatedAmount, 175000);
});

test("A29: getFundingAtRisk identifies stalled and past-deadline applications", () => {
  const res = getFundingAtRisk(MANY_APPS_STATE);
  assert.strictEqual(res.label, "estimated");
  // app-3 (100000, stalled) + app-4 (40000, past deadline) = 140000
  assert.strictEqual(res.fundingAtRiskAmount, 140000);
  assert.strictEqual(res.count, 2);
});

test("A33 & A34: Activity heatmap and streaks", () => {
  const hm = getWeeklyActivityHeatmap(MANY_APPS_STATE);
  assert.strictEqual(hm.heatmapMatrix.length, 7);
  assert.strictEqual(hm.heatmapMatrix[0].blocks.length, 4);

  const st = getActiveDaysStreak(MANY_APPS_STATE);
  assert.ok(st.currentStreakDays >= 1);
  assert.ok(st.longestStreakDays >= st.currentStreakDays);
});

test("A36 & A37: Deadline load and busiest week warning", () => {
  const dl = getDeadlineLoad12Weeks(MANY_APPS_STATE);
  assert.strictEqual(dl.weeks.length, 12);

  const bw = getBusiestDeadlineWeek(MANY_APPS_STATE);
  assert.strictEqual(bw.hasData, true);
});

test("computeAllAnalytics runs all A1-A40 without throwing", () => {
  const res = computeAllAnalytics(MANY_APPS_STATE);
  for (let i = 1; i <= 40; i++) {
    assert.ok(res[`A${i}`], `Metric A${i} must be computed`);
  }
});

test("generateInsightEngineObservations creates rule-based actionable observations", () => {
  const metrics = computeAllAnalytics(MANY_APPS_STATE);
  const observations = generateInsightEngineObservations(metrics, MANY_APPS_STATE);
  assert.ok(observations.length >= 3);
  assert.ok(observations.length <= 5);
  // Each must have an actionPath and actionLabel
  observations.forEach((obs) => {
    assert.ok(obs.actionPath, "Observation must link to action path");
    assert.ok(obs.actionLabel, "Observation must have an action label");
    assert.ok(!obs.observation.toLowerCase().includes("will definitely"), "Never phrased as prediction");
  });
});
