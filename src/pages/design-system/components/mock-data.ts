/**
 * Mock data for the Design System Full Components Page
 * Contains realistic sample data for all component showcases
 */

import {
  Conversation,
  ChatMessage,
  CreditCard,
  CreditCardDetails,
  CardCredit,
  UserCredit,
  UserCreditWithExpiration,
  MonthlyStatsResponse,
  ChatSolutionCard,
  CHAT_SOURCE,
  CREDIT_PERIODS,
  CREDIT_USAGE,
} from '../../../types';

// ============================================================================
// MOCK CREDIT CARDS
// ============================================================================

export const mockCreditCards: CreditCard[] = [
  {
    id: 'card-amex-gold',
    CardName: 'American Express Gold',
    CardIssuer: 'American Express',
    CardNetwork: 'Amex',
    CardDetails: '4X points on dining and groceries',
    CardImage: undefined,
    CardPrimaryColor: '#B4975A',
    CardSecondaryColor: '#1E3A5F',
    selected: true,
    isDefaultCard: true,
  },
  {
    id: 'card-chase-sapphire',
    CardName: 'Chase Sapphire Reserve',
    CardIssuer: 'Chase',
    CardNetwork: 'Visa',
    CardDetails: '3X points on travel and dining',
    CardImage: undefined,
    CardPrimaryColor: '#0B2441',
    CardSecondaryColor: '#1E88E5',
    selected: true,
    isDefaultCard: false,
  },
  {
    id: 'card-citi-premier',
    CardName: 'Citi Premier',
    CardIssuer: 'Citibank',
    CardNetwork: 'Mastercard',
    CardDetails: '3X points on travel, gas, groceries',
    CardImage: undefined,
    CardPrimaryColor: '#003B70',
    CardSecondaryColor: '#00B5E2',
    selected: true,
    isDefaultCard: false,
  },
  {
    id: 'card-capital-one-venture',
    CardName: 'Capital One Venture X',
    CardIssuer: 'Capital One',
    CardNetwork: 'Visa',
    CardDetails: '2X miles on all purchases',
    CardImage: undefined,
    CardPrimaryColor: '#004977',
    CardSecondaryColor: '#D03027',
    selected: false,
    isDefaultCard: false,
  },
  {
    id: 'card-discover-it',
    CardName: 'Discover it Cash Back',
    CardIssuer: 'Discover',
    CardNetwork: 'Discover',
    CardDetails: '5% cashback rotating categories',
    CardImage: undefined,
    CardPrimaryColor: '#FF6000',
    CardSecondaryColor: '#1A1A1A',
    selected: false,
    isDefaultCard: false,
  },
];

// ============================================================================
// MOCK CREDIT CARD DETAILS (Extended)
// ============================================================================

export const mockCreditCardDetails: CreditCardDetails[] = mockCreditCards.map((card) => ({
  ...card,
  AnnualFee: card.id === 'card-discover-it' ? 0 : card.id === 'card-chase-sapphire' ? 550 : 250,
  ForeignExchangeFee: card.id === 'card-discover-it' ? '3%' : 'None',
  ForeignExchangeFeePercentage: card.id === 'card-discover-it' ? 3 : 0,
  RewardsCurrency: card.id === 'card-discover-it' ? 'Cashback' : 'Points',
  PointsPerDollar: card.id === 'card-discover-it' ? 1 : 2,
  VersionName: 'Current',
  ReferenceCardId: card.id,
  IsActive: true,
  effectiveFrom: '2024-01-01',
  effectiveTo: '9999-12-31',
  lastUpdated: new Date().toISOString(),
}));

// ============================================================================
// MOCK CARD CREDITS
// ============================================================================

