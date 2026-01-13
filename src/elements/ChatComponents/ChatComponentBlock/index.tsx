import React, { useState } from 'react';
import {
  ChatComponentBlock as ChatComponentBlockType,
  ChatComponentItem,
  ChatComponentAction,
  CardAction,
  CreditAction,
  PerkAction,
  MultiplierAction,
  isCardComponentItem,
  isCreditComponentItem,
  isPerkComponentItem,
  isMultiplierComponentItem,
  CHAT_COMPONENT_TYPES,
} from '../../../types/ChatComponentTypes';
import ChatCardComponent from '../ChatCardComponent';
import ChatCreditComponent from '../ChatCreditComponent';
import ChatPerkComponent from '../ChatPerkComponent';
import ChatMultiplierComponent from '../ChatMultiplierComponent';
import ShowMoreButton from '../ShowMoreButton';
import './ChatComponentBlock.scss';

/** Default number of items to show before "Show more" */
const DEFAULT_VISIBLE_COUNT = 5;

interface ChatComponentBlockProps {
  /** The block data containing items to display */
  block: ChatComponentBlockType;
  /** Whether undo is available (typically false after user sends next message) */
  canUndo: boolean;
  /** Handler for card clicks - opens card detail modal */
  onCardClick: (cardId: string) => void;
  /** Handler for credit clicks - opens credit edit modal */
  onCreditClick: (cardId: string, creditId: string) => void;
  /** Handler for perk clicks - opens card detail modal to perks tab */
  onPerkClick: (cardId: string) => void;
  /** Handler for multiplier clicks - opens card detail modal to multipliers tab */
  onMultiplierClick: (cardId: string) => void;
  /** Handler for undo actions */
  onUndoAction?: (action: ChatComponentAction) => void;
  /** Map of action IDs that are currently being undone */
  pendingUndoActions?: Set<string>;
}

/**
 * Container component that renders a mixed list of chat components.
 * Handles "Show X more" expansion and routes item rendering to appropriate components.
 */
const ChatComponentBlock: React.FC<ChatComponentBlockProps> = ({
  block,
  canUndo,
  onCardClick,
  onCreditClick,
  onPerkClick,
  onMultiplierClick,
  onUndoAction,
  pendingUndoActions = new Set(),
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { items } = block;

  // Empty state - return nothing
  if (!items || items.length === 0) {
    return null;
  }

  // Sort items by display order
  const sortedItems = [...items].sort((a, b) => a.displayOrder - b.displayOrder);

  // Calculate visible items
  const shouldShowMore = sortedItems.length > DEFAULT_VISIBLE_COUNT;
  const visibleItems = isExpanded
    ? sortedItems
    : sortedItems.slice(0, DEFAULT_VISIBLE_COUNT);
  const hiddenCount = sortedItems.length - DEFAULT_VISIBLE_COUNT;

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCardUndo = (action: CardAction) => {
    onUndoAction?.(action);
  };

  const handleCreditUndo = (action: CreditAction) => {
    onUndoAction?.(action);
  };

  const handlePerkUndo = (action: PerkAction) => {
    onUndoAction?.(action);
  };

  const handleMultiplierUndo = (action: MultiplierAction) => {
    onUndoAction?.(action);
  };

  const isActionPending = (item: ChatComponentItem): boolean => {
    if ('action' in item && item.action) {
      return pendingUndoActions.has(item.action.id);
    }
    return false;
  };

  const renderItem = (item: ChatComponentItem) => {
    const isPending = isActionPending(item);

    if (isCardComponentItem(item)) {
      return (
        <ChatCardComponent
          key={item.id}
          item={item}
          onCardClick={onCardClick}
          onUndoAction={handleCardUndo}
          canUndo={canUndo}
          isUndoPending={isPending}
        />
      );
    }

    if (isCreditComponentItem(item)) {
      return (
        <ChatCreditComponent
          key={item.id}
          item={item}
          onCreditClick={onCreditClick}
          onUndoAction={handleCreditUndo}
          canUndo={canUndo}
          isUndoPending={isPending}
        />
      );
    }

    if (isPerkComponentItem(item)) {
      return (
        <ChatPerkComponent
          key={item.id}
          item={item}
          onPerkClick={onPerkClick}
          onUndoAction={handlePerkUndo}
          canUndo={canUndo}
          isUndoPending={isPending}
        />
      );
    }

    if (isMultiplierComponentItem(item)) {
      return (
        <ChatMultiplierComponent
          key={item.id}
          item={item}
          onMultiplierClick={onMultiplierClick}
          onUndoAction={handleMultiplierUndo}
          canUndo={canUndo}
          isUndoPending={isPending}
        />
      );
    }

    // Exhaustive check - should never reach here
    const _exhaustiveCheck: never = item;
    console.warn('Unknown component type:', _exhaustiveCheck);
    return null;
  };

  return (
    <div className="chat-component-block" data-block-id={block.id}>
      <div className="component-list">
        {visibleItems.map(renderItem)}
      </div>

      {shouldShowMore && (
        <ShowMoreButton
          hiddenCount={hiddenCount}
          isExpanded={isExpanded}
          onToggle={handleToggleExpanded}
        />
      )}
    </div>
  );
};

export default ChatComponentBlock;
