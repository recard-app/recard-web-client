import React, { useMemo } from 'react';
import { CREDIT_PERIODS, CREDIT_USAGE_DISPLAY_NAMES } from '@/types/CardCreditsTypes';
import { COLORS } from '@/types/Colors';
import UsageBar from '@/components/UsageBar';
import PeriodTracker from '../PeriodGrids/PeriodTracker';
import { buildPeriodInfo } from '../PeriodGrids/utils';
import { CreditSectionProps } from '../types';
import './CreditSection.scss';

// Get credit value (already a number)
const getCreditValue = (value: number): number => {
  return value || 0;
};

// Get period display name
const getPeriodDisplayName = (period: string): string => {
  switch (period) {
    case CREDIT_PERIODS.Monthly:
    case 'monthly':
      return 'Monthly';
    case CREDIT_PERIODS.Quarterly:
    case 'quarterly':
      return 'Quarterly';
    case CREDIT_PERIODS.Semiannually:
    case 'semiannually':
      return 'Semi-annually';
    case CREDIT_PERIODS.Annually:
    case 'annually':
      return 'Annually';
    default:
      return period;
  }
};

const CreditSection: React.FC<CreditSectionProps> = ({
  credit,
  cardCredit,
  year,
  onPeriodClick,
  isUpdating
}) => {
  const creditValue = getCreditValue(cardCredit.Value);

  // Calculate total used and possible values
  const usageStats = useMemo(() => {
    let totalUsed = 0;
    let totalPossible = 0;

    // For anniversary credits, there's only 1 period
    if (credit.isAnniversaryBased) {
      const entry = credit.History.find(h => h.PeriodNumber === 1);
      totalUsed = entry?.ValueUsed ?? 0;
      totalPossible = creditValue;
    } else {
      // For calendar credits, sum up all periods
      for (const entry of credit.History) {
        totalUsed += entry.ValueUsed;
        totalPossible += creditValue;
      }
    }

    return { totalUsed, totalPossible };
  }, [credit.History, credit.isAnniversaryBased, creditValue]);

  // Determine if this is an anniversary-based credit
  const isAnniversaryBased = credit.isAnniversaryBased ?? cardCredit?.isAnniversaryBased ?? false;

  // Build period info for the unified PeriodTracker
  const periods = useMemo(() => {
    return buildPeriodInfo(credit, year, creditValue);
  }, [credit, year, creditValue]);

  // Determine period type label
  const periodTypeLabel = isAnniversaryBased
    ? 'Anniversary-based'
    : getPeriodDisplayName(credit.AssociatedPeriod);

  return (
    <div className="credit-section">
      <div className="credit-header">
        <div className="credit-info">
          <h4 className="credit-title">{cardCredit.Title}</h4>
          <span className="credit-meta">
            ${creditValue}/{periodTypeLabel.toLowerCase()}
            {isAnniversaryBased && <span className="anniversary-badge">Anniversary</span>}
          </span>
        </div>
      </div>

      <div className="credit-period-display">
        <PeriodTracker
          periods={periods}
          onPeriodClick={(periodNumber, anniversaryYear) => onPeriodClick(periodNumber, anniversaryYear)}
          isUpdating={isUpdating}
        />
      </div>

      {usageStats.totalPossible > 0 && (
        <div className="credit-usage-bar">
          <UsageBar
            segments={[
              { label: CREDIT_USAGE_DISPLAY_NAMES.USED, value: usageStats.totalUsed, color: COLORS.PRIMARY_MEDIUM }
            ]}
            maxValue={usageStats.totalPossible}
            showLabels={true}
            valuePrefix="$"
          />
        </div>
      )}
    </div>
  );
};

export default CreditSection;
