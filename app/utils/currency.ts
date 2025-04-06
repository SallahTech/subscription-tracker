interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
}

export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US'
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Helper function to parse currency string back to number
export function parseCurrency(value: string): number {
  // Remove currency symbols, spaces, and commas
  const cleanValue = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleanValue) || 0;
}

// Validate if a string is a valid currency amount
export function isValidCurrencyAmount(value: string): boolean {
  const amount = parseCurrency(value);
  return !isNaN(amount) && amount >= 0;
} 