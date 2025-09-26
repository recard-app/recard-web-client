import React, { useState, useEffect } from 'react';
import './CreditList.scss';
import { CreditUsageType, UserCredit, MOBILE_BREAKPOINT } from '../../../types';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';
import CreditEntry from './CreditEntry';

export interface CreditListProps {
  credits: UserCredit[];
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
  onUpdateComplete?: () => void; // Optional callback when any credit is updated
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

const CreditList: React.FC<CreditListProps> = ({ credits, now, cardById, creditByPair, displayPeriod = true, onUpdateHistoryEntry, onUpdateComplete }) => {
  const isMobile = useIsMobile();

  if (!credits || credits.length === 0) return null;

  return (
    <div className="credit-list">
      {credits.map((uc) => {
        const card = cardById.get(uc.CardId) || null;
        const cardCredit = creditByPair.get(`${uc.CardId}:${uc.CreditId}`) || null;
        const creditMaxValue = cardCredit?.Value;
        return (
          <CreditEntry
            key={`${uc.CardId}:${uc.CreditId}`}
            userCredit={uc}
            now={now}
            card={card}
            cardCredit={cardCredit}
            creditMaxValue={typeof creditMaxValue === 'string' ? Number(creditMaxValue.replace(/[^0-9.]/g, '')) : (creditMaxValue as unknown as number) }
            disableDropdown={isMobile} // Disable dropdown on mobile
            displayPeriod={displayPeriod}
            onUpdateHistoryEntry={onUpdateHistoryEntry}
            onUpdateComplete={onUpdateComplete}
          />
        );
      })}
    </div>
  );
};

export default CreditList;

