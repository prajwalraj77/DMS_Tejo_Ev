
import {
  COMPANY,
  HEADER_BOTTOM,
  MARGIN,
  PAGE_WIDTH,
  C,
  addTitle,
  addSection,
  addDataTable,
  addClause,
  createPDF,
  drawHeader,
  drawFooter,
  loadLogo,
  getToday,
  money,
  value,
  safeFileName,
} from "./pdfCommon.js";

// --------------------------------------------------
// 1. SALARY AND PERFORMANCE-BASED REMUNERATION
// --------------------------------------------------

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
        "Performance Conditions",
        "Performance affects confirmation, appraisal and separately notified variable incentives. Earned fixed salary is not automatically forfeited for missed targets or poor performance.",
      ],
      [
        "Salary Review",
        "Any change to fixed salary must be prospective, lawfully agreed in writing and comply with statutory wage requirements. No retrospective performance penalty is authorised.",
      ],
    ],
    y
  );
}

// --------------------------------------------------
// 2. PROBATION AND PERFORMANCE
// --------------------------------------------------

function addProbationAndPerformance(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "3. PROBATION AND PERFORMANCE",
    [
      "Probation is six (6) calendar months from joining. Confirmation is subject to a documented assessment and applicable law. The company will communicate duties, reasonable targets, working arrangements and the reporting manager in writing.",

      "Below-standard performance will ordinarily be addressed through feedback and a written Performance Improvement Plan (PIP), normally allowing seven (7) to fourteen (14) calendar days, with a reasonable extension where the task, training needs or circumstances require it.",

      "If performance remains unsatisfactory after documented assessment, feedback and a reasonable opportunity to improve, the company may take further action, including termination, subject to employment terms, applicable notice requirements and law.",

      "Performance affects confirmation, appraisal and separately notified variable incentives. Earned fixed salary is not automatically forfeited for missed targets or poor performance.",
    ],
    y
  );
}

// --------------------------------------------------
// 3. PRODUCT TRAINING
// --------------------------------------------------

function addProductTraining(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "4. PRODUCT TRAINING AND PROFESSIONAL COMPETENCE",
    [
      "The employee is appointed as an experienced employee in the designated role and must apply the experience and skills represented during recruitment. Previous experience does not remove the obligation to learn TEJO EV products, current variants, company procedures and authorised work practices.",

      "The company will provide relevant product literature, specifications, price lists, warranty terms, approved sales material, demonstrations and access to required systems. The employee must attend assigned training, study updates promptly and ask for clarification whenever information is unclear.",

      "After the initial training or field orientation, the employee must demonstrate the ability to explain product features, battery capacity, charging, range qualifications, warranty exclusions, service arrangements, booking and payment conditions accurately. New or changed products must be learned within reasonable deadlines communicated by the manager, taking account of complexity and the material supplied.",

      "Completion will be assessed through a recorded demonstration, product explanation, supervised customer interaction or written assessment against communicated criteria. Training gaps will be documented and reasonable support provided.",

      "Knowingly false claims of experience or deliberate refusal to complete reasonable training may be examined as misconduct; inability alone is a performance matter.",
    ],
    y
  );
}

// --------------------------------------------------
// 4. WORKING HOURS AND CUSTOMER INFORMATION
// --------------------------------------------------

function addWorkingHours(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "5. WORKING HOURS, DILIGENCE AND CUSTOMER INFORMATION",
    [
      "During scheduled working hours, the employee must attend assigned duties, respond to customer enquiries, complete follow-ups and maintain truthful activity records. Deliberate or repeated idling, sleeping on duty, refusal of lawful instructions or leaving the assigned workplace without approval may attract proportionate disciplinary action after the procedure in clause 11.",

      "Authorised breaks, approved leave, genuine illness, reasonable accommodations, lack of assigned work, lack of customers and system or material unavailability must be considered. Merely sitting at a desk, a missed sales target or a short CCTV extract does not by itself establish wilful neglect.",

      "The employee must not knowingly mislead customers, HR or management about specifications, prices, discounts, warranties, delivery dates, payment receipts, attendance, calls, leads, stock or completed work. Unverified claims must be escalated for confirmation. Errors must be reported and corrected promptly; intentional falsification and honest mistakes will be assessed separately.",
    ],
    y
  );
}

// --------------------------------------------------
// 5. CCTV AND SYSTEM RECORDS
// --------------------------------------------------

