
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "../assets/tejo-ev-dms-icon.png";

export const COMPANY = {
  name: "NV EV TECH PRIVATE LIMITED",
  brand: "TEJO EV",
  address:
    "No. 1049, Mariya Arcade, Rajkumar Road, 4th M Block, Rajajinagar IV Block, Bengaluru, Karnataka - 560010, India",
  reference: "NV/COMP/2026",
  email: "info@tejoev.com",
  poshEmail: "info@tejoev.com",
  signatory: "Bindu",
  signatoryRole: "HR Manager / Authorized Signatory",
};

export const C = {
  black: [20, 25, 25],
  green: [112, 174, 32],
  orange: [244, 105, 20],
  paleGreen: [239, 247, 225],
  grey: [105, 112, 112],
  white: [255, 255, 255],
};

export const MARGIN = 16;
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
export const HEADER_BOTTOM = 43;
export const FOOTER_Y = 285;

export const value = (input) => {
  if (input === undefined || input === null || input === "") {
    return "Not provided";
  }

  if (
    typeof input === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(input)
  ) {
    const date = new Date(input);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN");
    }
  }

  if (input instanceof Date) {
    return input.toLocaleDateString("en-IN");
  }

  return String(input);
};

export const money = (input) => {
  if (input === undefined || input === null || input === "") {
    return "Not provided";
  }

  return `INR ${Number(input).toLocaleString("en-IN")}`;
};

export const getToday = () =>
  new Date().toLocaleDateString("en-IN");

export const safeFileName = (employee) => {
  const name = (employee.fullName || "Employee").replace(
    /[^a-z0-9_-]/gi,
    "_"
  );

  const id = (employee.employeeId || "ID").replace(
    /[^a-z0-9_-]/gi,
    "_"
  );

  return `${id}_${name}`;
};

export const createPDF = () =>
  new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

export async function loadLogo() {
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

export function drawHeader(doc, logo) {
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

  doc.setFontSize(7);
  doc.text(COMPANY.email, 46, 37);

  doc.setDrawColor(...C.green);
  doc.setLineWidth(1.2);
  doc.line(MARGIN, HEADER_BOTTOM - 2, 105, HEADER_BOTTOM - 2);

  doc.setDrawColor(...C.orange);
  doc.line(105, HEADER_BOTTOM - 2, 194, HEADER_BOTTOM - 2);
}

export function drawFooter(doc) {
  const total = doc.internal.getNumberOfPages();

  for (let page = 1; page <= total; page++) {
    doc.setPage(page);

    doc.setDrawColor(220, 224, 224);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, FOOTER_Y - 5, 194, FOOTER_Y - 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.grey);

    doc.text(
      "NV EV TECH PRIVATE LIMITED | TEJO EV",
      MARGIN,
      FOOTER_Y
    );

    doc.text(
      `Page ${page} of ${total}`,
      194,
      FOOTER_Y,
      { align: "right" }
    );
  }
}

export function newPage(doc, logo) {
  doc.addPage();
  drawHeader(doc, logo);

  return HEADER_BOTTOM + 7;
}

export function addTitle(doc, title, subtitle, y) {
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

export function addSection(doc, logo, heading, rows, y) {
  if (y > 240) {
    y = newPage(doc, logo);
  }

  doc.setFillColor(...C.paleGreen);
  doc.roundedRect(
    MARGIN,
    y - 5,
    CONTENT_WIDTH,
    10,
    1.5,
    1.5,
    "F"
  );

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
      0: {
        cellWidth: 55,
        fontStyle: "bold",
      },
      1: {
        cellWidth: 123,
      },
    },
    didDrawPage: () => drawHeader(doc, logo),
  });

  return doc.lastAutoTable.finalY + 10;
}

export function addDataTable(doc, logo, heading, headers, rows, y) {
  if (y > 240) {
    y = newPage(doc, logo);
  }

  doc.setFillColor(...C.paleGreen);
  doc.roundedRect(
    MARGIN,
    y - 5,
    CONTENT_WIDTH,
    10,
    1.5,
    1.5,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.black);
  doc.text(heading, MARGIN + 3, y + 1.5);

  autoTable(doc, {
    startY: y + 7,
    head: [headers],
    body: rows,
    theme: "grid",
    margin: {
      left: MARGIN,
      right: MARGIN,
      top: HEADER_BOTTOM + 5,
      bottom: 18,
    },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 3,
      overflow: "linebreak",
      textColor: C.black,
      lineColor: [220, 224, 224],
      lineWidth: 0.2,
      valign: "middle",
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
      0: {
        cellWidth: 55,
        fontStyle: "bold",
      },
      1: {
        cellWidth: 123,
      },
    },
    didDrawPage: () => drawHeader(doc, logo),
  });

  return doc.lastAutoTable.finalY + 10;
}

export function addClause(doc, logo, heading, paragraphs, y) {
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

export function addSignature(
  doc,
  logo,
  employee,
  y,
  joining = false
) {
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

export function finishPDF(doc, employee, type) {
  drawFooter(doc);

  const filename =
    `TEJO_EV_${type}_${safeFileName(employee)}.pdf`;

  doc.save(filename);
}
