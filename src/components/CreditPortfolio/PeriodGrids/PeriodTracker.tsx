import React from 'react';
import { CREDIT_USAGE, CreditUsageType } from '@/types';
import { CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_ICON_NAMES } from '@/types/CardCreditsTypes';
import { COLORS } from '@/types/Colors';
import Icon from '@/icons';
import { PeriodTrackerProps } from '../types';
import './PeriodGrids.scss';

// Color utility functions
const parseHexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
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

const getUsageIcon = (usage: CreditUsageType, isFuture: boolean): string => {
  if (isFuture && usage === CREDIT_USAGE.NOT_USED) {
    return 'future-icon-filled';
  }

  switch (usage) {
    case CREDIT_USAGE.USED:
      return CREDIT_USAGE_ICON_NAMES.USED;
    case CREDIT_USAGE.PARTIALLY_USED:
      return CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED;
    case CREDIT_USAGE.NOT_USED:
      return CREDIT_USAGE_ICON_NAMES.NOT_USED;
    case CREDIT_USAGE.DISABLED:
      return CREDIT_USAGE_ICON_NAMES.DISABLED;
    case CREDIT_USAGE.INACTIVE:
    default:
      return CREDIT_USAGE_ICON_NAMES.INACTIVE;
  }
};

const PeriodTracker: React.FC<PeriodTrackerProps> = ({
  periods,
  onPeriodClick,
  isUpdating
}) => {
  return (
    <div className="period-tracker">
      {periods.map((period) => {
        const isDisabled = period.status === CREDIT_USAGE.DISABLED;
        const isNonInteractive = period.isFuture || isDisabled;
        const usageColor = getUsageColor(period.status, period.isFuture);
        const backgroundColor = tintHexColor(usageColor, 0.95);
        const updating = isUpdating?.(period.periodNumber) ?? false;

        return (
          <div
            key={period.periodNumber}
            className={`period-item ${isNonInteractive ? 'future' : ''} ${updating ? 'updating' : ''}`}
            style={{
              backgroundColor,
              color: usageColor,
              borderColor: usageColor
            }}
            onClick={() => {
              if (!isNonInteractive) {
                onPeriodClick(period.periodNumber, period.anniversaryYear);
              }
            }}
            role="button"
            tabIndex={isNonInteractive ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isNonInteractive) {
                e.preventDefault();
                onPeriodClick(period.periodNumber, period.anniversaryYear);
              }
            }}
          >
            <div className="period-content">
              <span className="period-label">{period.label}</span>
              <Icon
                name={getUsageIcon(period.status, period.isFuture)}
                variant="micro"
                size={12}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PeriodTracker;
