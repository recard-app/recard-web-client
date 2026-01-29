import React, { useMemo, useEffect, useRef } from 'react';
import { UserCredit, CreditUsageType, CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS, MONTH_LABEL_ABBREVIATIONS } from '../../../../../../types';
import { CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_DISPLAY_NAMES } from '../../../../../../types/CardCreditsTypes';
import { COLORS } from '../../../../../../types/Colors';
import { isPeriodFuture } from '../../utils';
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

const CreditUsageTracker: React.FC<CreditUsageTrackerProps> = ({
  userCredit,
  currentYear,
  currentUsage,
  currentValueUsed,
  selectedPeriodNumber,
  onPeriodSelect,
  creditMaxValue = 100,
  isUpdating
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const periodRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Calculate the fill percentage for bar display
  const calculateFillPercentage = (
    usage: CreditUsageType,
    valueUsed: number,
    maxValue: number
  ): number => {
    // INACTIVE/DISABLED = 0% (empty bar)
    if (usage === CREDIT_USAGE.INACTIVE || usage === CREDIT_USAGE.DISABLED) {
      return 0;
    }

    // USED = 100%
    if (usage === CREDIT_USAGE.USED) {
      return 100;
    }

    // NOT_USED = minimum 5% so it's visible
    if (usage === CREDIT_USAGE.NOT_USED || valueUsed === 0) {
      return 5;
    }

    // PARTIALLY_USED = actual percentage (minimum 5%)
    const percentage = maxValue > 0 ? (valueUsed / maxValue) * 100 : 5;
    return Math.max(5, Math.min(100, percentage));
  };

  const periods = useMemo(() => {
    const now = new Date();
    const isCurrentYear = currentYear === now.getFullYear();

    // Handle anniversary-based credits
    if (userCredit.isAnniversaryBased) {
      const anniversaryYear = userCredit.anniversaryYear || currentYear;
      const historyEntry = userCredit.History.find((h: any) => h.PeriodNumber === 1);
      const usage = (historyEntry?.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE;
      const valueUsed = historyEntry?.ValueUsed ?? 0;

      return [{
        periodNumber: 1,
        name: String(anniversaryYear),
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

    // Generate month labels for date ranges
    const monthLabels = MONTH_LABEL_ABBREVIATIONS.map(m => m.label);

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

      // Generate simplified period labels
      let periodName = '';
      if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
        periodName = monthLabels[i - 1] || `${i}`;
      } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
        periodName = `Q${i}`;
      } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
        periodName = `H${i}`;
      } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
        periodName = `${currentYear}`;
      }

      periodsInfo.push({
        periodNumber: i,
        name: periodName.toUpperCase(),
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

  const getUsageColor = (usage: CreditUsageType, isFuture: boolean): string => {
    if (isFuture && usage === CREDIT_USAGE.NOT_USED) {
      return COLORS.NEUTRAL_MEDIUM_GRAY;
    }

    switch (usage) {
      case CREDIT_USAGE.USED:
        return CREDIT_USAGE_DISPLAY_COLORS.USED;
      case CREDIT_USAGE.PARTIALLY_USED:
        return CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED;
      case CREDIT_USAGE.NOT_USED:
        return CREDIT_USAGE_DISPLAY_COLORS.NOT_USED;
      case CREDIT_USAGE.DISABLED:
        return CREDIT_USAGE_DISPLAY_COLORS.DISABLED;
      case CREDIT_USAGE.INACTIVE:
      default:
        return CREDIT_USAGE_DISPLAY_COLORS.INACTIVE;
    }
  };

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
          const usageColor = getUsageColor(period.usage, period.isFuture);
          const isSelected = selectedPeriodNumber === period.periodNumber;
          const isNonInteractive = period.isFuture || isDisabled;
          const fillPercentage = calculateFillPercentage(period.usage, period.valueUsed, creditMaxValue);
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
              <div className="period-bar-container">
                <div
                  className="period-bar-fill"
                  style={{
                    height: `${fillPercentage}%`,
                    backgroundColor: usageColor
                  }}
                />
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
