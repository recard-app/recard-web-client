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

export function isAllowedYearMonth(
  year: number,
  month: number,
  accountCreatedAt: Date | null,
  now: Date = new Date()
): boolean {
  const maxYear = now.getFullYear();
  const maxMonth = now.getMonth() + 1;
  const minYear = (accountCreatedAt ?? now).getFullYear();
  const minMonth = (accountCreatedAt ?? now).getMonth() + 1;
  if (year > maxYear || (year === maxYear && month > maxMonth)) return false;
  if (year < minYear || (year === minYear && month < minMonth)) return false;
  return true;
}

export function buildYearOptions(
  accountCreatedAt: Date | null,
  now: Date = new Date()
): number[] {
  const currentYear = now.getFullYear();
  const startYear = accountCreatedAt ? accountCreatedAt.getFullYear() : currentYear;
  const years: number[] = [];
  for (let y = currentYear; y >= startYear; y -= 1) years.push(y);
  return years;
}

export function clampMonthForYear(
  year: number,
  month: number,
  accountCreatedAt: Date | null,
  now: Date = new Date()
): number {
  const maxYear = now.getFullYear();
  const maxMonth = now.getMonth() + 1;
  const minYear = (accountCreatedAt ?? now).getFullYear();
  const minMonth = (accountCreatedAt ?? now).getMonth() + 1;

  let result = month;
  if (year === maxYear && result > maxMonth) result = maxMonth;
  if (year === minYear && result < minMonth) result = minMonth;
  return result;
}


