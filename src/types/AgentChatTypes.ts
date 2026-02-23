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
  agentMode?: string;
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
  agentType?: string;
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
// SSE Event Types (LangGraph Native)
// ============================================

/**
 * LangGraph stream event types
 */
export type StreamEventType =
  | 'node_start'    // Agent/node begins processing
  | 'node_end'      // Agent/node completes
  | 'token'         // LLM token (for real-time text streaming)
  | 'tool_start'    // Tool execution begins (optional)
  | 'tool_end'      // Tool execution ends (optional)
  | 'final'         // Complete response with all data
  | 'error';        // Error occurred

/**
 * Node start event - fired when an agent node begins processing
 */
export interface NodeStartEvent {
  type: 'node_start';
  data: {
    node: string;
    message: string;
  };
}

/**
 * Node end event - fired when an agent node completes
 */
export interface NodeEndEvent {
  type: 'node_end';
  data: {
    node: string;
  };
}

/**
 * Token event - fired for each LLM token during streaming
 */
export interface TokenEvent {
  type: 'token';
  data: {
    content: string;
    node: string;
  };
}

/**
 * Tool start event - fired when a tool begins execution (optional)
 */
export interface ToolStartEvent {
  type: 'tool_start';
  data: {
    tool: string;
    input?: unknown;
  };
}

/**
 * Tool end event - fired when a tool completes (optional)
 */
export interface ToolEndEvent {
  type: 'tool_end';
  data: {
    tool: string;
    success: boolean;
  };
}

/**
 * Final response event - contains complete response data
 */
export interface FinalEvent {
  type: 'final';
  data: {
    textResponse: string;
    componentBlock?: ChatComponentBlock;
    agentType?: string;
    success: boolean;
    messageId: string;
    timestamp: string;
    dataChanged?: DataChangedFlags;
  };
}

/**
 * Error event - fired when an error occurs
 */
export interface StreamErrorEvent {
  type: 'error';
  data: {
    message: string;
  };
}

/**
 * Union of all LangGraph stream events
 */
export type StreamEvent =
  | NodeStartEvent
  | NodeEndEvent
  | TokenEvent
  | ToolStartEvent
  | ToolEndEvent
  | FinalEvent
  | StreamErrorEvent;

/**
 * Flags indicating which data was modified by the AI
 * Used to trigger UI refreshes
 */
export interface DataChangedFlags {
  credits?: boolean;
  cards?: boolean;
  preferences?: boolean;
}

// ============================================
// Timeline Types (Agent Progress Tracking)
// ============================================

/**
 * Status of a timeline item (node or tool)
 */
export type TimelineItemStatus = 'pending' | 'active' | 'completed' | 'error';

/**
 * A tool call within a timeline node
 */
export interface TimelineToolCall {
  id: string;
  tool: string;
  parentNode: string;
  activeMessage: string;      // "Loading credits..."
  resultMessage?: string;     // "Credits loaded"
  status: TimelineItemStatus;
  startTime: number;
  endTime?: number;
}

/**
 * A node (agent) in the timeline
 */
export interface TimelineNode {
  id: string;
  node: string;
  message: string;
  status: TimelineItemStatus;
  startTime: number;
  endTime?: number;
  toolCalls: TimelineToolCall[];
}

/**
 * Complete timeline state
 */
export interface TimelineState {
  nodes: TimelineNode[];
  isComplete: boolean;
  isCollapsed: boolean;
}

/**
 * Initial timeline state
 */
export const initialTimelineState: TimelineState = {
  nodes: [],
  isComplete: false,
  isCollapsed: false,
};

// ============================================
// Streaming State Types
// ============================================

/**
 * Current node being processed (for indicator display)
 */
export interface ActiveNode {
  /** Node name (e.g., 'router_node', 'spend_node') */
  name: string;
  /** Human-readable message (e.g., 'Finding best card...') */
  message: string;
  /** Timestamp when node started (for elapsed time display) */
  startTime: number;
}

/**
 * Current tool being executed (for indicator display)
 * Separate from activeNode to allow independent rendering/styling
 */
export interface ActiveTool {
  /** Tool name (e.g., 'get_user_cards', 'get_expiring_credits') */
  name: string;
  /** Human-readable message (e.g., 'Loading your cards...') */
  message: string;
  /** Timestamp when tool started */
  startTime: number;
}

/**
 * Streaming state for the chat hook
 * Tracks all state during LangGraph stream processing
 */
export interface StreamingState {
  /** Whether currently streaming */
  isStreaming: boolean;
  /** Active node (for indicator) */
  activeNode: ActiveNode | null;
  /** Active tool within node (for indicator) - separate from activeNode for independent styling */
  activeTool: ActiveTool | null;
  /** Accumulated text (token by token) */
  streamedText: string;
  /** Component block (arrives with final event) */
  componentBlock: ChatComponentBlock | null;
  /** Error message if failed */
  error: string | null;
  /** Final message ID */
  messageId: string | null;
  /** Final timestamp */
  timestamp: string | null;
  /** Agent that handled the request */
  agentType: string | null;
  /** Nodes that have completed */
  completedNodes: string[];
  /** Timeline state for agent progress visualization */
  timeline: TimelineState;
}

/**
 * Initial streaming state
 */
export const initialStreamingState: StreamingState = {
  isStreaming: false,
  activeNode: null,
  activeTool: null,
  streamedText: '',
  componentBlock: null,
  error: null,
  messageId: null,
  timestamp: null,
  agentType: null,
  completedNodes: [],
  timeline: initialTimelineState,
};

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
  [AGENT_ERROR_CODES.DAILY_LIMIT]: 'You\'ve reached your daily message limit. Upgrade your plan for more messages.',
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
