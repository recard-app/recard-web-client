import React from 'react';
import '../CreditPeriodGroup/CreditPeriodGroup.scss'; // Share the same CSS
import { CreditUsageType, UserCredit, UserCreditWithExpiration } from '../../../types';
import CreditList from '../CreditList';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';
import Icon from '@/icons';

export interface CreditGroupProps {
  title: string;
  periodLabel?: string;
  credits: (UserCredit | UserCreditWithExpiration)[];
  now: Date;
  cardById: Map<string, CreditCardDetails>;
  creditByPair: Map<string, CardCredit>;
  displayPeriod?: boolean; // flag to display the period text (default: true)
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  onUpdateComplete?: () => void;
  isUpdating?: boolean; // Optional flag to show updating indicators
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
}

const CreditGroup: React.FC<CreditGroupProps> = ({
  title,
  periodLabel,
  credits,
  now,
  cardById,
  creditByPair,
  displayPeriod = true,
  onUpdateHistoryEntry,
  onUpdateComplete,
  isUpdating,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating
}) => {
  if (credits.length === 0) {
    return null;
  }

  return (
    <section className="credit-period-group" aria-labelledby={`credit-group-${title}`}>
      <div className="period-header">
        <h3 id={`credit-group-${title}`} className="period-title">{title}</h3>

        {periodLabel && (
          <div className="mobile-period-label desktop-visible">
            <Icon name="calendar" variant="micro" size={12} />
            <span className="period-label">{periodLabel}</span>
          </div>
        )}
      </div>

      <CreditList
        credits={credits}
        now={now}
        cardById={cardById}
        creditByPair={creditByPair}
        displayPeriod={displayPeriod}
        onUpdateHistoryEntry={onUpdateHistoryEntry}
        onUpdateComplete={onUpdateComplete}
        isUpdating={isUpdating}
        onAddUpdatingCreditId={onAddUpdatingCreditId}
        onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
        isCreditUpdating={isCreditUpdating}
      />
    </section>
  );
};

export default CreditGroup;