import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { ChatRequestData, ChatSolution, MessageContentBlock } from '../types';
import {
  AgentRequestData,
  AgentResponse,
  AgentResponseData,
  isQuickResponse,
  StreamEvent,
} from '../types/AgentChatTypes';
import { ChatComponentBlock } from '../types/ChatComponentTypes';
import { RECOMMENDED_MAX_CHAT_MESSAGES } from '../types/Constants';
import { getSSEClient } from './SSEClient';

export const ChatService = {
    /**
     * Gets AI response for chat message
     * @param requestData Chat request data
     * @param signal AbortController signal for cancellation
     * @returns Promise containing the AI response
     */
    async getChatResponse(requestData: ChatRequestData, signal?: AbortSignal): Promise<string> {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${apiurl}/chat/response`,
            requestData,
            { 
                headers,
                signal 
            }
        );
        return response.data;
    },

    /**
     * Gets solution recommendations from AI
     * @param requestData Chat request data with updated chat history
     * @param signal AbortController signal for cancellation
     * @returns Promise containing the solution recommendations and content blocks
     */
    async getChatSolution(requestData: ChatRequestData, signal?: AbortSignal): Promise<{ solutions: ChatSolution; contentBlocks: MessageContentBlock[] }> {
        const headers = await getAuthHeaders();
        const response = await axios.post<{ solutions: ChatSolution; contentBlocks: MessageContentBlock[] }>(
            `${apiurl}/chat/solution`,
            requestData,
            {
                headers,
                signal
            }
        );
        return response.data;
    }
};

// ============================================
// New Agent API Methods
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
  onDone: (messageId: string, timestamp: string) => void;
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
              callbacks.onDone(event.messageId, event.timestamp);
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