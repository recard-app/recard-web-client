/**
 * CreditEntry Component
 *
 * Main component for displaying and interacting with credit usage entries.
 * The drawer/modal for viewing credit details is managed by CreditDrawerContext
 * at the App level, decoupling the drawer lifecycle from this list item.
 *
 * DOCUMENTATION: For comprehensive documentation of the credits system including
 * data models, edge cases, sync mechanisms, and API reference, see:
 * - Documents/credits-system-documentation.md
 * - Documents/credits-system-audit-report.md
 */

import React, { useMemo, useState, useEffect } from 'react';
import './CreditEntry.scss';
import { CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, UserCreditWithExpiration, CreditUsageType, CreditPeriodType, SHOW_CARD_NAME_BUBBLE_IN_CREDITS, COLORS, ICON_GRAY, CREDIT_PERIODS } from '../../../../types';
import { CreditCard, CardCredit } from '../../../../types/CreditCardTypes';
import { CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_ICON_NAMES } from '../../../../types/CardCreditsTypes';
import { CardIcon } from '../../../../icons';
import Icon from '@/icons';
import UsagePieIcon from '@/icons/UsagePieIcon';
import { getMaxValue, getValueForUsage, getDateRangeText, getCurrentPeriodIndex, PERIOD_DISPLAY_NAMES, formatCreditDollars, formatCreditDollarsCompact } from './utils';
import { getEasternYear } from '../../../../utils';
import { UserCreditService } from '../../../../services/UserServices/UserCreditService';
import UsageDropdown from './UsageDropdown';
import { useCreditDrawer } from '../../../../contexts/useCreditDrawer';

export interface CreditEntryProps {
  userCredit: UserCredit | UserCreditWithExpiration;
  now: Date;
  card: CreditCard | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number;
  hideSlider?: boolean;
  disableDropdown?: boolean;
  displayPeriod?: boolean;
  variant?: 'default' | 'sidebar';
  onUpdateComplete?: () => void;
  isUpdating?: boolean;
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
}

const SHOW_DATE_RANGE = true;

