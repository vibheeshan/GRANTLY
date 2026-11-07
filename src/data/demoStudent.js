/**
 * Demo student profile and initial setup for GRANTLY 2.0
 */

export const INITIAL_STUDENT_PROFILE = {
  name: "Aarav Sharma",
  email: "aarav.sharma@demo.edu",
  phone: "+91 98765 43210",
  educationLevel: "Undergraduate",
  course: "Engineering",
  specialization: "Computer Science & Engineering",
  institution: "Apex Institute of Technology, Pune",
  state: "Maharashtra",
  academicPercentage: 82.5,
  familyIncome: 450000,
  category: "STEM",
  firstGeneration: false,
  gender: "Male",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  bio: "Pre-final year engineering student passionate about distributed systems and AI. Seeking merit and CSR fellowships to support university tuition.",
  completedProfile: true,
  targetFundingGoal: 300000
};

export const INITIAL_DOCUMENT_CHECKLIST = [
  {
    id: "doc-1",
    name: "Previous Year Academic Marksheet",
    category: "Academic",
    description: "Official transcript or semester grade cards showing latest CGPA/percentage.",
    isReady: true,
    fileDetails: "Semester_5_GradeCard_82.5.pdf (1.2 MB)",
    lastUpdated: "2026-11-01",
    expiryDate: "2027-08-31",
    issuingAuthority: "Apex Institute Controller of Examinations"
  },
  {
    id: "doc-2",
    name: "Annual Family Income Certificate",
    category: "Financial",
    description: "Certified certificate issued by competent authority (Tahsildar / Revenue Department / Form 16).",
    isReady: true,
    fileDetails: "Income_Certificate_FY26.pdf (850 KB)",
    lastUpdated: "2026-10-15",
    expiryDate: "2027-03-31",
    issuingAuthority: "Tahsildar Office, Pune District"
  },
  {
    id: "doc-3",
    name: "Government Photo ID (Aadhaar / Passport)",
    category: "Identity",
    description: "Clear scan of Aadhaar Card, Passport, or Voter ID with date of birth.",
    isReady: true,
    fileDetails: "Aadhaar_Card_Verified.pdf (620 KB)",
    lastUpdated: "2026-09-20",
    expiryDate: "2032-12-31",
    issuingAuthority: "UIDAI (Govt of India)"
  },
  {
    id: "doc-4",
    name: "College Admission Letter & ID Card",
    category: "Institutional",
    description: "Official admission allotment letter along with current student ID card.",
    isReady: true,
    fileDetails: "Apex_Admission_ID_2026.pdf (1.4 MB)",
    lastUpdated: "2026-10-05",
    expiryDate: "2027-06-30",
    issuingAuthority: "Apex Institute Academic Dean"
  },
  {
    id: "doc-5",
    name: "Active Bank Account Passbook / Statement",
    category: "Financial",
    description: "Bank passbook front page or cancelled cheque showing IFSC code and account number in applicant's name.",
    isReady: true,
    fileDetails: "SBI_Passbook_Aarav.pdf (780 KB)",
    lastUpdated: "2026-11-02",
    expiryDate: "2028-12-31",
    issuingAuthority: "State Bank of India (Pune Branch)"
  },
  {
    id: "doc-6",
    name: "State Domicile Certificate",
    category: "Identity",
    description: "Official certificate proving residency in the state.",
    isReady: true,
    fileDetails: "Maharashtra_Domicile_Cert.pdf (910 KB)",
    lastUpdated: "2026-08-14",
    expiryDate: "2035-08-14",
    issuingAuthority: "Sub-Divisional Magistrate, Maharashtra"
  },
  {
    id: "doc-7",
    name: "Bonafide Student Certificate",
    category: "Institutional",
    description: "Fresh certificate stamped and signed by the college principal / registrar for current academic year.",
    isReady: false,
    fileDetails: null,
    lastUpdated: null,
    expiryDate: "2027-05-31",
    issuingAuthority: "Principal Office, Apex Institute"
  },
  {
    id: "doc-8",
    name: "Statement of Purpose (SOP)",
    category: "Academic",
    description: "Personal essay articulating career aspirations, financial context, and why you deserve the grant.",
    isReady: false,
    fileDetails: null,
    lastUpdated: null,
    expiryDate: null,
    issuingAuthority: "Applicant Self-Declaration"
  }
];

