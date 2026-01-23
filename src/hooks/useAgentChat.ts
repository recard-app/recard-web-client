/**
 * useAgentChat Hook
 *
 * React hook for managing agent chat streaming state with LangGraph.
 * Provides both streaming (SSE) and fallback (non-streaming) implementations.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/ChatTypes';
import { ChatComponentBlock } from '../types/ChatComponentTypes';
import {
  AgentRequestData,
  filterMessagesForApi,
  DataChangedFlags,
  StreamingState,
  initialStreamingState,
} from '../types/AgentChatTypes';
import {
  sendAgentMessageStreaming,
  normalizeAgentResponse,
  sendAgentMessage,
} from '../services/ChatService';
import { CHAT_SOURCE, NO_DISPLAY_NAME_PLACEHOLDER } from '../types/Constants';

// ============================================
// Types
// ============================================

export interface UseAgentChatOptions {
  userName?: string;
  conversationId?: string;
  onMessageComplete?: (message: ChatMessage, componentBlock?: ChatComponentBlock) => void;
  onError?: (error: string) => void;
  onDataChanged?: (dataChanged: DataChangedFlags) => void;
}

export interface UseAgentChatReturn {
  streamingState: StreamingState;
  sendMessage: (prompt: string, chatHistory: ChatMessage[]) => Promise<void>;
  cancelStream: () => void;
  resetState: () => void;
  isProcessing: boolean;
}

// Re-export StreamingState for backward compatibility
export type { StreamingState };

// ============================================
// Hook Implementation
// ============================================

export function useAgentChat(options: UseAgentChatOptions = {}): UseAgentChatReturn {
  const { userName, conversationId, onMessageComplete, onError, onDataChanged } = options;

  const [streamingState, setStreamingState] = useState<StreamingState>(initialStreamingState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Track accumulated text for final message
  const accumulatedTextRef = useRef('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      cleanupRef.current?.();
    };
  }, []);

  const sendMessage = useCallback(async (prompt: string, chatHistory: ChatMessage[]) => {
    console.log('[useAgentChat] Sending message:', prompt.slice(0, 50) + '...');
    console.log('[useAgentChat] Chat history length:', chatHistory.length);
    const startTime = performance.now();

    // Cancel any existing request
    abortControllerRef.current?.abort();
    cleanupRef.current?.();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Reset state and start streaming
    accumulatedTextRef.current = '';
    setStreamingState({
      ...initialStreamingState,
      isStreaming: true,
    });

    // Prepare request data
    // Note: filterMessagesForApi removes error messages, backend accepts frontend format directly
    const requestData: AgentRequestData = {
      name: userName || NO_DISPLAY_NAME_PLACEHOLDER,
      prompt,
      chatHistory: filterMessagesForApi(chatHistory),
      conversationId,
    };

    console.log('[useAgentChat] Filtered history length:', requestData.chatHistory?.length || 0);

    // Track received data
    let receivedComponentBlock: ChatComponentBlock | null = null;
    let receivedMessageId: string | null = null;
    let receivedTimestamp: string | null = null;
    let receivedAgentType: string | null = null;

    // Start streaming
    cleanupRef.current = sendAgentMessageStreaming(
      requestData,
      {
        onNodeStart: (node, message) => {
          setStreamingState(prev => ({
            ...prev,
            activeNode: {
              name: node,
              message,
              startTime: Date.now(),
            },
          }));
        },

        onNodeEnd: (node) => {
          setStreamingState(prev => ({
            ...prev,
            activeNode: prev.activeNode?.name === node ? null : prev.activeNode,
            completedNodes: [...prev.completedNodes, node],
          }));
        },

        onToken: (content, _node) => {
          accumulatedTextRef.current += content;
          setStreamingState(prev => ({
            ...prev,
            streamedText: accumulatedTextRef.current,
          }));
        },

        onFinal: (textResponse, componentBlock, agentType, messageId, timestamp, dataChanged) => {
          const totalTime = performance.now() - startTime;
          console.log(`[useAgentChat] Done in ${(totalTime / 1000).toFixed(2)}s, messageId: ${messageId}`);
          console.log(`[useAgentChat] Total text length: ${textResponse.length} chars`);
          if (dataChanged) {
            console.log(`[useAgentChat] Data changed:`, dataChanged);
          }

          // Store received values
          receivedComponentBlock = componentBlock || null;
          receivedMessageId = messageId;
          receivedTimestamp = timestamp;
          receivedAgentType = agentType || null;

          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            activeNode: null,
            // Use final text response (may be composed from multiple agents)
            streamedText: textResponse,
            componentBlock: receivedComponentBlock,
            messageId: receivedMessageId,
            timestamp: receivedTimestamp,
            agentType: receivedAgentType,
          }));

          // Notify about data changes (for UI refresh)
          if (dataChanged && onDataChanged) {
            onDataChanged(dataChanged);
          }

          // Create final message and notify
          if (onMessageComplete) {
            const message: ChatMessage = {
              id: receivedMessageId!,
              chatSource: CHAT_SOURCE.ASSISTANT,
              chatMessage: textResponse,
              timestamp: receivedTimestamp!,
              componentBlock: receivedComponentBlock || undefined,
            };
            onMessageComplete(message, receivedComponentBlock || undefined);
          }
        },

        onError: (message) => {
          const totalTime = performance.now() - startTime;
          console.error(`[useAgentChat] Error after ${(totalTime / 1000).toFixed(2)}s:`, message);

          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            activeNode: null,
            error: message,
          }));
          onError?.(message);
        },
      },
      abortControllerRef.current.signal
    );
  }, [userName, conversationId, onMessageComplete, onError, onDataChanged]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    cleanupRef.current?.();
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      activeNode: null,
    }));
  }, []);

  const resetState = useCallback(() => {
    setStreamingState(initialStreamingState);
  }, []);

  return {
    streamingState,
    sendMessage,
    cancelStream,
    resetState,
    isProcessing: streamingState.isStreaming,
  };
}

// ============================================
// Fallback Hook (Non-Streaming)
// ============================================

/**
 * Fallback for environments without SSE support
 * Uses regular POST request
 */
