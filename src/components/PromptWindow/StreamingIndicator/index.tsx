import React from 'react';
import { Icon } from '../../../icons';
import { ActiveNode } from '../../../types/AgentChatTypes';
import './styles.scss';

/**
 * Map node names to display icons
 */
const NODE_ICONS: Record<string, string> = {
  router_node: 'chat-bubble-oval-left-ellipsis',
  spend_node: 'card',
  credit_node: 'banknotes',
  card_node: 'card',
  stats_node: 'chart-bar',
  action_node: 'pencil',
  chat_node: 'chat-bubble-oval-left-ellipsis',
  composer_node: 'chat-bubble-oval-left-ellipsis',
};

/**
 * Get icon for a node name
 */
function getNodeIcon(nodeName: string): string {
  return NODE_ICONS[nodeName] || 'chat-bubble-oval-left-ellipsis';
}

interface StreamingIndicatorProps {
  /** Active node being processed (null when not processing) */
  activeNode: ActiveNode | null;
  /** Whether the indicator should be visible */
  isVisible: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Streaming indicator for agent responses
 * Shows: <icon> action text with pulsing animation
 */
export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  activeNode,
  isVisible,
  className = '',
}) => {
  if (!isVisible || !activeNode) return null;

  const displayMessage = activeNode.message || 'Thinking...';
  const iconName = getNodeIcon(activeNode.name);

  return (
    <div className={`streaming-indicator ${className}`}>
      <div className="streaming-indicator-content pulsing">
        <Icon
          name={iconName}
          variant="mini"
          size={16}
          className="streaming-icon"
        />
        <span className="streaming-message">{displayMessage}</span>
      </div>
    </div>
  );
};

export default StreamingIndicator;
