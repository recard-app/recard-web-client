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
import { MAX_CHAT_MESSAGES } from '../types/Constants';
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
 * Streaming callbacks for LangGraph SSE events
 */
export interface StreamingCallbacks {
  /** Called when an agent node starts processing */
  onNodeStart: (node: string, message: string) => void;
  /** Called when an agent node completes */
  onNodeEnd: (node: string) => void;
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
  signal?: AbortSignal
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
                undefined // dataChanged not yet implemented in LangGraph backend
              );
              break;

            case 'error':
              callbacks.onError(event.data.message);
              break;

            // Optionally handle tool events (not currently exposed to UI)
            case 'tool_start':
            case 'tool_end':
              // Could add tool status to UI if desired
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
