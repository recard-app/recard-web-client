import { CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS, type CreditUsageType, type CreditPeriodType } from '../../../../types';
import { MONTH_ABBREVIATIONS } from '../../../../types/Constants';
export function formatCreditDollars(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? `$${rounded}` : `$${rounded.toFixed(2)}`;
}

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

/**
 * Parses the month number (1-12) from an anniversary date string (MM-DD or MM/DD format).
 * Returns null if the format is invalid.
 */
export function parseAnniversaryMonth(anniversaryDate: string): number | null {
  const result = parseAnniversaryDate(anniversaryDate);
  return result ? result.month : null;
}

/**
 * Parses the month (1-12) and day (1-31) from an anniversary date string (MM-DD or MM/DD format).
 * Returns null if the format is invalid.
 */
export function parseAnniversaryDate(anniversaryDate: string): { month: number; day: number } | null {
  try {
    const [month, day] = anniversaryDate.includes('-')
      ? anniversaryDate.split('-').map(Number)
      : anniversaryDate.split('/').map(Number);
    if (!isNaN(month) && month >= 1 && month <= 12 && !isNaN(day) && day >= 1 && day <= 31) {
      return { month, day };
    }
  } catch {
    // Invalid format
  }
  return null;
}

export interface AnniversaryPeriodRange {
  start: { month: number; day: number; year: number; monthAbbr: string };
  end: { month: number; day: number; year: number; monthAbbr: string };
}

/**
 * Computes the start and end dates of an anniversary credit cycle.
 * Start = anniversaryDate in anniversaryYear.
 * End = the day before the same date in anniversaryYear + 1.
 * Handles leap years and month boundaries correctly via Date arithmetic.
 */
export function getAnniversaryPeriodRange(
  anniversaryDate: string,
  anniversaryYear: number
): AnniversaryPeriodRange | null {
  const parsed = parseAnniversaryDate(anniversaryDate);
  if (!parsed) return null;

  const startDate = new Date(anniversaryYear, parsed.month - 1, parsed.day);
  const endDate = new Date(anniversaryYear + 1, parsed.month - 1, parsed.day);
  endDate.setDate(endDate.getDate() - 1);

  return {
    start: {
      month: startDate.getMonth() + 1,
      day: startDate.getDate(),
      year: startDate.getFullYear(),
      monthAbbr: MONTH_ABBREVIATIONS[startDate.getMonth()]
    },
    end: {
      month: endDate.getMonth() + 1,
      day: endDate.getDate(),
      year: endDate.getFullYear(),
      monthAbbr: MONTH_ABBREVIATIONS[endDate.getMonth()]
    }
  };
}

/**
 * Returns a month-range label for a given period number within totalPeriods.
 * e.g. periodNumber=1, totalPeriods=4 => "Jan → Mar"
 *      periodNumber=3, totalPeriods=12 => "Mar"
 */
export function getPeriodMonthRange(periodNumber: number, totalPeriods: number): string {
  const monthsPerPeriod = 12 / totalPeriods;
  const startMonthIndex = (periodNumber - 1) * monthsPerPeriod;
  const endMonthIndex = startMonthIndex + monthsPerPeriod - 1;
  if (startMonthIndex === endMonthIndex) {
    return MONTH_ABBREVIATIONS[startMonthIndex];
  }
  return `${MONTH_ABBREVIATIONS[startMonthIndex]} \u2192 ${MONTH_ABBREVIATIONS[endMonthIndex]}`;
}

/**
 * Display-friendly period type names (e.g., for tracking actions)
 */
export const PERIOD_DISPLAY_NAMES: Record<string, string> = {
  [CREDIT_PERIODS.Monthly]: 'Monthly',
  [CREDIT_PERIODS.Quarterly]: 'Quarterly',
  [CREDIT_PERIODS.Semiannually]: 'Semiannual',
  [CREDIT_PERIODS.Annually]: 'Annual',
};

/**
 * Gets the date range text for the current period (e.g., "MAR", "JAN -> MAR", "MAR -> FEB")
 * @param associatedPeriod The credit's AssociatedPeriod value (e.g., 'monthly', 'annually')
 * @param isAnniversaryBased Whether this is an anniversary-based credit
 * @param anniversaryDate Optional MM-DD format date for anniversary credits
 * @param now Optional date to use as reference (defaults to current date)
 */
export function getDateRangeText(
  associatedPeriod: string,
  isAnniversaryBased: boolean,
  anniversaryDate?: string,
  now: Date = new Date()
): string {
  if (isAnniversaryBased && anniversaryDate) {
    // Use year=2000 as dummy -- callers only use monthAbbr
    const range = getAnniversaryPeriodRange(anniversaryDate, 2000);
    if (range) {
      return `${range.start.monthAbbr} \u2192 ${range.end.monthAbbr}`;
    }
    return 'Annual';
  }

  // Normalize to lowercase to handle mixed casing from database TimePeriod values
  const normalizedPeriod = associatedPeriod.toLowerCase();

  const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
    (k) => CREDIT_PERIODS[k] === normalizedPeriod
  ) as keyof typeof CREDIT_INTERVALS | undefined;

  if (!periodKey) return associatedPeriod;

  const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
  const currentPeriodNumber = getCurrentPeriodIndex(normalizedPeriod as CreditPeriodType, now);
  return getPeriodMonthRange(currentPeriodNumber, intervals);
}
