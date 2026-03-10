import type { CreditCardDetails } from '@/types/CreditCardTypes';

export interface YearMonth {
  y: number;
  m: number;
}

export function getNextYearMonth(year: number, month: number): YearMonth {
  let m = month + 1;
  let y = year;
  if (m > 12) {
    m = 1;
    y = year + 1;
  }
  return { y, m };
}

export function getPrevYearMonth(year: number, month: number): YearMonth {
  let m = month - 1;
  let y = year;
  if (m < 1) {
    m = 12;
    y = year - 1;
  }
  return { y, m };
}

/**
 * Get the earliest open date year from a set of cards.
 * Returns null if no cards have open dates.
 */
function getEarliestOpenDateYear(cards: CreditCardDetails[]): number | null {
  let earliest: number | null = null;
  for (const card of cards) {
    if (!card.openDate) continue;
    // openDate format is MM/DD/YYYY
    const parts = card.openDate.split('/');
    const year = parseInt(parts[2], 10);
    if (!Number.isFinite(year)) continue;
    if (earliest === null || year < earliest) {
      earliest = year;
    }
  }
  return earliest;
}

export function isAllowedYearMonth(
  year: number,
  month: number,
  cards: CreditCardDetails[],
  now: Date = new Date()
): boolean {
  const maxYear = now.getFullYear();
  const maxMonth = now.getMonth() + 1;
  const earliestYear = getEarliestOpenDateYear(cards);
  const minYear = earliestYear ?? maxYear;
  if (year > maxYear || (year === maxYear && month > maxMonth)) return false;
  if (year < minYear) return false;
  return true;
}

export function buildYearOptions(
  cards: CreditCardDetails[],
  now: Date = new Date()
): number[] {
  const currentYear = now.getFullYear();
  const earliestYear = getEarliestOpenDateYear(cards);
  const startYear = earliestYear ?? currentYear;
  const years: number[] = [];
  for (let y = currentYear; y >= startYear; y -= 1) years.push(y);
  return years;
}

export function clampMonthForYear(
  year: number,
  month: number,
  cards: CreditCardDetails[],
  now: Date = new Date()
): number {
  const maxYear = now.getFullYear();
  const maxMonth = now.getMonth() + 1;

  let result = month;
  if (year === maxYear && result > maxMonth) result = maxMonth;
  return result;
}
