import { BudgetSettings } from '@/models/schema';

export interface CurrencyFormatOptions {
  currencySymbol?: string;
  showDecimals?: boolean;
}

/**
 * Converts a major currency unit number (e.g. 150.50 BDT) to an integer minor unit (15050 Paisa).
 */
export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

/**
 * Converts integer minor units (e.g. 15050 Paisa) to major currency units (150.50 BDT).
 */
export function toMajorUnits(amountMinor: number): number {
  if (!Number.isFinite(amountMinor)) return 0;
  return amountMinor / 100;
}

/**
 * Formats minor units to display string (e.g. 125000 -> "৳1,250" or "৳1,250.00" if showDecimals: true).
 */
export function formatCurrency(
  amountMinor: number,
  options?: CurrencyFormatOptions | BudgetSettings
): string {
  const safeMinor = Number.isFinite(amountMinor) ? Math.round(amountMinor) : 0;
  const symbol = options?.currencySymbol ?? '৳';
  const showDecimals = options?.showDecimals ?? false;

  const isNegative = safeMinor < 0;
  const absMinor = Math.abs(safeMinor);
  const majorValue = absMinor / 100;

  let formattedNumber: string;
  if (showDecimals) {
    formattedNumber = majorValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formattedNumber = Math.round(majorValue).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  }

  const prefix = isNegative ? '-' : '';
  return `${prefix}${symbol}${formattedNumber}`;
}

/**
 * Formats minor units without the currency symbol (e.g. 125000 -> "1,250").
 */
export function formatAmountWithoutSymbol(
  amountMinor: number,
  showDecimals = false
): string {
  const safeMinor = Number.isFinite(amountMinor) ? Math.round(amountMinor) : 0;
  const isNegative = safeMinor < 0;
  const absMinor = Math.abs(safeMinor);
  const majorValue = absMinor / 100;

  let formattedNumber: string;
  if (showDecimals) {
    formattedNumber = majorValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formattedNumber = Math.round(majorValue).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  }

  const prefix = isNegative ? '-' : '';
  return `${prefix}${formattedNumber}`;
}

/**
 * Parses user numeric/decimal input text into an integer minor unit (paisa).
 * Examples: "150" -> 15000, "150.5" -> 15050, "150.50" -> 15050, "" -> 0
 */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  const sanitized = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  if (!Number.isFinite(parsed)) return 0;
  return toMinorUnits(parsed);
}
