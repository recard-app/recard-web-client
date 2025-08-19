import React, { useMemo } from 'react';
import './CreditPeriodGroup.scss';
import { CalendarUserCredits, CreditPeriodType } from '../../../types';
import CreditList from '../CreditList';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';

export interface CreditPeriodGroupProps {
  period: CreditPeriodType;
  calendar: CalendarUserCredits;
  now: Date;
  cardById: Map<string, CreditCardDetails>;
  creditByPair: Map<string, CardCredit>;
}

const CreditPeriodGroup: React.FC<CreditPeriodGroupProps> = ({ period, calendar, now, cardById, creditByPair }) => {
  const creditsForPeriod = useMemo(() => {
    return (calendar.Credits || []).filter((c) => c.AssociatedPeriod === period);
  }, [calendar, period]);

  if (creditsForPeriod.length === 0) {
    return null;
  }

  const title = period.charAt(0).toUpperCase() + period.slice(1);

  return (
    <section className="credit-period-group" aria-labelledby={`period-${period}`}>
      <h3 id={`period-${period}`} className="period-title">{title}</h3>
      <CreditList credits={creditsForPeriod} now={now} cardById={cardById} creditByPair={creditByPair} />
    </section>
  );
};

export default CreditPeriodGroup;

