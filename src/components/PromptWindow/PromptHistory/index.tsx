import React, { useMemo } from 'react';
import showdown from 'showdown';
import { ChatMessage } from '../../../types/ChatTypes';
import { InfoDisplay } from '../../../elements';
import { ChatComponentBlock } from '../../../elements/ChatComponents';
import { StreamingState } from '../../../types/AgentChatTypes';
import StreamingIndicator from '../StreamingIndicator';
import { ChatErrorBoundary } from '../ErrorBoundary';
import './PromptHistory.scss';
import { PLACEHOLDER_ASSISTANT_IMAGE, TERMINOLOGY, CHAT_SOURCE } from '../../../types';

/**
 * Props for the PromptHistory component.
 */
interface PromptHistoryProps {
  chatHistory: ChatMessage[];
  streamingState?: StreamingState;
  isNewChat?: boolean;
  // Component click handlers
  onCardClick?: (cardId: string) => void;
  onCreditClick?: (cardId: string, creditId: string) => void;
  onPerkClick?: (cardId: string, perkId: string) => void;
  onMultiplierClick?: (cardId: string, multiplierId: string) => void;
}

function PromptHistory({
  chatHistory,
  streamingState,
  isNewChat = false,
  onCardClick,
  onCreditClick,
  onPerkClick,
  onMultiplierClick,
}: PromptHistoryProps): React.ReactElement {
  const chatEntries = chatHistory;

  // Initialize the showdown converter for markdown to HTML conversion
  // Only supports: bold, italic, bullet lists, numbered lists, paragraphs
  const converter = useMemo(() => {
    const instance = new showdown.Converter({
      simpleLineBreaks: false,                    // Double newline = paragraph (no <br> for single newlines)
      literalMidWordUnderscores: true,            // Don't italicize underscores in words
      disableForced4SpacesIndentedSublists: true, // More intuitive sublist handling
    });
    return instance;
  }, []);

  // Default handlers for component clicks
  const handleCardClick = onCardClick || (() => {});
  const handleCreditClick = onCreditClick || (() => {});
  const handlePerkClick = onPerkClick || (() => {});
  const handleMultiplierClick = onMultiplierClick || (() => {});

  // Render streaming content
  const renderStreamingContent = () => {
    if (!streamingState) return null;

    const { isStreaming, activeNode, streamedText, componentBlock } = streamingState;

    // Only show streaming content while actively streaming
    // Once streaming is done, the message is added to chatHistory, so we don't show it here
    if (!isStreaming) return null;

    return (
      <div className="streaming-content">
        {/* Node indicator - shows current processing step */}
        <StreamingIndicator
          activeNode={activeNode}
          isVisible={!!activeNode}
        />

        {/* Streaming text (token by token) */}
        {streamedText && (
          <div className="entry entry-assistant streaming">
            <div className="entry-content">
              <img src={PLACEHOLDER_ASSISTANT_IMAGE} alt="AI Assistant" className="assistant-avatar" />
              <div className="message-text">
                <div
                  dangerouslySetInnerHTML={{ __html: converter.makeHtml(streamedText) }}
                />
                {/* Blinking cursor while streaming */}
                {isStreaming && <span className="cursor-blink" />}
              </div>
            </div>
          </div>
        )}

        {/* Component block (arrives near end of stream) */}
        {componentBlock && (
          <ChatErrorBoundary>
            <ChatComponentBlock
              block={componentBlock}
              canUndo={false}
              onCardClick={handleCardClick}
              onCreditClick={handleCreditClick}
              onPerkClick={handlePerkClick}
              onMultiplierClick={handleMultiplierClick}
            />
          </ChatErrorBoundary>
        )}
      </div>
    );
  };

  return (
    <div className='prompt-history'>
      {chatEntries.length === 0 && !streamingState?.isStreaming ? (
        isNewChat ? (
          <div className="welcome-message">
            <p className="title">What are you looking to purchase today?</p>
            <p className="subtitle">I'll help you find the best credit card to maximize your rewards.</p>
          </div>
        ) : (
          <div className="loading-message">
            <InfoDisplay
              type="loading"
              message={TERMINOLOGY.promptHistoryLoading}
              showTitle={false}
              transparent={true}
            />
          </div>
        )
      ) : (
        <>
          {chatEntries.map((chatEntry) => {
            // Handle error entries with InfoDisplay
            if (chatEntry.chatSource === CHAT_SOURCE.ERROR) {
              return (
                <div key={chatEntry.id} className="entry entry-error">
                  <InfoDisplay
                    type="error"
                    message={chatEntry.chatMessage}
                    transparent={true}
                    showTitle={false}
                  />
                </div>
              );
            }

            return (
              <div key={chatEntry.id} className={`${(chatEntry.chatSource === CHAT_SOURCE.USER) ? 'entry entry-user' : 'entry entry-assistant'}`}>
                <div className="entry-content">
                  {chatEntry.chatSource === CHAT_SOURCE.ASSISTANT && (
                    <img src={PLACEHOLDER_ASSISTANT_IMAGE} alt="AI Assistant" className="assistant-avatar" />
                  )}
                  <div className="message-text">
                    {chatEntry.chatMessage && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: converter.makeHtml(chatEntry.chatMessage)
                        }}
                      />
                    )}
                    {/* Render component block if present (new agent format) */}
                    {chatEntry.componentBlock && (
                      <ChatErrorBoundary>
                        <ChatComponentBlock
                          block={chatEntry.componentBlock}
                          canUndo={false}
                          onCardClick={handleCardClick}
                          onCreditClick={handleCreditClick}
                          onPerkClick={handlePerkClick}
                          onMultiplierClick={handleMultiplierClick}
                        />
                      </ChatErrorBoundary>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Render streaming content at the end */}
          {renderStreamingContent()}
        </>
      )}
    </div>
  );
}

export default PromptHistory;
