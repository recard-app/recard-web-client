import React from 'react';
import './CreditList.scss';
import { UserCredit } from '../../../types';
import { CreditCardDetails, CardCredit } from '../../../types/CreditCardTypes';
import CreditEntry from './CreditEntry';

export interface CreditListProps {
  credits: UserCredit[];
  now: Date;
  cardById: Map<string, CreditCardDetails>;
  creditByPair: Map<string, CardCredit>;
}

const CreditList: React.FC<CreditListProps> = ({ credits, now, cardById, creditByPair }) => {
  if (!credits || credits.length === 0) return null;
  return (
    <div className="credit-list">
      {credits.map((uc) => (
        <CreditEntry key={`${uc.CardId}:${uc.CreditId}`} userCredit={uc} now={now} card={cardById.get(uc.CardId) || null} cardCredit={creditByPair.get(`${uc.CardId}:${uc.CreditId}`) || null} />
      ))}
    </div>
  );
};

export default CreditList;

