import React from 'react';
import {
  MultiplierComponentItem,
  MultiplierAction,
  MULTIPLIER_ACTION_DISPLAY_LABELS,
} from '../../../types/ChatComponentTypes';
import { getEffectiveCategory } from '../../../types/CreditCardTypes';
import { CardIcon } from '../../../icons';
import ActionDisplay from '../ActionDisplay';
import './ChatMultiplierComponent.scss';

interface ChatMultiplierComponentProps {
  item: MultiplierComponentItem;
  onUndoAction?: (action: MultiplierAction) => void;
  canUndo: boolean;
  isUndoPending?: boolean;
}

/**
 * Format multiplier value for display badge (e.g., "2x", "3x")
 */
function formatMultiplierBadge(multiplier: number | null): string {
  if (multiplier === null) {
    return 'Bonus';
  }
  return `${multiplier}x`;
}

/**
 * Displays a single multiplier in the chat with optional action.
 * Display-only component (no click action).
 */
const ChatMultiplierComponent: React.FC<ChatMultiplierComponentProps> = ({
  item,
  onUndoAction,
  canUndo,
  isUndoPending = false,
}) => {
  const { multiplier, card, action } = item;

  const handleUndo = () => {
    if (onUndoAction && action) {
      onUndoAction(action);
    }
  };

  const className = [
    'chat-multiplier-component',
    'chat-component-item',
    isUndoPending ? 'undo-pending' : '',
  ].filter(Boolean).join(' ');

  // Get action display text
  const actionText = action ? MULTIPLIER_ACTION_DISPLAY_LABELS[action.actionType] : '';

  // Get effective category for display
  const { category, subCategory } = getEffectiveCategory(multiplier);
  const categoryDisplay = subCategory && subCategory !== category
    ? `${category} - ${subCategory}`
    : category;

  return (
    <div
      className={className}
      aria-label={`${multiplier.Name} multiplier from ${card.CardName}${action ? `. Action: ${actionText}` : ''}`}
    >
      <div className="multiplier-header-row">
        <span className="multiplier-badge">
          {formatMultiplierBadge(multiplier.Multiplier)}
        </span>
        <CardIcon
          title={`${card.CardName} card`}
          size={16}
          primary={card.CardPrimaryColor}
          secondary={card.CardSecondaryColor}
          className="multiplier-card-icon"
        />
        <span className="multiplier-title">{multiplier.Name}</span>
      </div>

      <div className="multiplier-details">
        {multiplier.Description ? (
          <span className="multiplier-description">{multiplier.Description}</span>
        ) : (
          <span className="multiplier-category">{categoryDisplay}</span>
        )}
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

export default ChatMultiplierComponent;
