import {
  UserCredit,
  CreditUsageType,
  CREDIT_USAGE,
  CREDIT_INTERVALS,
  CREDIT_PERIODS,
  MONTH_LABEL_ABBREVIATIONS
} from '@/types';
import { PeriodInfo } from '../types';

// Month labels - use full abbreviations like CreditUsageTracker
const MONTH_LABELS = MONTH_LABEL_ABBREVIATIONS.map(m => m.label.toUpperCase());
const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];
const HALF_LABELS = ['H1', 'H2'];

/**
 * Gets the current period index for a given period type
 */
function getCurrentPeriodIndex(periodType: string, now: Date = new Date()): number {
  const monthZeroBased = now.getMonth();
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
  const segmentLength = 12 / intervals;
  const index = Math.floor(monthZeroBased / segmentLength) + 1;
  return Math.min(Math.max(index, 1), intervals);
}

/**
 * Determines if a period is in the future
 */
function isPeriodFuture(periodNumber: number, periodType: string, now: Date = new Date()): boolean {
  const currentIndex = getCurrentPeriodIndex(periodType, now);
  return periodNumber > currentIndex;
}

/**
 * Gets status from credit history for a period
 */
function getStatusFromHistory(history: UserCredit['History'], periodNumber: number): CreditUsageType {
  const entry = history.find(h => h.PeriodNumber === periodNumber);
  return (entry?.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE;
}

/**
 * Gets value used from credit history for a period
 */
function getValueFromHistory(history: UserCredit['History'], periodNumber: number): number {
  const entry = history.find(h => h.PeriodNumber === periodNumber);
  return entry?.ValueUsed ?? 0;
}

/**
 * Builds period info array for any credit type
 */
export function buildPeriodInfo(
  credit: UserCredit,
  year: number,
  creditValue: number
): PeriodInfo[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const isCurrentYear = year === currentYear;

  // Anniversary-based credits: single item with year label
  if (credit.isAnniversaryBased) {
    const anniversaryYear = credit.anniversaryYear || year;
    return [{
      periodNumber: 1,
      label: String(anniversaryYear),
      status: getStatusFromHistory(credit.History, 1),
      valueUsed: getValueFromHistory(credit.History, 1),
      maxValue: creditValue,
      isFuture: false,
      anniversaryYear: anniversaryYear
    }];
  }

  // Calendar-based credits
  let labels: string[];
  let periodCount: number;
  const periodType = credit.AssociatedPeriod;

  switch (periodType) {
    case CREDIT_PERIODS.Monthly:
    case 'monthly':
      labels = MONTH_LABELS;
      periodCount = 12;
      break;
    case CREDIT_PERIODS.Quarterly:
    case 'quarterly':
      labels = QUARTER_LABELS;
      periodCount = 4;
      break;
    case CREDIT_PERIODS.Semiannually:
    case 'semiannually':
      labels = HALF_LABELS;
      periodCount = 2;
      break;
    case CREDIT_PERIODS.Annually:
    case 'annually':
      labels = [String(year)];
      periodCount = 1;
      break;
    default:
      labels = MONTH_LABELS;
      periodCount = 12;
  }

  return labels.map((label, index) => {
    const periodNumber = index + 1;

    // Check if this period is in the future
    const isFuture = year > currentYear ||
      (isCurrentYear && isPeriodFuture(periodNumber, periodType, now));

    return {
      periodNumber,
      label,
      status: getStatusFromHistory(credit.History, periodNumber),
      valueUsed: getValueFromHistory(credit.History, periodNumber),
      maxValue: creditValue,
      isFuture
    };
  });
}
