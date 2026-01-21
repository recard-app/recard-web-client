/**
 * useAgentChat Hook
 *
 * React hook for managing agent chat streaming state.
 * Provides both streaming (SSE) and fallback (non-streaming) implementations.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/ChatTypes';
import { ChatComponentBlock } from '../types/ChatComponentTypes';
import {
  AgentRequestData,
  filterMessagesForApi,
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

export interface StreamingState {
  isStreaming: boolean;
  indicatorMessage: string | null;
  streamedText: string;
  componentBlock: ChatComponentBlock | null;
  error: string | null;
  messageId: string | null;
  timestamp: string | null;
}

export interface UseAgentChatOptions {
  userName?: string;
  conversationId?: string;
  onMessageComplete?: (message: ChatMessage, componentBlock?: ChatComponentBlock) => void;
  onError?: (error: string) => void;
}

export interface UseAgentChatReturn {
  streamingState: StreamingState;
  sendMessage: (prompt: string, chatHistory: ChatMessage[]) => Promise<void>;
  cancelStream: () => void;
  resetState: () => void;
  isProcessing: boolean;
}

// ============================================
// Initial State
// ============================================

export const initialStreamingState: StreamingState = {
  isStreaming: false,
  indicatorMessage: null,
  streamedText: '',
  componentBlock: null,
  error: null,
  messageId: null,
  timestamp: null,
};

// ============================================
// Hook Implementation
// ============================================

export function useAgentChat(options: UseAgentChatOptions = {}): UseAgentChatReturn {
  const { userName, conversationId, onMessageComplete, onError } = options;

  const [streamingState, setStreamingState] = useState<StreamingState>(initialStreamingState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

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

    // Accumulate streamed text
    let accumulatedText = '';
    let receivedComponentBlock: ChatComponentBlock | null = null;
    let receivedMessageId: string | null = null;
    let receivedTimestamp: string | null = null;

    // Start streaming
    cleanupRef.current = sendAgentMessageStreaming(
      requestData,
      {
        onIndicator: (message) => {
          setStreamingState(prev => ({
            ...prev,
            indicatorMessage: message,
          }));
        },

        onIndicatorEnd: () => {
          setStreamingState(prev => ({
            ...prev,
            indicatorMessage: null,
          }));
        },

        onText: (content) => {
          accumulatedText += content;
          setStreamingState(prev => ({
            ...prev,
            streamedText: accumulatedText,
          }));
        },

        onComponents: (block) => {
          receivedComponentBlock = block;
          setStreamingState(prev => ({
            ...prev,
            componentBlock: block,
          }));
        },

        onDone: (messageId, timestamp) => {
          const totalTime = performance.now() - startTime;
          console.log(`[useAgentChat] Done in ${(totalTime / 1000).toFixed(2)}s, messageId: ${messageId}`);
          console.log(`[useAgentChat] Total text length: ${accumulatedText.length} chars`);

          // messageId and timestamp are now required per Phase 2 decision
          receivedMessageId = messageId;
          receivedTimestamp = timestamp;

          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            messageId: receivedMessageId,
            timestamp: receivedTimestamp,
          }));

          // Create final message and notify
          if (onMessageComplete) {
            const message: ChatMessage = {
              id: receivedMessageId,
              chatSource: CHAT_SOURCE.ASSISTANT,
              chatMessage: accumulatedText,
              timestamp: receivedTimestamp,
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
            error: message,
          }));
          onError?.(message);
        },
      },
      abortControllerRef.current.signal
    );
  }, [userName, conversationId, onMessageComplete, onError]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    cleanupRef.current?.();
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
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
      indicatorMessage: 'Thinking...',
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
        indicatorMessage: null,
        streamedText: normalized.textResponse,
        componentBlock: normalized.componentBlock || null,
        error: null,
        messageId: normalized.messageId,
        timestamp: normalized.timestamp,
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
