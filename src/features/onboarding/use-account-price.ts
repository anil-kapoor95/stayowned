"use client";

import { formatAdminPrice } from "@/lib/price-format";
import { useSignupSession } from "./signup-session";

/**
 * Price writer of the account (Company options > General: price format and currency symbol place), for amounts in
 * the account's currency. Undefined while there is no sign-up yet or the amount is in another currency.
 */
export function useAccountPrice(currency: string): ((amount: number) => string) | undefined {
  const { state } = useSignupSession();
  if (!state?.price_format || !state.currency || state.currency !== currency) return undefined;
  const sign = state.currency_sign || state.currency;
  const format = state.price_format;
  return (amount: number) => formatAdminPrice(amount, sign, format);
}
