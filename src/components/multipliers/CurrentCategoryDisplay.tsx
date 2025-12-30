import type { RotatingScheduleEntry, SchedulePeriodType } from '@/types';

interface CurrentCategoryDisplayProps {
  scheduleEntry: RotatingScheduleEntry;
  className?: string;
}

/**
 * Parse a YYYY-MM-DD date string as a local calendar date (no timezone shift)
 */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date range for display
 */
function formatDateRange(startDate: string, endDate: string): string {
  // Parse as local dates to avoid timezone shift (UTC midnight -> local time bug)
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Format a period label (Q1 2025, Jan 2025, H1 2025, etc.)
 */
function formatPeriodLabel(
  periodType: SchedulePeriodType,
  periodValue: number | undefined,
  year: number
): string {
  switch (periodType) {
    case 'quarter':
      return `Q${periodValue} ${year}`;
    case 'month':
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[(periodValue ?? 1) - 1]} ${year}`;
    case 'half_year':
      return `H${periodValue} ${year}`;
    case 'year':
      return `${year}`;
    case 'custom':
      return 'Custom Period';
    default:
      return '';
  }
}

/**
 * Display current category for rotating multipliers.
 * Shows the category name, schedule period, and date range.
 */
export function CurrentCategoryDisplay({ scheduleEntry, className = '' }: CurrentCategoryDisplayProps) {
  const periodLabel = formatPeriodLabel(
    scheduleEntry.periodType,
    scheduleEntry.periodValue,
    scheduleEntry.year
  );

  const dateRange = formatDateRange(
    scheduleEntry.startDate,
    scheduleEntry.endDate
  );

  return (
    <div className={`current-category-display ${className}`}>
      <span className="category-name">{scheduleEntry.title}</span>
      <span className="period-info">
        <span className="period-text"> - {periodLabel} ({dateRange})</span>
      </span>
    </div>
  );
}

export default CurrentCategoryDisplay;
