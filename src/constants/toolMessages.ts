const TOOL_ACTIVE_MESSAGES: Record<string, string> = {
  // Card tools
  get_all_cards: 'Loading cards...',
  get_card_details: 'Loading card details...',
  get_user_cards: 'Loading your cards...',
  get_user_cards_details: 'Loading card details...',
  get_user_components: 'Loading components...',
  add_card: 'Adding card...',
  remove_card: 'Removing card...',
  set_card_frozen: 'Updating card status...',
  set_card_preferred: 'Setting preferred card...',
  set_card_open_date: 'Updating start date...',
  // Credit tools
  get_user_credits: 'Checking credits...',
  get_prioritized_credits: 'Prioritizing credits...',
  get_expiring_credits: 'Finding expiring credits...',
  get_credit_history: 'Loading credit history...',
  // Stats tools
  get_monthly_stats: 'Calculating monthly stats...',
  get_annual_stats: 'Calculating annual stats...',
  get_to_date_stats: 'Calculating to-date stats...',
  get_expiring_stats: 'Calculating expiring stats...',
  get_roi_stats: 'Calculating ROI...',
  get_lost_stats: 'Calculating lost value...',
  get_category_stats: 'Analyzing categories...',
  // Action tools
  update_credit_usage: 'Updating credit usage...',
  update_component_tracking: 'Updating tracking...',
};

const TOOL_RESULT_MESSAGES: Record<string, string> = {
  // Card tools
  get_all_cards: 'Cards loaded',
  get_card_details: 'Details loaded',
  get_user_cards: 'Your cards loaded',
  get_user_cards_details: 'Details loaded',
  get_user_components: 'Components loaded',
  add_card: 'Card added',
  remove_card: 'Card removed',
  set_card_frozen: 'Status updated',
  set_card_preferred: 'Preference set',
  set_card_open_date: 'Date updated',
  // Credit tools
  get_user_credits: 'Credits checked',
  get_prioritized_credits: 'Credits prioritized',
  get_expiring_credits: 'Found expiring',
  get_credit_history: 'History loaded',
  // Stats tools
  get_monthly_stats: 'Stats calculated',
  get_annual_stats: 'Stats calculated',
  get_to_date_stats: 'Stats calculated',
  get_expiring_stats: 'Stats calculated',
  get_roi_stats: 'ROI calculated',
  get_lost_stats: 'Lost value calculated',
  get_category_stats: 'Categories analyzed',
  // Action tools
  update_credit_usage: 'Usage updated',
  update_component_tracking: 'Tracking updated',
};

export function getToolActiveMessage(tool: string): string {
  return TOOL_ACTIVE_MESSAGES[tool] || 'Processing...';
}

export function getToolResultMessage(tool: string): string {
  return TOOL_RESULT_MESSAGES[tool] || 'Done';
}
