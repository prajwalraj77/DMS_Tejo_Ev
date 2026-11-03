
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "../assets/tejo-ev-dms-icon.png";

const COMPANY = {
  name: "NV EV TECH PRIVATE LIMITED",
  brand: "TEJO EV",
  address:
    "No. 1049, Mariya Arcade, Rajkumar Road, 4th M Block, Rajajinagar IV Block, Bengaluru, Karnataka - 560010, India",
  reference: "NV/COMP/2026",
  signatory: "Bindu",
  signatoryRole: "HR Manager / Authorized Signatory",
};

const C = {
  black: [20, 25, 25],
  green: [112, 174, 32],
  orange: [244, 105, 20],
  paleGreen: [239, 247, 225],
  grey: [105, 112, 112],
  white: [255, 255, 255],
};

const MARGIN = 16;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const HEADER_BOTTOM = 43;
const FOOTER_Y = 285;

const value = (input) => {
  if (input === undefined || input === null || input === "") {
    return "Not provided";
  }

  if (
    typeof input === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(input)
  ) {
    return new Date(input).toLocaleDateString("en-IN");
  }

  if (input instanceof Date) {
    return input.toLocaleDateString("en-IN");
  }

  return String(input);
};

const money = (input) => {
  if (input === undefined || input === null || input === "") {
    return "Not provided";
  }

  return `INR ${Number(input).toLocaleString("en-IN")}`;
};

const getToday = () => new Date().toLocaleDateString("en-IN");

const safeFileName = (employee) => {
  const name = (employee.fullName || "Employee")
    .replace(/[^a-z0-9_-]/gi, "_");

  const id = (employee.employeeId || "ID")
    .replace(/[^a-z0-9_-]/gi, "_");

  return `${id}_${name}`;
};

async function loadLogo() {
  const response = await fetch(logoUrl);

  if (!response.ok) {
    throw new Error("Unable to load the TEJO EV logo.");
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Unable to process the company logo."));

    reader.readAsDataURL(blob);
  });
}

function drawHeader(doc, logo) {
  if (logo) {
    doc.addImage(logo, "PNG", MARGIN, 8, 26, 26);
  }

  doc.setTextColor(...C.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(COMPANY.name, 46, 15);

  doc.setTextColor(...C.green);
  doc.setFontSize(11);
  doc.text(COMPANY.brand, 46, 22);

  doc.setTextColor(...C.grey);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const addressLines = doc.splitTextToSize(
    COMPANY.address,
    145
  );

  doc.text(addressLines, 46, 29);

  doc.setDrawColor(...C.green);
  doc.setLineWidth(1.2);
  doc.line(MARGIN, HEADER_BOTTOM - 2, 105, HEADER_BOTTOM - 2);

  doc.setDrawColor(...C.orange);
  doc.line(105, HEADER_BOTTOM - 2, 194, HEADER_BOTTOM - 2);
}

function drawFooter(doc) {
  const total = doc.internal.getNumberOfPages();

  for (let page = 1; page <= total; page++) {
    doc.setPage(page);

    doc.setDrawColor(220, 224, 224);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, FOOTER_Y - 5, 194, FOOTER_Y - 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.grey);

    doc.text("NV EV TECH PRIVATE LIMITED | TEJO EV", MARGIN, FOOTER_Y);

    doc.text(
      `Page ${page} of ${total}`,
      194,
      FOOTER_Y,
      { align: "right" }
    );
  }
}

function newPage(doc, logo) {
  doc.addPage();
  drawHeader(doc, logo);
  return HEADER_BOTTOM + 7;
}

function addTitle(doc, title, subtitle, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.black);

  doc.text(title, PAGE_WIDTH / 2, y, {
    align: "center",
  });

  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.grey);

  doc.text(subtitle, PAGE_WIDTH / 2, y, {
    align: "center",
  });

  return y + 13;
}

function addSection(doc, logo, heading, rows, y) {
  if (y > 240) {
    y = newPage(doc, logo);
  }

  doc.setFillColor(...C.paleGreen);
  doc.roundedRect(MARGIN, y - 5, CONTENT_WIDTH, 10, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.black);
  doc.text(heading, MARGIN + 3, y + 1.5);

  autoTable(doc, {
    startY: y + 7,
    head: [["Particulars", "Details"]],
    body: rows.map(([label, detail]) => [
      label,
      value(detail),
    ]),
    theme: "grid",
    margin: {
      left: MARGIN,
      right: MARGIN,
      top: HEADER_BOTTOM + 5,
      bottom: 18,
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
      textColor: C.black,
      lineColor: [220, 224, 224],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C.black,
      textColor: C.white,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 247],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold" },
      1: { cellWidth: 123 },
    },
    didDrawPage: () => drawHeader(doc, logo),
  });

  return doc.lastAutoTable.finalY + 10;
}

