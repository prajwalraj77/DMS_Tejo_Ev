import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const money = (value) => {
  const amount = Number(value || 0);
  return `₹ ${amount.toFixed(2)}`;
};

const valueOrDash = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
};

const addWrappedText = (doc, text, x, y, width, lineHeight = 5) => {
  const lines = doc.splitTextToSize(valueOrDash(text), width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const drawSectionTitle = (doc, title, y) => {
  doc.setFillColor(245, 245, 245);
  doc.rect(14, y - 5, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, 17, y);
  doc.setFont("helvetica", "normal");
  return y + 7;
};

export const generateSaleInvoicePdf = (invoice) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const dealer = invoice.dealerId || {};
  const customer = invoice.customerId || {};
  const vehicle = invoice.vehicleId || {};
  const model = vehicle.model || {};
  const batteryVariant = vehicle.batteryVariant || {};

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TEJO EV", 14, 18);

  doc.setFontSize(12);
  doc.text("SALE INVOICE", pageWidth - 14, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Electric Vehicle Dealership Management System", 14, 24);

  doc.setDrawColor(60, 60, 60);
  doc.line(14, 28, pageWidth - 14, 28);

  // Invoice / dealer information
  let y = 38;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Dealer", 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  y += 5;
  y = addWrappedText(doc, dealer.businessName, 14, y, 85);
  y = addWrappedText(doc, dealer.address, 14, y, 85);
  y = addWrappedText(
    doc,
    [dealer.city, dealer.state, dealer.pincode].filter(Boolean).join(", "),
    14,
    y,
    85,
  );
  y = addWrappedText(doc, dealer.phone, 14, y, 85);
  y = addWrappedText(doc, dealer.email, 14, y, 85);

  let rightY = 38;
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No.", pageWidth - 75, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(valueOrDash(invoice.invoiceNumber), pageWidth - 14, rightY, {
    align: "right",
  });

  rightY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Date", pageWidth - 75, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(
    invoice.createdAt
      ? new Date(invoice.createdAt).toLocaleDateString("en-IN")
      : "-",
    pageWidth - 14,
    rightY,
    { align: "right" },
  );

  rightY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status", pageWidth - 75, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(valueOrDash(invoice.paymentStatus), pageWidth - 14, rightY, {
    align: "right",
  });

  // Customer
  y = Math.max(y, rightY) + 10;
  y = drawSectionTitle(doc, "CUSTOMER DETAILS", y);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.5,
      lineColor: [210, 210, 210],
    },
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: 255,
      fontStyle: "bold",
    },
    head: [["Name", "Phone", "Email"]],
    body: [[
      valueOrDash(customer.name),
      valueOrDash(customer.phone),
      valueOrDash(customer.email),
    ]],
  });

  y = doc.lastAutoTable.finalY + 5;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.5,
      lineColor: [210, 210, 210],
    },
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: 255,
      fontStyle: "bold",
    },
    head: [["Address", "City", "State", "Pincode", "GSTIN"]],
    body: [[
      valueOrDash(customer.address),
      valueOrDash(customer.city),
      valueOrDash(customer.state),
      valueOrDash(customer.pincode),
      valueOrDash(customer.gstin),
    ]],
  });

  // Vehicle
  y = doc.lastAutoTable.finalY + 8;
  y = drawSectionTitle(doc, "VEHICLE DETAILS", y);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.5,
      lineColor: [210, 210, 210],
    },
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: 255,
      fontStyle: "bold",
    },
    head: [["Model", "Variant", "Colour", "Chassis Number"]],
    body: [[
      valueOrDash(model.name),
      valueOrDash(batteryVariant.name),
      valueOrDash(vehicle.colour),
      valueOrDash(vehicle.chassisNumber),
    ]],
  });

  y = doc.lastAutoTable.finalY + 5;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.5,
      lineColor: [210, 210, 210],
    },
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: 255,
      fontStyle: "bold",
    },
    head: [["Motor Number", "Battery Number", "Controller Number", "Charger Number"]],
    body: [[
      valueOrDash(vehicle.motorNumber),
      valueOrDash(vehicle.batteryNumber),
      valueOrDash(vehicle.controllerNumber),
      valueOrDash(vehicle.chargerNumber),
    ]],
  });

  // Pricing
  y = doc.lastAutoTable.finalY + 8;
  y = drawSectionTitle(doc, "PRICE DETAILS", y);

  const discountLabel =
    invoice.discountType === "PERCENTAGE"
      ? `${invoice.discountValue}%`
      : money(invoice.discountValue);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: [210, 210, 210],
    },
    body: [
      ["Selling Price", money(invoice.sellingPrice)],
      ["Discount", `${discountLabel}  (-${money(invoice.discountAmount)})`],
      ["Taxable Amount", money(invoice.taxableAmount)],
      [
        `GST (${invoice.gstRate}% - ${invoice.gstTreatment})`,
        money(invoice.gstAmount),
      ],
      ["Final Invoice Total", money(invoice.totalAmount)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 110 },
      1: { halign: "right", cellWidth: 72 },
    },
  });

  y = doc.lastAutoTable.finalY + 8;
  y = drawSectionTitle(doc, "PAYMENT DETAILS", y);

  const balanceAmount = Math.max(
    0,
    Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0),
  );

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: [210, 210, 210],
    },
    body: [
      ["Payment Status", valueOrDash(invoice.paymentStatus)],
      ["Payment Method", valueOrDash(invoice.paymentMethod)],
      ["Paid Amount", money(invoice.paidAmount)],
      ["Outstanding Amount", money(balanceAmount)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 110 },
      1: { halign: "right", cellWidth: 72 },
    },
  });

  // Signatures
  y = doc.lastAutoTable.finalY + 25;

  doc.setDrawColor(100, 100, 100);
  doc.line(18, y, 75, y);
  doc.line(pageWidth - 75, y, pageWidth - 18, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Dealer / Authorized Signatory", 46.5, y + 5, {
    align: "center",
  });
  doc.text("Customer Signature", pageWidth - 46.5, y + 5, {
    align: "center",
  });

  doc.setFontSize(8);
  doc.text(
    "This is a system-generated sale invoice.",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" },
  );

  return Buffer.from(doc.output("arraybuffer"));
};