function addCCTV(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "6. CCTV, SYSTEM RECORDS AND EVIDENCE",
    [
      "The company may use disclosed CCTV in appropriate workplace areas and authorised attendance, CRM/DMS and business communication records for security, service quality and investigation. Monitoring must be necessary, proportionate and lawful, with restricted access and defined retention. No surveillance is authorised in toilets, changing areas or other private spaces.",

      "Relevant footage, timestamps, original records, manager observations and available corroboration will be preserved and considered together with the employee's explanation. Manager reports are evidence, not a conclusive finding. Electronic records relied on in legal proceedings must meet applicable authenticity and certification requirements, including section 63 of the Bharatiya Sakshya Adhiniyam, 2023.",
    ],
    y
  );
}

// --------------------------------------------------
// 6. NOTICE, ABSENCE AND EXIT
// --------------------------------------------------

function addNoticeAndExit(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "7. NOTICE, UNAUTHORISED ABSENCE AND EXIT",
    [
      "The existing contractual notice periods are retained: sixty (60) calendar days during probation and thirty (30) calendar days after confirmation, for either party, subject to applicable law and any more favourable statutory entitlement. Resignation must be submitted in writing to HR or the reporting authority. Any waiver, reduction or pay-in-lieu arrangement must be documented.",

      "The employee must obtain approval before leaving duty or taking leave, except where a genuine emergency makes prior approval impracticable; in that event, the employee must inform the company as soon as reasonably possible and provide available supporting information.",

      "Three (3) consecutive scheduled working days of unexplained absence may trigger a welfare/contact check and an unauthorised-absence review. HR will send a written notice through recorded contact channels stating the absence, requesting an explanation and return-to-duty response, and allowing a reasonable response period, ordinarily at least seven (7) calendar days from delivery or documented reasonable service attempts.",

      "There is no automatic declaration of resignation, abandonment or 'absconding' solely because three days have elapsed. Medical emergencies, inability to communicate and other explanations will be assessed. Any final finding must follow fair procedure and a reasoned written decision. Leaving employment or failing to serve notice is not by itself a criminal offence.",

      "Any employee-side notice-pay claim is limited to reasonable compensation for the unserved portion under the enforceable contract and sections 73-74 of the Indian Contract Act, 1872. It is not an automatic debt or permission to deduct wages; mitigation, proof where required, statutory limits and adjudication of disputes apply.",
    ],
    y
  );
}

// --------------------------------------------------
// 7. COMPANY ASSETS AND HANDOVER
// --------------------------------------------------

function addAssetsAndHandover(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "8. COMPANY ASSETS, RECORDS AND HANDOVER",
    [
      "Company smartphones, SIM cards, accessories, keys, logbooks, customer notebooks, registers, marketing materials, business records and company account access remain company property. The employee must protect them, promptly report loss or damage and use them only for authorised work.",

      "At exit or upon a lawful request, the employee must complete a recorded handover of assets, customer follow-ups, pending work and company account control. Company access must be transferred through authorised IT procedures; personal passwords must not be demanded. Reasonable assistance must be provided to identify and return company records.",
    ],
    y
  );
}

// --------------------------------------------------
// 8. CONFIDENTIALITY AND DATA PROTECTION
// --------------------------------------------------

function addConfidentiality(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "9. CONFIDENTIALITY AND DATA PROTECTION",
    [
      "The employee must protect non-public customer and dealer information, pricing, supplier details, business plans, financial records and software data. Unauthorised access, copying, export, disclosure, deletion, alteration, retention or use of company data, including transfer to personal accounts or competitors, is prohibited during employment and after exit.",

      "Customer diversion and unauthorised use of company leads are prohibited. Suspected compromise must be reported promptly; records must not be erased to conceal an incident. Unauthorised copies must be returned or securely deleted as directed, subject to lawful evidence preservation.",

      "These duties do not restrict general skills, publicly available information or disclosures required by law or protected complaints.",
    ],
    y
  );
}

// --------------------------------------------------
// 9. THREATS AND WORKPLACE CONDUCT
// --------------------------------------------------

function addWorkplaceConduct(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "10. THREATS, REPUTATION AND WORKPLACE CONDUCT",
    [
      "Threatening, coercing, intimidating or physically obstructing HR, management, colleagues or customers; threatening unlawful harm to a person, property or reputation; or seeking money or another benefit through unlawful threats is prohibited, including after employment ends. Genuine disputes must be raised through lawful grievance or legal channels.",

      "The employee must not knowingly fabricate or circulate false allegations, impersonate the company, misuse its name or logo, or publish maliciously false statements intended to damage its reputation. Any action must distinguish deliberate wrongdoing from honest feedback, fair comment and legally protected speech.",

      "Nothing in this letter prevents truthful testimony, good-faith complaints to HR, the Internal Committee, police, labour authorities, regulators or courts, lawful wage claims, legally protected collective activity or obtaining legal advice. Such actions must not be treated as threats, defamation or misconduct merely because they are adverse to the company.",
    ],
    y
  );
}

