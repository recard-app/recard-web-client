/**
 * Mock data for the Design System Full Components Page
 * Contains realistic sample data for all component showcases
 */

import {
  Conversation,
  ChatMessage,
  CreditCard,
  CreditCardDetails,
  UserCredit,
  UserCreditWithExpiration,
  MonthlyStatsResponse,
  CHAT_SOURCE,
  CREDIT_PERIODS,
  CREDIT_USAGE,
} from '../../../types';
import type { CardCredit, CardPerk, CardMultiplier, EnrichedMultiplier } from '../../../types/CreditCardTypes';
import {
  ChatComponentBlock,
  CardComponentItem,
  CreditComponentItem,
  PerkComponentItem,
  MultiplierComponentItem,
  CardAction,
  CreditAction,
  PerkAction,
  MultiplierAction,
  ChatComponentCard,
  ChatComponentCredit,
  ChatComponentUserCredit,
  ChatComponentPerk,
  ChatComponentMultiplier,
  CHAT_COMPONENT_TYPES,
  CARD_ACTION_TYPES,
  CREDIT_ACTION_TYPES,
  PERK_ACTION_TYPES,
  MULTIPLIER_ACTION_TYPES,
} from '../../../types/ChatComponentTypes';
import { MULTIPLIER_TYPES } from '../../../types/CreditCardTypes';

// ============================================================================
// TYPE CONVERSION HELPERS (for mock data)
// ============================================================================

/**
 * Convert full CreditCard to simplified ChatComponentCard
 */
function toChatComponentCard(card: CreditCard, overrides?: Partial<ChatComponentCard>): ChatComponentCard {
  return {
    id: card.id,
    CardName: card.CardName,
    CardIssuer: card.CardIssuer,
    CardNetwork: card.CardNetwork,
    CardPrimaryColor: card.CardPrimaryColor || '#333333',
    CardSecondaryColor: card.CardSecondaryColor || '#666666',
    isFrozen: card.isFrozen,
    isDefaultCard: card.isDefaultCard,
    ...overrides,
  };
}

/**
 * Convert full CardCredit to simplified ChatComponentCredit
 */
function toChatComponentCredit(credit: CardCredit): ChatComponentCredit {
  return {
    id: credit.id,
    Title: credit.Title,
    Value: credit.Value,
    TimePeriod: credit.TimePeriod,
    Description: credit.Description,
  };
}

/**
 * Convert full UserCredit to simplified ChatComponentUserCredit
 */
function toChatComponentUserCredit(userCredit: UserCredit): ChatComponentUserCredit {
  return {
    isAnniversaryBased: userCredit.isAnniversaryBased,
    AssociatedPeriod: userCredit.AssociatedPeriod,
  };
}

/**
 * Convert full CardPerk to simplified ChatComponentPerk
 */
function toChatComponentPerk(perk: CardPerk): ChatComponentPerk {
  return {
    id: perk.id,
    Title: perk.Title,
    Description: perk.Description,
  };
}

/**
 * Convert full EnrichedMultiplier to simplified ChatComponentMultiplier
 */
