import React from 'react';
import './CreditGroup.scss';
import { CreditUsageType, UserCredit, UserCreditWithExpiration } from '../../../types';
import CreditList from '../CreditList';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';

export interface CreditGroupProps {
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
    <section className="credit-group">
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