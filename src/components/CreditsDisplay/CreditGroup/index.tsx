import React from 'react';
import '../CreditPeriodGroup/CreditPeriodGroup.scss'; // Share the same CSS
import { CreditUsageType, UserCredit } from '../../../types';
import CreditList from '../CreditList';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';
import Icon from '@/icons';

export interface CreditGroupProps {
  title: string;
  periodLabel?: string;
  credits: UserCredit[];
  now: Date;
  cardById: Map<string, CreditCardDetails>;
  creditByPair: Map<string, CardCredit>;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  onUpdateComplete?: () => void;
}

const CreditGroup: React.FC<CreditGroupProps> = ({
  title,
  periodLabel,
  credits,
  now,
  cardById,
  creditByPair,
  onUpdateHistoryEntry,
  onUpdateComplete
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
        onUpdateHistoryEntry={onUpdateHistoryEntry}
        onUpdateComplete={onUpdateComplete}
      />
    </section>
  );
};

export default CreditGroup;