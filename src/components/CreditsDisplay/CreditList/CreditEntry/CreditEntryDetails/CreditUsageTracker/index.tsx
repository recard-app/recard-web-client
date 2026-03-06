import React, { useMemo, useEffect, useRef } from 'react';
import { UserCredit, CreditUsageType, CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS, MONTH_ABBREVIATIONS } from '../../../../../../types';
import { CREDIT_USAGE_DISPLAY_NAMES, CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_ICON_NAMES } from '../../../../../../types/CardCreditsTypes';
import { COLORS } from '../../../../../../types/Colors';
import { isPeriodFuture, parseAnniversaryMonth, getPeriodMonthRange } from '../../utils';
import Icon from '@/icons';
import './CreditUsageTracker.scss';

interface CreditUsageTrackerProps {
  userCredit: UserCredit;
  currentYear: number;
  currentUsage?: CreditUsageType;
  currentValueUsed?: number;
  selectedPeriodNumber?: number;
  onPeriodSelect?: (periodNumber: number, anniversaryYear?: number) => void;
  creditMaxValue?: number;
  isUpdating?: (periodNumber: number) => boolean;
}

interface PeriodInfo {
  periodNumber: number;
  name: string;
  usage: CreditUsageType;
  valueUsed: number;
  isFuture: boolean;
  isActive: boolean;
  anniversaryYear?: number;
}

type PillState = 'used' | 'partially_used' | 'not_used' | 'inactive' | 'disabled' | 'future';

const PILL_BG_COLORS: Record<PillState, string> = {
  used: `color-mix(in srgb, ${COLORS.PRIMARY_MEDIUM} 12%, ${COLORS.NEUTRAL_WHITE})`,
  partially_used: `color-mix(in srgb, ${COLORS.NEUTRAL_MEDIUM_GRAY} 15%, ${COLORS.NEUTRAL_WHITE})`,
  not_used: `color-mix(in srgb, ${COLORS.NEUTRAL_MEDIUM_GRAY} 15%, ${COLORS.NEUTRAL_WHITE})`,
  inactive: COLORS.NEUTRAL_LIGHTEST_GRAY,
  disabled: COLORS.NEUTRAL_LIGHTEST_GRAY,
  future: COLORS.NEUTRAL_LIGHTEST_GRAY
};

const PILL_TEXT_COLORS: Record<PillState, string> = {
  used: CREDIT_USAGE_DISPLAY_COLORS.USED,
  partially_used: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
  not_used: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
  inactive: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  disabled: CREDIT_USAGE_DISPLAY_COLORS.DISABLED,
  future: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE
};

const PILL_BORDER_COLORS: Record<PillState, string> = {
  used: `color-mix(in srgb, ${COLORS.PRIMARY_MEDIUM} 35%, transparent)`,
  partially_used: `color-mix(in srgb, ${COLORS.NEUTRAL_DARK_GRAY} 25%, transparent)`,
  not_used: `color-mix(in srgb, ${COLORS.NEUTRAL_DARK_GRAY} 25%, transparent)`,
  inactive: COLORS.BORDER_LIGHT_GRAY,
  disabled: COLORS.BORDER_LIGHT_GRAY,
  future: COLORS.BORDER_LIGHT_GRAY
};

const formatPillValue = (value: number): string => {
  if (value >= 1000) {
    const k = Math.round((value / 1000) * 10) / 10;
    return `$${k}K`;
  }
  return `$${Math.round(value)}`;
};

const getPillState = (period: PeriodInfo): PillState => {
  if (period.isFuture) return 'future';
  switch (period.usage) {
    case CREDIT_USAGE.USED: return 'used';
    case CREDIT_USAGE.PARTIALLY_USED: return 'partially_used';
    case CREDIT_USAGE.NOT_USED: return 'not_used';
    case CREDIT_USAGE.DISABLED: return 'disabled';
    case CREDIT_USAGE.INACTIVE:
    default: return 'inactive';
  }
};