export function useAgentChatFallback(options: UseAgentChatOptions = {}): UseAgentChatReturn {
  const { userName, conversationId, onMessageComplete, onError } = options;

  const [streamingState, setStreamingState] = useState<StreamingState>(initialStreamingState);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (prompt: string, chatHistory: ChatMessage[]) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setStreamingState({
      ...initialStreamingState,
      isStreaming: true,
      activeNode: {
        name: 'router_node',
        message: 'Thinking...',
        startTime: Date.now(),
      },
    });

    try {
      const requestData: AgentRequestData = {
        name: userName || NO_DISPLAY_NAME_PLACEHOLDER,
        prompt,
        chatHistory: filterMessagesForApi(chatHistory),
        conversationId,
      };

      const response = await sendAgentMessage(requestData, abortControllerRef.current.signal);
      const normalized = normalizeAgentResponse(response);

      setStreamingState({
        isStreaming: false,
        activeNode: null,
        streamedText: normalized.textResponse,
        componentBlock: normalized.componentBlock || null,
        error: null,
        messageId: normalized.messageId,
        timestamp: normalized.timestamp,
        agentType: normalized.agentType || null,
        completedNodes: [],
      });

      if (onMessageComplete) {
        const message: ChatMessage = {
          id: normalized.messageId,
          chatSource: CHAT_SOURCE.ASSISTANT,
          chatMessage: normalized.textResponse,
          timestamp: normalized.timestamp,
          componentBlock: normalized.componentBlock,
        };
        onMessageComplete(message, normalized.componentBlock);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        activeNode: null,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [userName, conversationId, onMessageComplete, onError]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      activeNode: null,
    }));
  }, []);

  const resetState = useCallback(() => {
    setStreamingState(initialStreamingState);
  }, []);

  return {
    streamingState,
    sendMessage,
    cancelStream,
    resetState,
    isProcessing: streamingState.isStreaming,
  };
}
