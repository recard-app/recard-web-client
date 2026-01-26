/**
 * SSE Client for Agent Chat Streaming (LangGraph)
 *
 * Handles Server-Sent Events for POST-based streaming from the /chat/agent endpoint.
 * Uses the Fetch API with ReadableStream for streaming responses.
 *
 * Updated for LangGraph native events:
 * - node_start / node_end: Agent lifecycle
 * - token: LLM streaming tokens
 * - final: Complete response
 * - error: Error handling
 */

import { StreamEvent } from '../types/AgentChatTypes';

// ============================================
// Types
// ============================================

export interface SSEClientOptions {
  url: string;
  body: object;
  headers: Record<string, string>;
  onEvent: (event: StreamEvent) => void;
  onOpen?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  signal?: AbortSignal;
}

// ============================================
// SSE Client Class
// ============================================

/**
 * SSE Client for streaming POST requests
 * Uses fetch API with ReadableStream for POST-based SSE
 */
export class SSEClient {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private buffer = '';
  private isConnected = false;

  async connect(options: SSEClientOptions): Promise<void> {
    const { url, body, headers, onEvent, onOpen, onError, onClose, signal } = options;

    console.log('[SSEClient] Connecting to:', url);
    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as { message?: string }).message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const connectTime = performance.now() - startTime;
      const contentType = response.headers.get('content-type');
      console.log(`[SSEClient] Connected in ${connectTime.toFixed(0)}ms, Content-Type: ${contentType}`);

      // Check if server returned JSON instead of SSE stream
      if (contentType?.includes('application/json')) {
        console.log('[SSEClient] Server returned JSON instead of SSE, parsing as fallback...');

        const jsonData = await response.json();
        this.handleJsonFallback(jsonData, onEvent);
        onClose?.();
        return;
      }

      this.isConnected = true;
      onOpen?.();

      this.reader = response.body.getReader();
      await this.readStream(onEvent, onError, onClose);

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Request was cancelled - not an error
          onClose?.();
          return;
        }
        onError?.(error);
      } else {
        onError?.(new Error('Unknown error occurred'));
      }
    }
  }

  private async readStream(
    onEvent: (event: StreamEvent) => void,
    onError?: (error: Error) => void,
    onClose?: () => void
  ): Promise<void> {
    if (!this.reader) return;

    try {
      while (true) {
        const { done, value } = await this.reader.read();

        if (done) {
          console.log('[SSEClient] Stream done, remaining buffer:', this.buffer ? `"${this.buffer.slice(0, 200)}"` : '(empty)');
          // Process any remaining buffer
          if (this.buffer.trim()) {
            this.processLine(this.buffer, onEvent);
          }
          break;
        }

        // Decode chunk and add to buffer
        const chunk = this.decoder.decode(value, { stream: true });
        console.log('[SSEClient] Received chunk:', `"${chunk.slice(0, 200)}${chunk.length > 200 ? '...' : ''}"`);
        this.buffer += chunk;

        // Process complete lines
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          this.processLine(line, onEvent);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        onError?.(error);
      }
    } finally {
      console.log('[SSEClient] Stream closed');
      this.isConnected = false;
      onClose?.();
    }
  }

  private processLine(line: string, onEvent: (event: StreamEvent) => void): void {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith(':')) {
      return;
    }

    // Parse SSE data line
    if (trimmedLine.startsWith('data:')) {
      const jsonStr = trimmedLine.slice(5).trim();
      if (!jsonStr) return;

      try {
        const event = JSON.parse(jsonStr) as StreamEvent;
        console.log(`[SSEClient] Event: ${event.type}`, this.getEventLogData(event));
        onEvent(event);
      } catch (parseError) {
        console.warn('[SSEClient] Failed to parse SSE event:', jsonStr, parseError);
      }
    }
  }

  /**
   * Get log-friendly data for an event
   */
  private getEventLogData(event: StreamEvent): string {
    switch (event.type) {
      case 'token':
        return `"${event.data.content.slice(0, 30)}..."`;
      case 'node_start':
        return `node=${event.data.node}`;
      case 'node_end':
        return `node=${event.data.node}`;
      case 'final':
        return `textLen=${event.data.textResponse?.length || 0}`;
      case 'error':
        return `msg=${event.data.message}`;
      default:
        return '';
    }
  }

  /**
   * Handle JSON fallback response (non-streaming)
   * Converts JSON response to LangGraph-style events
   */
  private handleJsonFallback(
    jsonData: any,
    onEvent: (event: StreamEvent) => void
  ): void {
    // Determine agent type for proper icon
    const agentType = jsonData.agentType || 'chat';
    const agentNode = `${agentType}_node`;

    // Show agent-specific indicator briefly
    onEvent({
      type: 'node_start',
      data: {
        node: agentNode,
        message: this.getNodeMessage(agentNode),
      },
    });

    // End the node
    onEvent({
      type: 'node_end',
      data: { node: agentNode },
    });

    // Handle response based on format
    if (jsonData.textResponse !== undefined) {
      // Full response format
      onEvent({
        type: 'final',
        data: {
          textResponse: jsonData.textResponse,
          componentBlock: jsonData.componentBlock,
          agentType: jsonData.agentType,
          success: !jsonData.isError,
          messageId: jsonData.messageId || `msg-${Date.now()}`,
          timestamp: jsonData.timestamp || new Date().toISOString(),
        },
      });
    } else if (jsonData.response) {
      // Quick response format
      onEvent({
        type: 'final',
        data: {
          textResponse: jsonData.response,
          success: true,
          messageId: `msg-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Get human-readable message for a node
   */
  private getNodeMessage(nodeName: string): string {
    const messages: Record<string, string> = {
      router_node: 'Thinking...',
      spend_node: 'Finding the best card...',
      credit_node: 'Checking your credits...',
      card_node: 'Looking up card info...',
      stats_node: 'Calculating your stats...',
      action_node: 'Updating your data...',
      chat_node: 'Thinking...',
      composer_node: 'Preparing response...',
    };
    return messages[nodeName] || 'Processing...';
  }

  disconnect(): void {
    if (this.reader) {
      this.reader.cancel().catch(() => {
        // Ignore cancel errors
      });
      this.reader = null;
    }
    this.isConnected = false;
    this.buffer = '';
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// ============================================
// Singleton Helpers
// ============================================

// Singleton instance for easy cleanup
let activeClient: SSEClient | null = null;

/**
 * Get an SSE client instance, disconnecting any existing one
 * Ensures only one active connection at a time
 */
export function getSSEClient(): SSEClient {
  if (activeClient) {
    activeClient.disconnect();
  }
  activeClient = new SSEClient();
  return activeClient;
}

/**
 * Disconnect the active SSE client if one exists
 */
export function disconnectSSEClient(): void {
  if (activeClient) {
    activeClient.disconnect();
    activeClient = null;
  }
}
