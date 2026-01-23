import React from 'react';
import { Icon } from '../../../icons';
import { ActiveNode, ActiveTool } from '../../../types/AgentChatTypes';
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
 * Map tool names to display icons
 */
const TOOL_ICONS: Record<string, string> = {
  // Card tools
  get_all_cards: 'card',
  get_card_details: 'card',
  get_user_cards: 'card',
  get_user_cards_details: 'card',
  get_user_components: 'squares-2x2',
  add_card: 'plus-circle',
  remove_card: 'minus-circle',
  set_card_frozen: 'pause-circle',
  set_card_preferred: 'star',
  set_card_open_date: 'calendar',
  // Credit tools
  get_user_credits: 'banknotes',
  get_prioritized_credits: 'banknotes',
  get_expiring_credits: 'clock',
  get_credit_history: 'clock',
  // Stats tools
  get_monthly_stats: 'chart-bar',
  get_annual_stats: 'chart-bar',
  get_to_date_stats: 'chart-bar',
  get_expiring_stats: 'chart-bar',
  get_roi_stats: 'chart-bar',
  get_lost_stats: 'chart-bar',
  get_category_stats: 'chart-bar',
  // Action tools
  update_credit_usage: 'pencil',
  update_component_tracking: 'eye',
};

/**
 * Get icon for a node name
 */
function getNodeIcon(nodeName: string): string {
  return NODE_ICONS[nodeName] || 'chat-bubble-oval-left-ellipsis';
}

/**
 * Get icon for a tool name
 */
function getToolIcon(toolName: string): string {
  return TOOL_ICONS[toolName] || 'cog-6-tooth';
}

interface StreamingIndicatorProps {
  /** Active node being processed (null when not processing) */
  activeNode: ActiveNode | null;
  /** Active tool being executed within the node (null when not executing tool) */
  activeTool?: ActiveTool | null;
  /** Whether the indicator should be visible */
  isVisible: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Streaming indicator for agent responses
 * Shows node and tool indicators separately for future styling flexibility
 */
export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  activeNode,
  activeTool,
  isVisible,
  className = '',
}) => {
  if (!isVisible || (!activeNode && !activeTool)) return null;

  return (
    <div className={`streaming-indicator ${className}`}>
      {/* Node indicator - always shows when active */}
      {activeNode && (
        <div className="streaming-indicator-content streaming-indicator-node pulsing">
          <Icon
            name={getNodeIcon(activeNode.name)}
            variant="mini"
            size={16}
            className="streaming-icon"
          />
          <span className="streaming-message">{activeNode.message || 'Thinking...'}</span>
        </div>
      )}

      {/* Tool indicator - shows nested below node when tool is active */}
      {activeTool && (
        <div className="streaming-indicator-content streaming-indicator-tool pulsing">
          <Icon
            name={getToolIcon(activeTool.name)}
            variant="mini"
            size={14}
            className="streaming-icon"
          />
          <span className="streaming-message">{activeTool.message}</span>
        </div>
      )}
    </div>
  );
};

export default StreamingIndicator;