function addClause(doc, logo, heading, paragraphs, y) {
  if (y > 250) {
    y = newPage(doc, logo);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.black);
  doc.text(heading, MARGIN, y);

  y += 7;

  for (const paragraph of paragraphs) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 60, 60);

    const lines = doc.splitTextToSize(
      paragraph,
      CONTENT_WIDTH
    );

    for (const line of lines) {
      if (y > 267) {
        y = newPage(doc, logo);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(55, 60, 60);
      }

      doc.text(line, MARGIN, y);
      y += 4.3;
    }

    y += 3;
  }

  return y + 3;
}

function addSignature(doc, logo, employee, y, joining = false) {
  if (y > 225) {
    y = newPage(doc, logo);
  }

  y = addClause(
    doc,
    logo,
    joining
      ? "EMPLOYEE JOINING ACKNOWLEDGEMENT"
      : "OFFER ACCEPTANCE AND ACKNOWLEDGEMENT",
    [
      joining
        ? `I, ${value(employee.fullName)}, acknowledge that I have joined NV EV TECH PRIVATE LIMITED in the position stated in this letter. I confirm that the information provided by me is accurate to the best of my knowledge and that I have received and understood the applicable employment terms.`
        : `I, ${value(employee.fullName)}, acknowledge receipt of this employment offer and confirm that I have read and understood the employment terms described in this letter. My acceptance is subject to the terms stated in this offer and applicable law.`,
    ],
    y
  );

  if (y > 230) {
    y = newPage(doc, logo);
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
  doc.text("Signature: ____________________", 112, y);

  y += 6;

  doc.text(COMPANY.signatoryRole, MARGIN, y);

  y += 18;

  doc.setDrawColor(...C.grey);
  doc.line(MARGIN, y, MARGIN + 65, y);
  doc.line(112, y, 177, y);

  y += 6;

  doc.setFontSize(7.5);
  doc.text("Authorized Signatory Signature", MARGIN, y);
  doc.text("Employee Signature", 112, y);

  y += 12;

  doc.setFontSize(8);
  doc.text(`Date: ${getToday()}`, MARGIN, y);
  doc.text("Date: ____________________", 112, y);

  y += 7;

  doc.text("Place: Bengaluru", MARGIN, y);
  doc.text("Place: Bengaluru", 112, y);

  return y;
}


function addCompensation(doc, logo, employee, y) {
  const monthlySalary = Number(employee.monthlySalary) || 0;

  const annualSalary =
    employee.annualCTC != null && employee.annualCTC !== ""
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
        "Performance-Based Salary Conditions",
        "Salary is determined based on individual performance, achievement of assigned targets, productivity, quality of work and company performance evaluation criteria."
      ],
      [
        "Salary Review",
        "The company reserves the right to review and revise the employee's salary based on performance. Salary may increase or decrease depending on performance results."
      ],
    ],
    y
  );
}


function addEmploymentConditions(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "NOTICE PERIOD AND EMPLOYMENT CONDITIONS",
    [
      "The contractual notice period is sixty (60) calendar days during the probationary period and thirty (30) calendar days after confirmation, for either party, subject to the employment agreement and applicable law.",

      "The probationary period is six (6) calendar months from the date of joining. Confirmation will be subject to the company's assessment and applicable employment procedures.",

      "Any recovery for an unserved notice period or unreturned/damaged company property must be supported by applicable contractual terms and lawful deductions.",
    ],
    y
  );
}

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

function addPerformance(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "PERFORMANCE STANDARDS AND IMPROVEMENT PLAN",
    [
      "The employee is expected to perform assigned responsibilities professionally, achieve applicable key performance indicators (KPIs), follow authorized business procedures and maintain accurate work records.",

      "Where performance falls below the applicable operational benchmark, the company may issue a written notice or Performance Improvement Plan (PIP), specifying the deficiency and an improvement period of seven (7) to fourteen (14) calendar days.",

      "Failure to demonstrate verifiable improvement may result in further action in accordance with the employment terms and applicable law.",

      "Variable incentives are conditional upon achievement of applicable targets and the company's incentive scheme.",
    ],
    y
  );
}