export const INITIAL_APPLICATIONS = [
  {
    id: "app-101",
    scholarshipId: "sch-001",
    scholarshipTitle: "Apex NextGen STEM Excellence Fellowship",
    provider: "Apex Global Technology Foundation (Demo)",
    awardAmount: 120000,
    currency: "₹",
    status: "Under Review", // "Saved" | "Applying" | "Submitted" | "Under Review" | "Awarded" | "Rejected"
    appliedDate: "2026-11-02",
    deadline: "2026-11-28",
    notes: "Submitted all documents online. Technical assessment completed; waiting for interview shortlist.",
    matchScore: 95,
    milestones: [
      { id: "m-1", label: "Application Drafted", completed: true, date: "2026-10-28" },
      { id: "m-2", label: "Dossier Documents Verified", completed: true, date: "2026-11-01" },
      { id: "m-3", label: "Online Submission Dispatched", completed: true, date: "2026-11-02" },
      { id: "m-4", label: "Committee Scrutiny & Interview", completed: false, date: "2026-11-20" },
      { id: "m-5", label: "Final Award Disbursement", completed: false, date: "2026-12-10" }
    ],
    history: [
      { status: "Applying", date: "2026-10-28", note: "Started drafting application dossier." },
      { status: "Submitted", date: "2026-11-02", note: "All attested marksheets uploaded successfully." },
      { status: "Under Review", date: "2026-11-05", note: "Document scrutiny cleared. Assigned to tech evaluation panel." }
    ]
  },
  {
    id: "app-102",
    scholarshipId: "sch-003",
    scholarshipTitle: "Maharashtra Medha Rural Talent Grant",
    provider: "Maharashtra Educational Development Trust (Demo)",
    awardAmount: 60000,
    currency: "₹",
    status: "Submitted",
    appliedDate: "2026-11-04",
    deadline: "2026-12-15",
    notes: "Physical verification slip dispatched to district education bureau in Pune.",
    matchScore: 88,
    milestones: [
      { id: "m-1", label: "Application Drafted", completed: true, date: "2026-11-01" },
      { id: "m-2", label: "Dossier Documents Verified", completed: true, date: "2026-11-03" },
      { id: "m-3", label: "Online Submission Dispatched", completed: true, date: "2026-11-04" },
      { id: "m-4", label: "District Education Scrutiny", completed: false, date: "2026-11-25" },
      { id: "m-5", label: "Direct Benefit Transfer", completed: false, date: "2026-12-20" }
    ],
    history: [
      { status: "Applying", date: "2026-11-01", note: "Verified domicile eligibility." },
      { status: "Submitted", date: "2026-11-04", note: "Form dispatched with Tahsildar income slip." }
    ]
  },
  {
    id: "app-103",
    scholarshipId: "sch-009",
    scholarshipTitle: "Kalam Aerospace & Defense Young Scholar Award",
    provider: "AeroTech Frontier Foundation (Demo)",
    awardAmount: 200000,
    currency: "₹",
    status: "Applying",
    appliedDate: null,
    deadline: "2027-02-05",
    notes: "Drafting the capstone project abstract with professor recommendation letter.",
    matchScore: 85,
    milestones: [
      { id: "m-1", label: "Application Drafted", completed: true, date: "2026-11-06" },
      { id: "m-2", label: "Capstone Abstract Completed", completed: false, date: "2026-12-01" },
      { id: "m-3", label: "Faculty Endorsement Acquired", completed: false, date: "2026-12-15" },
      { id: "m-4", label: "Formal Portal Submission", completed: false, date: "2027-01-10" },
      { id: "m-5", label: "Defense Panel Review", completed: false, date: "2027-02-15" }
    ],
    history: [
      { status: "Applying", date: "2026-11-06", note: "Initiated application and flagged capstone portfolio requirement." }
    ]
  }
];

export const INITIAL_SAVED_IDS = ["sch-001", "sch-003", "sch-009", "sch-012"];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    category: "deadline",
    title: "Apex Fellowship Closing in 21 Days",
    message: "Submission deadline for Apex NextGen STEM Fellowship is November 28, 2026. Review your application status.",
    timestamp: "2026-11-07T00:30:00Z",
    read: false,
    link: "/scholarship/sch-001"
  },
  {
    id: "notif-2",
    category: "application",
    title: "Application Moved to 'Under Review'",
    message: "Apex NextGen STEM Excellence Fellowship application transitioned to Under Review stage.",
    timestamp: "2026-11-05T14:30:00Z",
    read: false,
    link: "/applications"
  },
  {
    id: "notif-3",
    category: "document",
    title: "Document Missing for 100% Dossier",
    message: "Bonafide Student Certificate is required for 2 of your bookmarked scholarships. Request from college registrar.",
    timestamp: "2026-11-04T11:00:00Z",
    read: true,
    link: "/documents"
  },
  {
    id: "notif-4",
    category: "recommendation",
    title: "New 100% Compatible Match Found",
    message: "Based on your 82.5% engineering marks, Green Earth Sustainable Energy Scholarship matches all parameters.",
    timestamp: "2026-11-03T09:15:00Z",
    read: true,
    link: "/scholarship/sch-012"
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    type: "status_change",
    title: "Application status updated to Under Review",
    subtitle: "Apex NextGen STEM Excellence Fellowship",
    timestamp: "2026-11-05T14:30:00Z"
  },
  {
    id: "act-2",
    type: "document_checked",
    title: "Document verified & marked ready",
    subtitle: "Active Bank Account Passbook / Statement",
    timestamp: "2026-11-02T10:15:00Z"
  },
  {
    id: "act-3",
    type: "saved",
    title: "Saved new opportunity",
    subtitle: "Green Earth Sustainable Energy Scholarship",
    timestamp: "2026-11-01T09:00:00Z"
  }
];
