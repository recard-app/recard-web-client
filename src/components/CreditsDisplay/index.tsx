import React, { useMemo, ReactNode } from 'react';
import './CreditsDisplay.scss';
import { CalendarUserCredits, CREDIT_PERIODS, CreditPeriodType, CreditUsageType } from '../../types';
import CreditPeriodGroup from './CreditPeriodGroup';
import CreditGroup from './CreditGroup';
import { CreditCardDetails, CardCredit } from '../../types/CreditCardTypes';
import { useCredits } from '../../contexts/ComponentsContext';
import { MONTH_ABBREVIATIONS } from '../../types/Constants';

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
  showAllPeriods?: boolean;
  // Display mode - if true, uses CreditGroup (display-only) instead of CreditPeriodGroup
  useSimpleDisplay?: boolean;
  // Show period label (calendar icon with month name) in simple display mode
  showPeriodLabel?: boolean;
  // Show period text on individual credit entries (default: true)
  displayPeriod?: boolean;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  onUpdateComplete?: () => void; // Optional callback when any credit is updated
  children?: ReactNode; // Optional children to render at the bottom
  isUpdating?: boolean; // Optional flag to show updating indicators
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ calendar, isLoading = false, now, userCards = [], onJumpMonths, canJumpMonths, showUsed = true, showNotUsed = true, showPartiallyUsed = true, showInactive = true, showAllPeriods = true, useSimpleDisplay = false, showPeriodLabel = false, displayPeriod = true, onUpdateHistoryEntry, onUpdateComplete, children, isUpdating, onAddUpdatingCreditId, onRemoveUpdatingCreditId, isCreditUpdating }) => {
  const effectiveNow = useMemo(() => now ?? new Date(), [now]);
  const credits = useCredits(); // Get all credit data from the context

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

  // Build credit lookup map using the separate credits data from ComponentsContext
  const creditByPair = useMemo(() => {
    const map = new Map<string, CardCredit>();
    for (const credit of credits) {
      // Use ReferenceCardId to map credits to cards
      map.set(`${credit.ReferenceCardId}:${credit.id}`, credit);
    }
    return map;
  }, [credits]);

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

  if (useSimpleDisplay) {
    // Generate period label if requested
    const periodLabel = showPeriodLabel
      ? MONTH_ABBREVIATIONS[effectiveNow.getMonth()]
      : undefined;

    // For simple display mode, just show all credits in a single group
    return (
      <div className="credits-display">
        <CreditGroup
          title="Credits this month"
          periodLabel={periodLabel}
          credits={calendar.Credits}
          now={effectiveNow}
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
        {children}
      </div>
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
          showAllPeriods={showAllPeriods}
          displayPeriod={displayPeriod}
          onUpdateHistoryEntry={onUpdateHistoryEntry}
          onUpdateComplete={onUpdateComplete}
          isUpdating={isUpdating}
          onAddUpdatingCreditId={onAddUpdatingCreditId}
          onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
          isCreditUpdating={isCreditUpdating}
        />
      ))}
      {children}
    </div>
  );
};

export default CreditsDisplay;

