import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ScholarshipProvider } from "./context/ScholarshipContext.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";

// Page modules
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ExplorerPage } from "./pages/ExplorerPage.jsx";
import { RecommendedPage } from "./pages/RecommendedPage.jsx";
import { ScholarshipDetailPage } from "./pages/ScholarshipDetailPage.jsx";
import { MatchDNAPage } from "./pages/MatchDNAPage.jsx";
import { MatcherPage } from "./pages/MatcherPage.jsx";
import { ComparePage } from "./pages/ComparePage.jsx";
import { CalculatorPage } from "./pages/CalculatorPage.jsx";
import { CategoriesPage } from "./pages/CategoriesPage.jsx";
import { OpportunityMapPage } from "./pages/OpportunityMapPage.jsx";
import { ApplicationsPage } from "./pages/ApplicationsPage.jsx";
import { ApplicationJourneyPage } from "./pages/ApplicationJourneyPage.jsx";
import { CalendarPage } from "./pages/CalendarPage.jsx";
import { DocumentsPage } from "./pages/DocumentsPage.jsx";
import { InsightsPage } from "./pages/InsightsPage.jsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.jsx";
import { AssistantPage } from "./pages/AssistantPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { ReadinessReportPage } from "./pages/ReadinessReportPage.jsx";
import { NotificationsPage } from "./pages/NotificationsPage.jsx";
import { ActivityFeedPage } from "./pages/ActivityFeedPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <ScholarshipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="explorer" element={<ExplorerPage />} />
              <Route path="recommended" element={<RecommendedPage />} />
              <Route path="scholarship/:id" element={<ScholarshipDetailPage />} />
              <Route path="match-dna" element={<MatchDNAPage />} />
              <Route path="matcher" element={<MatchDNAPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="opportunity-map" element={<OpportunityMapPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="journey" element={<ApplicationJourneyPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="passport" element={<ProfilePage />} />
              <Route path="settings" element={<ProfilePage />} />
              <Route path="settings/integrations" element={<ProfilePage defaultTab="integrations" />} />
              <Route path="integrations" element={<ProfilePage defaultTab="integrations" />} />
              <Route path="readiness-report" element={<ReadinessReportPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="activity" element={<ActivityFeedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ScholarshipProvider>
    </ThemeProvider>
  );
}
