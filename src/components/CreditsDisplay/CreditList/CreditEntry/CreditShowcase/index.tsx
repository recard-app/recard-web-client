import React from 'react';
import './CreditShowcase.scss';
import { UserCredit } from '../../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../../types/CreditCardTypes';
import { CardIcon } from '../../../../../icons';

interface CreditShowcaseProps {
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  userCredit: UserCredit;
  currentYear: number;
}

const CreditShowcase: React.FC<CreditShowcaseProps> = ({
  card,
  cardCredit,
  userCredit,
  currentYear,
}) => {
  const title = cardCredit?.Title ?? userCredit.CreditId;
  const cardName = card?.CardName ?? '';
  const category = cardCredit?.Category;
  const subCategory = cardCredit?.SubCategory;
  const timePeriod = cardCredit?.TimePeriod ?? userCredit.AssociatedPeriod;
  const value = cardCredit?.Value ?? 0;

  const totalUsed = userCredit.History.reduce(
    (sum: number, h: any) => sum + (h.ValueUsed || 0),
    0
  );
  const totalPossible = value * userCredit.History.length;

  const showcaseStyle = card?.CardPrimaryColor
    ? ({
        '--showcase-solid': `color-mix(in srgb, ${card.CardPrimaryColor} 8%, white)`,
        '--showcase-gradient': `linear-gradient(to bottom, color-mix(in srgb, ${card.CardPrimaryColor} 12%, white), white)`,
      } as React.CSSProperties)
    : undefined;

  return (
    <div className="credit-showcase-wrapper">
      <div className="credit-showcase" style={showcaseStyle}>
        <div className="showcase-identity">
          {card && (
            <CardIcon
              title={card.CardName}
              size={36}
              primary={card.CardPrimaryColor}
              secondary={card.CardSecondaryColor}
            />
          )}
          <div className="showcase-info">
            <h3>{title}</h3>
            {cardName && <p className="showcase-card-name">{cardName}</p>}
            <div className="showcase-badges">
              {(category || subCategory) && (
                <span className="badge badge-category">
                  {category}{subCategory ? ` > ${subCategory}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="credit-showcase-footer">
        <div className="meta-item">
          <span className="meta-label">Value</span>
          <span className="meta-value">${value} {timePeriod}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">{currentYear} Usage</span>
          <span className="meta-value">${totalUsed} / ${totalPossible}</span>
        </div>
      </div>
    </div>
  );
};

export default CreditShowcase;
