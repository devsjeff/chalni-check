export const UPI_ID = "deve659775@axl";
export const UPI_AMOUNT = "20";
export const UPI_PAYEE = "Karva Chauth Fun";
export const UPI_NOTE = "Optional support";
export const UPI_CURRENCY = "INR";

/** Voluntary ₹20 UPI link. The @ in the VPA stays literal so UPI apps can read it. */
export function buildUpiUri(): string {
  return [
    "upi://pay",
    `?pa=${UPI_ID}`,
    `&pn=${encodeURIComponent(UPI_PAYEE)}`,
    `&am=${UPI_AMOUNT}`,
    `&cu=${UPI_CURRENCY}`,
    `&tn=${encodeURIComponent(UPI_NOTE)}`,
  ].join("");
}
