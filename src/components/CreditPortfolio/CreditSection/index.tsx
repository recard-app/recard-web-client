import React, { useMemo } from 'react';
import { CREDIT_USAGE_DISPLAY_NAMES } from '@/types/CardCreditsTypes';
import { COLORS } from '@/types/Colors';
import UsageBar from '@/components/UsageBar';
import { CreditSectionProps } from '../types';
import './CreditSection.scss';

// Get credit value (already a number)
const getCreditValue = (value: number): number => {
  return value || 0;
};

const CreditSection: React.FC<CreditSectionProps> = ({
  credit,
  cardCredit,
  onClick
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

    return {
      totalUsed: Math.round(totalUsed * 100) / 100,
      totalPossible: Math.round(totalPossible * 100) / 100
    };
  }, [credit.History, credit.isAnniversaryBased, creditValue]);

  // Determine if this is an anniversary-based credit
  const isAnniversaryBased = credit.isAnniversaryBased ?? cardCredit?.isAnniversaryBased ?? false;

  // Capitalize period label from CREDIT_PERIODS values
  const period = isAnniversaryBased ? 'yearly' : credit.AssociatedPeriod;
  const periodTypeLabel = period.charAt(0).toUpperCase() + period.slice(1);

  return (
    <div className="credit-section" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
      <div className="credit-header">
        <h4 className="credit-title">{cardCredit.Title}</h4>
        <span className="credit-period">
          {periodTypeLabel}
          {isAnniversaryBased && <span className="anniversary-badge">Anniversary</span>}
        </span>
      </div>

      {usageStats.totalPossible > 0 && (
        <>
          <div className="credit-usage-bar">
            <UsageBar
              segments={[
                { label: CREDIT_USAGE_DISPLAY_NAMES.USED, value: usageStats.totalUsed, color: COLORS.PRIMARY_MEDIUM }
              ]}
              maxValue={usageStats.totalPossible}
              showLabels={false}
              valuePrefix="$"
            />
          </div>
          <div className={`credit-stat${usageStats.totalUsed >= usageStats.totalPossible ? ' fully-used' : ''}`}>
            <span>${usageStats.totalUsed} / ${usageStats.totalPossible}</span>
            <span>{Math.round((usageStats.totalUsed / usageStats.totalPossible) * 100)}%</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CreditSection;
