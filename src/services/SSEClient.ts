/**
 * SSE Client for Agent Chat Streaming
 *
 * Handles Server-Sent Events for POST-based streaming from the /chat/agent endpoint.
 * Uses the Fetch API with ReadableStream for streaming responses.
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

    // Show initial loading indicator while waiting for server to route the request
    // Server will send agent-specific indicator after routing
    onEvent({ type: 'indicator', message: 'Thinking...', icon: 'chat-bubble-oval-left-ellipsis' });

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

        // Show agent-specific indicator briefly if agentType is available
        if (jsonData.agentType) {
          const agentIndicators: Record<string, { message: string; icon: string }> = {
            spend: { message: 'Finding the best card...', icon: 'card' },
            card: { message: 'Looking up card info...', icon: 'card' },
            credit: { message: 'Checking your credits...', icon: 'banknotes' },
            stats: { message: 'Calculating your stats...', icon: 'chart-bar' },
            action: { message: 'Updating your data...', icon: 'pencil' },
            chat: { message: 'Thinking...', icon: 'chat-bubble-oval-left-ellipsis' },
          };
          const indicator = agentIndicators[jsonData.agentType] || { message: 'Thinking...', icon: 'chat-bubble-oval-left-ellipsis' };
          onEvent({ type: 'indicator', message: indicator.message, icon: indicator.icon });
        }

        // Clear the loading indicator
        onEvent({ type: 'indicator_end' });

        // Emit events based on JSON response structure
        if (jsonData.textResponse) {
          onEvent({ type: 'text', content: jsonData.textResponse });
        }
        if (jsonData.componentBlock) {
          console.log('[SSEClient] Component block received:', JSON.stringify(jsonData.componentBlock, null, 2));
          onEvent({ type: 'components', block: jsonData.componentBlock });
        } else {
          console.log('[SSEClient] No componentBlock in response');
        }
        onEvent({
          type: 'done',
          messageId: jsonData.messageId || `msg-${Date.now()}`,
          timestamp: jsonData.timestamp || new Date().toISOString()
        });
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
        console.log(`[SSEClient] Event: ${event.type}`, event.type === 'text' ? `"${(event as any).content?.slice(0, 50)}..."` : '');
        onEvent(event);
      } catch (parseError) {
        console.warn('[SSEClient] Failed to parse SSE event:', jsonStr, parseError);
      }
    }
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
