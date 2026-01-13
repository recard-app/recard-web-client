import React from 'react';
import {
  ChatComponentAction,
  isCardAction,
  isCreditAction,
  isPerkAction,
  isMultiplierAction,
  formatCardActionText,
  formatCreditActionText,
  PERK_ACTION_DISPLAY_LABELS,
  MULTIPLIER_ACTION_DISPLAY_LABELS,
} from '../../../types/ChatComponentTypes';
import { LOADING_ICON, LOADING_ICON_SIZE } from '../../../types/Constants';
import { Icon } from '../../../icons';
import './ActionDisplay.scss';

interface ActionDisplayProps {
  /** The action to display */
  action: ChatComponentAction;
  /** Handler when undo is clicked */
  onUndo: () => void;
  /** Whether undo is available (false after next message sent) */
  canUndo: boolean;
  /** Whether an undo operation is in progress */
  isUndoPending?: boolean;
}

/**
 * Get the display text for an action
 */
function getActionText(action: ChatComponentAction): string {
  if (isCreditAction(action)) {
    return formatCreditActionText(action);
  }
  if (isCardAction(action)) {
    return formatCardActionText(action);
  }
  if (isPerkAction(action)) {
    return PERK_ACTION_DISPLAY_LABELS[action.actionType];
  }
  if (isMultiplierAction(action)) {
    return MULTIPLIER_ACTION_DISPLAY_LABELS[action.actionType];
  }
  return '';
}

/**
 * Displays action text with optional undo button.
 * Used by all chat component types.
 *
 * States:
 * - Normal: Action text + "Undo" button (enabled)
 * - Pending: Action text + "Undoing..." button (disabled, loading)
 * - Undone: Strikethrough action text + "Undone" button (disabled)
 * - Expired: Action text only (no button, next message sent)
 */
const ActionDisplay: React.FC<ActionDisplayProps> = ({
  action,
  onUndo,
  canUndo,
  isUndoPending = false,
}) => {
  const actionText = getActionText(action);
  const isUndone = action.isUndone;

  // Determine button state
  const showButton = canUndo || isUndone;
  const buttonDisabled = isUndone || isUndoPending;

  // Button text
  let buttonText = 'Undo';
  if (isUndoPending) {
    buttonText = 'Undoing...';
  } else if (isUndone) {
    buttonText = 'Undone';
  }

  // Icon name based on state
  const iconName = isUndone ? 'arrow-uturn-left' : 'check-simple';

  return (
    <div className="action-display">
      <div className={`action-content ${isUndone ? 'undone' : ''}`}>
        <Icon
          name={iconName}
          variant="mini"
          size={14}
          className="action-icon"
        />
        <span className="action-text">{actionText}</span>
      </div>
      {showButton && (
        <button
          type="button"
          className={`undo-button button ghost ${isUndoPending ? 'loading' : ''}`}
          onClick={onUndo}
          disabled={buttonDisabled}
          aria-label={isUndone ? 'Action has been undone' : 'Undo this action'}
        >
          {isUndoPending && <LOADING_ICON size={LOADING_ICON_SIZE} />}
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default ActionDisplay;
