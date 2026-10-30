/**
 * Prices shown like the back office shows them (System options > Price format and currency
 * position; pjCurrency::formatPrice). The formats and signs come from the API.
 */
export interface PriceFormat {
  /** 1: 1000, 2: 1000.00, 3: 1,000, 4: 1,000.00, 5: 1 000, 6: 1 000.00 */
  price_format: number;
  currency_place: "front" | "back";
}

export const DEFAULT_PRICE_FORMAT: PriceFormat = { price_format: 4, currency_place: "back" };

export function formatNumberLike(amount: number, format: number): string {
  const decimals = format % 2 === 0 ? 2 : 0;
  const thousands = format <= 2 ? "" : format <= 4 ? "," : " ";
  const [whole, fraction] = Math.abs(amount).toFixed(decimals).split(".");
  const grouped = thousands ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) : whole;
  return `${amount < 0 ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

/** "8,500.00 $" / "$ 8,500.00" … as the back office formats it. */
export function formatAdminPrice(amount: number, sign: string, format: PriceFormat = DEFAULT_PRICE_FORMAT): string {
  const number = formatNumberLike(amount, format.price_format);
  return format.currency_place === "front" ? `${sign} ${number}` : `${number} ${sign}`;
}
