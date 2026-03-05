/**
 * Format a price in kopecks (bigint) to rubles string like "₽1 299"
 */
export function formatPrice(kopecks: bigint): string {
  const rubles = Number(kopecks) / 100;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rubles);
}

/**
 * Generate a UUID-like ID for new items
 */
export function generateId(): string {
  return crypto.randomUUID();
}