// --------------------------------------------------
// 10. INVESTIGATION AND DISCIPLINARY ACTION
// --------------------------------------------------

function addDisciplinaryProcedure(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "11. INVESTIGATION AND PROPORTIONATE DISCIPLINARY ACTION",
    [
      "For an alleged breach, the company will identify the incident and relevant rule; preserve records; issue written allegations with sufficient particulars; provide access to material relied upon, subject to lawful confidentiality safeguards; and give a reasonable opportunity to respond and present relevant evidence.",

      "Where an inquiry is required, an impartial inquiry officer will assess evidence and the employee's defence. The company will issue a reasoned written outcome, consider seriousness, intent, repetition, prior warnings, training provided and actual consequences, and communicate the available internal review and statutory remedies.",

      "Depending on the findings, measures may include counselling, retraining, a written warning, a PIP, a final warning or lawful termination. Serious misconduct may justify dismissal after the required inquiry. Any interim suspension and subsistence allowance must comply with applicable law; restriction of system access may be used promptly to protect evidence and security without prejudging guilt.",

      "Where applicable, section 39 of the Karnataka Shops and Commercial Establishments Act, 1961 protects employees with at least six months' continuous service: dismissal requires reasonable cause and one month's notice or pay in lieu, unless misconduct is proved in the prescribed inquiry. More favourable contractual rights and statutory appeal rights are preserved. Other applicable labour-code and service-rule requirements also apply.",
    ],
    y
  );
}

// --------------------------------------------------
// 11. POSH
// --------------------------------------------------

function addPOSH(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "12. PREVENTION OF SEXUAL HARASSMENT (POSH)",
    [
      "Sexual harassment is prohibited at the workplace, during work travel, in online communications and at work-connected events.",

      "Complaints by aggrieved women must be dealt with by the competent Internal Committee under the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, or the district Local Committee where legally applicable, including complaints against the employer.",

      "HR must supply and display the verified committee order and complaint contact details. A complaint may be made directly to the competent committee without management permission. Confidentiality, protection against retaliation and the statutory inquiry procedure apply. Other workplace harassment complaints may be raised with HR or an appropriate authority.",

      `Company HR contact: ${COMPANY.email}. This email does not replace the right to approach the competent Internal Committee or Local Committee directly.`,
    ],
    y
  );
}

// --------------------------------------------------
// 12. LEGAL REMEDIES AND RECOVERY TABLE
// --------------------------------------------------

function addLegalRemedies(doc, logo, y) {
  y = addClause(
    doc,
    logo,
    "13. APPLICABLE LEGAL REMEDIES AND RECOVERY",
    [
      "The company may seek the following remedies only where the facts, evidence, legal ingredients and applicable procedure justify them. These provisions do not establish guilt, authorise automatic penalties or replace the decision of a competent authority.",
    ],
    y
  );

  const rows = [
    [
      "Breach causing financial loss",
      "Indian Contract Act, 1872, sections 73-74: reasonable compensation for legally recoverable loss caused by a proved breach. Remote or speculative loss is excluded; a stipulated sum is a ceiling on reasonable compensation, not an automatic penalty.",
    ],
    [
      "Unauthorised computer/data acts",
      "Information Technology Act, 2000, section 43: compensation for qualifying unauthorised access, copying, extraction, deletion, alteration or damage. Sections 46-47 govern adjudication and quantum. Section 66 may apply when the section 43 act is dishonest or fraudulent.",
    ],
    [
      "Theft or dishonest use of property",
      "Bharatiya Nyaya Sanhita, 2023 (BNS), section 306 for employee theft of employer property; section 316(4) for criminal breach of trust by a clerk or servant. Entrustment, dishonest conduct and other required elements must be established; ordinary loss or delay is insufficient.",
    ],
    [
      "Fraudulent statements or records",
      "BNS section 318 may apply to deception satisfying the requirements of cheating. Section 344 may apply to intentional falsification of accounts or employer records with intent to defraud. An error or unmet promise alone does not establish these offences.",
    ],
    [
      "Threats and coercive demands",
      "BNS section 351 for criminal intimidation; section 308 where facts satisfy extortion. Lawful demands for wages, complaints and recourse to authorities are not prohibited.",
    ],
    [
      "Defamation and misuse of data",
      "BNS section 356, subject to its ingredients and exceptions, and appropriate civil remedies for actionable defamation. The company may seek lawful injunctions under the Specific Relief Act, 1963, sections 38-40, to restrain misuse of confidential information and seek associated damages.",
    ],
  ];

  return addDataTable(
    doc,
    logo,
    "POTENTIAL LEGAL ROUTES AND LIMITS",
    ["Conduct / Issue", "Potential Legal Route and Limits"],
    rows,
    y
  );
}

