import React, { useMemo } from 'react';
import './CreditEntry.scss';
import { CREDIT_INTERVALS, CREDIT_PERIODS, UserCredit } from '../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../types/CreditCardTypes';

export interface CreditEntryProps {
  userCredit: UserCredit;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
}

const CreditEntry: React.FC<CreditEntryProps> = ({ userCredit, now, card, cardCredit }) => {
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

  const currentHistory = useMemo(() => {
    return userCredit.History.find((h) => h.PeriodNumber === currentPeriodNumber) ?? userCredit.History[0];
  }, [userCredit, currentPeriodNumber]);

  return (
    <div className="credit-entry" data-period={userCredit.AssociatedPeriod}>
      <div className="credit-line">
        <div className="credit-id">{cardCredit?.Title ?? userCredit.CreditId}</div>
        <div className="credit-usage">{currentHistory?.CreditUsage}</div>
        <div className="credit-value-used">{currentHistory?.ValueUsed ?? 0}</div>
      </div>
      {cardCredit?.Description && (
        <div className="credit-desc">{cardCredit.Description}</div>
      )}
      {card && (
        <div className="credit-card-ref">{card.CardName}</div>
      )}
    </div>
  );
};

export default CreditEntry;