import React, { useMemo } from 'react';
import './CreditsDisplay.scss';
import { CalendarUserCredits, CREDIT_PERIODS, CreditPeriodType, CreditUsageType } from '../../types';
import CreditPeriodGroup from './CreditPeriodGroup';
import { CreditCardDetails, CardCredit } from '../../types/CreditCardTypes';

export interface CreditsDisplayProps {
  calendar: CalendarUserCredits | null;
  isLoading?: boolean;
  // Allows callers to override the notion of "now" (useful for tests)
  now?: Date;
  userCards?: CreditCardDetails[];
  // Navigation helpers provided by parent (MyCredits)
  onJumpMonths?: (deltaMonths: number) => void;
  canJumpMonths?: (deltaMonths: number) => boolean;
  // Visibility filters
  showUsed?: boolean;
  showNotUsed?: boolean;
  showPartiallyUsed?: boolean;
  showInactive?: boolean;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ calendar, isLoading = false, now, userCards = [], onJumpMonths, canJumpMonths, showUsed = true, showNotUsed = true, showPartiallyUsed = true, showInactive = true, onUpdateHistoryEntry }) => {
  const effectiveNow = useMemo(() => now ?? new Date(), [now]);

  const periodOrder: CreditPeriodType[] = useMemo(() => {
    // Use the order defined in CREDIT_PERIODS from the types file
    return Object.values(CREDIT_PERIODS) as CreditPeriodType[];
  }, []);

  // Build lookup maps for quick resolution in child components
  const cardById = useMemo(() => {
    const map = new Map<string, CreditCardDetails>();
    for (const c of userCards || []) map.set(c.id, c);
    return map;
  }, [userCards]);

  const creditByPair = useMemo(() => {
    const map = new Map<string, CardCredit>();
    for (const c of userCards || []) {
      for (const credit of c.Credits || []) {
        map.set(`${c.id}:${credit.id}`, credit);
      }
    }
    return map;
  }, [userCards]);

  if (isLoading) {
    return (
      <div className="credits-display loading">Loading credits…</div>
    );
  }

  if (!calendar) {
    return (
      <div className="credits-display empty">No credit history found for the current year.</div>
    );
  }

  return (
    <div className="credits-display">
      {periodOrder.map((period) => (
        <CreditPeriodGroup
          key={period}
          period={period}
          calendar={calendar}
          now={effectiveNow}
          cardById={cardById}
          creditByPair={creditByPair}
          onJumpMonths={onJumpMonths}
          canJumpMonths={canJumpMonths}
          showUsed={showUsed}
          showNotUsed={showNotUsed}
          showPartiallyUsed={showPartiallyUsed}
          showInactive={showInactive}
          onUpdateHistoryEntry={onUpdateHistoryEntry}
        />
      ))}
    </div>
  );
};

export default CreditsDisplay;