const CreditEntry: React.FC<CreditEntryProps> = ({ userCredit, now, card, cardCredit, creditMaxValue, hideSlider = true, disableDropdown = false, displayPeriod = true, variant = 'default', onUpdateComplete, isUpdating, onAddUpdatingCreditId, onRemoveUpdatingCreditId }) => {
  const { openDrawer } = useCreditDrawer();

  // Check if this credit is expiring (only available on UserCreditWithExpiration)
  const isExpiring = 'isExpiring' in userCredit ? userCredit.isExpiring : false;
  const daysUntilExpiration = 'daysUntilExpiration' in userCredit ? userCredit.daysUntilExpiration : undefined;

  // State for the main card's usage editing
  const [cardUsage, setCardUsage] = useState<CreditUsageType>(CREDIT_USAGE.INACTIVE);
  const [cardValueUsed, setCardValueUsed] = useState<number>(0);

  const getExpirationText = (days?: number): string => {
    if (days === undefined) {
      return 'Soon';
    }
    if (days === 0) {
      return 'Today';
    }
    return `${days} day${days === 1 ? '' : 's'}`;
  };

  const USAGE_ICON_NAME: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_ICON_NAMES.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_ICON_NAMES.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_ICON_NAMES.INACTIVE,
  };

  // Check if this is an anniversary-based credit
  const isAnniversaryBased = userCredit.isAnniversaryBased ?? false;
  const anniversaryDate = userCredit.anniversaryDate;

  /**
   * Calculate anniversary credit period end date dynamically
   * Period runs from anniversary date to day before next anniversary
   */
  const calculateAnniversaryEndDate = (): Date | null => {
    const anniversaryYear = userCredit.anniversaryYear;
    if (!anniversaryDate || !anniversaryYear) return null;

    try {
      const [month, day] = anniversaryDate.includes('-')
        ? anniversaryDate.split('-').map(Number)
        : anniversaryDate.split('/').map(Number);

      if (isNaN(month) || isNaN(day)) return null;

      const nextAnniversaryYear = anniversaryYear + 1;
      const endDate = new Date(nextAnniversaryYear, month - 1, day);
      endDate.setDate(endDate.getDate() - 1);

      return endDate;
    } catch {
      return null;
    }
  };

  // Get the date range text for the current period
  const dateRangeText = getDateRangeText(
    userCredit.AssociatedPeriod,
    isAnniversaryBased,
    anniversaryDate,
    now
  );

  // Get the display text for the credit period (anniversary-aware)
  const getPeriodDisplayText = (): string => {
    if (SHOW_DATE_RANGE) {
      return dateRangeText;
    }

    if (isAnniversaryBased) {
      const endDate = calculateAnniversaryEndDate();
      if (endDate) {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `Expires ${endDate.toLocaleDateString('en-US', options)}`;
      }
    }
    return PERIOD_DISPLAY_NAMES[userCredit.AssociatedPeriod.toLowerCase()] || userCredit.AssociatedPeriod;
  };

  // Get the credit title
  const getCreditTitle = (): string => {
    if (userCredit.Title) {
      return userCredit.Title;
    }
    return cardCredit?.Title ?? userCredit.CreditId;
  };

  // Compute the current period number based on AssociatedPeriod and now
  const currentPeriodNumber = useMemo(() => {
    if (userCredit.isAnniversaryBased) {
      return 1;
    }
    return getCurrentPeriodIndex(userCredit.AssociatedPeriod as CreditPeriodType, now);
  }, [now, userCredit.AssociatedPeriod, userCredit.isAnniversaryBased]);

  // Get current period history for main list display
  const currentHistory = useMemo(() => {
    return userCredit.History.find((h) => h.PeriodNumber === currentPeriodNumber) ?? userCredit.History[0];
  }, [userCredit, currentPeriodNumber]);

  // Sync card state with current period history
  useEffect(() => {
    if (currentHistory) {
      setCardUsage((currentHistory.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE);
      setCardValueUsed(currentHistory.ValueUsed ?? 0);
    }
  }, [currentHistory, userCredit.CardId, userCredit.CreditId]);

  const valueUsed = cardValueUsed;
  const usage = cardUsage;

  const maxValue = getMaxValue(creditMaxValue);

  const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  };

  const usageColor = USAGE_COLOR_BY_STATE[usage] || CREDIT_USAGE_DISPLAY_COLORS.INACTIVE;

  const remainingValue = Math.max(0, maxValue - valueUsed);
  const usedPercentage = maxValue > 0 ? (valueUsed / maxValue) * 100 : 0;

  // Open the centralized credit drawer
  const handleOpenDrawer = () => {
    openDrawer({ cardId: userCredit.CardId, creditId: userCredit.CreditId });
  };

  // Handle inline usage dropdown selection (calls API directly)
  const handleCardUsageSelect = async (newUsage: CreditUsageType) => {
    setCardUsage(newUsage);
    let val = cardValueUsed;

    if (newUsage === CREDIT_USAGE.USED) {
      val = maxValue;
      setCardValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.PARTIALLY_USED) {
      val = getValueForUsage(newUsage, maxValue);
      setCardValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.NOT_USED) {
      val = 0;
      setCardValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.INACTIVE) {
      val = 0;
      setCardValueUsed(val);
    }

    if (onAddUpdatingCreditId) {
      onAddUpdatingCreditId(userCredit.CardId, userCredit.CreditId, currentPeriodNumber);
    }

    try {
      await UserCreditService.updateCreditHistoryEntry({
        cardId: userCredit.CardId,
        creditId: userCredit.CreditId,
        periodNumber: currentPeriodNumber,
        creditUsage: newUsage,
        valueUsed: val,
        year: getEasternYear(),
        anniversaryYear: userCredit.isAnniversaryBased ? userCredit.anniversaryYear : undefined,
      });

      if (onUpdateComplete) {
        onUpdateComplete();
      }
    } catch (error) {
      console.error('Failed to update credit history entry:', error);

      // Revert optimistic update
      if (currentHistory) {
        setCardUsage((currentHistory.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE);
        setCardValueUsed(currentHistory.ValueUsed ?? 0);
      }

      if (onRemoveUpdatingCreditId) {
        onRemoveUpdatingCreditId(userCredit.CardId, userCredit.CreditId, currentPeriodNumber);
      }
    }
  };

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div
        className={`credit-entry-sidebar ${isUpdating ? 'updating' : ''}`}
        onClick={handleOpenDrawer}
        style={{ cursor: 'pointer' }}
      >
        <div className="credit-title-row">
          {(cardUsage === CREDIT_USAGE.NOT_USED || cardUsage === CREDIT_USAGE.PARTIALLY_USED) ? (
            <UsagePieIcon
              percentage={maxValue > 0 ? (valueUsed / maxValue) * 100 : 0}
              size={18}
              color={COLORS.NEUTRAL_BLACK}
            />
          ) : (
            <Icon
              name={USAGE_ICON_NAME[cardUsage]}
              variant="mini"
              size={18}
              style={{ color: cardUsage === CREDIT_USAGE.USED ? usageColor : COLORS.NEUTRAL_BLACK }}
            />
          )}
          <div className="credit-name-group">
            {isExpiring && (
              <Icon name="clock" variant="micro" size={12} style={{ color: COLORS.WARNING, flexShrink: 0 }} />
            )}
            <div className="credit-name">
              {getCreditTitle()}
            </div>
          </div>
        </div>
        <Icon
          name="chevron-right"
          variant="mini"
          size={16}
          color={COLORS.NEUTRAL_MEDIUM_GRAY}
          className="sidebar-chevron"
        />
      </div>
    );
  }

  // Default variant - full display
  return (
    <div className={`credit-entry-row ${isUpdating ? 'updating' : ''}`} data-period={userCredit.AssociatedPeriod} onClick={handleOpenDrawer} style={{ cursor: 'pointer' }}>
      <div className="credit-donut">
        <UsagePieIcon
          percentage={usedPercentage}
          size={72}
          color={usageColor}
          trackColor={CREDIT_USAGE_DISPLAY_COLORS.NOT_USED}
          centerText={formatCreditDollarsCompact(remainingValue)}
          centerTextColor={COLORS.NEUTRAL_BLACK}
          centerSubText="LEFT"
          centerSubTextColor={COLORS.NEUTRAL_MEDIUM_GRAY}
        />
      </div>

      <div className="credit-info">
        <div className="credit-name">
          {card && !SHOW_CARD_NAME_BUBBLE_IN_CREDITS && (
            <CardIcon
              title={card.CardName}
              size={16}
              primary={card.CardPrimaryColor}
              secondary={card.CardSecondaryColor}
              className="card-thumbnail"
            />
          )}
          <span className="credit-name-text">{getCreditTitle()}</span>
        </div>
        {card && SHOW_CARD_NAME_BUBBLE_IN_CREDITS && (
          <>
            <div className="card-info">
              <CardIcon
                title={card.CardName}
                size={12}
                primary={card.CardPrimaryColor}
                secondary={card.CardSecondaryColor}
                className="card-thumbnail"
              />
              <span className="card-name">{card.CardName}</span>
            </div>
          </>
        )}
        <div className="card-info-inline">
          <div className="card-period-group">
            <Icon name="calendar" variant="micro" size={14} color={ICON_GRAY} />
            <span className="period-text-inline">
              {getPeriodDisplayText()}
            </span>
          </div>
          {isExpiring && (
            <span className="expiring-text-inline">
              <Icon name="clock" variant="micro" size={12} />
              {getExpirationText(daysUntilExpiration)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditEntry;