export const mockCardCredits: CardCredit[] = [
  {
    id: 'credit-amex-dining',
    ReferenceCardId: 'card-amex-gold',
    Title: 'Dining Credit',
    Category: 'Dining',
    SubCategory: 'Restaurant',
    Description: 'Monthly dining credit at select restaurants',
    Value: '10',
    TimePeriod: 'monthly',
    Requirements: 'Use at participating restaurants',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
  {
    id: 'credit-amex-uber',
    ReferenceCardId: 'card-amex-gold',
    Title: 'Uber Cash',
    Category: 'Transportation',
    SubCategory: 'Rideshare',
    Description: 'Monthly Uber credit for rides or Uber Eats',
    Value: '10',
    TimePeriod: 'monthly',
    Requirements: 'Add card to Uber app',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
  {
    id: 'credit-chase-doordash',
    ReferenceCardId: 'card-chase-sapphire',
    Title: 'DoorDash Credit',
    Category: 'Dining',
    SubCategory: 'Delivery',
    Description: 'Annual DoorDash credit',
    Value: '60',
    TimePeriod: 'annually',
    Requirements: 'Link card to DoorDash account',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
  {
    id: 'credit-chase-travel',
    ReferenceCardId: 'card-chase-sapphire',
    Title: 'Travel Credit',
    Category: 'Travel',
    SubCategory: 'General',
    Description: 'Annual travel credit',
    Value: '300',
    TimePeriod: 'annually',
    Requirements: 'Automatically applied to travel purchases',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
  {
    id: 'credit-citi-hotel',
    ReferenceCardId: 'card-citi-premier',
    Title: 'Hotel Credit',
    Category: 'Travel',
    SubCategory: 'Hotels',
    Description: 'Annual hotel credit',
    Value: '100',
    TimePeriod: 'annually',
    Requirements: 'Book through Citi portal',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
];

// ============================================================================
// MOCK USER CREDITS
// ============================================================================

const currentMonth = new Date().getMonth() + 1; // 1-12

export const mockUserCredits: UserCredit[] = [
  {
    CardId: 'card-amex-gold',
    CreditId: 'credit-amex-dining',
    AssociatedPeriod: CREDIT_PERIODS.Monthly,
    History: [
      { PeriodNumber: currentMonth, CreditUsage: CREDIT_USAGE.USED, ValueUsed: 10 },
      { PeriodNumber: currentMonth > 1 ? currentMonth - 1 : 12, CreditUsage: CREDIT_USAGE.USED, ValueUsed: 10 },
    ],
  },
  {
    CardId: 'card-amex-gold',
    CreditId: 'credit-amex-uber',
    AssociatedPeriod: CREDIT_PERIODS.Monthly,
    History: [
      { PeriodNumber: currentMonth, CreditUsage: CREDIT_USAGE.PARTIALLY_USED, ValueUsed: 5 },
      { PeriodNumber: currentMonth > 1 ? currentMonth - 1 : 12, CreditUsage: CREDIT_USAGE.USED, ValueUsed: 10 },
    ],
  },
  {
    CardId: 'card-chase-sapphire',
    CreditId: 'credit-chase-doordash',
    AssociatedPeriod: CREDIT_PERIODS.Annually,
    History: [
      { PeriodNumber: 1, CreditUsage: CREDIT_USAGE.NOT_USED, ValueUsed: 0 },
    ],
  },
  {
    CardId: 'card-chase-sapphire',
    CreditId: 'credit-chase-travel',
    AssociatedPeriod: CREDIT_PERIODS.Annually,
    History: [
      { PeriodNumber: 1, CreditUsage: CREDIT_USAGE.PARTIALLY_USED, ValueUsed: 150 },
    ],
  },
  {
    CardId: 'card-citi-premier',
    CreditId: 'credit-citi-hotel',
    AssociatedPeriod: CREDIT_PERIODS.Annually,
    History: [
      { PeriodNumber: 1, CreditUsage: CREDIT_USAGE.INACTIVE, ValueUsed: 0 },
    ],
  },
];

export const mockUserCreditsWithExpiration: UserCreditWithExpiration[] = [
  {
    ...mockUserCredits[0],
    isExpiring: false,
  },
  {
    ...mockUserCredits[1],
    isExpiring: true,
    daysUntilExpiration: 5,
  },
  {
    ...mockUserCredits[2],
    isExpiring: true,
    daysUntilExpiration: 30,
  },
  {
    ...mockUserCredits[3],
    isExpiring: false,
  },
  {
    ...mockUserCredits[4],
    isExpiring: false,
  },
];

// ============================================================================
// MOCK CONVERSATIONS
// ============================================================================

const createMockMessages = (description: string): ChatMessage[] => [
  {
    id: 'msg-1',
    chatSource: CHAT_SOURCE.USER,
    chatMessage: description,
  },
  {
    id: 'msg-2',
    chatSource: CHAT_SOURCE.ASSISTANT,
    chatMessage: 'Based on your question, I recommend using the Chase Sapphire Reserve for this purchase.',
  },
];

export const mockConversations: Conversation[] = [
  {
    chatId: 'chat-1',
    chatDescription: 'Best card for groceries this month?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    conversation: createMockMessages('Best card for groceries this month?'),
    cardSelection: 'card-amex-gold',
  },
  {
    chatId: 'chat-2',
    chatDescription: 'Travel booking for vacation flights',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    conversation: createMockMessages('Travel booking for vacation flights'),
    cardSelection: 'card-chase-sapphire',
  },
  {
    chatId: 'chat-3',
    chatDescription: 'Which card for Amazon purchase?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    conversation: createMockMessages('Which card for Amazon purchase?'),
    cardSelection: '',
  },
  {
    chatId: 'chat-4',
    chatDescription: 'Restaurant dinner with 5x points',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    conversation: createMockMessages('Restaurant dinner with 5x points'),
    cardSelection: 'card-amex-gold',
  },
  {
    chatId: 'chat-5',
    chatDescription: 'Gas station fill-up rewards',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    conversation: createMockMessages('Gas station fill-up rewards'),
    cardSelection: 'card-citi-premier',
  },
];

// ============================================================================
// MOCK MONTHLY STATS
// ============================================================================

export const mockMonthlyStats: MonthlyStatsResponse = {
  MonthlyCredits: {
    usedValue: 25,
    possibleValue: 40,
    usedCount: 2,
    partiallyUsedCount: 1,
    unusedCount: 1,
  },
  CurrentCredits: {
    usedValue: 175,
    possibleValue: 480,
    usedCount: 3,
    partiallyUsedCount: 2,
    unusedCount: 3,
  },
  AllCredits: {
    usedValue: 175,
    possibleValue: 480,
    usedCount: 3,
    partiallyUsedCount: 2,
    unusedCount: 3,
  },
  ExpiringCredits: {
    Monthly: { count: 1, unusedValue: 5 },
    Quarterly: { count: 0, unusedValue: 0 },
    Semiannually: { count: 0, unusedValue: 0 },
    Annually: { count: 1, unusedValue: 60 },
    Total: { count: 2, unusedValue: 65 },
  },
};

export const mockMonthlyStatsEmpty: MonthlyStatsResponse = {
  MonthlyCredits: {
    usedValue: 0,
    possibleValue: 0,
    usedCount: 0,
    partiallyUsedCount: 0,
    unusedCount: 0,
  },
  CurrentCredits: {
    usedValue: 0,
    possibleValue: 0,
    usedCount: 0,
    partiallyUsedCount: 0,
    unusedCount: 0,
  },
  AllCredits: {
    usedValue: 0,
    possibleValue: 0,
    usedCount: 0,
    partiallyUsedCount: 0,
    unusedCount: 0,
  },
  ExpiringCredits: {
    Monthly: { count: 0, unusedValue: 0 },
    Quarterly: { count: 0, unusedValue: 0 },
    Semiannually: { count: 0, unusedValue: 0 },
    Annually: { count: 0, unusedValue: 0 },
    Total: { count: 0, unusedValue: 0 },
  },
};

// ============================================================================
// MOCK CHAT SOLUTIONS
// ============================================================================

export const mockChatSolutions: ChatSolutionCard[] = [
  {
    id: 'card-amex-gold',
    cardName: 'American Express Gold',
    rewardCategory: 'Dining',
    rewardRate: '4X points',
  },
  {
    id: 'card-chase-sapphire',
    cardName: 'Chase Sapphire Reserve',
    rewardCategory: 'Dining',
    rewardRate: '3X points',
  },
  {
    id: 'card-citi-premier',
    cardName: 'Citi Premier',
    rewardCategory: 'Dining',
    rewardRate: '3X points',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'chat-sample-user-1',
    chatSource: CHAT_SOURCE.USER,
    chatMessage: "I'm planning a dinner out with friends. Which card should I use for the best dining rewards this month?",
  },
  {
    id: 'chat-sample-assistant-1',
    chatSource: CHAT_SOURCE.ASSISTANT,
    chatMessage: 'The American Express Gold card currently gives 4x points on dining, so it is the top pick for this expense.',
  },
  {
    id: 'chat-sample-user-2',
    chatSource: CHAT_SOURCE.USER,
    chatMessage: 'Great! What about an upcoming trip to Europe in March—any travel credits I should stack?',
  },
  {
    id: 'chat-sample-assistant-2',
    chatSource: CHAT_SOURCE.ASSISTANT,
    chatMessage: 'The Chase Sapphire Reserve has a $300 travel credit that automatically offsets travel purchases; it would pair nicely with the Gold card for dining.',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a card details object by card ID
 */
export const getCardDetailsById = (cardId: string): CreditCardDetails | null => {
  return mockCreditCardDetails.find((card) => card.id === cardId) || null;
};

/**
 * Get a card credit object by credit ID
 */
export const getCardCreditById = (creditId: string): CardCredit | null => {
  return mockCardCredits.find((credit) => credit.id === creditId) || null;
};

/**
 * Get credit max value from card credit
 */
export const getCreditMaxValue = (creditId: string): number => {
  const credit = getCardCreditById(creditId);
  return credit ? parseFloat(credit.Value) : 0;
};

