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
          // Process any remaining buffer
          if (this.buffer.trim()) {
            this.processLine(this.buffer, onEvent);
          }
          break;
        }

        // Decode chunk and add to buffer
        this.buffer += this.decoder.decode(value, { stream: true });

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
