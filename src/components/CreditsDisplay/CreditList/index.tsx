import React from 'react';
import './CreditList.scss';
import { CreditUsageType, UserCredit } from '../../../types';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';
import CreditEntry from './CreditEntry';

export interface CreditListProps {
  credits: UserCredit[];
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

const CreditList: React.FC<CreditListProps> = ({ credits, now, cardById, creditByPair, onUpdateHistoryEntry }) => {
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
            onUpdateHistoryEntry={onUpdateHistoryEntry}
          />
        );
      })}
    </div>
  );
};

export default CreditList;

