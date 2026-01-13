import React from 'react';
import {
  PerkComponentItem,
  PerkAction,
  PERK_ACTION_DISPLAY_LABELS,
} from '../../../types/ChatComponentTypes';
import { CardIcon } from '../../../icons';
import ActionDisplay from '../ActionDisplay';
import './ChatPerkComponent.scss';

interface ChatPerkComponentProps {
  item: PerkComponentItem;
  onUndoAction?: (action: PerkAction) => void;
  canUndo: boolean;
  isUndoPending?: boolean;
}

/**
 * Displays a single perk in the chat with optional action.
 * Display-only component (no click action).
 */
const ChatPerkComponent: React.FC<ChatPerkComponentProps> = ({
  item,
  onUndoAction,
  canUndo,
  isUndoPending = false,
}) => {
  const { perk, card, action } = item;

  const handleUndo = () => {
    if (onUndoAction && action) {
      onUndoAction(action);
    }
  };

  const className = [
    'chat-perk-component',
    'chat-component-item',
    isUndoPending ? 'undo-pending' : '',
  ].filter(Boolean).join(' ');

  // Get action display text
  const actionText = action ? PERK_ACTION_DISPLAY_LABELS[action.actionType] : '';

  return (
    <div
      className={className}
      aria-label={`${perk.Title} perk from ${card.CardName}${action ? `. Action: ${actionText}` : ''}`}
    >
      <div className="perk-header-row">
        <CardIcon
          title={`${card.CardName} card`}
          size={16}
          primary={card.CardPrimaryColor}
          secondary={card.CardSecondaryColor}
          className="perk-card-icon"
        />
        <span className="perk-title">{perk.Title}</span>
      </div>

      {perk.Description && (
        <div className="perk-description">
          {perk.Description}
        </div>
      )}

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

export default ChatPerkComponent;
