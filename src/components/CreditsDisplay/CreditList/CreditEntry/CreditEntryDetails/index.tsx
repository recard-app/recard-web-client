import React from 'react';
import './CreditEntryDetails.scss';
import { CreditUsageType, UserCredit } from '../../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../../types/CreditCardTypes';

export interface CreditEntryDetailsProps {
  userCredit: UserCredit;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number;
  currentYear: number;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  hideControls?: boolean;
  selectedPeriodNumber?: number;
  onPeriodSelect?: (periodNumber: number) => void;
  isExpiring?: boolean;
  daysUntilExpiration?: number;
}

const CreditEntryDetails: React.FC<CreditEntryDetailsProps> = ({
  userCredit,
  card,
  cardCredit,
}) => {
  return (
    <div className="credit-detail-content">
      {/* Description */}
      {cardCredit?.Description && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Description</span>
          <div className="credit-detail-value">{cardCredit.Description}</div>
        </div>
      )}

      {/* Details */}
      {cardCredit?.Details && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Details</span>
          <div className="credit-detail-value">{cardCredit.Details}</div>
        </div>
      )}

      {/* Requirements */}
      {cardCredit?.Requirements && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Requirements</span>
          <div className="credit-detail-value">{cardCredit.Requirements}</div>
        </div>
      )}

      {/* Anniversary-based credit note */}
      {(cardCredit?.isAnniversaryBased || userCredit.isAnniversaryBased) && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Note</span>
          <div className="credit-detail-value">
            This credit renews on your card anniversary{card?.openDate ? ` (${card.openDate})` : ''} rather than the calendar year.
          </div>
        </div>
      )}

    </div>
  );
};

export default CreditEntryDetails;
