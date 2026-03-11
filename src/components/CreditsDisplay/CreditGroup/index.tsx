import React from 'react';
import './CreditGroup.scss';
import { UserCredit, UserCreditWithExpiration } from '../../../types';
import CreditList from '../CreditList';
import { CreditCard, CardCredit } from '../../../types/CreditCardTypes';

export interface CreditGroupProps {
  credits: (UserCredit | UserCreditWithExpiration)[];
  now: Date;
  cardById: Map<string, CreditCard>;
  creditByPair: Map<string, CardCredit>;
  displayPeriod?: boolean;
  onUpdateComplete?: () => void;
  isUpdating?: boolean;
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