import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import type {
  AgentModePreference,
  CardCredit,
  CardPerk,
  Conversation,
  CreditCard,
  CreditCardDetails,
  EnrichedMultiplier,
  SubscriptionPlan,
  SubscriptionStatusType,
  UserComponentTrackingPreferences,
  UserCreditCard,
  ChatHistoryPreference,
} from '../../types';

export type BootstrapIncludeSection =
  | 'cards'
  | 'subscription'
  | 'preferences'
  | 'components'
  | 'componentPreferences'
  | 'history'
  | 'credits';

export interface BootstrapCardsPayload {
  previews: CreditCard[];
  userCards: UserCreditCard[];
  details: CreditCardDetails[];
}

export interface BootstrapSubscriptionPayload {
  plan: SubscriptionPlan;
  status: SubscriptionStatusType;
  billingPeriod: string | null;
  expiresAt: string | null;
  onboardingComplete: boolean;
}

export interface BootstrapPreferencesPayload {
  instructions: string;
  chatHistory: ChatHistoryPreference;
  agentMode: AgentModePreference;
}

export interface BootstrapComponentsPayload {
  perks: CardPerk[];
  credits: CardCredit[];
  multipliers: EnrichedMultiplier[];
}

export interface BootstrapHistoryPayload {
  previews: Conversation[];
  priorityChat?: Conversation | null;
}

export interface BootstrapCreditsPayload {
  monthlyStats: Record<string, unknown>;
  prioritizedCredits: unknown[];
  prioritizedCreditsTotal?: number;
  lastUpdated?: string;
}

export interface BootstrapResponse {
  cards?: BootstrapCardsPayload;
  subscription?: BootstrapSubscriptionPayload;
  preferences?: BootstrapPreferencesPayload;
  components?: BootstrapComponentsPayload;
  componentPreferences?: UserComponentTrackingPreferences;
  history?: BootstrapHistoryPayload;
  creditsSummary?: BootstrapCreditsPayload;
}

function normalizeConversationPreview(conversation: Partial<Conversation> & Pick<Conversation, 'chatId' | 'chatDescription' | 'timestamp'>): Conversation {
  const normalizedConversation = Array.isArray(conversation.conversation) ? conversation.conversation : [];
  const normalizedComponentBlocks = Array.isArray(conversation.componentBlocks) ? conversation.componentBlocks : [];
  const normalizedMessageCount = typeof conversation.messageCount === 'number'
    ? conversation.messageCount
    : 0;

  return {
    ...conversation,
    conversation: normalizedConversation,
    componentBlocks: normalizedComponentBlocks,
    messageCount: normalizedMessageCount,
  };
}

function normalizeBootstrapResponse(response: BootstrapResponse): BootstrapResponse {
  if (!response.history?.previews) {
    return response;
  }

  return {
    ...response,
    history: {
      ...response.history,
      previews: response.history.previews.map(normalizeConversationPreview),
      priorityChat: response.history.priorityChat
        ? normalizeConversationPreview(response.history.priorityChat)
        : response.history.priorityChat,
    },
  };
}

export function hasRequiredBootstrapSections(response: BootstrapResponse): response is BootstrapResponse & {
  cards: BootstrapCardsPayload;
  subscription: BootstrapSubscriptionPayload;
  preferences: BootstrapPreferencesPayload;
  components: BootstrapComponentsPayload;
  componentPreferences: UserComponentTrackingPreferences;
  history: BootstrapHistoryPayload;
} {
  return Boolean(
    response.cards &&
      Array.isArray(response.cards.previews) &&
      Array.isArray(response.cards.userCards) &&
      Array.isArray(response.cards.details) &&
      response.subscription &&
      response.preferences &&
      response.components &&
      Array.isArray(response.components.perks) &&
      Array.isArray(response.components.credits) &&
      Array.isArray(response.components.multipliers) &&
      response.componentPreferences &&
      response.history &&
      Array.isArray(response.history.previews)
  );
}

export const BootstrapService = {
  async fetchBootstrap(options?: {
    include?: BootstrapIncludeSection[];
    historySize?: number;
    chatId?: string | null;
  }): Promise<BootstrapResponse> {
    const headers = await getAuthHeaders();
    const params: Record<string, string | number> = {};

    if (options?.include && options.include.length > 0) {
      params.include = options.include.join(',');
    }
    if (typeof options?.historySize === 'number') {
      params.historySize = options.historySize;
    }
    if (options?.chatId) {
      params.chatId = options.chatId;
    }

    const response = await axios.get<BootstrapResponse>(`${apiurl}/api/v1/bootstrap`, {
      headers,
      params,
    });

    return normalizeBootstrapResponse(response.data);
  },
};
