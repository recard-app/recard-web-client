import React from 'react';
import { CreditComponentItem, CreditAction, CREDIT_ACTION_TYPES } from '../../../types/ChatComponentTypes';
import {
  CREDIT_USAGE_DISPLAY_COLORS,
  CREDIT_USAGE_ICON_NAMES,
} from '../../../types/CardCreditsTypes';
import { ICON_GRAY } from '../../../types/Constants';
import { CardIcon, Icon } from '../../../icons';
import UsagePieIcon from '../../../icons/UsagePieIcon';
import { getDateRangeText, PERIOD_DISPLAY_NAMES } from '../../../components/CreditsDisplay/CreditList/CreditEntry/utils';
import ActionDisplay from '../ActionDisplay';
import './ChatCreditComponent.scss';

interface ChatCreditComponentProps {
  item: CreditComponentItem;
  onCreditClick: (cardId: string, creditId: string) => void;
  onUndoAction?: (action: CreditAction) => void;
  canUndo: boolean;
  isUndoPending?: boolean;
}

/**
 * Get usage status and styling info using the defined types
 */
function getUsageInfo(valueUsed: number, maxValue: number): {
  color: string;
  iconName: string;
} {
  if (valueUsed >= maxValue) {
    return {
      color: CREDIT_USAGE_DISPLAY_COLORS.USED,
      iconName: CREDIT_USAGE_ICON_NAMES.USED,
    };
  }
  if (valueUsed > 0) {
    return {
      color: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
      iconName: CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED,
    };
  }
  return {
    color: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    iconName: CREDIT_USAGE_ICON_NAMES.NOT_USED,
  };
}

/**
 * Displays a single credit in the chat with usage info and optional action.
 * Matches the CreditEntry component from My Credits page.
 */
const ChatCreditComponent: React.FC<ChatCreditComponentProps> = ({
  item,
  onCreditClick,
  onUndoAction,
  canUndo,
  isUndoPending = false,
}) => {
  const { cardCredit, card, userCredit, creditMaxValue, currentValueUsed, action } = item;
  const prefix = cardCredit.isNonMonetary ? '' : '$';

  const handleClick = () => {
    onCreditClick(card.id, cardCredit.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCreditClick(card.id, cardCredit.id);
    }
  };

  const handleUndo = () => {
    if (onUndoAction && action) {
      onUndoAction(action);
    }
  };

  const usageInfo = getUsageInfo(currentValueUsed, creditMaxValue);

  // Check if this is a tracking action (track/untrack) - only show total value, not usage
  const isTrackingAction = action && (
    action.actionType === CREDIT_ACTION_TYPES.TRACK ||
    action.actionType === CREDIT_ACTION_TYPES.UNTRACK
  );

  // Get period display text: date range for usage credits, type name for tracking actions
  const periodText = isTrackingAction
    ? (userCredit.isAnniversaryBased
      ? 'Anniversary'
      : PERIOD_DISPLAY_NAMES[userCredit.AssociatedPeriod.toLowerCase()] || userCredit.AssociatedPeriod)
    : getDateRangeText(
        userCredit.AssociatedPeriod,
        userCredit.isAnniversaryBased ?? false,
        userCredit.anniversaryDate,
        new Date(),
        userCredit.anniversaryYear
      );

  const className = [
    'chat-credit-component',
    'chat-component-item',
    'clickable',
    isUndoPending ? 'undo-pending' : '',
  ].filter(Boolean).join(' ');

  // Build aria-label based on action type
  let ariaLabel = `${cardCredit.Title} credit`;
  if (action) {
    if (isTrackingAction) {
      ariaLabel += `. Action: ${action.actionType === CREDIT_ACTION_TYPES.TRACK ? 'Now tracking' : 'Stopped tracking'}`;
    } else {
      ariaLabel += `. Action: Updated from ${prefix}${action.fromValue} to ${prefix}${action.toValue}`;
    }
  }

  return (
    <div className={className}>
      <div
        className="clickable-content"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
      >
        <div className="credit-row">
          {/* Left side: Credit info */}
          <div className="credit-info">
            <div className="credit-name-row">
              <CardIcon
                title={`${card.CardName} card`}
                size={16}
                primary={card.CardPrimaryColor}
                secondary={card.CardSecondaryColor}
              />
              <span className="credit-name">{cardCredit.Title}</span>
            </div>
            {isTrackingAction ? (
              <span className="period-text">{periodText}</span>
            ) : (
              <span className="period-date-range">
                <Icon name="calendar" variant="micro" size={12} color={ICON_GRAY} />
                {periodText}
              </span>
            )}
          </div>

          {/* Right side: Value display - simplified for tracking actions */}
          {isTrackingAction ? (
            <div className="credit-value">
              <span className="value-amount">{prefix}{creditMaxValue}</span>
            </div>
          ) : (
            <div className="credit-usage" style={{ color: usageInfo.color }}>
              <div className="usage-amount">{prefix}{currentValueUsed} / {prefix}{creditMaxValue}</div>
              <div className="usage-status">
                {currentValueUsed < creditMaxValue ? (
                  <UsagePieIcon
                    percentage={creditMaxValue > 0 ? (currentValueUsed / creditMaxValue) * 100 : 0}
                    size={12}
                    color={usageInfo.color}
                  />
                ) : (
                  <Icon name={usageInfo.iconName} variant="micro" size={12} color={usageInfo.color} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {action && (
        <div className="action-row">
          <ActionDisplay
            action={action}
            onUndo={handleUndo}
            canUndo={canUndo}
            isUndoPending={isUndoPending}
            isNonMonetary={cardCredit.isNonMonetary}
          />
        </div>
      )}
    </div>
  );
};

export default ChatCreditComponent;
