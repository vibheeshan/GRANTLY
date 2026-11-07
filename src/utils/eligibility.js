/**
 * Deterministic Rule-Based Eligibility Engine & Match DNA for GRANTLY 2.0
 * 
 * Evaluates candidate profile against criteria:
 * - Education level compatibility (20%)
 * - Course / Branch compatibility (20%)
 * - Location / State residency compatibility (20%)
 * - Academic percentage compatibility (20%)
 * - Annual family income ceiling compatibility (20%)
 * - Cross-checked Document Dossier Readiness (0-100% of required certificates)
 * 
 * IMPORTANT:
 * - A high match percentage does NOT equal official eligibility approval.
 * - Missing profile fields are flagged clearly.
 * - If mandatory criteria fail, isFullyEligible is strictly false.
 */

export const ELIGIBILITY_DISCLAIMER =
  "Match score and Match DNA evaluations are deterministic automated simulations based on demonstration data. They do not constitute official scholarship sanction or grant guarantees.";

/**
 * Evaluates a single student profile against a single scholarship
 * @param {Object} student - Student profile
 * @param {Object} scholarship - Scholarship object
 * @param {Array} userDocuments - User's current documents checklist
 * @returns {Object} detailed eligibility and Match DNA breakdown
 */
export function evaluateEligibility(student, scholarship, userDocuments = []) {
  if (!scholarship) {
    return {
      matchScore: 0,
      isFullyEligible: false,
      matchedCriteria: [],
      unmatchedCriteria: [],
      missingProfileFields: ["Scholarship record unavailable"],
      explanation: "No scholarship data provided for evaluation.",
      disclaimer: ELIGIBILITY_DISCLAIMER,
      dna: null,
      documentReadiness: { percentage: 0, readyCount: 0, totalCount: 0, missingDocs: [] }
    };
  }

  const profile = student || {};
  const missingFields = [];

  // Check profile completeness
  if (!profile.educationLevel) missingFields.push("Education Level");
  if (!profile.course) missingFields.push("Course / Specialization");
  if (!profile.state) missingFields.push("State of Residence");
  if (profile.academicPercentage === undefined || profile.academicPercentage === null || isNaN(Number(profile.academicPercentage))) {
    missingFields.push("Academic Percentage");
  }
  if (profile.familyIncome === undefined || profile.familyIncome === null || isNaN(Number(profile.familyIncome))) {
    missingFields.push("Annual Family Income");
  }

  // Weightings for score computation (total = 100)
  // Education Level: 20
  // Course: 20
  // State: 20
  // Academic Percentage: 20
  // Income Limit: 20
  let earnedScore = 0;
  const matchedCriteria = [];
  const unmatchedCriteria = [];

  // 1. Education Level Check (20 pts)
  const reqLevels = scholarship.educationLevels || [];
  const studentLevel = (profile.educationLevel || "").trim();
  const levelMatches =
    reqLevels.length === 0 ||
    reqLevels.includes("All Levels") ||
    (studentLevel && reqLevels.some(l => l.toLowerCase() === studentLevel.toLowerCase()));

  const educationDna = {
    title: "Education Compatibility",
    score: levelMatches && studentLevel ? 20 : 0,
    maxScore: 20,
    passed: Boolean(levelMatches && studentLevel),
    required: reqLevels.join(", "),
    actual: studentLevel || "Not provided",
    details: levelMatches && studentLevel
      ? `Student is enrolled in ${studentLevel}, which qualifies for ${reqLevels.join(", ")}.`
      : `Program requires ${reqLevels.join(", ")}, but current profile is ${studentLevel || "unspecified"}.`
  };

  if (educationDna.passed) {
    earnedScore += 20;
    matchedCriteria.push({
      criterion: "Education Level",
      required: reqLevels.join(", "),
      actual: studentLevel,
      status: "Passed",
      note: educationDna.details
    });
  } else {
    unmatchedCriteria.push({
      criterion: "Education Level",
      required: reqLevels.join(", "),
      actual: studentLevel || "Not provided",
      status: "Failed",
      mandatory: true,
      reason: educationDna.details
    });
  }

  // 2. Course / Discipline Check (20 pts)
  const reqCourses = scholarship.eligibleCourses || [];
  const studentCourse = (profile.course || "").trim();
  const courseMatches =
    reqCourses.length === 0 ||
    reqCourses.includes("All Courses") ||
    (studentCourse && reqCourses.some(c => c.toLowerCase() === studentCourse.toLowerCase()));

  const courseDna = {
    title: "Course Compatibility",
    score: courseMatches && studentCourse ? 20 : 0,
    maxScore: 20,
    passed: Boolean(courseMatches && studentCourse),
    required: reqCourses.join(", "),
    actual: studentCourse || "Not provided",
    details: courseMatches && studentCourse
      ? `Enrolled discipline (${studentCourse}) is fully supported by this program.`
      : `Restricted to [${reqCourses.join(", ")}]. Enrolled discipline is ${studentCourse || "unspecified"}.`
  };

  if (courseDna.passed) {
    earnedScore += 20;
    matchedCriteria.push({
      criterion: "Eligible Course",
      required: reqCourses.join(", "),
      actual: studentCourse,
      status: "Passed",
      note: courseDna.details
    });
  } else {
    unmatchedCriteria.push({
      criterion: "Eligible Course",
      required: reqCourses.join(", "),
      actual: studentCourse || "Not provided",
      status: "Failed",
      mandatory: true,
      reason: courseDna.details
    });
  }

  // 3. State / Regional Domicile Check (20 pts)
  const reqStates = scholarship.states || [];
  const studentState = (profile.state || "").trim();
  const stateMatches =
    reqStates.length === 0 ||
    reqStates.includes("All India") ||
    (studentState && reqStates.some(s => s.toLowerCase() === studentState.toLowerCase()));

  const locationDna = {
    title: "Location & Domicile Compatibility",
    score: stateMatches && studentState ? 20 : 0,
    maxScore: 20,
    passed: Boolean(stateMatches && studentState),
    required: reqStates.join(", "),
    actual: studentState || "Not provided",
    details: stateMatches && studentState
      ? reqStates.includes("All India")
        ? `Open nationwide (Student domiciled in ${studentState}).`
        : `Applicant holds required state domicile in ${studentState}.`
      : `Open only to candidates from [${reqStates.join(", ")}]. Profile state is ${studentState || "unspecified"}.`
  };

  if (locationDna.passed) {
    earnedScore += 20;
    matchedCriteria.push({
      criterion: "State Domicile",
      required: reqStates.join(", "),
      actual: studentState,
      status: "Passed",
      note: locationDna.details
    });
  } else {
    unmatchedCriteria.push({
      criterion: "State Domicile",
      required: reqStates.join(", "),
      actual: studentState || "Not provided",
      status: "Failed",
      mandatory: true,
      reason: locationDna.details
    });
  }

  // 4. Academic Percentage Check (20 pts)
  const minPercent = Number(scholarship.minimumPercentage) || 0;
  const studentPercent = Number(profile.academicPercentage);
  const hasValidPercent = !isNaN(studentPercent) && profile.academicPercentage !== undefined;
  const academicPass = hasValidPercent && studentPercent >= minPercent;

  const academicDna = {
    title: "Academic Standing Compatibility",
    score: academicPass ? 20 : 0,
    maxScore: 20,
    passed: academicPass,
    required: `Minimum ${minPercent}%`,
    actual: hasValidPercent ? `${studentPercent}%` : "Not provided",
    details: academicPass
      ? `Academic record (${studentPercent}%) satisfies the minimum requirement of ${minPercent}%.`
      : hasValidPercent
        ? `Score of ${studentPercent}% is below the mandatory threshold (${minPercent}%).`
        : "Academic marks percentage is missing from profile."
  };

  if (academicPass) {
    earnedScore += 20;
    matchedCriteria.push({
      criterion: "Academic Merit",
      required: `Minimum ${minPercent}%`,
      actual: `${studentPercent}%`,
      status: "Passed",
      note: academicDna.details
    });
  } else {
    unmatchedCriteria.push({
      criterion: "Academic Merit",
      required: `Minimum ${minPercent}%`,
      actual: hasValidPercent ? `${studentPercent}%` : "Not provided",
      status: "Failed",
      mandatory: true,
      reason: academicDna.details
    });
  }

  // 5. Family Income Ceiling Check (20 pts)
  const maxIncome = Number(scholarship.maximumFamilyIncome) || Infinity;
  const studentIncome = Number(profile.familyIncome);
  const hasValidIncome = !isNaN(studentIncome) && profile.familyIncome !== undefined;
  const incomePass = hasValidIncome && studentIncome <= maxIncome;

  const incomeDna = {
    title: "Income Ceiling Compatibility",
    score: incomePass ? 20 : 0,
    maxScore: 20,
    passed: incomePass,
    required: maxIncome === Infinity ? "No ceiling" : `Max ₹${maxIncome.toLocaleString("en-IN")}`,
    actual: hasValidIncome ? `₹${studentIncome.toLocaleString("en-IN")}` : "Not provided",
    details: incomePass
      ? `Annual household income (₹${studentIncome.toLocaleString("en-IN")}) is within the allowable limit of ₹${maxIncome.toLocaleString("en-IN")}.`
      : hasValidIncome
        ? `Annual household income (₹${studentIncome.toLocaleString("en-IN")}) exceeds ceiling limit of ₹${maxIncome.toLocaleString("en-IN")}.`
        : "Annual family income not specified."
  };

  if (incomePass) {
    earnedScore += 20;
    matchedCriteria.push({
      criterion: "Family Income Limit",
      required: maxIncome === Infinity ? "No cap" : `Up to ₹${maxIncome.toLocaleString("en-IN")}`,
      actual: `₹${studentIncome.toLocaleString("en-IN")}`,
      status: "Passed",
      note: incomeDna.details
    });
  } else {
    unmatchedCriteria.push({
      criterion: "Family Income Limit",
      required: maxIncome === Infinity ? "No cap" : `Up to ₹${maxIncome.toLocaleString("en-IN")}`,
      actual: hasValidIncome ? `₹${studentIncome.toLocaleString("en-IN")}` : "Not provided",
      status: "Failed",
      mandatory: true,
      reason: incomeDna.details
    });
  }

  // 6. Cross-check Document Dossier Readiness for THIS scholarship
  const requiredDocs = scholarship.requiredDocuments || [];
  let readyDocsCount = 0;
  const missingDocs = [];

  requiredDocs.forEach(reqDocName => {
    // Check if user has a document that matches (fuzzy or exact) and isReady === true
    const foundDoc = userDocuments.find(d =>
      d.name.toLowerCase().includes(reqDocName.toLowerCase()) ||
      reqDocName.toLowerCase().includes(d.name.toLowerCase()) ||
      (reqDocName.toLowerCase().includes("income") && d.category === "Financial") ||
      (reqDocName.toLowerCase().includes("marksheet") && d.category === "Academic") ||
      (reqDocName.toLowerCase().includes("id") && d.category === "Identity")
    );

    if (foundDoc && foundDoc.isReady) {
      readyDocsCount++;
    } else {
      missingDocs.push(reqDocName);
    }
  });

  const docReadinessPct = requiredDocs.length > 0
    ? Math.round((readyDocsCount / requiredDocs.length) * 100)
    : 100;

  const documentDna = {
    title: "Document Dossier Readiness",
    score: docReadinessPct,
    maxScore: 100,
    passed: docReadinessPct >= 80,
    required: `${requiredDocs.length} certificates`,
    actual: `${readyDocsCount}/${requiredDocs.length} ready (${docReadinessPct}%)`,
    details: docReadinessPct === 100
      ? "All required certificates are verified in your personal dossier."
      : `${missingDocs.length} required document(s) still pending in Document Manager.`
  };

  // Determine full eligibility:
  // Is fully eligible ONLY if all 5 mandatory criteria are satisfied AND no required profile fields are missing
  const isFullyEligible =
    educationDna.passed &&
    courseDna.passed &&
    locationDna.passed &&
    academicDna.passed &&
    incomeDna.passed &&
    missingFields.length === 0;

  // Explanation string
  let explanation = "";
  if (missingFields.length > 0) {
    explanation = `Evaluation incomplete: Please provide ${missingFields.join(", ")} in your student profile.`;
  } else if (isFullyEligible) {
    explanation = `100% Eligible: You satisfy all 5 mandatory eligibility criteria for ${scholarship.title}. Document readiness is currently at ${docReadinessPct}%.`;
  } else {
    const failedList = unmatchedCriteria.map(c => c.criterion).join(", ");
    explanation = `Criteria unmet: Unmatched parameters (${failedList}). Mandatory eligibility requirements are not satisfied.`;
  }

  const dna = {
    education: educationDna,
    course: courseDna,
    location: locationDna,
    academic: academicDna,
    income: incomeDna,
    documentReadiness: documentDna,
    overallScore: earnedScore
  };

  return {
    matchScore: earnedScore,
    isFullyEligible,
    matchedCriteria,
    unmatchedCriteria,
    missingProfileFields: missingFields,
    explanation,
    disclaimer: ELIGIBILITY_DISCLAIMER,
    dna,
    documentReadiness: {
      percentage: docReadinessPct,
      readyCount: readyDocsCount,
      totalCount: requiredDocs.length,
      missingDocs
    }
  };
}

