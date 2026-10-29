export const UPI_ID = "deve659775@axl";
export const UPI_AMOUNT = "20";
export const UPI_PAYEE = "Karwa Chauth Fun";
export const UPI_NOTE = "Optional support";
export const UPI_CURRENCY = "INR";

/**
 * Builds the voluntary ₹20 UPI deep link.
 * The VPA keeps a literal @ because PhonePe, GPay, and Paytm read it that way.
 * Payee name and note use encodeURIComponent.
 */
export function buildUpiUri(): string {
  const query = [
    `pa=${UPI_ID}`,
    `pn=${encodeURIComponent(UPI_PAYEE)}`,
    `am=${UPI_AMOUNT}`,
    `cu=${UPI_CURRENCY}`,
    `tn=${encodeURIComponent(UPI_NOTE)}`,
  ].join("&");

  return `upi://pay?${query}`;
}