function toChatComponentMultiplier(multiplier: EnrichedMultiplier): ChatComponentMultiplier {
  return {
    id: multiplier.id,
    Name: multiplier.Name || multiplier.Category,
    Category: multiplier.Category,
    SubCategory: multiplier.SubCategory,
    Multiplier: multiplier.Multiplier,
    Description: multiplier.Description,
  };
}

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
    Value: 10,
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
    Value: 10,
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
    Value: 60,
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
    Value: 300,
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
    Value: 100,
    TimePeriod: 'annually',
    Requirements: 'Book through Citi portal',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
  {
    id: 'credit-chase-airline',
    ReferenceCardId: 'card-chase-sapphire',
    Title: 'Airline Incidental Credit',
    Category: 'Travel',
    SubCategory: 'Airline',
    Description: 'Annual credit for incidental airline fees (baggage, seat selection, etc.)',
    Value: 200,
    TimePeriod: 'annually',
    Requirements: 'Select airline in portal',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
    isAnniversaryBased: true,
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
  {
    CardId: 'card-chase-sapphire',
    CreditId: 'credit-chase-airline',
    AssociatedPeriod: CREDIT_PERIODS.Annually,
    History: [
      { PeriodNumber: 1, CreditUsage: CREDIT_USAGE.PARTIALLY_USED, ValueUsed: 75 },
    ],
    isAnniversaryBased: true,
    anniversaryDate: '03-15',
    anniversaryYear: 2024,
    Title: 'Airline Incidental Credit (2024)',
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
  {
    ...mockUserCredits[5], // Anniversary-based credit
    isExpiring: true,
    daysUntilExpiration: 60,
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
  },
  {
    chatId: 'chat-2',
    chatDescription: 'Travel booking for vacation flights',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    conversation: createMockMessages('Travel booking for vacation flights'),
  },
  {
    chatId: 'chat-3',
    chatDescription: 'Which card for Amazon purchase?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    conversation: createMockMessages('Which card for Amazon purchase?'),
  },
  {
    chatId: 'chat-4',
    chatDescription: 'Restaurant dinner with 5x points',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    conversation: createMockMessages('Restaurant dinner with 5x points'),
  },
  {
    chatId: 'chat-5',
    chatDescription: 'Gas station fill-up rewards',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    conversation: createMockMessages('Gas station fill-up rewards'),
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
  return credit?.Value || 0;
};

// ============================================================================
// MOCK CARD PERKS
// ============================================================================

export const mockCardPerks: CardPerk[] = [
  {
    id: 'perk-amex-gold-lounge',
    ReferenceCardId: 'card-amex-gold',
    Title: 'Centurion Lounge Access',
    Category: 'Travel',
    SubCategory: 'Airport',
    Description: 'Access to American Express Centurion Lounges worldwide with complimentary food, drinks, and WiFi.',
    Requirements: 'Present card at lounge entrance',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
  {
    id: 'perk-chase-priority-boarding',
    ReferenceCardId: 'card-chase-sapphire',
    Title: 'Priority Pass Membership',
    Category: 'Travel',
    SubCategory: 'Airport',
    Description: 'Unlimited access to 1,300+ airport lounges worldwide through Priority Pass Select membership.',
    Requirements: 'Enroll through Chase portal',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
  {
    id: 'perk-amex-gold-insurance',
    ReferenceCardId: 'card-amex-gold',
    Title: 'Purchase Protection',
    Category: 'Insurance',
    SubCategory: 'Purchase',
    Description: 'Coverage for eligible purchases against damage or theft for up to 90 days from purchase date.',
    Requirements: 'Pay with card',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
  },
];

// ============================================================================
// MOCK CARD MULTIPLIERS
// ============================================================================

export const mockCardMultipliers: EnrichedMultiplier[] = [
  {
    id: 'mult-amex-gold-dining',
    ReferenceCardId: 'card-amex-gold',
    Name: 'Dining Rewards',
    Category: 'Dining',
    SubCategory: 'Restaurant',
    Description: '4X Membership Rewards points at restaurants worldwide',
    Multiplier: 4,
    Requirements: 'Purchases at restaurants',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
    multiplierType: MULTIPLIER_TYPES.STANDARD,
  },
  {
    id: 'mult-chase-travel',
    ReferenceCardId: 'card-chase-sapphire',
    Name: 'Travel Rewards',
    Category: 'Travel',
    SubCategory: 'General',
    Description: '3X points on travel after earning $300 travel credit',
    Multiplier: 3,
    Requirements: 'Travel purchases through Chase portal or direct',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '9999-12-31',
    LastUpdated: new Date().toISOString(),
    multiplierType: MULTIPLIER_TYPES.STANDARD,
  },
  {
    id: 'mult-discover-rotating',
    ReferenceCardId: 'card-discover-it',
    Name: 'Rotating Categories',
    Category: 'Rotating',
    SubCategory: 'Q1 2025',
    Description: '5% cash back on rotating quarterly categories',
    Multiplier: 5,
    Requirements: 'Activate quarterly, up to $1,500',
    EffectiveFrom: '2024-01-01',
    EffectiveTo: '2024-03-31',
    LastUpdated: new Date().toISOString(),
    multiplierType: MULTIPLIER_TYPES.ROTATING,
    currentSchedules: [
      {
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        category: 'Grocery',
        subCategory: 'Supermarkets',
      },
    ],
  },
];

// ============================================================================
// MOCK CHAT COMPONENT ITEMS
// ============================================================================

// Card items with various actions
export const mockCardComponentItems: CardComponentItem[] = [
  {
    id: 'item-card-1',
    componentType: CHAT_COMPONENT_TYPES.CARD,
    displayOrder: 1,
    card: toChatComponentCard(mockCreditCards[0]), // Amex Gold
    action: {
      id: 'action-card-1',
      componentType: CHAT_COMPONENT_TYPES.CARD,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: CARD_ACTION_TYPES.ADD,
      cardId: 'card-amex-gold',
    },
  },
  {
    id: 'item-card-2',
    componentType: CHAT_COMPONENT_TYPES.CARD,
    displayOrder: 2,
    card: toChatComponentCard(mockCreditCards[1], { isDefaultCard: true }), // Chase Sapphire as preferred
    action: {
      id: 'action-card-2',
      componentType: CHAT_COMPONENT_TYPES.CARD,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: CARD_ACTION_TYPES.SET_PREFERRED,
      cardId: 'card-chase-sapphire',
    },
  },
  {
    id: 'item-card-3',
    componentType: CHAT_COMPONENT_TYPES.CARD,
    displayOrder: 3,
    card: toChatComponentCard(mockCreditCards[2], { isFrozen: true }), // Citi Premier frozen
    action: {
      id: 'action-card-3',
      componentType: CHAT_COMPONENT_TYPES.CARD,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: CARD_ACTION_TYPES.FROZEN,
      cardId: 'card-citi-premier',
    },
  },
  {
    id: 'item-card-3b-preferred-frozen',
    componentType: CHAT_COMPONENT_TYPES.CARD,
    displayOrder: 3,
    card: toChatComponentCard(mockCreditCards[3], { isDefaultCard: true, isFrozen: true }), // Capital One both preferred and frozen
  },
  {
    id: 'item-card-4-undone',
    componentType: CHAT_COMPONENT_TYPES.CARD,
    displayOrder: 4,
    card: toChatComponentCard(mockCreditCards[3]), // Capital One Venture
    action: {
      id: 'action-card-4',
      componentType: CHAT_COMPONENT_TYPES.CARD,
      timestamp: new Date().toISOString(),
      isUndone: true, // Undone state
      actionType: CARD_ACTION_TYPES.REMOVE,
      cardId: 'card-capital-one-venture',
    },
  },
  {
    id: 'item-card-5-no-action',
    componentType: CHAT_COMPONENT_TYPES.CARD,
    displayOrder: 5,
    card: toChatComponentCard(mockCreditCards[4]), // Discover without action
  },
];

// Credit items with various states
export const mockCreditComponentItems: CreditComponentItem[] = [
  {
    id: 'item-credit-1',
    componentType: CHAT_COMPONENT_TYPES.CREDIT,
    displayOrder: 1,
    userCredit: toChatComponentUserCredit(mockUserCredits[0]),
    cardCredit: toChatComponentCredit(mockCardCredits[0]),
    card: toChatComponentCard(mockCreditCards[0]),
    creditMaxValue: 10,
    currentValueUsed: 10,
    action: {
      id: 'action-credit-1',
      componentType: CHAT_COMPONENT_TYPES.CREDIT,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: CREDIT_ACTION_TYPES.UPDATE_USAGE,
      cardId: 'card-amex-gold',
      creditId: 'credit-amex-dining',
      periodNumber: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      periodType: 'monthly',
      fromValue: 0,
      toValue: 10,
    },
  },
  {
    id: 'item-credit-2',
    componentType: CHAT_COMPONENT_TYPES.CREDIT,
    displayOrder: 2,
    userCredit: toChatComponentUserCredit(mockUserCredits[1]),
    cardCredit: toChatComponentCredit(mockCardCredits[1]),
    card: toChatComponentCard(mockCreditCards[0]),
    creditMaxValue: 10,
    currentValueUsed: 5,
    action: {
      id: 'action-credit-2',
      componentType: CHAT_COMPONENT_TYPES.CREDIT,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: CREDIT_ACTION_TYPES.UPDATE_USAGE,
      cardId: 'card-amex-gold',
      creditId: 'credit-amex-uber',
      periodNumber: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      periodType: 'monthly',
      fromValue: 0,
      toValue: 5,
    },
  },
  {
    id: 'item-credit-3-no-action',
    componentType: CHAT_COMPONENT_TYPES.CREDIT,
    displayOrder: 3,
    userCredit: toChatComponentUserCredit(mockUserCredits[2]),
    cardCredit: toChatComponentCredit(mockCardCredits[2]),
    card: toChatComponentCard(mockCreditCards[1]),
    creditMaxValue: 60,
    currentValueUsed: 0,
  },
  {
    id: 'item-credit-4-anniversary',
    componentType: CHAT_COMPONENT_TYPES.CREDIT,
    displayOrder: 4,
    userCredit: toChatComponentUserCredit(mockUserCredits[5]), // Anniversary-based credit
    cardCredit: toChatComponentCredit(mockCardCredits[5]), // Anniversary-based card credit
    card: toChatComponentCard(mockCreditCards[1]), // Chase Sapphire
    creditMaxValue: 200,
    currentValueUsed: 75,
    action: {
      id: 'action-credit-4',
      componentType: CHAT_COMPONENT_TYPES.CREDIT,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: CREDIT_ACTION_TYPES.UPDATE_USAGE,
      cardId: 'card-chase-sapphire',
      creditId: 'credit-chase-airline',
      periodNumber: 1,
      year: 2024,
      periodType: 'annually',
      fromValue: 0,
      toValue: 75,
      isAnniversaryBased: true,
      anniversaryDate: '03-15',
    },
  },
];

// Perk items
export const mockPerkComponentItems: PerkComponentItem[] = [
  {
    id: 'item-perk-1',
    componentType: CHAT_COMPONENT_TYPES.PERK,
    displayOrder: 1,
    perk: toChatComponentPerk(mockCardPerks[0]),
    card: toChatComponentCard(mockCreditCards[0]),
    action: {
      id: 'action-perk-1',
      componentType: CHAT_COMPONENT_TYPES.PERK,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: PERK_ACTION_TYPES.TRACK,
      cardId: 'card-amex-gold',
      perkId: 'perk-amex-gold-lounge',
    },
  },
  {
    id: 'item-perk-2-undone',
    componentType: CHAT_COMPONENT_TYPES.PERK,
    displayOrder: 2,
    perk: toChatComponentPerk(mockCardPerks[1]),
    card: toChatComponentCard(mockCreditCards[1]),
    action: {
      id: 'action-perk-2',
      componentType: CHAT_COMPONENT_TYPES.PERK,
      timestamp: new Date().toISOString(),
      isUndone: true,
      actionType: PERK_ACTION_TYPES.UNTRACK,
      cardId: 'card-chase-sapphire',
      perkId: 'perk-chase-priority-boarding',
    },
  },
  {
    id: 'item-perk-3-no-action',
    componentType: CHAT_COMPONENT_TYPES.PERK,
    displayOrder: 3,
    perk: toChatComponentPerk(mockCardPerks[2]),
    card: toChatComponentCard(mockCreditCards[0]),
  },
];

// Multiplier items
export const mockMultiplierComponentItems: MultiplierComponentItem[] = [
  {
    id: 'item-mult-1',
    componentType: CHAT_COMPONENT_TYPES.MULTIPLIER,
    displayOrder: 1,
    multiplier: toChatComponentMultiplier(mockCardMultipliers[0]),
    card: toChatComponentCard(mockCreditCards[0]),
    action: {
      id: 'action-mult-1',
      componentType: CHAT_COMPONENT_TYPES.MULTIPLIER,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: MULTIPLIER_ACTION_TYPES.TRACK,
      cardId: 'card-amex-gold',
      multiplierId: 'mult-amex-gold-dining',
    },
  },
  {
    id: 'item-mult-2-no-action',
    componentType: CHAT_COMPONENT_TYPES.MULTIPLIER,
    displayOrder: 2,
    multiplier: toChatComponentMultiplier(mockCardMultipliers[1]),
    card: toChatComponentCard(mockCreditCards[1]),
  },
  {
    id: 'item-mult-3-rotating',
    componentType: CHAT_COMPONENT_TYPES.MULTIPLIER,
    displayOrder: 3,
    multiplier: toChatComponentMultiplier(mockCardMultipliers[2]),
    card: toChatComponentCard(mockCreditCards[4]),
    action: {
      id: 'action-mult-3',
      componentType: CHAT_COMPONENT_TYPES.MULTIPLIER,
      timestamp: new Date().toISOString(),
      isUndone: false,
      actionType: MULTIPLIER_ACTION_TYPES.TRACK,
      cardId: 'card-discover-it',
      multiplierId: 'mult-discover-rotating',
    },
  },
];

// Mixed component block for testing
export const mockChatComponentBlock: ChatComponentBlock = {
  id: 'block-mixed-1',
  messageId: 'msg-1',
  timestamp: new Date().toISOString(),
  items: [
    mockCardComponentItems[0],
    mockCreditComponentItems[0],
    mockPerkComponentItems[0],
    mockMultiplierComponentItems[0],
  ],
};

// Large block to test "Show more" functionality
export const mockLargeChatComponentBlock: ChatComponentBlock = {
  id: 'block-large-1',
  messageId: 'msg-2',
  timestamp: new Date().toISOString(),
  items: [
    ...mockCardComponentItems,
    ...mockCreditComponentItems.slice(0, 2),
  ],
};

