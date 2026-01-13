import React from 'react';
import { CardComponentItem, CardAction } from '../../../types/ChatComponentTypes';
import { ICON_PRIMARY, ICON_BLUE } from '../../../types';
import { Icon, CardIcon } from '../../../icons';
import ActionDisplay from '../ActionDisplay';
import './ChatCardComponent.scss';

interface ChatCardComponentProps {
  item: CardComponentItem;
  onCardClick: (cardId: string) => void;
  onUndoAction?: (action: CardAction) => void;
  canUndo: boolean;
  isUndoPending?: boolean;
}

/**
 * Displays a single credit card in the chat with optional action and undo functionality.
 * Based on CreditCardPreview component from sidebar.
 */
const ChatCardComponent: React.FC<ChatCardComponentProps> = ({
  item,
  onCardClick,
  onUndoAction,
  canUndo,
  isUndoPending = false,
}) => {
  const { card, action } = item;

  const handleClick = () => {
    onCardClick(card.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(card.id);
    }
  };

  const handleUndo = () => {
    if (onUndoAction && action) {
      onUndoAction(action);
    }
  };

  const className = [
    'chat-card-component',
    'chat-component-item',
    'clickable',
    isUndoPending ? 'undo-pending' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <div
        className="clickable-content"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${card.CardName} card${action ? `. Action: ${action.actionType}` : ''}`}
      >
        <div className="card-content-row">
          <CardIcon
            title={`${card.CardName} card`}
            size={32}
            primary={card.CardPrimaryColor}
            secondary={card.CardSecondaryColor}
            className="card-icon"
          />
          <div className="card-info">
            <div className="card-name">
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
            </div>
            <div className="card-network">{card.CardNetwork}</div>
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

export default ChatCardComponent;