// --------------------------------------------------
// 13. HOW MUCH MAY BE CLAIMED?
// --------------------------------------------------

function addRecoveryLimits(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "HOW MUCH MAY BE CLAIMED?",
    [
      "No fixed recovery amount, salary multiple or unlimited indemnity is imposed by this letter. A civil claim may exceed monthly or annual salary only to the extent the law permits and evidence supports it. The company must identify the employee's breach, causal connection and recoverable loss, credit amounts already recovered and take reasonable steps to reduce loss.",

      "Documented asset loss, reasonable restoration costs and directly attributable financial loss may be claimed where legally recoverable. Asset valuation must allow for age, condition, repair, salvage and insurance or other recoveries. Speculative brand value, assumed future sales, ordinary recruitment/product induction costs and earned salary are not automatically chargeable.",

      "For section 43 IT Act compensation, section 46(1A) places claims up to INR 5 crore before the adjudicating officer and higher claims before the competent court. This is a forum threshold, not a guaranteed recovery or a total liability ceiling. Criminal fines are not automatically compensation payable to the company.",
    ],
    y
  );
}

// --------------------------------------------------
// 14. RECOVERY PROCEDURE AND WAGE SAFEGUARDS
// --------------------------------------------------

function addRecoveryProcedure(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "14. RECOVERY PROCEDURE AND WAGE SAFEGUARDS",
    [
      "Before recovery, the company will provide an itemised statement explaining the incident, evidence, contractual or legal basis, calculation and credits, and give the employee a reasonable opportunity to dispute it. Disputed civil claims must be pursued before the competent forum. No coercive collection, forced admission or retention of original personal certificates is authorised.",

      "Under the Code on Wages, 2019, sections 18 and 21, wage deductions for damage are confined to qualifying entrusted goods or money, must reflect loss directly attributable to neglect/default, and require a show-cause opportunity and prescribed records. Business, brand and notice-pay claims do not become permissible payroll deductions merely through employee consent.",

      "Section 20 permits proportionate absence deductions, including refusal to work without reasonable cause where its conditions are met. Poor output alone is not absence. Section 18 caps aggregate deductions at 50% of wages per wage period. Fines require section 19 compliance, including prior approval of specified acts, notice and hearing, and the 3% wage-period cap; this letter itself imposes no fine.",

      "Wages due on resignation, removal, dismissal or retrenchment must ordinarily be paid within two working days under section 17(2), subject to a valid applicable statutory variation. Clearance or a pending claim cannot justify withholding lawful dues. Other statutory benefits remain governed by their respective provisions and deadlines.",
    ],
    y
  );
}

// --------------------------------------------------
// 15. APPLICATION AND STATUTORY RIGHTS
// --------------------------------------------------

function addApplicationAndRights(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "15. APPLICATION, ACCEPTANCE AND STATUTORY RIGHTS",
    [
      "These revised service conditions apply prospectively upon acknowledgement by both parties. For matters addressed here, they supersede inconsistent wording in the offer letter or prior joining letter, including unrestricted performance-based salary reduction. Mandatory statutory rights prevail. An invalid provision does not invalidate the remaining lawful terms.",

      "This letter creates no training bond or post-employment non-compete. Any later material change requires lawful written communication and agreement where required. Applicable law, establishment coverage and employee classification determine the competent forum and available remedies; no statutory complaint or appeal right is waived.",
    ],
    y
  );
}

// --------------------------------------------------
// 16. EMPLOYEE ACKNOWLEDGEMENT AND SIGNATURE
// --------------------------------------------------

