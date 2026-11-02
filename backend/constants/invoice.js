/**
 * TEJO EV INVOICE CONFIGURATION
 */

export const INVOICE_CONFIG = {
  digits: 4,
  startingNumber: 1,
  minimumNumber: 1,
  maximumNumber: 9999,
  prefix: "",
};

export function formatInvoiceNumber(number) {
  if (number < 1 || number > 9999) {
    throw new Error("Invoice number must be between 0001 and 9999.");
  }

  return String(number).padStart(4, "0");
}
