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
import { RECOMMENDED_MAX_CHAT_MESSAGES } from '../types/Constants';
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
  signal?: AbortSignal
): Promise<AgentResponse> {
  const headers = await getAuthHeaders();

  // Limit chat history to prevent large payloads
  const limitedData = {
    ...requestData,
    chatHistory: requestData.chatHistory?.slice(-RECOMMENDED_MAX_CHAT_MESSAGES),
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
 * Streaming callbacks for SSE events
 */
export interface StreamingCallbacks {
  onIndicator: (message: string) => void;
  onIndicatorEnd: () => void;
  onText: (content: string) => void;
  onComponents: (block: ChatComponentBlock) => void;
  onDone: (messageId: string, timestamp: string, dataChanged?: DataChangedFlags) => void;
  onError: (message: string) => void;
}

/**
 * Send message to agent endpoint with SSE streaming
 * Returns cleanup function to cancel the stream
 */
export function sendAgentMessageStreaming(
  requestData: AgentRequestData,
  callbacks: StreamingCallbacks,
  signal?: AbortSignal
): () => void {
  const client = getSSEClient();

  // Limit chat history
  const limitedData = {
    ...requestData,
    chatHistory: requestData.chatHistory?.slice(-RECOMMENDED_MAX_CHAT_MESSAGES),
  };

  // Start connection asynchronously
  (async () => {
    try {
      const headers = await getAuthHeaders();

      await client.connect({
        url: `${apiurl}/chat/agent`,
        body: limitedData,
        headers,
        signal,
        onEvent: (event: StreamEvent) => {
          switch (event.type) {
            case 'indicator':
              callbacks.onIndicator(event.message);
              break;
            case 'indicator_end':
              callbacks.onIndicatorEnd();
              break;
            case 'text':
              callbacks.onText(event.content);
              break;
            case 'components':
              callbacks.onComponents(event.block);
              break;
            case 'done':
              callbacks.onDone(event.messageId, event.timestamp, event.dataChanged);
              break;
            case 'error':
              callbacks.onError(event.message);
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