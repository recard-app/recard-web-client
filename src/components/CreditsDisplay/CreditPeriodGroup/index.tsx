import React, { useMemo } from 'react';
import './CreditPeriodGroup.scss';
import { CalendarUserCredits, CreditPeriodType, CreditUsageType, MONTH_LABEL_ABBREVIATIONS, CREDIT_PERIODS, CREDIT_USAGE } from '../../../types';
import CreditList from '../CreditList';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';
import Icon from '@/icons';

export interface CreditPeriodGroupProps {
  period: CreditPeriodType;
  calendar: CalendarUserCredits;
  now: Date;
  cardById: Map<string, CreditCardDetails>;
  creditByPair: Map<string, CardCredit>;
  onJumpMonths?: (deltaMonths: number) => void;
  canJumpMonths?: (deltaMonths: number) => boolean;
  showUsed?: boolean;
  showNotUsed?: boolean;
  showPartiallyUsed?: boolean;
  showInactive?: boolean;
  // When true, show all period cells; when false, only show the active cell
  showAllPeriods?: boolean;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
}

const CreditPeriodGroup: React.FC<CreditPeriodGroupProps> = ({ period, calendar, now, cardById, creditByPair, onJumpMonths, canJumpMonths, showUsed = true, showNotUsed = true, showPartiallyUsed = true, showInactive = true, showAllPeriods = false, onUpdateHistoryEntry }) => {
  // Build period cells across top using MONTH_LABEL_ABBREVIATIONS and math
  const title = period.charAt(0).toUpperCase() + period.slice(1);
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

  const creditsForPeriod = useMemo(() => {
    return (calendar.Credits || [])
      .filter((c) => c.AssociatedPeriod === period)
      .filter((c) => {
        // filter by usage flags if needed for the currently selected period
        // Determine current period number for this credit
        const monthZero = now.getMonth();
        const intervals = period === CREDIT_PERIODS.Monthly ? 12 : period === CREDIT_PERIODS.Quarterly ? 4 : period === CREDIT_PERIODS.Semiannually ? 2 : 1;
        const segmentLen = 12 / intervals;
        const currentPeriodNumber = Math.min(Math.max(Math.floor(monthZero / segmentLen) + 1, 1), intervals);
        const history = c.History.find(h => h.PeriodNumber === currentPeriodNumber) || c.History[0];
        if (!history) return true;
        const usage = history.CreditUsage as CreditUsageType;
        if (!showUsed && usage === CREDIT_USAGE.USED) return false;
        if (!showNotUsed && usage === CREDIT_USAGE.NOT_USED) return false;
        if (!showPartiallyUsed && usage === CREDIT_USAGE.PARTIALLY_USED) return false;
        if (!showInactive && usage === CREDIT_USAGE.INACTIVE) return false;
        return true;
      });
  }, [calendar, period, now, showUsed, showNotUsed, showPartiallyUsed, showInactive]);

  if (creditsForPeriod.length === 0) {
    return null;
  }

  // Selected/browsed time from props (moves as user browses)
  const selectedMonthIdx = now.getMonth(); // 0-11
  const selectedYear = now.getFullYear();
  const groupYear = calendar.Year;

  // Real current time (should not move while browsing)
  const realNow = new Date();
  const realMonthIdx = realNow.getMonth();
  const realYear = realNow.getFullYear();

  // Get the active period label for mobile display
  const activePeriodLabel = useMemo(() => {
    const activeIdx = cells.findIndex((cell) =>
      (groupYear === selectedYear) && (selectedMonthIdx >= cell.startMonthIndex && selectedMonthIdx <= cell.endMonthIndex)
    );
    return activeIdx >= 0 ? cells[activeIdx].label : '';
  }, [cells, groupYear, selectedYear, selectedMonthIdx]);

  return (
    <section className="credit-period-group" aria-labelledby={`period-${period}`}>
      <div className="period-header">
        <h3 id={`period-${period}`} className="period-title">{title}</h3>
        
        {/* Mobile period label */}
        {activePeriodLabel && (
          <div className="mobile-period-label">
            <Icon name="calendar" variant="micro" size={12} />
            <span className="period-label">{activePeriodLabel}</span>
          </div>
        )}
      </div>
      
      <div className="period-bar">
        {(() => {
          const activeIdx = cells.findIndex((cell) =>
            (groupYear === selectedYear) && (selectedMonthIdx >= cell.startMonthIndex && selectedMonthIdx <= cell.endMonthIndex)
          );
          const jumpSize = period === CREDIT_PERIODS.Monthly ? 1
            : period === CREDIT_PERIODS.Quarterly ? 3
            : period === CREDIT_PERIODS.Semiannually ? 6
            : 12;
          const canBack = canJumpMonths ? canJumpMonths(-jumpSize) : false;
          const canForward = canJumpMonths ? canJumpMonths(jumpSize) : false;

          const renderCell = (cell: Cell, idx: number) => {
            const isActive = idx === activeIdx;
            const isPast = (groupYear < realYear) || (groupYear === realYear && cell.endMonthIndex < realMonthIdx);
            const isCurrent = (groupYear === realYear) && (realMonthIdx >= cell.startMonthIndex && realMonthIdx <= cell.endMonthIndex);
            const isFuture = (groupYear > realYear) || (groupYear === realYear && cell.startMonthIndex > realMonthIdx);

            const iconName = showAllPeriods
              ? (isCurrent ? 'map-pin' : null)
              : (isCurrent ? 'map-pin' : (isPast ? 'history-clock' : null));

            // If showing all periods: make cells clickable to jump to the start month of that period
            const targetDeltaMonths = (groupYear - selectedYear) * 12 + (cell.startMonthIndex - selectedMonthIdx);
            const canJumpToCell = !!(showAllPeriods && canJumpMonths && canJumpMonths(targetDeltaMonths));
            const handleCellClick = () => {
              if (showAllPeriods && onJumpMonths && canJumpToCell) {
                onJumpMonths(targetDeltaMonths);
              }
            };

            return (
              <div
                key={idx}
                className={`period-cell ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''} ${isCurrent ? 'current' : ''} ${showAllPeriods ? 'clickable' : ''} ${showAllPeriods && !canJumpToCell ? 'disabled' : ''}`}
                onClick={handleCellClick}
                role={showAllPeriods ? 'button' : undefined}
                aria-disabled={showAllPeriods && !canJumpToCell ? true : undefined}
                tabIndex={showAllPeriods ? 0 : undefined}
              >
                {iconName ? (
                  <span className="period-icon">
                    <Icon name={iconName} variant="micro" size={16} />
                  </span>
                ) : null}
                <span>{cell.label}</span>
              </div>
            );
          };

          if (activeIdx < 0) return null;

          return (
            <>
              {!showAllPeriods && (
                <button
                  type="button"
                  aria-label="Previous period"
                  className="button outline small px-2 period-nav"
                  disabled={!canBack}
                  onClick={() => onJumpMonths && onJumpMonths(-jumpSize)}
                >
                  <Icon name="chevron-down" variant="mini" size={16} className="rotate-90" />
                </button>
              )}
              {showAllPeriods ? (
                cells.map((c, i) => renderCell(c, i))
              ) : (
                renderCell(cells[activeIdx], activeIdx)
              )}
              {!showAllPeriods && (
                <button
                  type="button"
                  aria-label="Next period"
                  className="button outline small px-2 period-nav"
                  disabled={!canForward}
                  onClick={() => onJumpMonths && onJumpMonths(jumpSize)}
                >
                  <Icon name="chevron-down" variant="mini" size={16} className="-rotate-90" />
                </button>
              )}
            </>
          );
        })()}
      </div>
      <CreditList credits={creditsForPeriod} now={now} cardById={cardById} creditByPair={creditByPair} onUpdateHistoryEntry={onUpdateHistoryEntry} />
    </section>
  );
};

export default CreditPeriodGroup;

