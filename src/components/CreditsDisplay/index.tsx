import React, { useMemo, ReactNode } from 'react';
import './CreditsDisplay.scss';
import { CalendarUserCredits, CreditUsageType } from '../../types';
import CreditGroup from './CreditGroup';
import { CreditCardDetails, CardCredit } from '../../types/CreditCardTypes';
import { useCredits } from '../../contexts/ComponentsContext';
import { InfoDisplay } from '../../elements';

export interface CreditsDisplayProps {
  calendar: CalendarUserCredits | null;
  isLoading?: boolean;
  // Allows callers to override the notion of "now" (useful for tests)
  now?: Date;
  userCards?: CreditCardDetails[];
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

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({
  calendar,
  isLoading = false,
  now,
  userCards = [],
  displayPeriod = true,
  onUpdateHistoryEntry,
  onUpdateComplete,
  children,
  isUpdating,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating
}) => {
  const effectiveNow = useMemo(() => now ?? new Date(), [now]);
  const credits = useCredits(); // Get all credit data from the context

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
      <div className="credits-display loading">
        <InfoDisplay
          type="loading"
          message="Loading credits..."
          showTitle={false}
          transparent={true}
          centered={true}
        />
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="credits-display empty">
        <InfoDisplay
          type="warning"
          message="No credit history found for the current year."
          showTitle={false}
          transparent={true}
          centered={true}
        />
      </div>
    );
  }

  return (
    <div className="credits-display">
      <CreditGroup
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
};

export default CreditsDisplay;