const CreditUsageTracker: React.FC<CreditUsageTrackerProps> = ({
  userCredit,
  currentYear,
  currentUsage,
  currentValueUsed,
  selectedPeriodNumber,
  onPeriodSelect,
  isUpdating
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const periodRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const periods = useMemo(() => {
    const now = new Date();
    const isCurrentYear = currentYear === now.getFullYear();

    // Handle anniversary-based credits
    if (userCredit.isAnniversaryBased) {
      const anniversaryYear = userCredit.anniversaryYear || currentYear;
      const historyEntry = userCredit.History.find((h: any) => h.PeriodNumber === 1);
      const usage = (historyEntry?.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE;
      const valueUsed = historyEntry?.ValueUsed ?? 0;

      // Build "Mon YYYY → Mon YYYY" label from anniversaryDate
      let anniversaryLabel = String(anniversaryYear);
      if (userCredit.anniversaryDate) {
        const month = parseAnniversaryMonth(userCredit.anniversaryDate);
        if (month !== null) {
          const monthAbbr = MONTH_ABBREVIATIONS[month - 1];
          anniversaryLabel = `${monthAbbr} ${anniversaryYear} \u2192 ${monthAbbr} ${anniversaryYear + 1}`;
        }
      }

      return [{
        periodNumber: 1,
        name: anniversaryLabel,
        usage,
        valueUsed,
        isFuture: false,
        isActive: usage !== CREDIT_USAGE.INACTIVE && usage !== CREDIT_USAGE.DISABLED,
        anniversaryYear
      }];
    }

    // Get the period type and calculate number of periods
    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === userCredit.AssociatedPeriod
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return [];

    const totalPeriods = CREDIT_INTERVALS[periodKey] ?? 1;
    const periodsInfo: PeriodInfo[] = [];

    for (let i = 1; i <= totalPeriods; i++) {
      // Find the historical data for this period
      const historyEntry = userCredit.History.find((h: any) => h.PeriodNumber === i);

      // Calculate if this period is in the future using the utility function
      const isFuture = isCurrentYear
        ? isPeriodFuture(i, userCredit.AssociatedPeriod, now)
        : currentYear > now.getFullYear();

      // Use current usage/value if this is the selected period and we have live data
      const isSelectedPeriod = selectedPeriodNumber === i;

      // Determine usage status - use from history or live data
      const usage: CreditUsageType = isSelectedPeriod && currentUsage !== undefined
        ? currentUsage
        : (historyEntry?.CreditUsage as CreditUsageType ?? CREDIT_USAGE.INACTIVE);

      const valueUsed = isSelectedPeriod && currentValueUsed !== undefined
        ? currentValueUsed
        : (historyEntry?.ValueUsed ?? 0);

      periodsInfo.push({
        periodNumber: i,
        name: getPeriodMonthRange(i, totalPeriods),
        usage,
        valueUsed,
        isFuture,
        isActive: !isFuture && usage !== CREDIT_USAGE.INACTIVE && usage !== CREDIT_USAGE.DISABLED
      });
    }

    return periodsInfo;
  }, [userCredit, currentYear, currentUsage, currentValueUsed, selectedPeriodNumber]);

  // Scroll selected period into view when it changes (horizontal only)
  useEffect(() => {
    if (selectedPeriodNumber && containerRef.current) {
      const selectedElement = periodRefs.current.get(selectedPeriodNumber);
      if (selectedElement && containerRef.current) {
        const container = containerRef.current;
        const element = selectedElement;

        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        const elementCenter = elementRect.left + elementRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const scrollOffset = elementCenter - containerCenter;

        container.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedPeriodNumber]);

  const getUsageLabel = (usage: CreditUsageType, isFuture: boolean): string => {
    if (isFuture && usage === CREDIT_USAGE.NOT_USED) {
      return 'Future';
    }

    switch (usage) {
      case CREDIT_USAGE.USED:
        return CREDIT_USAGE_DISPLAY_NAMES.USED;
      case CREDIT_USAGE.PARTIALLY_USED:
        return CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED;
      case CREDIT_USAGE.NOT_USED:
        return CREDIT_USAGE_DISPLAY_NAMES.NOT_USED;
      case CREDIT_USAGE.DISABLED:
        return CREDIT_USAGE_DISPLAY_NAMES.DISABLED;
      case CREDIT_USAGE.INACTIVE:
      default:
        return CREDIT_USAGE_DISPLAY_NAMES.INACTIVE;
    }
  };

  const handlePeriodClick = (period: PeriodInfo) => {
    const isDisabled = period.usage === CREDIT_USAGE.DISABLED;
    const isNonInteractive = period.isFuture || isDisabled;

    if (onPeriodSelect && !isNonInteractive) {
      onPeriodSelect(period.periodNumber, period.anniversaryYear);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, period: PeriodInfo) => {
    const isDisabled = period.usage === CREDIT_USAGE.DISABLED;
    const isNonInteractive = period.isFuture || isDisabled;

    if ((e.key === 'Enter' || e.key === ' ') && !isNonInteractive) {
      e.preventDefault();
      handlePeriodClick(period);
    }
  };

  return (
    <div className="credit-usage-tracker">
      <div
        ref={containerRef}
        className={`tracker-periods ${userCredit.AssociatedPeriod}`}
      >
        {periods.map((period) => {
          const isDisabled = period.usage === CREDIT_USAGE.DISABLED;
          const isSelected = selectedPeriodNumber === period.periodNumber;
          const isNonInteractive = period.isFuture || isDisabled;
          const pillState = getPillState(period);
          const showValue = pillState === 'used' || pillState === 'partially_used' || pillState === 'not_used';
          const updating = isUpdating?.(period.periodNumber) ?? false;

          return (
            <div
              key={period.periodNumber}
              ref={(el) => {
                if (el) {
                  periodRefs.current.set(period.periodNumber, el);
                } else {
                  periodRefs.current.delete(period.periodNumber);
                }
              }}
              className={`tracker-period ${isNonInteractive ? 'future' : ''} ${onPeriodSelect && !isNonInteractive ? 'clickable' : ''} ${isSelected ? 'selected' : ''} ${updating ? 'updating' : ''}`}
              title={`${period.name}: ${period.isFuture ? 'Future period' : isDisabled ? 'Disabled period' : getUsageLabel(period.usage, period.isFuture)}${!isNonInteractive && period.valueUsed > 0 ? ` ($${period.valueUsed})` : ''}${onPeriodSelect && !isNonInteractive ? ' (Click to edit)' : ''}${isSelected ? ' [EDITING]' : ''}`}
              onClick={() => handlePeriodClick(period)}
              role="button"
              tabIndex={isNonInteractive ? -1 : 0}
              onKeyDown={(e) => handleKeyDown(e, period)}
            >
              <div className="period-bar-container" style={{ backgroundColor: PILL_BG_COLORS[pillState], borderColor: PILL_BORDER_COLORS[pillState] }}>
                {showValue && (
                  <span className="pill-value" style={{ color: PILL_TEXT_COLORS[pillState] }}>
                    {formatPillValue(period.valueUsed)}
                  </span>
                )}
                {pillState === 'inactive' && (
                  <Icon name={CREDIT_USAGE_ICON_NAMES.INACTIVE} variant="micro" size={14} style={{ color: PILL_TEXT_COLORS[pillState] }} />
                )}
              </div>
              <span className="period-label">{period.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreditUsageTracker;
