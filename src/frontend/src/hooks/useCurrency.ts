import { useCallback, useEffect, useState } from "react";

export type CurrencyCode = "USD" | "RUB" | "TJS";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  /** How many units of this currency = 1 USD */
  rateToUsd: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "Доллар", rateToUsd: 1 },
  { code: "RUB", symbol: "₽", name: "Рубль", rateToUsd: 91.5 },
  { code: "TJS", symbol: "смн", name: "Сомони", rateToUsd: 10.9 },
];

const CURRENCY_KEY = "shop_selected_currency";

export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/** Convert USD amount to target currency */
export function convertFromUsd(usd: number, currency: CurrencyInfo): number {
  return usd * currency.rateToUsd;
}

/** Format a USD amount in the given currency */
export function formatInCurrency(usd: number, currency: CurrencyInfo): string {
  const amount = convertFromUsd(usd, currency);
  if (currency.code === "TJS") {
    return `${amount.toFixed(2)} ${currency.symbol}`;
  }
  if (currency.code === "RUB") {
    return `${amount.toFixed(2)} ${currency.symbol}`;
  }
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
    return saved && ["USD", "RUB", "TJS"].includes(saved) ? saved : "USD";
  });

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(CURRENCY_KEY, code);
  }, []);

  const currencyInfo = getCurrencyInfo(currency);

  const format = useCallback(
    (usd: number) => formatInCurrency(usd, currencyInfo),
    [currencyInfo],
  );

  return { currency, setCurrency, currencyInfo, format };
}
