import React, { useMemo, useEffect, useRef } from 'react';
import { UserCredit, CreditUsageType, CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS, MONTH_LABEL_ABBREVIATIONS } from '../../../../../../types';
import { CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_ICON_NAMES } from '../../../../../../types/CardCreditsTypes';
import Icon from '@/icons';
import './CreditUsageTracker.scss';

interface CreditUsageTrackerProps {
  userCredit: UserCredit;
  currentYear: number;
  currentUsage?: CreditUsageType;
  currentValueUsed?: number;
  selectedPeriodNumber?: number;
  onPeriodSelect?: (periodNumber: number) => void;
}

interface PeriodInfo {
  periodNumber: number;
  name: string;
  usage: CreditUsageType;
  valueUsed: number;
  isFuture: boolean;
  isActive: boolean;
}

const CreditUsageTracker: React.FC<CreditUsageTrackerProps> = ({ userCredit, currentYear, currentUsage, currentValueUsed, selectedPeriodNumber, onPeriodSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const periodRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const periods = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-based month
    const isCurrentYear = currentYear === now.getFullYear();
    
    // Get the period type and calculate number of periods
    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === userCredit.AssociatedPeriod
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return [];

    const totalPeriods = CREDIT_INTERVALS[periodKey] ?? 1;
    const periodsInfo: PeriodInfo[] = [];

    // Generate month labels for date ranges (same logic as CreditPeriodGroup)
    const monthLabels = MONTH_LABEL_ABBREVIATIONS.map(m => m.label);


    for (let i = 1; i <= totalPeriods; i++) {
      // Find the historical data for this period
      const historyEntry = userCredit.History.find((h: any) => h.PeriodNumber === i);
      
      // Use current usage/value if this is the selected period and we have live data
      const isSelectedPeriod = selectedPeriodNumber === i;
      const usage = isSelectedPeriod && currentUsage !== undefined 
        ? currentUsage 
        : (historyEntry?.CreditUsage as CreditUsageType ?? CREDIT_USAGE.INACTIVE);
      const valueUsed = isSelectedPeriod && currentValueUsed !== undefined 
        ? currentValueUsed 
        : (historyEntry?.ValueUsed ?? 0);
      
      // Calculate if this period is in the future
      let isFuture = false;
      if (isCurrentYear) {
        if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
          isFuture = i > currentMonth;
        } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
          const currentQuarter = Math.ceil(currentMonth / 3);
          isFuture = i > currentQuarter;
        } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
          const currentHalf = Math.ceil(currentMonth / 6);
          isFuture = i > currentHalf;
        } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
          isFuture = false; // Always show annual period for current year
        }
      } else if (currentYear > now.getFullYear()) {
        // Entire year is in the future
        isFuture = true;
      }

      // Generate simplified period labels
      let periodName = '';
      if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
        periodName = monthLabels[i - 1] || `${i}`;
      } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
        periodName = `Q${i}`;
      } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
        periodName = `H${i}`;
      } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
        periodName = `${now.getFullYear()}`;
      }

      periodsInfo.push({
        periodNumber: i,
        name: periodName.toUpperCase(),
        usage,
        valueUsed,
        isFuture,
        isActive: !isFuture && usage !== CREDIT_USAGE.INACTIVE && usage !== CREDIT_USAGE.DISABLED && usage !== CREDIT_USAGE.FUTURE
      });
    }

    return periodsInfo;
  }, [userCredit, currentYear, currentUsage, currentValueUsed, selectedPeriodNumber]);

  // Scroll selected period into view when it changes (horizontal only)
  useEffect(() => {
    if (selectedPeriodNumber && containerRef.current) {
      const selectedElement = periodRefs.current.get(selectedPeriodNumber);
      if (selectedElement && containerRef.current) {
        // Calculate horizontal scroll position to center the selected element
        const container = containerRef.current;
        const element = selectedElement;
        
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate the scroll position to center the element horizontally
        const elementCenter = elementRect.left + elementRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const scrollOffset = elementCenter - containerCenter;
        
        // Only scroll horizontally within the container
        container.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedPeriodNumber]);

  const getUsageIcon = (usage: CreditUsageType): string => {
    switch (usage) {
      case CREDIT_USAGE.USED:
        return CREDIT_USAGE_ICON_NAMES.USED;
      case CREDIT_USAGE.PARTIALLY_USED:
        return CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED;
      case CREDIT_USAGE.NOT_USED:
        return CREDIT_USAGE_ICON_NAMES.NOT_USED;
      case CREDIT_USAGE.DISABLED:
      case CREDIT_USAGE.FUTURE:
        return CREDIT_USAGE_ICON_NAMES.DISABLED;
      case CREDIT_USAGE.INACTIVE:
      default:
        return CREDIT_USAGE_ICON_NAMES.INACTIVE;
    }
  };

  const getUsageColor = (usage: CreditUsageType, isFuture: boolean, isDisabled: boolean): string => {
    if (isFuture || isDisabled) {
      return CREDIT_USAGE_DISPLAY_COLORS.INACTIVE;
    }
    switch (usage) {
      case CREDIT_USAGE.USED:
        return CREDIT_USAGE_DISPLAY_COLORS.USED;
      case CREDIT_USAGE.PARTIALLY_USED:
        return CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED;
      case CREDIT_USAGE.NOT_USED:
        return CREDIT_USAGE_DISPLAY_COLORS.NOT_USED;
      case CREDIT_USAGE.DISABLED:
      case CREDIT_USAGE.FUTURE:
        return CREDIT_USAGE_DISPLAY_COLORS.DISABLED;
      case CREDIT_USAGE.INACTIVE:
      default:
        return CREDIT_USAGE_DISPLAY_COLORS.INACTIVE;
    }
  };



  // Tinting functions from CreditEntry
  const parseHexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    return { r, g, b };
  };

  const tintHexColor = (hex: string, tintFactor: number): string => {
    const { r, g, b } = parseHexToRgb(hex);
    const mix = (channel: number) => Math.round(channel + (255 - channel) * tintFactor);
    const nr = mix(r);
    const ng = mix(g);
    const nb = mix(b);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  const getUsageLabel = (usage: CreditUsageType): string => {
    switch (usage) {
      case CREDIT_USAGE.USED:
        return 'Used';
      case CREDIT_USAGE.PARTIALLY_USED:
        return 'Partial';
      case CREDIT_USAGE.NOT_USED:
        return 'Not Used';
      case CREDIT_USAGE.DISABLED:
        return 'Disabled';
      case CREDIT_USAGE.FUTURE:
        return 'Future';
      case CREDIT_USAGE.INACTIVE:
      default:
        return 'Untracked';
    }
  };

  return (
    <div className="credit-usage-tracker">
      <div 
        ref={containerRef}
        className={`tracker-periods ${userCredit.AssociatedPeriod}`}
      >
        {periods.map((period) => {
          const isDisabled = period.usage === CREDIT_USAGE.DISABLED || period.usage === CREDIT_USAGE.FUTURE;
          const usageColor = getUsageColor(period.usage, period.isFuture, isDisabled);
          const backgroundColor = tintHexColor(usageColor, 0.95);
          const isSelected = selectedPeriodNumber === period.periodNumber;
          const isNonInteractive = period.isFuture || isDisabled;

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
              className={`tracker-period ${isNonInteractive ? 'future' : ''} ${onPeriodSelect && !isNonInteractive ? 'clickable' : ''} ${isSelected ? 'selected' : ''}`}
              style={{
                backgroundColor: backgroundColor,
                color: usageColor,
                borderColor: usageColor
              }}
              title={`${period.name}: ${period.isFuture ? 'Future period' : isDisabled ? 'Disabled period' : getUsageLabel(period.usage)}${!isNonInteractive && period.valueUsed > 0 ? ` ($${period.valueUsed})` : ''}${onPeriodSelect && !isNonInteractive ? ' (Click to edit)' : ''}${isSelected ? ' [EDITING]' : ''}`}
              onClick={() => {
                if (onPeriodSelect && !isNonInteractive) {
                  onPeriodSelect(period.periodNumber);
                }
              }}
            >
              <div className="period-content">
                <span className="period-name">{period.name}</span>
                <Icon
                  name={getUsageIcon(period.usage)}
                  variant="micro"
                  size={12}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreditUsageTracker;