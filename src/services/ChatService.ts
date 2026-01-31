import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import {
  AgentRequestData,
  AgentResponse,
  AgentResponseData,
  isQuickResponse,
  StreamEvent,
  DataChangedFlags,
} from '../types/AgentChatTypes';
import { ChatComponentBlock } from '../types/ChatComponentTypes';
import { MAX_CHAT_MESSAGES, ChatModeType } from '../types/Constants';
import { getSSEClient } from './SSEClient';

// ============================================
// Agent API Methods
// ============================================

/**
 * Send message to agent endpoint (non-streaming)
 * Use for environments where SSE is not supported
 */
export async function sendAgentMessage(
  requestData: AgentRequestData,
  signal?: AbortSignal,
  chatMode?: ChatModeType
): Promise<AgentResponse> {
  const headers = await getAuthHeaders();

  // Add chat mode header if specified
  if (chatMode) {
    headers['X-Chat-Mode'] = chatMode;
  }

  // Limit chat history to prevent large payloads
  const limitedData = {
    ...requestData,
    chatHistory: requestData.chatHistory?.slice(-MAX_CHAT_MESSAGES),
  };

  const response = await axios.post<AgentResponse>(
    `${apiurl}/chat/agent`,
    limitedData,
    {
      headers,
      signal,
    }
  );

  return response.data;
}

/**
 * Tool name to human-readable message mapping
 */
function getToolMessage(toolName: string): string {
  const messages: Record<string, string> = {
    get_all_cards: 'Loading cards...',
    get_card_details: 'Loading card details...',
    get_user_cards: 'Loading your cards...',
    get_user_cards_details: 'Loading card details...',
    get_user_components: 'Loading components...',
    add_card: 'Adding card...',
    remove_card: 'Removing card...',
    set_card_frozen: 'Updating card status...',
    set_card_preferred: 'Setting preferred card...',
    set_card_open_date: 'Updating open date...',
    get_user_credits: 'Loading your credits...',
    get_prioritized_credits: 'Loading prioritized credits...',
    get_expiring_credits: 'Checking expiring credits...',
    get_credit_history: 'Loading credit history...',
    get_monthly_stats: 'Calculating monthly stats...',
    get_annual_stats: 'Calculating annual stats...',
    get_to_date_stats: 'Calculating to-date stats...',
    get_expiring_stats: 'Checking expiring stats...',
    get_roi_stats: 'Calculating ROI...',
    get_lost_stats: 'Checking lost credits...',
    get_category_stats: 'Calculating category stats...',
    update_credit_usage: 'Updating credit usage...',
    update_component_tracking: 'Updating tracking...',
  };
  return messages[toolName] || 'Processing...';
}

/**
 * Streaming callbacks for LangGraph SSE events
 */
export interface StreamingCallbacks {
  /** Called when an agent node starts processing */
  onNodeStart: (node: string, message: string) => void;
  /** Called when an agent node completes */
  onNodeEnd: (node: string) => void;
  /** Called when a tool starts execution (optional) */
  onToolStart?: (tool: string, message: string) => void;
  /** Called when a tool completes (optional) */
  onToolEnd?: (tool: string) => void;
  /** Called for each token during LLM streaming */
  onToken: (content: string, node: string) => void;
  /** Called when the final response is ready */
  onFinal: (
    textResponse: string,
    componentBlock: ChatComponentBlock | undefined,
    agentType: string | undefined,
    messageId: string,
    timestamp: string,
    dataChanged?: DataChangedFlags
  ) => void;
  /** Called when an error occurs */
  onError: (message: string) => void;
}

/**
 * Send message to agent endpoint with SSE streaming (LangGraph)
 * Returns cleanup function to cancel the stream
 */
export function sendAgentMessageStreaming(
  requestData: AgentRequestData,
  callbacks: StreamingCallbacks,
  signal?: AbortSignal,
  chatMode?: ChatModeType
): () => void {
  const client = getSSEClient();

  // Limit chat history
  const limitedData = {
    ...requestData,
    chatHistory: requestData.chatHistory?.slice(-MAX_CHAT_MESSAGES),
  };

  // Start connection asynchronously
  (async () => {
    try {
      const headers = await getAuthHeaders();

      // Add chat mode header if specified
      if (chatMode) {
        headers['X-Chat-Mode'] = chatMode;
      }

      await client.connect({
        url: `${apiurl}/chat/agent`,
        body: limitedData,
        headers,
        signal,
        onEvent: (event: StreamEvent) => {
          switch (event.type) {
            case 'node_start':
              callbacks.onNodeStart(event.data.node, event.data.message);
              break;

            case 'node_end':
              callbacks.onNodeEnd(event.data.node);
              break;

            case 'token':
              callbacks.onToken(event.data.content, event.data.node);
              break;

            case 'final':
              callbacks.onFinal(
                event.data.textResponse,
                event.data.componentBlock,
                event.data.agentType,
                event.data.messageId,
                event.data.timestamp,
                event.data.dataChanged
              );
              break;

            case 'error':
              callbacks.onError(event.data.message);
              break;

            case 'tool_start':
              callbacks.onToolStart?.(
                event.data.tool as string,
                getToolMessage(event.data.tool as string)
              );
              break;

            case 'tool_end':
              callbacks.onToolEnd?.(event.data.tool as string);
              break;
          }
        },
        onError: (error) => {
          callbacks.onError(error.message);
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        callbacks.onError(error.message);
      } else {
        callbacks.onError('Failed to connect');
      }
    }
  })();

  // Return cleanup function
  return () => client.disconnect();
}

/**
 * Handle agent response (both quick and full)
 * Normalizes response to consistent format
 */
export function normalizeAgentResponse(response: AgentResponse): AgentResponseData {
  if (isQuickResponse(response)) {
    return {
      textResponse: response.response,
      messageId: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isError: false,
    };
  }
  return response;
}
