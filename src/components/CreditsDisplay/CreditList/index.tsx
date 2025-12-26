import React, { useState, useEffect, useMemo } from 'react';
import './CreditList.scss';
import { CreditUsageType, UserCredit, MOBILE_BREAKPOINT, CREDIT_PERIODS, CREDIT_INTERVALS } from '../../../types';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';
import CreditEntry from './CreditEntry';

export interface CreditListProps {
  credits: UserCredit[];
  now: Date;
  cardById: Map<string, CreditCardDetails>;
  creditByPair: Map<string, CardCredit>;
  displayPeriod?: boolean; // flag to display the period text (default: true)
  variant?: 'default' | 'sidebar'; // display variant (default: 'default')
  limit?: number; // maximum number of credits to display
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  onUpdateComplete?: () => void; // Optional callback when any credit is updated
  isUpdating?: boolean; // Optional flag to show updating indicators
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
}

// Simple hook to detect mobile screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

// Helper function to calculate current period number based on date and period type
const calculateCurrentPeriod = (now: Date, associatedPeriod: string): number => {
  const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
    (k) => CREDIT_PERIODS[k] === associatedPeriod
  ) as keyof typeof CREDIT_INTERVALS | undefined;

  if (!periodKey) return 1;

  const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
  if (intervals <= 1) return 1;
  const monthZeroBased = now.getMonth();
  const segmentLength = 12 / intervals;
  return Math.min(Math.max(Math.floor(monthZeroBased / segmentLength) + 1, 1), intervals);
};

const CreditList: React.FC<CreditListProps> = ({ credits, now, cardById, creditByPair, displayPeriod = true, variant = 'default', limit, onUpdateHistoryEntry, onUpdateComplete, isUpdating, onAddUpdatingCreditId, onRemoveUpdatingCreditId, isCreditUpdating }) => {
  const isMobile = useIsMobile();

  // DEBUG: Log map contents and credit lookups
  useEffect(() => {
    if (credits && credits.length > 0) {
      console.group('[CreditList DEBUG] Map Analysis');
      console.log('cardById keys:', Array.from(cardById.keys()));
      console.log('cardById size:', cardById.size);
      console.log('creditByPair keys:', Array.from(creditByPair.keys()));
      console.log('creditByPair size:', creditByPair.size);
      console.log('Calendar credits CardIds:', credits.map(uc => uc.CardId));
      console.log('Calendar credits CreditIds:', credits.map(uc => uc.CreditId));

      // Check for mismatches
      const missingCards: string[] = [];
      const missingCredits: string[] = [];
      credits.forEach(uc => {
        if (!cardById.has(uc.CardId)) {
          missingCards.push(uc.CardId);
        }
        const creditKey = `${uc.CardId}:${uc.CreditId}`;
        if (!creditByPair.has(creditKey)) {
          missingCredits.push(creditKey);
        }
      });

      if (missingCards.length > 0) {
        console.warn('MISSING CARDS - CardIds not found in cardById:', [...new Set(missingCards)]);
      }
      if (missingCredits.length > 0) {
        console.warn('MISSING CREDITS - Keys not found in creditByPair:', [...new Set(missingCredits)]);
      }
      console.groupEnd();
    }
  }, [credits, cardById, creditByPair]);

  if (!credits || credits.length === 0) return null;

  // Apply limit if specified
  const displayCredits = limit ? credits.slice(0, limit) : credits;
  const isSidebar = variant === 'sidebar';

  return (
    <div className={`credit-list ${isSidebar ? 'credit-list--sidebar' : ''}`}>
      {displayCredits.map((uc) => {
        const card = cardById.get(uc.CardId) || null;
        const cardCredit = creditByPair.get(`${uc.CardId}:${uc.CreditId}`) || null;
        const creditMaxValue = cardCredit?.Value;

        // Calculate current period using the same logic as CreditEntry
        const currentPeriodNumber = calculateCurrentPeriod(now, uc.AssociatedPeriod);
        const isThisCreditUpdating = isCreditUpdating?.(uc.CardId, uc.CreditId, currentPeriodNumber) || false;

        return (
          <CreditEntry
            key={`${uc.CardId}:${uc.CreditId}`}
            userCredit={uc}
            now={now}
            card={card}
            cardCredit={cardCredit}
            creditMaxValue={typeof creditMaxValue === 'string' ? Number(creditMaxValue.replace(/[^0-9.]/g, '')) : (creditMaxValue as unknown as number) }
            disableDropdown={isMobile || isSidebar} // Disable dropdown on mobile or sidebar
            displayPeriod={displayPeriod && !isSidebar} // Hide period in sidebar
            variant={variant}
            onUpdateHistoryEntry={onUpdateHistoryEntry}
            onUpdateComplete={onUpdateComplete}
            isUpdating={isThisCreditUpdating}
            onAddUpdatingCreditId={onAddUpdatingCreditId}
            onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
            isCreditUpdating={isCreditUpdating}
          />
        );
      })}
    </div>
  );
};

export default CreditList;

