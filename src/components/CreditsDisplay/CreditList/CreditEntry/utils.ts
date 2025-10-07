import { CREDIT_USAGE, CREDIT_INTERVALS, type CreditUsageType, type CreditPeriodType } from '../../../../types';
export function parseCreditValue(raw: string | number | null | undefined): number | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'number' && isFinite(raw) && raw > 0) return Math.floor(raw);
  if (typeof raw === 'string') {
    // Strip $ and commas and whitespace
    const num = Number(raw.replace(/[^0-9.]/g, ''));
    if (isFinite(num) && num > 0) return Math.floor(num);
  }
  return undefined;
}

export function getMaxValue(creditMaxValue?: number): number {
  const parsed = typeof creditMaxValue === 'number' && isFinite(creditMaxValue) && creditMaxValue > 0
    ? creditMaxValue
    : undefined;
  return parsed ?? 100;
}

export function clampValue(value: number, maxValue: number): number {
  if (!isFinite(value)) return 0;
  // Round to 2 decimal places to avoid floating point issues
  const rounded = Math.round(value * 100) / 100;
  return Math.max(0, Math.min(maxValue, rounded));
}

export function getValueForUsage(usage: CreditUsageType, maxValue: number): number {
  switch (usage) {
    case CREDIT_USAGE.USED:
      return maxValue;
    case CREDIT_USAGE.PARTIALLY_USED:
      return Math.ceil(maxValue / 2);
    case CREDIT_USAGE.NOT_USED:
    case CREDIT_USAGE.INACTIVE:
      return 0;
    default:
      return 0;
  }
}

export function getUsageForValue(value: number, maxValue: number): CreditUsageType {
  if (value <= 0) return CREDIT_USAGE.NOT_USED;
  if (value >= maxValue) return CREDIT_USAGE.USED;
  return CREDIT_USAGE.PARTIALLY_USED;
}

/**
 * Gets the current period index for a given period type
 * @param periodType The credit period type (monthly, quarterly, etc.)
 * @param now Optional date to use as reference (defaults to current date)
 * @returns The current period index (1-based)
 */
export function getCurrentPeriodIndex(periodType: CreditPeriodType, now: Date = new Date()): number {
  const monthZeroBased = now.getMonth(); // 0..11
  let intervals: number;

  switch (periodType) {
    case 'monthly':
      intervals = CREDIT_INTERVALS.Monthly;
      break;
    case 'quarterly':
      intervals = CREDIT_INTERVALS.Quarterly;
      break;
    case 'semiannually':
      intervals = CREDIT_INTERVALS.Semiannually;
      break;
    case 'annually':
      intervals = CREDIT_INTERVALS.Annually;
      break;
    default:
      intervals = 1;
  }

  if (intervals <= 1) return 1;
  const segmentLength = 12 / intervals; // months per period segment
  const index = Math.floor(monthZeroBased / segmentLength) + 1; // 1..intervals
  // Clamp to valid range
  return Math.min(Math.max(index, 1), intervals);
}

/**
 * Determines if a period is in the future (not current or past)
 * @param periodNumber The period number to check (1-based)
 * @param periodType The credit period type (monthly, quarterly, etc.)
 * @param now Optional date to use as reference (defaults to current date)
 * @returns true if the period is in the future, false otherwise
 */
export function isPeriodFuture(periodNumber: number, periodType: CreditPeriodType, now: Date = new Date()): boolean {
  const currentIndex = getCurrentPeriodIndex(periodType, now);
  return periodNumber > currentIndex;
}


