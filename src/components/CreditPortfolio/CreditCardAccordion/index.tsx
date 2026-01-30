import React, { useMemo } from 'react';
import { Icon } from '@/icons';
import { CardIcon } from '@/icons';
import { COLORS } from '@/types/Colors';
import { ICON_BLUE, ICON_PRIMARY } from '@/types';
import CreditSection from '../CreditSection';
import { CreditCardAccordionProps, CardCreditSummary } from '../types';
import './CreditCardAccordion.scss';

// Calculate summary stats for card
const calculateCardSummary = (
  credits: CreditCardAccordionProps['credits'],
  creditMetadata: CreditCardAccordionProps['creditMetadata']
): CardCreditSummary => {
  let totalMonthlyValue = 0;
  let totalUsedValue = 0;
  let totalPossibleValue = 0;

  for (const credit of credits) {
    const cardCredit = creditMetadata.get(credit.CreditId);
    if (!cardCredit) continue;

    // Get credit value (already a number)
    const creditValue = cardCredit.Value || 0;

    // Calculate monthly equivalent
    // Handle anniversary credits first (treat as annual equivalent)
    if (credit.isAnniversaryBased) {
      totalMonthlyValue += creditValue / 12;
    } else {
      // Calendar-based credits
      switch (credit.AssociatedPeriod) {
        case 'monthly':
          totalMonthlyValue += creditValue;
          break;
        case 'quarterly':
          totalMonthlyValue += creditValue / 3;
          break;
        case 'semiannually':
          totalMonthlyValue += creditValue / 6;
          break;
        case 'annually':
          totalMonthlyValue += creditValue / 12;
          break;
      }
    }

    // Sum up usage from history
    for (const entry of credit.History) {
      totalUsedValue += entry.ValueUsed;
      totalPossibleValue += creditValue;
    }
  }

  return {
    creditCount: credits.length,
    totalMonthlyValue: Math.round(totalMonthlyValue * 100) / 100,
    totalUsedValue: Math.round(totalUsedValue * 100) / 100,
    totalPossibleValue: Math.round(totalPossibleValue * 100) / 100
  };
};

const CreditCardAccordion: React.FC<CreditCardAccordionProps> = ({
  card,
  credits,
  creditMetadata,
  year,
  isExpanded,
  onToggle,
  onPeriodClick,
  isUpdating,
  isLoading
}) => {
  // Calculate summary stats
  const summary = useMemo(
    () => calculateCardSummary(credits, creditMetadata),
    [credits, creditMetadata]
  );

  // Handle period click - pass up with full context
  const handlePeriodClick = (
    credit: CreditCardAccordionProps['credits'][number],
    periodNumber: number,
    anniversaryYear?: number
  ) => {
    const cardCredit = creditMetadata.get(credit.CreditId);
    if (!cardCredit) return;

    onPeriodClick(credit, cardCredit, periodNumber, anniversaryYear);
  };

  // Check if credit is updating
  const isCreditUpdating = (creditId: string) => (periodNumber: number) => {
    return isUpdating?.(creditId, periodNumber) ?? false;
  };

  // No credits for this card - return null unless loading (show empty state when loading)
  if (credits.length === 0 && !isLoading) {
    return null;
  }

  const usagePercentage = summary.totalPossibleValue > 0
    ? Math.round((summary.totalUsedValue / summary.totalPossibleValue) * 100)
    : 0;

  return (
    <div className={`credit-card-accordion ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="accordion-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
        type="button"
      >
        <div className="card-identity">
          <CardIcon
            title={card.CardName}
            size={32}
            primary={card.CardPrimaryColor}
            secondary={card.CardSecondaryColor}
            className="card-icon"
          />
          <div className="card-info">
            <span className="card-name">
              {card.isFrozen && (
                <Icon
                  name="snowflake"
                  variant="mini"
                  size={16}
                  color={ICON_BLUE}
                  className="frozen-icon"
                />
              )}
              {card.isDefaultCard && (
                <Icon
                  name="star"
                  variant="mini"
                  size={16}
                  color={ICON_PRIMARY}
                  className="preferred-star-icon"
                />
              )}
              {card.CardName}
            </span>
            <span className="card-meta">
              {summary.creditCount} credit{summary.creditCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className={`header-stats ${isLoading ? 'updating' : ''}`}>
          <div className="usage-stat">
            <span className="usage-value">${summary.totalUsedValue.toFixed(0)}</span>
            <span className="usage-label">of ${summary.totalPossibleValue.toFixed(0)} ({usagePercentage}%)</span>
          </div>
          <Icon
            name="chevron-down"
            variant="mini"
            size={20}
            color={COLORS.NEUTRAL_GRAY}
            className={`chevron-icon ${isExpanded ? 'rotated' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className={`accordion-content ${isLoading ? 'updating' : ''}`}>
          {isLoading && credits.length === 0 ? (
            <div className="accordion-empty-year">
              No credits tracked for this year
            </div>
          ) : (
            credits.map((credit) => {
              const cardCredit = creditMetadata.get(credit.CreditId);
              if (!cardCredit) return null;

              return (
                <CreditSection
                  key={credit.CreditId}
                  credit={credit}
                  cardCredit={cardCredit}
                  year={year}
                  onPeriodClick={(periodNumber, anniversaryYear) =>
                    handlePeriodClick(credit, periodNumber, anniversaryYear)
                  }
                  isUpdating={isCreditUpdating(credit.CreditId)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CreditCardAccordion;
