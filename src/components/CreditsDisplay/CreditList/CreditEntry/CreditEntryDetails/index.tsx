import React, { useState, useEffect, useMemo } from 'react';
import './CreditEntryDetails.scss';
import { CreditUsageType, CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS, UserCredit } from '../../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../../types/CreditCardTypes';
import { CardIcon } from '../../../../../icons';
import { MONTH_NAMES, MONTH_ABBREVIATIONS } from '../../../../../types/Constants';

export interface CreditEntryDetailsProps {
  userCredit: UserCredit;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number;
  currentYear: number;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  hideControls?: boolean;
  selectedPeriodNumber?: number;
  onPeriodSelect?: (periodNumber: number) => void;
}

const CreditEntryDetails: React.FC<CreditEntryDetailsProps> = ({ 
  userCredit, 
  now, 
  card, 
  cardCredit, 
  creditMaxValue, 
  onUpdateHistoryEntry,
  hideControls = false,
  selectedPeriodNumber: propSelectedPeriodNumber,
  onPeriodSelect: propOnPeriodSelect
}) => {
  // Compute the current period number based on AssociatedPeriod and now
  const currentPeriodNumber = useMemo(() => {
    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === userCredit.AssociatedPeriod
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return 1;

    const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
    if (intervals <= 1) return 1;
    const monthZeroBased = now.getMonth();
    const segmentLength = 12 / intervals;
    return Math.min(Math.max(Math.floor(monthZeroBased / segmentLength) + 1, 1), intervals);
  }, [now, userCredit.AssociatedPeriod]);

  // Use props if provided, otherwise fall back to local state
  const [localSelectedPeriodNumber, setLocalSelectedPeriodNumber] = useState<number>(currentPeriodNumber);
  const selectedPeriodNumber = propSelectedPeriodNumber ?? localSelectedPeriodNumber;
  const onPeriodSelect = propOnPeriodSelect ?? setLocalSelectedPeriodNumber;
  
  // Update selected period when current period changes (e.g., year navigation)
  useEffect(() => {
    if (propSelectedPeriodNumber === undefined) {
      setLocalSelectedPeriodNumber(currentPeriodNumber);
    }
  }, [currentPeriodNumber, propSelectedPeriodNumber]);

  // Get the effective period number (always use selected period in modal)
  const effectivePeriodNumber = selectedPeriodNumber;
  
  const currentHistory = useMemo(() => {
    return userCredit.History.find((h: any) => h.PeriodNumber === effectivePeriodNumber) ?? userCredit.History[0];
  }, [userCredit, effectivePeriodNumber]);

  // Modal-specific state for the selected period
  const [valueUsed, setValueUsed] = useState<number>(currentHistory?.ValueUsed ?? 0);
  const [usage, setUsage] = useState<CreditUsageType>(
    (currentHistory?.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE
  );
  
  // Sync modal state when the selected period changes
  useEffect(() => {
    if (currentHistory) {
      setUsage((currentHistory.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE);
      setValueUsed(currentHistory.ValueUsed ?? 0);
    }
  }, [currentHistory]);

  // Generate period name for display (dynamically calculated using CREDIT_INTERVALS)
  const getPeriodName = (periodNumber: number) => {
    if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
      return MONTH_NAMES[periodNumber - 1] || `Month ${periodNumber}`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
      // Calculate month range for this quarter (3 months per quarter)
      const monthsPerQuarter = 12 / CREDIT_INTERVALS.Quarterly;
      const startMonth = (periodNumber - 1) * monthsPerQuarter;
      const endMonth = startMonth + monthsPerQuarter - 1;
      const startMonthName = MONTH_ABBREVIATIONS[startMonth];
      const endMonthName = MONTH_ABBREVIATIONS[endMonth];
      return `${startMonthName} - ${endMonthName} (Q${periodNumber})`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
      // Calculate month range for this half (6 months per half)
      const monthsPerHalf = 12 / CREDIT_INTERVALS.Semiannually;
      const startMonth = (periodNumber - 1) * monthsPerHalf;
      const endMonth = startMonth + monthsPerHalf - 1;
      const startMonthName = MONTH_ABBREVIATIONS[startMonth];
      const endMonthName = MONTH_ABBREVIATIONS[endMonth];
      return `${startMonthName} - ${endMonthName} (H${periodNumber})`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
      return now.getFullYear().toString();
    }
    return `Period ${periodNumber}`;
  };
  
  // Generate selected period name for display
  const getSelectedPeriodName = () => getPeriodName(effectivePeriodNumber);



  return (
    <div className="credit-detail-content">
      {/* Description with stacked label */}
      {cardCredit?.Description && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Description</span>
          <div className="credit-detail-value">{cardCredit.Description}</div>
        </div>
      )}

      {/* Details with stacked label - full width */}
      {cardCredit?.Details && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Details</span>
          <div className="credit-detail-value">{cardCredit.Details}</div>
        </div>
      )}

      {/* Anniversary-based credit note */}
      {(cardCredit?.isAnniversaryBased || userCredit.isAnniversaryBased) && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Note</span>
          <div className="credit-detail-value">
            This credit renews annually on your card's anniversary date rather than the calendar year.
          </div>
        </div>
      )}

      {/* Time Period and Category side-by-side */}
      {(cardCredit?.TimePeriod || cardCredit?.Category || cardCredit?.SubCategory) && (
        <div className="credit-details-section">
          <div className="credit-detail-group">
            {cardCredit?.TimePeriod && (
              <div className="credit-detail-item">
                <span className="credit-detail-label">Time Period</span>
                <div className="credit-detail-value">{cardCredit.TimePeriod}</div>
              </div>
            )}
          </div>
          
          <div className="credit-detail-group">
            {(cardCredit?.Category || cardCredit?.SubCategory) && (
              <div className="credit-detail-item">
                <span className="credit-detail-label">Category</span>
                <div className="credit-detail-value">
                  {cardCredit.Category}{cardCredit.SubCategory ? ` › ${cardCredit.SubCategory}` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Statistics */}
      <div className="usage-stats-section">
        <div className="credit-detail-item">
          <span className="credit-detail-label">Usage This Year</span>
          <div className="credit-detail-value">
            ${userCredit.History.reduce((total: any, entry: any) => total + (entry.ValueUsed || 0), 0)} / ${(Number(cardCredit?.Value) || 0) * userCredit.History.length} used
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreditEntryDetails;
