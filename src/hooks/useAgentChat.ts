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
} from '../services/ChatService';
import { CHAT_SOURCE, NO_DISPLAY_NAME_PLACEHOLDER } from '../types/Constants';

// ============================================
// Tool Message Helpers
// ============================================

const TOOL_ACTIVE_MESSAGES: Record<string, string> = {
  // Card tools
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
  // Credit tools
  get_user_credits: 'Checking credits...',
  get_prioritized_credits: 'Prioritizing credits...',
  get_expiring_credits: 'Finding expiring credits...',
  get_credit_history: 'Loading credit history...',
  // Stats tools
  get_monthly_stats: 'Calculating monthly stats...',
  get_annual_stats: 'Calculating annual stats...',
  get_to_date_stats: 'Calculating to-date stats...',
  get_expiring_stats: 'Calculating expiring stats...',
  get_roi_stats: 'Calculating ROI...',
  get_lost_stats: 'Calculating lost value...',
  get_category_stats: 'Analyzing categories...',
  // Action tools
  update_credit_usage: 'Updating credit usage...',
  update_component_tracking: 'Updating tracking...',
};

const TOOL_RESULT_MESSAGES: Record<string, string> = {
  // Card tools
  get_all_cards: 'Cards loaded',
  get_card_details: 'Details loaded',
  get_user_cards: 'Your cards loaded',
  get_user_cards_details: 'Details loaded',
  get_user_components: 'Components loaded',
  add_card: 'Card added',
  remove_card: 'Card removed',
  set_card_frozen: 'Status updated',
  set_card_preferred: 'Preference set',
  set_card_open_date: 'Date updated',
  // Credit tools
  get_user_credits: 'Credits checked',
  get_prioritized_credits: 'Credits prioritized',
  get_expiring_credits: 'Found expiring',
  get_credit_history: 'History loaded',
  // Stats tools
  get_monthly_stats: 'Stats calculated',
  get_annual_stats: 'Stats calculated',
  get_to_date_stats: 'Stats calculated',
  get_expiring_stats: 'Stats calculated',
  get_roi_stats: 'ROI calculated',
  get_lost_stats: 'Lost value calculated',
  get_category_stats: 'Categories analyzed',
  // Action tools
  update_credit_usage: 'Usage updated',
  update_component_tracking: 'Tracking updated',
};

function getToolActiveMessage(tool: string): string {
  return TOOL_ACTIVE_MESSAGES[tool] || 'Processing...';
}

function getToolResultMessage(tool: string): string {
  return TOOL_RESULT_MESSAGES[tool] || 'Done';
}

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
  const { userName, conversationId, agentMode, onMessageComplete, onError, onDataChanged } = options;

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
      agentMode,
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
          const totalTime = performance.now() - startTime;
          console.error(`[useAgentChat] Error after ${(totalTime / 1000).toFixed(2)}s:`, message);

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
    abortControllerRef.current?.abort();
    cleanupRef.current?.();
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
