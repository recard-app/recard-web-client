import { Conversation, MY_CREDITS_BEFORE_MY_CARDS } from '../types';
import { CardCredit, CreditCard } from '../types/CreditCardTypes';

export const shouldShowNewChatButton = (
  chatHistory: Conversation[],
  currentChatId: string | null
): boolean => {
  if (!currentChatId) {
    return false;
  }

  const currentChat = chatHistory.find(chat => chat.chatId === currentChatId);
  if (!currentChat) {
    return false;
  }

  const messageCount = typeof currentChat.messageCount === 'number'
    ? currentChat.messageCount
    : (currentChat.conversation?.length || 0);

  return messageCount > 0;
};

export const buildCardByIdMap = (creditCards: CreditCard[]): Map<string, CreditCard> => (
  new Map(creditCards.map(card => [card.id, card]))
);

export const buildCreditByPairMap = (credits: CardCredit[]): Map<string, CardCredit> => {
  const map = new Map<string, CardCredit>();
  for (const credit of credits) {
    map.set(`${credit.ReferenceCardId}:${credit.id}`, credit);
  }
  return map;
};

export const orderSidebarSections = <T>(myCardsSection: T, myCreditsSection: T | null): T[] => (
  MY_CREDITS_BEFORE_MY_CARDS
    ? [myCreditsSection, myCardsSection].filter(Boolean) as T[]
    : [myCardsSection, myCreditsSection].filter(Boolean) as T[]
);
