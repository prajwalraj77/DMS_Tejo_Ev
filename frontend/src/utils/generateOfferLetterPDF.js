
import {
  COMPANY,
  HEADER_BOTTOM,
  addTitle,
  addSection,
  addClause,
  addSignature,
  createPDF,
  drawHeader,
  finishPDF,
  getToday,
  loadLogo,
  money,
} from "./pdfCommon.js";

// Salary and compensation details
function addCompensation(doc, logo, employee, y) {
  const monthlySalary = Number(employee.monthlySalary) || 0;

  const annualSalary =
    employee.annualCTC !== undefined &&
    employee.annualCTC !== null &&
    employee.annualCTC !== ""
      ? employee.annualCTC
      : monthlySalary * 12;

  return addSection(
    doc,
    logo,
    "SALARY AND PERFORMANCE-BASED REMUNERATION",
    [
      ["Monthly Salary", money(employee.monthlySalary)],
      ["Annual Salary", money(annualSalary)],
      [
        "Performance-Based Conditions",
        "Performance evaluation may consider individual performance, achievement of assigned targets, productivity, quality of work and applicable company evaluation criteria. Variable incentives, where applicable, are governed by a separately communicated incentive scheme and its eligibility conditions.",
      ],
      [
        "Salary Review",
        "The company may review compensation based on performance and business requirements. Any change to fixed salary will apply prospectively, must be lawfully agreed in writing and must comply with applicable statutory wage requirements. No retrospective performance-based deduction or reduction of earned wages will be imposed.",
      ],
    ],
    y
  );
}

// Notice period and probation
function addEmploymentConditions(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "NOTICE PERIOD AND EMPLOYMENT CONDITIONS",
    [
      "The probationary period will be six (6) calendar months from the date of joining. Confirmation will be subject to the company's assessment and applicable employment procedures.",

      "The contractual notice period is sixty (60) calendar days during probation and thirty (30) calendar days after confirmation, for either party, subject to applicable employment terms and law.",

      "Any recovery for an unserved notice period or unreturned or damaged company property must be supported by applicable contractual terms, appropriate documentation and lawful deductions.",
    ],
    y
  );
}

// Performance standards and improvement
function addPerformance(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "PERFORMANCE STANDARDS AND IMPROVEMENT PLAN",
    [
      "The employee is expected to perform assigned responsibilities professionally, achieve applicable key performance indicators (KPIs), follow authorized business procedures and maintain accurate work records.",

      "Where performance falls below the applicable operational benchmark, the company may issue a written notice or Performance Improvement Plan (PIP). The notice should identify the performance deficiency, expected improvement, support or training provided, review period and review date.",

      "The usual improvement period may be seven (7) to fourteen (14) calendar days, with a reasonable extension where appropriate to the role and circumstances.",

      "If performance remains unsatisfactory after documented assessment, feedback and a reasonable opportunity to improve, the company may take further appropriate action, including termination, subject to the employment terms, applicable notice requirements and law.",

      "Performance outcomes may be considered for confirmation, appraisal and separately communicated variable incentives. Missing a target or KPI does not automatically result in forfeiture of earned fixed salary.",
    ],
    y
  );
}

// Offer withdrawal before joining
function addOfferWithdrawal(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "OFFER WITHDRAWAL BEFORE JOINING",
    [
      "The company may withdraw or revoke this employment offer before the proposed joining date if information supplied by the candidate is found to be false, misleading or materially incomplete; if the candidate fails to satisfy applicable joining requirements; or if genuine business or operational circumstances require the company to reconsider the offer.",

      "Any such withdrawal or revocation will be communicated to the candidate in writing and will remain subject to applicable law.",
    ],
    y
  );
}

// Confidentiality and company information
function addConfidentiality(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "CONFIDENTIALITY AND COMPANY DATA PROTECTION",
    [
      "The employee must protect confidential company information, business strategies, pricing information, supplier details, customer databases, business records and software systems belonging to NV EV TECH PRIVATE LIMITED and TEJO EV.",

      "Confidential information must not be disclosed, copied, transferred, retained or used for unauthorized purposes during employment or after its termination, subject to applicable law.",

      "Diverting prospective EV customers, business leads or customer inquiries to third parties, competitors or unauthorized personal channels is prohibited.",
    ],
    y
  );
}

// POSH contact and policy
function addPOSH(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "PREVENTION OF SEXUAL HARASSMENT (POSH)",
    [
      "The company prohibits sexual harassment at the workplace, during work-related travel, through online communications or at work-connected events.",

      `Complaints may be submitted through the designated company email address: ${COMPANY.poshEmail}.`,

      "Complaints and inquiries will be handled in accordance with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, applicable rules, confidentiality requirements and principles of natural justice.",
    ],
    y
  );
}

// Applicable statutory references
function addStatutoryReferences(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "STATUTORY AND REGULATORY REFERENCES",
    [
      "Employment terms and company policies are subject to applicable central and state laws and rules, including relevant provisions of the Code on Wages, 2019, Karnataka Shops and Commercial Establishments Act, 1961, POSH Act, 2013, Bharatiya Nyaya Sanhita, 2023 and Information Technology Act, 2000, as applicable.",
    ],
    y
  );
}

// Main Offer Letter PDF generator
export async function generateOfferLetterPDF(employee) {
  if (!employee) {
    throw new Error("Employee details are missing.");
  }

  const logo = await loadLogo();
  const doc = createPDF();

  drawHeader(doc, logo);

  let y = addTitle(
    doc,
    "OFFER LETTER",
    "EMPLOYMENT OFFER AND TERMS",
    HEADER_BOTTOM + 10
  );

  // Offer reference
  y = addSection(
    doc,
    logo,
    "OFFER REFERENCE",
    [
      ["Company Reference", COMPANY.reference],
      ["Offer Issue Date", getToday()],
      ["Employee ID", employee.employeeId],
      ["Candidate Name", employee.fullName],
      ["Proposed Joining Date", employee.joiningDate],
    ],
    y
  );

  // Candidate information
  y = addSection(
    doc,
    logo,
    "CANDIDATE INFORMATION",
    [
      ["Full Name", employee.fullName],
      ["Email", employee.email],
      ["Contact Number", employee.phone],
      ["Residential Address", employee.currentAddress],
    ],
    y
  );

  // Position details
  y = addSection(
    doc,
    logo,
    "1. OFFER AND POSITION DETAILS",
    [
      ["Designation", employee.designation],
      ["Department", employee.department],
      ["Employment Type", employee.employmentType],
      ["Work Location", employee.workLocation],
      ["Reporting Authority", employee.reportingManager],
      ["Probationary Period", "Six (6) calendar months"],
      ["Job Responsibilities", employee.responsibilities],
    ],
    y
  );

  // Salary
  y = addCompensation(doc, logo, employee, y);

  // Employment conditions
  y = addEmploymentConditions(doc, logo, y);

  // Performance standards
  y = addPerformance(doc, logo, y);

  // Confidentiality
  y = addConfidentiality(doc, logo, y);

  // Offer withdrawal condition
  y = addOfferWithdrawal(doc, logo, y);

  // POSH
  y = addPOSH(doc, logo, y);

  // Statutory references
  y = addStatutoryReferences(doc, logo, y);

  // Employee and company acknowledgement
  addSignature(doc, logo, employee, y, false);

  // Save PDF
  finishPDF(doc, employee, "Offer_Letter");
}

export default generateOfferLetterPDF;
