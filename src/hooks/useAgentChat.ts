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
  initialTimelineState,
  TimelineNode,
  TimelineToolCall,
} from '../types/AgentChatTypes';
import {
  sendAgentMessageStreaming,
  normalizeAgentResponse,
  sendAgentMessage,
  cancelServerStream,
} from '../services/ChatService';
import { CHAT_SOURCE, NO_DISPLAY_NAME_PLACEHOLDER } from '../types/Constants';
import { getToolActiveMessage, getToolResultMessage } from '../constants/toolMessages';

// ============================================
// Types
// ============================================

export interface UseAgentChatOptions {
  userName?: string;
  conversationId?: string;
  agentMode?: string;
  onMessageComplete?: (message: ChatMessage, componentBlock?: ChatComponentBlock) => void;
  onError?: (error: string) => void;
  onDataChanged?: (dataChanged: DataChangedFlags) => void;
}

export interface UseAgentChatReturn {
  streamingState: StreamingState;
  sendMessage: (prompt: string, chatHistory: ChatMessage[], conversationId?: string) => Promise<void>;
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
  const { userName, conversationId, agentMode, onMessageComplete, onError, onDataChanged } = options;

  const [streamingState, setStreamingState] = useState<StreamingState>(initialStreamingState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Track accumulated text for final message
  const accumulatedTextRef = useRef('');

  // Track active conversation ID for server-side cancellation
  const activeConversationIdRef = useRef<string | null>(null);

  // Cleanup on unmount -- don't abort, let the server finish and persist.
  // Only clean up local state references.
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const sendMessage = useCallback(async (
    prompt: string,
    chatHistory: ChatMessage[],
    runtimeConversationId?: string
  ) => {
    // Cancel any existing request
    abortControllerRef.current?.abort();
    cleanupRef.current?.();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Track active conversation for cancel
    activeConversationIdRef.current = runtimeConversationId ?? conversationId ?? null;

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
      conversationId: runtimeConversationId ?? conversationId,
      agentMode,
    };

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
          const newNode: TimelineNode = {
            id: `node-${Date.now()}-${node}`,
            node,
            message,
            status: 'active',
            startTime: Date.now(),
            toolCalls: [],
          };

          setStreamingState(prev => ({
            ...prev,
            activeNode: {
              name: node,
              message,
              startTime: Date.now(),
            },
            timeline: {
              ...prev.timeline,
              nodes: [...prev.timeline.nodes, newNode],
              isCollapsed: false,
            },
          }));
        },

        onNodeEnd: (node) => {
          setStreamingState(prev => ({
            ...prev,
            activeNode: prev.activeNode?.name === node ? null : prev.activeNode,
            completedNodes: [...prev.completedNodes, node],
            timeline: {
              ...prev.timeline,
              nodes: prev.timeline.nodes.map(n =>
                n.node === node && n.status === 'active'
                  ? { ...n, status: 'completed' as const, endTime: Date.now() }
                  : n
              ),
            },
          }));
        },

        onToolStart: (tool, message) => {
          setStreamingState(prev => {
            const activeNodeName = prev.activeNode?.name || 'unknown';
            const newTool: TimelineToolCall = {
              id: `tool-${Date.now()}-${tool}`,
              tool,
              parentNode: activeNodeName,
              activeMessage: message || getToolActiveMessage(tool),
              status: 'active',
              startTime: Date.now(),
            };

            return {
              ...prev,
              activeTool: {
                name: tool,
                message: message || getToolActiveMessage(tool),
                startTime: Date.now(),
              },
              timeline: {
                ...prev.timeline,
                nodes: prev.timeline.nodes.map(n =>
                  n.status === 'active'
                    ? { ...n, toolCalls: [...n.toolCalls, newTool] }
                    : n
                ),
              },
            };
          });
        },

        onToolEnd: (tool) => {
          setStreamingState(prev => ({
            ...prev,
            activeTool: prev.activeTool?.name === tool ? null : prev.activeTool,
            timeline: {
              ...prev.timeline,
              nodes: prev.timeline.nodes.map(n => ({
                ...n,
                toolCalls: n.toolCalls.map(t =>
                  t.tool === tool && t.status === 'active'
                    ? {
                        ...t,
                        status: 'completed' as const,
                        endTime: Date.now(),
                        resultMessage: getToolResultMessage(tool),
                      }
                    : t
                ),
              })),
            },
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
          // Store received values
          receivedComponentBlock = componentBlock || null;
          receivedMessageId = messageId;
          receivedTimestamp = timestamp;
          receivedAgentType = agentType || null;

          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            activeNode: null,
            activeTool: null,
            // Use final text response (may be composed from multiple agents)
            streamedText: textResponse,
            componentBlock: receivedComponentBlock,
            messageId: receivedMessageId,
            timestamp: receivedTimestamp,
            agentType: receivedAgentType,
            timeline: {
              ...prev.timeline,
              isComplete: true,
              isCollapsed: true,
            },
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
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            activeNode: null,
            activeTool: null,
            error: message,
            timeline: {
              ...prev.timeline,
              isComplete: true,
              isCollapsed: true,
              // Mark any active nodes as error
              nodes: prev.timeline.nodes.map(n =>
                n.status === 'active'
                  ? { ...n, status: 'error' as const, endTime: Date.now() }
                  : n
              ),
            },
          }));
          onError?.(message);
        },
      },
      abortControllerRef.current.signal
    );
  }, [userName, conversationId, agentMode, onMessageComplete, onError, onDataChanged]);

  const cancelStream = useCallback(() => {
    // Abort the SSE connection (stops UI streaming)
    abortControllerRef.current?.abort();
    cleanupRef.current?.();
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      activeNode: null,
      activeTool: null,
    }));

    // Tell server to stop processing and discard (fire-and-forget)
    if (activeConversationIdRef.current) {
      cancelServerStream(activeConversationIdRef.current).catch(() => {});
      activeConversationIdRef.current = null;
    }
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

  const sendMessage = useCallback(async (
    prompt: string,
    chatHistory: ChatMessage[],
    runtimeConversationId?: string
  ) => {
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
        conversationId: runtimeConversationId ?? conversationId,
      };

      const response = await sendAgentMessage(requestData, abortControllerRef.current.signal);
      const normalized = normalizeAgentResponse(response);

      setStreamingState({
        isStreaming: false,
        activeNode: null,
        activeTool: null,
        streamedText: normalized.textResponse,
        componentBlock: normalized.componentBlock || null,
        error: null,
        messageId: normalized.messageId,
        timestamp: normalized.timestamp,
        agentType: normalized.agentType || null,
        completedNodes: [],
        timeline: {
          ...initialTimelineState,
          isComplete: true,
          isCollapsed: true,
        },
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
        activeTool: null,
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
      activeTool: null,
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
