import React from 'react';
import { CreditComponentItem, CreditAction } from '../../../types/ChatComponentTypes';
import {
  CREDIT_USAGE_DISPLAY_NAMES,
  CREDIT_USAGE_DISPLAY_COLORS,
  CREDIT_USAGE_ICON_NAMES,
} from '../../../types/CardCreditsTypes';
import { CardIcon, Icon } from '../../../icons';
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
 * Period display names mapping
 */
const PERIOD_DISPLAY_NAMES: Record<string, string> = {
  'monthly': 'Monthly',
  'quarterly': 'Quarterly',
  'semiannually': 'Semiannual',
  'annually': 'Annual',
};

/**
 * Get usage status and styling info using the defined types
 */
function getUsageInfo(valueUsed: number, maxValue: number): {
  status: string;
  color: string;
  iconName: string;
} {
  if (valueUsed >= maxValue) {
    return {
      status: CREDIT_USAGE_DISPLAY_NAMES.USED,
      color: CREDIT_USAGE_DISPLAY_COLORS.USED,
      iconName: CREDIT_USAGE_ICON_NAMES.USED,
    };
  }
  if (valueUsed > 0) {
    return {
      status: CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED,
      color: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
      iconName: CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED,
    };
  }
  return {
    status: CREDIT_USAGE_DISPLAY_NAMES.NOT_USED,
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

  // Get period display text
  const periodText = userCredit.isAnniversaryBased
    ? 'Anniversary'
    : PERIOD_DISPLAY_NAMES[userCredit.AssociatedPeriod] || userCredit.AssociatedPeriod;

  const className = [
    'chat-credit-component',
    'chat-component-item',
    'clickable',
    isUndoPending ? 'undo-pending' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${cardCredit.Title} credit${action ? `. Action: Updated from $${action.fromValue} to $${action.toValue}` : ''}`}
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
          <span className="period-text">{periodText}</span>
        </div>

        {/* Right side: Usage display */}
        <div className="credit-usage" style={{ color: usageInfo.color }}>
          <div className="usage-amount">${currentValueUsed} / ${creditMaxValue}</div>
          <div className="usage-status">
            <Icon name={usageInfo.iconName} size={12} color={usageInfo.color} />
            <span>{usageInfo.status}</span>
          </div>
        </div>
      </div>

      {action && (
        <div className="action-row">
          <ActionDisplay
            action={action}
            onUndo={handleUndo}
            canUndo={canUndo}
            isUndoPending={isUndoPending}
          />
        </div>
      )}
    </div>
  );
};

export default ChatCreditComponent;
