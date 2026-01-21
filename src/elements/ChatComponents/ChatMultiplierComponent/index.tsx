import React from 'react';
import {
  MultiplierComponentItem,
  MultiplierAction,
  MULTIPLIER_ACTION_DISPLAY_LABELS,
} from '../../../types/ChatComponentTypes';
import { CardIcon } from '../../../icons';
import ActionDisplay from '../ActionDisplay';
import './ChatMultiplierComponent.scss';

interface ChatMultiplierComponentProps {
  item: MultiplierComponentItem;
  onMultiplierClick: (cardId: string, multiplierId: string) => void;
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
 * Clickable - opens card detail modal to multipliers tab.
 */
const ChatMultiplierComponent: React.FC<ChatMultiplierComponentProps> = ({
  item,
  onMultiplierClick,
  onUndoAction,
  canUndo,
  isUndoPending = false,
}) => {
  const { multiplier, card, action } = item;

  const handleClick = () => {
    onMultiplierClick(card.id, multiplier.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onMultiplierClick(card.id, multiplier.id);
    }
  };

  const handleUndo = () => {
    if (onUndoAction && action) {
      onUndoAction(action);
    }
  };

  const className = [
    'chat-multiplier-component',
    'chat-component-item',
    'clickable',
    isUndoPending ? 'undo-pending' : '',
  ].filter(Boolean).join(' ');

  // Get action display text
  const actionText = action ? MULTIPLIER_ACTION_DISPLAY_LABELS[action.actionType] : '';

  // Get category for display (backend provides effective category already resolved)
  const categoryDisplay = multiplier.SubCategory && multiplier.SubCategory !== multiplier.Category
    ? `${multiplier.Category} - ${multiplier.SubCategory}`
    : multiplier.Category;

  return (
    <div className={className}>
      <div
        className="clickable-content"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
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