function addPOSH(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "PREVENTION OF SEXUAL HARASSMENT (POSH)",
    [
      "The company prohibits sexual harassment at the workplace, during work-related travel, through online communications or at work-connected events.",

      "Complaints may be submitted through the designated company email address: " +
        COMPANY.poshEmail,

      "Complaints and inquiries will be handled in accordance with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, applicable rules, confidentiality requirements and principles of natural justice.",
    ],
    y
  );
}

function addAssetHandover(doc, logo, y) {
  return addClause(
    doc,
    logo,
    "COMPANY ASSETS AND HANDOVER",
    [
      "All property assigned to the employee, including official smartphones, SIM cards, accessories, logbooks, customer notebooks, physical registers, marketing materials, company records and authorized DMS/CRM credentials, remains company property.",

      "Upon cessation of employment, resignation or termination, the employee must return all entrusted company property, records and access credentials to the designated company representative.",

      "The employee must not retain, copy, transfer or disclose customer information or confidential company material on personal devices or accounts.",
    ],
    y
  );
}

function addPOSHAndStatutoryReferences(doc, logo, y) {
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

function finish(doc, employee, type) {
  drawFooter(doc);

  const filename =
    `TEJO_EV_${type}_${safeFileName(employee)}.pdf`;

  doc.save(filename);
}

// PDF 1: OFFER LETTER
export async function generateOfferLetterPDF(employee) {
  if (!employee) {
    throw new Error("Employee details are missing.");
  }

  const logo = await loadLogo();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  drawHeader(doc, logo);

  let y = addTitle(
    doc,
    "OFFER LETTER",
    "EMPLOYMENT OFFER AND TERMS",
    HEADER_BOTTOM + 10
  );

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

  y = addCompensation(doc, logo, employee, y);

  y = addEmploymentConditions(doc, logo, y);

  y = addPerformance(doc, logo, y);

  y = addConfidentiality(doc, logo, y);

  y = addPOSH(doc, logo, y);

  y = addPOSHAndStatutoryReferences(doc, logo, y);

  addSignature(doc, logo, employee, y, false);

  finish(doc, employee, "Offer_Letter");
}

// PDF 2: JOINING LETTER
export async function generateJoiningLetterPDF(employee) {
  if (!employee) {
    throw new Error("Employee details are missing.");
  }

  const logo = await loadLogo();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  drawHeader(doc, logo);

  let y = addTitle(
    doc,
    "JOINING LETTER",
    "EMPLOYEE JOINING CONFIRMATION AND SERVICE TERMS",
    HEADER_BOTTOM + 10
  );

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

  y = addCompensation(doc, logo, employee, y);

  y = addClause(
    doc,
    logo,
    "3. PROBATION AND PERFORMANCE",
    [
      "The employee will be on probation for six (6) calendar months from the date of joining. Confirmation will be subject to the company's assessment and applicable employment procedures.",

      "The employee is expected to perform assigned duties professionally, achieve applicable key performance indicators (KPIs), follow authorized business procedures and maintain accurate work records.",

      "Where performance falls below the applicable operational benchmark, the company may issue a written notice or Performance Improvement Plan (PIP), specifying the deficiency and an improvement period of seven (7) to fourteen (14) calendar days.",

      "Failure to demonstrate verifiable improvement may result in further action in accordance with employment terms and applicable law.",
    ],
    y
  );

  y = addEmploymentConditions(doc, logo, y);

  y = addAssetHandover(doc, logo, y);

  y = addConfidentiality(doc, logo, y);

  y = addPOSH(doc, logo, y);

  y = addClause(
    doc,
    logo,
    "ABSENCE, ABANDONMENT AND EXIT CLEARANCE",
    [
      "Unapproved continuous absence for three (3) consecutive scheduled working days without prior written authorization or verifiable medical justification may initiate an unauthorized absence and abandonment-of-service review.",

      "An employee who leaves employment without submitting formal resignation and without fulfilling the applicable notice requirement may be recorded as having absconded, subject to appropriate review and applicable law.",

      "Final settlement and exit documentation will be processed in accordance with applicable law and company clearance procedures. Any recovery must be supported by applicable contractual terms and lawful deductions.",
    ],
    y
  );

  y = addPOSHAndStatutoryReferences(doc, logo, y);

  addSignature(doc, logo, employee, y, true);

  finish(doc, employee, "Joining_Letter");
}
