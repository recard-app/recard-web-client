import React, { useMemo } from 'react';
import './CreditPeriodGroup.scss';
import { CalendarUserCredits, CreditPeriodType, CreditUsageType, MONTH_LABEL_ABBREVIATIONS, CREDIT_PERIODS } from '../../../types';
import CreditList from '../CreditList';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';

export interface CreditPeriodGroupProps {
  period: CreditPeriodType;
  calendar: CalendarUserCredits;
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
}

const CreditPeriodGroup: React.FC<CreditPeriodGroupProps> = ({ period, calendar, now, cardById, creditByPair, onUpdateHistoryEntry }) => {
  const creditsForPeriod = useMemo(() => {
    return (calendar.Credits || []).filter((c) => c.AssociatedPeriod === period);
  }, [calendar, period]);

  if (creditsForPeriod.length === 0) {
    return null;
  }

  const title = period.charAt(0).toUpperCase() + period.slice(1);

  // Build period cells across top using MONTH_LABEL_ABBREVIATIONS and math
  const monthLabels = MONTH_LABEL_ABBREVIATIONS.map(m => m.label);
  type Cell = { label: string; startMonthIndex: number; endMonthIndex: number };
  const cells: Cell[] = useMemo(() => {
    if (period === CREDIT_PERIODS.Monthly) {
      return monthLabels.map((label, idx) => ({ label, startMonthIndex: idx, endMonthIndex: idx }));
    }
    if (period === CREDIT_PERIODS.Quarterly) {
      const quarterSize = 3;
      const out: Cell[] = [];
      for (let i = 0; i < 12; i += quarterSize) {
        const startIdx = i;
        const endIdx = i + quarterSize - 1;
        out.push({ label: `${monthLabels[startIdx]} - ${monthLabels[endIdx]}`, startMonthIndex: startIdx, endMonthIndex: endIdx });
      }
      return out;
    }
    if (period === CREDIT_PERIODS.Semiannually) {
      const halfSize = 6;
      return [
        { label: `${monthLabels[0]} - ${monthLabels[halfSize - 1]}`, startMonthIndex: 0, endMonthIndex: halfSize - 1 },
        { label: `${monthLabels[halfSize]} - ${monthLabels[11]}`, startMonthIndex: halfSize, endMonthIndex: 11 },
      ];
    }
    if (period === CREDIT_PERIODS.Annually) {
      return [{ label: `${monthLabels[0]} - ${monthLabels[11]}`, startMonthIndex: 0, endMonthIndex: 11 }];
    }
    return [];
  }, [period]);

  // Selected/browsed time from props (moves as user browses)
  const selectedMonthIdx = now.getMonth(); // 0-11
  const selectedYear = now.getFullYear();
  const groupYear = calendar.Year;

  // Real current time (should not move while browsing)
  const realNow = new Date();
  const realMonthIdx = realNow.getMonth();
  const realYear = realNow.getFullYear();

  return (
    <section className="credit-period-group" aria-labelledby={`period-${period}`}>
      <h3 id={`period-${period}`} className="period-title">{title}</h3>
      <div className="period-bar">
        {cells.map((cell, idx) => {
          const isActive = (groupYear === selectedYear) && (selectedMonthIdx >= cell.startMonthIndex && selectedMonthIdx <= cell.endMonthIndex);
          const isPast = (groupYear < realYear) || (groupYear === realYear && cell.endMonthIndex < realMonthIdx);
          const isCurrent = (groupYear === realYear) && (realMonthIdx >= cell.startMonthIndex && realMonthIdx <= cell.endMonthIndex);
          return (
            <div key={idx} className={`period-cell ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}`}>{cell.label}</div>
          );
        })}
      </div>
      <CreditList credits={creditsForPeriod} now={now} cardById={cardById} creditByPair={creditByPair} onUpdateHistoryEntry={onUpdateHistoryEntry} />
    </section>
  );
};

export default CreditPeriodGroup;

