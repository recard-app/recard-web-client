/**
 * AgentTimeline Utility Functions
 *
 * Icon and message mappings for agent nodes and tools.
 */

// Node name to icon mapping
export const NODE_ICONS: Record<string, string> = {
  router_node: 'chat-bubble-oval-left-ellipsis',
  spend_node: 'card',
  credit_node: 'banknotes',
  card_node: 'card',
  stats_node: 'chart-bar',
  action_node: 'pencil',
  chat_node: 'chat-bubble-oval-left-ellipsis',
  composer_node: 'chat-bubble-oval-left-ellipsis',
};

// Node finished messages (shown when node completes)
export const NODE_FINISHED_MESSAGES: Record<string, string> = {
  router_node: 'Done thinking',
  spend_node: 'Card found',
  credit_node: 'Credits checked',
  card_node: 'Card info loaded',
  stats_node: 'Stats calculated',
  action_node: 'Data updated',
  chat_node: 'Done',
  composer_node: 'Response generated',
};

// Tool name to icon mapping
export const TOOL_ICONS: Record<string, string> = {
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
export function getNodeIcon(node: string): string {
  return NODE_ICONS[node] || 'chat-bubble-oval-left-ellipsis';
}

/**
 * Get finished message for a node name
 */
export function getNodeFinishedMessage(node: string): string {
  return NODE_FINISHED_MESSAGES[node] || 'Done';
}

/**
 * Get icon for a tool name
 */
export function getToolIcon(tool: string): string {
  return TOOL_ICONS[tool] || 'cog-6-tooth';
}

/**
 * Get unique node icons from a list of nodes
 * Returns up to maxIcons icons
 */
export function getUniqueNodeIcons(nodes: Array<{ node: string }>, maxIcons = 5): string[] {
  const uniqueIcons: string[] = [];
  const seenIcons = new Set<string>();

  for (const node of nodes) {
    const icon = getNodeIcon(node.node);
    if (!seenIcons.has(icon)) {
      seenIcons.add(icon);
      uniqueIcons.push(icon);
      if (uniqueIcons.length >= maxIcons) break;
    }
  }

  return uniqueIcons;
}