function addJoiningAcknowledgement(doc, logo, employee, y) {
  y = addClause(
    doc,
    logo,
    "EMPLOYEE JOINING ACKNOWLEDGEMENT",
    [
      `I, ${value(employee.fullName)} (Employee ID ${value(employee.employeeId)}), acknowledge joining NV EV TECH PRIVATE LIMITED as ${value(employee.designation)} on ${value(employee.joiningDate)}.`,

      "I confirm my personal details and acknowledge these revised service terms. I have had an opportunity to seek clarification and an explanation in a language I understand. My acknowledgement is not an admission of misconduct or consent to unlawful deductions.",
    ],
    y
  );

  if (y > 220) {
    doc.addPage();
    drawHeader(doc, logo);
    y = HEADER_BOTTOM + 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.black);

  doc.text("FOR THE COMPANY", MARGIN, y);
  doc.text("EMPLOYEE", 112, y);

  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  doc.text(COMPANY.name, MARGIN, y);
  doc.text(value(employee.fullName), 112, y);

  y += 7;

  doc.text(COMPANY.signatory, MARGIN, y);
  doc.text(`Employee ID: ${value(employee.employeeId)}`, 112, y);

  y += 6;

  doc.text(COMPANY.signatoryRole, MARGIN, y);

  y += 15;

  doc.setDrawColor(...C.grey);
  doc.line(MARGIN, y, MARGIN + 65, y);
  doc.line(112, y, 177, y);

  y += 6;

  doc.setFontSize(7.5);
  doc.text("Authorized Signatory Signature / Company Seal", MARGIN, y);
  doc.text("Employee Signature", 112, y);

  y += 12;

  doc.setFontSize(8);
  doc.text("Date: ____________________", MARGIN, y);
  doc.text("Date: ____________________", 112, y);

  y += 7;

  doc.text("Place: Bengaluru", MARGIN, y);
  doc.text("Place: Bengaluru", 112, y);

  return y;
}

// --------------------------------------------------
// MAIN JOINING LETTER PDF GENERATOR
// --------------------------------------------------

export async function generateJoiningLetterPDF(employee) {
  if (!employee) {
    throw new Error("Employee details are missing.");
  }

  const logo = await loadLogo();
  const doc = createPDF();

  drawHeader(doc, logo);

  let y = addTitle(
    doc,
    "JOINING LETTER",
    "EMPLOYEE JOINING CONFIRMATION AND SERVICE TERMS",
    HEADER_BOTTOM + 10
  );

  // Joining reference
  y = addSection(
    doc,
    logo,
    "JOINING REFERENCE",
    [
      ["Company Reference", COMPANY.reference],
      ["Joining Letter Date", getToday()],
      ["Employee ID", employee.employeeId],
      ["Employee Name", employee.fullName],
      ["Actual Date of Joining", employee.joiningDate],
    ],
    y
  );

  // Employee information
  y = addSection(
    doc,
    logo,
    "1. EMPLOYEE AND CONTACT INFORMATION",
    [
      ["Full Name", employee.fullName],
      ["Date of Birth", employee.dateOfBirth],
      ["Gender", employee.gender],
      ["Email", employee.email],
      ["Contact Number", employee.phone],
      ["Current Address", employee.currentAddress],
      ["Permanent Address", employee.permanentAddress],
      ["Emergency Contact", employee.emergencyContactName],
      ["Emergency Contact Number", employee.emergencyContactPhone],
    ],
    y
  );

  // Joining particulars
  y = addSection(
    doc,
    logo,
    "2. CONFIRMED JOINING PARTICULARS",
    [
      ["Designation", employee.designation],
      ["Department", employee.department],
      ["Actual Joining Date", employee.joiningDate],
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

  // All 15 clauses
  y = addProbationAndPerformance(doc, logo, y);
  y = addProductTraining(doc, logo, y);
  y = addWorkingHours(doc, logo, y);
  y = addCCTV(doc, logo, y);
  y = addNoticeAndExit(doc, logo, y);
  y = addAssetsAndHandover(doc, logo, y);
  y = addConfidentiality(doc, logo, y);
  y = addWorkplaceConduct(doc, logo, y);
  y = addDisciplinaryProcedure(doc, logo, y);
  y = addPOSH(doc, logo, y);
  y = addLegalRemedies(doc, logo, y);
  y = addRecoveryLimits(doc, logo, y);
  y = addRecoveryProcedure(doc, logo, y);
  y = addApplicationAndRights(doc, logo, y);

  // Final acknowledgement and signatures
  addJoiningAcknowledgement(doc, logo, employee, y);

  // Page numbering and save
  drawFooter(doc);

  const filename =
    `TEJO_EV_Joining_Letter_${safeFileName(employee)}.pdf`;

  doc.save(filename);
}

export default generateJoiningLetterPDF;
