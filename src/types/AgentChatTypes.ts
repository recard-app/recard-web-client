/**
 * Agent Chat Types
 *
 * Types for the AI agent chat system including request/response types,
 * SSE streaming events, and error handling.
 *
 * Note: The backend accepts ChatMessage[] directly (chatSource/chatMessage format)
 * and converts internally - no field name conversion is needed on the frontend.
 */

import { ChatComponentBlock } from './ChatComponentTypes';
import { ChatMessage } from './ChatTypes';
import { CHAT_SOURCE } from './Constants';

// ============================================
// API Request/Response Types
// ============================================

/**
 * Request payload for /chat/agent endpoint
 * Note: Backend accepts ChatMessage[] directly (chatSource/chatMessage format)
 * and converts internally - no field name conversion needed on frontend
 */
export interface AgentRequestData {
  name?: string;
  prompt: string;
  chatHistory?: ChatMessage[];
  conversationId?: string;
}

/**
 * Full response from /chat/agent endpoint
 */
export interface AgentResponseData {
  textResponse: string;
  componentBlock?: ChatComponentBlock;
  messageId: string;
  timestamp: string;
  isError?: boolean;
}

/**
 * Quick response for simple queries (greetings, thanks)
 * Returned when no components are needed
 */
export interface QuickResponseData {
  response: string;
}

export type AgentResponse = AgentResponseData | QuickResponseData;

// ============================================
// Type Guards
// ============================================

export function isQuickResponse(data: AgentResponse): data is QuickResponseData {
  return 'response' in data && !('textResponse' in data);
}

export function isAgentResponse(data: AgentResponse): data is AgentResponseData {
  return 'textResponse' in data;
}

// ============================================
// SSE Event Types
// ============================================

export type StreamEventType =
  | 'indicator'
  | 'indicator_end'
  | 'text'
  | 'components'
  | 'done'
  | 'error';

export interface StreamIndicatorEvent {
  type: 'indicator';
  message: string;
  agentType?: string;
}

export interface StreamIndicatorEndEvent {
  type: 'indicator_end';
}

export interface StreamTextEvent {
  type: 'text';
  content: string;
}

export interface StreamComponentsEvent {
  type: 'components';
  block: ChatComponentBlock;
}

/**
 * Flags indicating which data was modified by the AI
 * Used to trigger UI refreshes
 */
export interface DataChangedFlags {
  credits?: boolean;
  cards?: boolean;
  preferences?: boolean;
}

export interface StreamDoneEvent {
  type: 'done';
  messageId: string;
  timestamp: string;
  agentType?: string;
  dataChanged?: DataChangedFlags;
}

export interface StreamErrorEvent {
  type: 'error';
  message: string;
}

export type StreamEvent =
  | StreamIndicatorEvent
  | StreamIndicatorEndEvent
  | StreamTextEvent
  | StreamComponentsEvent
  | StreamDoneEvent
  | StreamErrorEvent;

// ============================================
// Message Filtering Utilities
// ============================================

/**
 * Filter chat messages for API submission
 * - Removes error messages (isError: true)
 * - Keeps only user and assistant messages
 * Note: No field name conversion needed - backend accepts frontend format
 */
export function filterMessagesForApi(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter(msg =>
      msg.chatSource === CHAT_SOURCE.USER ||
      msg.chatSource === CHAT_SOURCE.ASSISTANT
    )
    .filter(msg => !msg.isError);
}

/**
 * Create a ChatMessage from agent response
 */
export function createAssistantMessage(
  response: AgentResponseData,
  messageId?: string
): Omit<ChatMessage, 'id'> & { id?: string } {
  return {
    id: messageId || response.messageId,
    chatSource: CHAT_SOURCE.ASSISTANT,
    chatMessage: response.textResponse,
    isError: response.isError,
  };
}

/**
 * Create a ChatMessage from quick response
 */
export function createQuickAssistantMessage(
  response: QuickResponseData,
  messageId: string
): Omit<ChatMessage, 'id'> & { id: string } {
  return {
    id: messageId,
    chatSource: CHAT_SOURCE.ASSISTANT,
    chatMessage: response.response,
    isError: false,
  };
}

// ============================================
// Error Types
// ============================================

export const AGENT_ERROR_CODES = {
  RATE_LIMIT: 'RATE_LIMIT',
  DAILY_LIMIT: 'DAILY_RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NETWORK: 'NETWORK_ERROR',
  STREAM_INTERRUPTED: 'STREAM_INTERRUPTED',
  PARSE_ERROR: 'PARSE_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type AgentErrorCode = typeof AGENT_ERROR_CODES[keyof typeof AGENT_ERROR_CODES];

export interface AgentError {
  code: AgentErrorCode;
  message: string;
  retryable: boolean;
}

export const ERROR_MESSAGES: Record<AgentErrorCode, string> = {
  [AGENT_ERROR_CODES.RATE_LIMIT]: 'Too many requests. Please wait a moment.',
  [AGENT_ERROR_CODES.DAILY_LIMIT]: 'Daily request limit reached. Try again tomorrow.',
  [AGENT_ERROR_CODES.UNAUTHORIZED]: 'Please sign in to continue.',
  [AGENT_ERROR_CODES.NETWORK]: 'Connection lost. Check your internet connection.',
  [AGENT_ERROR_CODES.STREAM_INTERRUPTED]: 'Response interrupted. Please try again.',
  [AGENT_ERROR_CODES.PARSE_ERROR]: 'Received invalid response. Please try again.',
  [AGENT_ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
  [AGENT_ERROR_CODES.UNKNOWN]: 'Something went wrong. Please try again.',
};

/**
 * Classify error and return structured error info
 */
export function classifyError(error: unknown): AgentError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('429') || message.includes('rate limit')) {
      return {
        code: AGENT_ERROR_CODES.RATE_LIMIT,
        message: ERROR_MESSAGES[AGENT_ERROR_CODES.RATE_LIMIT],
        retryable: true,
      };
    }

    if (message.includes('daily') || message.includes('DAILY_RATE_LIMIT_EXCEEDED')) {
      return {
        code: AGENT_ERROR_CODES.DAILY_LIMIT,
        message: ERROR_MESSAGES[AGENT_ERROR_CODES.DAILY_LIMIT],
        retryable: false,
      };
    }

    if (message.includes('401') || message.includes('unauthorized') || message.includes('auth')) {
      return {
        code: AGENT_ERROR_CODES.UNAUTHORIZED,
        message: ERROR_MESSAGES[AGENT_ERROR_CODES.UNAUTHORIZED],
        retryable: false,
      };
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        code: AGENT_ERROR_CODES.NETWORK,
        message: ERROR_MESSAGES[AGENT_ERROR_CODES.NETWORK],
        retryable: true,
      };
    }

    if (message.includes('timeout')) {
      return {
        code: AGENT_ERROR_CODES.TIMEOUT,
        message: ERROR_MESSAGES[AGENT_ERROR_CODES.TIMEOUT],
        retryable: true,
      };
    }
  }

  return {
    code: AGENT_ERROR_CODES.UNKNOWN,
    message: ERROR_MESSAGES[AGENT_ERROR_CODES.UNKNOWN],
    retryable: true,
  };
}
