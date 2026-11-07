# GRANTLY 🎓
### Discover Opportunities. Track Applications. Fund Your Future.

[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js Tests](https://img.shields.io/badge/Tests-34%20Passing-success.svg?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**GRANTLY** is an all-in-one scholarship discovery, Match DNA assessment, application lifecycle tracking, and student financial intelligence platform. Designed to eliminate the chaos of managing deadlines, essays, requirements, and funding calculations, GRANTLY empowers students to maximize their financial aid potential with precision and clarity.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [1. Discovery & Explorer](#1-discovery--explorer)
  - [2. Match DNA Assessment Engine](#2-match-dna-assessment-engine)
  - [3. Application Lifecycle Tracker & Journey Kanban](#3-application-lifecycle-tracker--journey-kanban)
  - [4. Financial Intelligence & ROI Calculator](#4-financial-intelligence--roi-calculator)
  - [5. Opportunity Map & Geographic Visualization](#5-opportunity-map--geographic-visualization)
  - [6. Document Vault & Dossier Readiness](#6-document-vault--dossier-readiness)
  - [7. Analytics & Actionable Insights Engine](#7-analytics--actionable-insights-engine)
  - [8. Calendar & Multi-Platform Sync](#8-calendar--multi-platform-sync)
  - [9. AI Scholarship Assistant](#9-ai-scholarship-assistant)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Development Server](#development-server)
  - [Building for Production](#building-for-production)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Privacy, Data Safety & Formula Security](#-privacy-data-safety--formula-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 1. Discovery & Explorer
- **Smart Catalog**: Search and browse a curated database of domestic and international scholarships, fellowships, and grants.
- **Multi-Faceted Filtering**: Filter seamlessly by field of study (STEM, Humanities, Business, Medicine), award value, citizenship, degree level (Undergraduate, Master's, Ph.D.), and urgency.
- **Side-by-Side Comparison**: Compare multiple opportunities across award amounts, acceptance rates, difficulty, and requirement criteria.

### 2. Match DNA Assessment Engine
- **Deterministic Match Scoring**: Dynamically calculates compatibility percentages based on GPA, academic major, citizenship, graduation timeline, and extracurricular background.
- **Transparent Breakdown**: Shows exactly why a student qualifies or what requirements are still unmet, eliminating guesswork.

### 3. Application Lifecycle Tracker & Journey Kanban
- **Pipeline Stages**: Organize applications through every stage: `Saved` ➔ `In Progress` ➔ `Submitted` ➔ `Under Review` ➔ `Awarded` / `Waitlisted`.
- **Turnaround Analysis**: Tracks submission-to-award timeline and flags stalled applications (> 14 days without status updates).

### 4. Financial Intelligence & ROI Calculator
- **Total Award Potential**: Track secured funding versus targeted costs.
- **Stackability & Conflict Detection**: Identifies whether multiple scholarships can be combined or if they have mutual exclusion rules.
- **Funding Gap & Coverage Analysis**: Computes the net cost of attendance after applying estimated awards.

### 5. Opportunity Map & Geographic Visualization
- **Interactive Global Map**: Visual distribution of scholarships across countries, states, and global study destinations.
- **Privacy-Preserving**: Mapping queries contain only educational and institution names without transmitting personal identifiable student data.

### 6. Document Vault & Dossier Readiness
- **Centralized Checklist**: Monitor the status of Transcripts, Statements of Purpose (SOP), Letters of Recommendation (LOR), and Financial Proofs.
- **Missing Document & Expiration Forecasting**: Alerts for impending document expirations and missing credentials across target deadlines.

### 7. Analytics & Actionable Insights Engine
- **40+ Core Metrics Computed Offline**:
  - Application conversion funnel and attrition points
  - On-time vs. late submission percentages
  - Provider concentration alerts (warns if > 50% of funding is concentrated in a single provider)
  - Deadline load and busiest week forecasting
  - Activity heatmaps and application streak tracking
  - Total estimated funding with duplicate/conflict reduction

### 8. Calendar & Multi-Platform Sync
- **Interactive Deadline Calendar**: Visual view of upcoming submission cutoffs.
- **Standards-Compliant ICS Generation**: Export calendars with embedded `VALARM` notifications at T-7 days and T-1 day.
- **One-Click Share Links**: Pre-generated integration links for Google Calendar, Microsoft Outlook, WhatsApp, and Email.

### 9. AI Scholarship Assistant
- **Context-Aware Guidance**: Instant answers regarding eligibility nuances, required essay prompts, and stackability regulations.
- **Dossier Preparation Checklists**: Step-by-step preparation roadmaps tailored to specific awards.

---

## 🛠 Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Functional components with Hooks & Context API |
| **Language** | [TypeScript](https://www.typescriptlang.org/) & JSX | Type definitions and strict validation |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Ultra-fast HMR and optimized production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS-first utility framework with Dark/Light theme support |
| **Routing** | [React Router v7](https://reactrouter.com/) | Dynamic client-side routing & nested layouts |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Charts & Visualization** | [Recharts](https://recharts.org/) | Responsive SVG charts for conversion funnels and analytics |
| **Motion & Transitions** | [Motion](https://motion.dev/) | Smooth layout transitions and interactive UI elements |
| **Testing** | Node.js Native Test Runner | Fast zero-dependency unit tests (`node --test`) |
| **Persistence** | LocalStorage + JSON Export | Client-side privacy-first persistence with zero required backend |

---

## 📂 Project Directory Structure

```plaintext
grantly/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Reusable UI component library
│   │   ├── layout/         # AppLayout, Navbar, Sidebar
│   │   └── ui/             # Card, Badge, Button, Modal, Tabs, Input, etc.
│   ├── context/            # React Context providers
│   │   ├── ScholarshipContext.jsx  # Global state (scholarships, apps, docs)
│   │   └── ThemeContext.jsx        # Dark/Light theme provider
│   ├── data/               # Scholarship seeds & demonstration catalog
│   ├── hooks/              # Custom React hooks (useScholarships, etc.)
│   ├── i18n/               # Internationalization & language packs
│   ├── pages/              # Application views & route handlers
│   │   ├── DashboardPage.jsx       # Overview metrics & quick actions
│   │   ├── ExplorerPage.jsx        # Searchable scholarship catalog
│   │   ├── MatchDNAPage.jsx        # Eligibility scoring engine
│   │   ├── ApplicationsPage.jsx    # Kanban application tracking
│   │   ├── CalendarPage.jsx        # Submission deadlines & ICS export
│   │   ├── AnalyticsPage.jsx       # Funnels, stats, and heatmaps
│   │   ├── CalculatorPage.jsx      # Funding & stackability calculator
│   │   ├── OpportunityMapPage.jsx  # Interactive geographic explorer
│   │   ├── AssistantPage.jsx       # AI Advisor chat interface
│   │   └── ...                     # Additional views
│   ├── utils/              # Pure algorithmic utilities & engines
│   │   ├── analytics.js    # 40+ analytics & observation functions
│   │   ├── eligibility.js  # Match DNA compatibility scoring
│   │   ├── csv.js          # Safe CSV generation with injection defense
│   │   ├── ics.js          # RFC-5545 iCalendar generation
│   │   ├── links.js        # Google/Outlook calendar URL builders
│   │   ├── storage.js      # Robust LocalStorage CRUD & data migration
│   │   └── importExport.js # Schema validation & merge resolution
│   ├── App.tsx             # Root router & layout orchestration
│   ├── index.css           # Global Tailwind CSS imports
│   └── main.tsx            # Application entry point
├── .env.example            # Sample environment variables
├── .gitignore              # Production Git ignore rules
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration & path aliases
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+), `pnpm`, or `bun`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/grantly.git
   cd grantly
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Configure your variables in `.env.local`:
```env
# Optional: GEMINI_API_KEY if integrating directly with Google AI Studio / Gemini API
GEMINI_API_KEY="your_api_key_here"

# APP_URL for self-referential links or deployment target
APP_URL="http://localhost:3000"
```

### Development Server

Start the local Vite development server:
```bash
npm run dev
```

Open your browser at:
`http://localhost:3000`

### Building for Production

Compile optimized production assets:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 🧪 Testing & Quality Assurance

The project includes an automated test suite executed via the native Node.js test runner:

```bash
npm run test
```

### Test Coverage Highlights:
- **Analytics Engine**: Verifies conversion funnels, stalled application detection (> 14 days), deadline load distribution, provider concentration warnings, and safe funding sum aggregations.
- **ICS Calendar Builder**: Validates RFC-5545 compliance, character escaping, Unicode preservation (including currency symbols ₹, €, $), and dual alarm generation (T-7 / T-1).
- **CSV Security**: Ensures prevention against CSV Formula Injection (CWE-1236) by properly sanitizing leading formula characters (`=`, `+`, `-`, `@`).
- **Data Import/Export**: Verifies JSON schema compliance, duplicate ID collision detection, and merge-vs-replace data recovery strategies.

---

## 🛡 Privacy, Data Safety & Formula Security

- **Formula Injection Mitigation**: All exported CSV files implement formula sanitization according to OWASP guidelines to prevent code execution in spreadsheet software (Microsoft Excel, LibreOffice, Google Sheets).
- **Privacy-Preserving Integrations**: Geographic queries and map lookups transmit solely educational institution names without packaging student identity or demographic data.
- **Client-Side Ownership**: All profile details, saved bookmarks, and application tracking records are maintained in local browser storage, giving users full ownership and portability via JSON backup/restore.

---

## 🤝 Contributing

Contributions make the open-source community an inspiring place to learn and build:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Run tests and linting (`npm run test` and `npm run lint`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
