import React from 'react';
import './CreditShowcase.scss';
import { UserCredit } from '../../../../../types';
import { CreditCard, CardCredit } from '../../../../../types/CreditCardTypes';
import { CardIcon } from '../../../../../icons';
import { formatCreditDollars } from '../utils';

interface CreditShowcaseProps {
  card: CreditCard | null;
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
        '--showcase-blob-1': `radial-gradient(ellipse at 89% 11%, color-mix(in srgb, ${card.CardPrimaryColor} 25%, transparent) 0%, color-mix(in srgb, ${card.CardPrimaryColor} 5%, transparent) 30%, color-mix(in srgb, ${card.CardPrimaryColor} 2%, transparent) 70%)`,
        '--showcase-blob-2': `radial-gradient(ellipse at 6% 50%, color-mix(in srgb, ${card.CardPrimaryColor} 15%, transparent) 0%, color-mix(in srgb, ${card.CardPrimaryColor} 3%, transparent) 30%, color-mix(in srgb, ${card.CardPrimaryColor} 1%, transparent) 70%)`,
        '--showcase-blob-3': `radial-gradient(ellipse at 72% 94%, color-mix(in srgb, ${card.CardPrimaryColor} 8%, transparent) 0%, color-mix(in srgb, ${card.CardPrimaryColor} 2%, transparent) 25%, color-mix(in srgb, ${card.CardPrimaryColor} 1%, transparent) 60%)`,
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
          <span className="meta-value">{formatCreditDollars(value)} {timePeriod}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">{currentYear} Usage</span>
          <span className="meta-value">{formatCreditDollars(totalUsed)} / {formatCreditDollars(totalPossible)}</span>
        </div>
      </div>
    </div>
  );
};

export default CreditShowcase;