/**
 * Filter and sort scholarships for a student profile
 */
export function rankScholarshipsForStudent(student, scholarships = [], userDocuments = []) {
  if (!scholarships || !Array.isArray(scholarships)) return [];

  return scholarships.map(scholarship => {
    const evaluation = evaluateEligibility(student, scholarship, userDocuments);
    return {
      ...scholarship,
      evaluation,
      matchScore: evaluation.matchScore,
      isFullyEligible: evaluation.isFullyEligible,
      documentReadiness: evaluation.documentReadiness,
      dna: evaluation.dna
    };
  }).sort((a, b) => {
    // Eligible first, then highest match score, then award amount
    if (a.isFullyEligible !== b.isFullyEligible) {
      return a.isFullyEligible ? -1 : 1;
    }
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (b.awardAmount || 0) - (a.awardAmount || 0);
  });
}

/**
 * Detailed 5-vector Match DNA evaluation for Match DNA pages and modals
 */
export function evaluateMatchDNA(scholarship, student, userDocuments = []) {
  const evalResult = evaluateEligibility(student, scholarship, userDocuments);
  const dna = evalResult.dna || {};
  const docR = evalResult.documentReadiness || {};

  const matchedRequirements = evalResult.matchedCriteria.map(c => ({
    label: c.criterion,
    value: c.message || `${c.criterion} criteria satisfied`
  }));

  const unmatchedRequirements = evalResult.unmatchedCriteria.map(c => ({
    label: c.criterion,
    reason: c.message || `${c.criterion} requirement not met`
  }));

  return {
    overallScore: evalResult.matchScore,
    isFullyEligible: evalResult.isFullyEligible,
    summaryExplanation: evalResult.explanation,
    disclaimer: evalResult.disclaimer,
    matchedRequirements,
    unmatchedRequirements,
    vectors: {
      educationLevel: {
        score: dna.education?.passed ? 100 : Math.round((dna.education?.score / dna.education?.maxScore) * 100) || 0,
        passed: Boolean(dna.education?.passed),
        detail: dna.education?.detail || "Education level evaluation"
      },
      academicMerit: {
        score: dna.academic?.passed ? 100 : Math.round((dna.academic?.score / dna.academic?.maxScore) * 100) || 0,
        passed: Boolean(dna.academic?.passed),
        detail: dna.academic?.detail || "Academic criteria evaluation"
      },
      familyIncome: {
        score: dna.income?.passed ? 100 : Math.round((dna.income?.score / dna.income?.maxScore) * 100) || 0,
        passed: Boolean(dna.income?.passed),
        detail: dna.income?.detail || "Income ceiling evaluation"
      },
      stateDomicile: {
        score: dna.location?.passed ? 100 : Math.round((dna.location?.score / dna.location?.maxScore) * 100) || 0,
        passed: Boolean(dna.location?.passed),
        detail: dna.location?.detail || "Domicile residency evaluation"
      },
      documentDossier: {
        score: docR.percentage || 0,
        passed: (docR.percentage || 0) >= 80,
        detail: `${docR.readyCount || 0} of ${docR.totalCount || 0} required certificates verified in dossier`
      }
    }
  };
}
