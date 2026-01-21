import React, { useMemo } from 'react';
import showdown from 'showdown';
import { ChatMessage } from '../../../types/ChatTypes';
import { InfoDisplay } from '../../../elements';
import { ChatComponentBlock } from '../../../elements/ChatComponents';
import { StreamingState } from '../../../hooks/useAgentChat';
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

  // Initialize the showdown converter with options to minimize whitespace
  const converter = useMemo(() => {
    // First create basic converter with common options
    const instance = new showdown.Converter({
      simpleLineBreaks: true,       // Convert \n to <br>
      strikethrough: true,          // Support ~~text~~ for strikethrough
      tables: true,                 // Support tables
      tasklists: true,              // Support task lists
      ghCodeBlocks: true,           // Support GitHub style code blocks
      emoji: true,                  // Support emoji
      parseImgDimensions: true,     // Parse dimensions from image syntax
      excludeTrailingPunctuationFromURLs: true, // Exclude trailing punctuation from URLs
      literalMidWordUnderscores: true,          // Treat underscores in middle of words literally
      simplifiedAutoLink: true,     // Automatically link URLs
      smoothLivePreview: false,     // No extra spacing/newlines
      smartIndentationFix: true,    // Fix indentation
      disableForced4SpacesIndentedSublists: true // More compact sublists
    });

    // Set output format to minimize whitespace
    instance.setOption('noHeaderId', true);
    instance.setOption('ghCompatibleHeaderId', false);
    instance.setOption('omitExtraWLInCodeBlocks', true);

    // Custom extensions to eliminate space between elements
    const removeWhitespaceExtension = () => {
      return [
        // Replace paragraphs with more compact versions
        {
          type: 'output',
          filter: (html: string) => {
            // Remove whitespace between tags
            html = html.replace(/>\s+</g, '><');

            // Remove excess newlines
            html = html.replace(/\n\s*\n/g, '\n');

            // Fix for paragraph spacing - eliminate spacing between p tags
            html = html.replace(/<\/p>\s*<p>/g, '</p><p>');

            // Fix for list spacing - eliminate spacing between list items
            html = html.replace(/<\/li>\s*<li>/g, '</li><li>');

            // Fix for list spacing - eliminate spacing between ul/ol and li
            html = html.replace(/<ul>\s*<li>/g, '<ul><li>');
            html = html.replace(/<ol>\s*<li>/g, '<ol><li>');
            html = html.replace(/<\/li>\s*<\/ul>/g, '</li></ul>');
            html = html.replace(/<\/li>\s*<\/ol>/g, '</li></ol>');

            // Remove excess whitespace before and after content
            html = html.trim();

            return html;
          }
        },
        // Custom paragraph handling
        {
          type: 'lang',
          filter: (text: string) => {
            // Eliminate double line breaks where possible
            return text.replace(/\n\n+/g, '\n\n');
          }
        }
      ];
    };

    // Add extension to converter
    instance.addExtension(removeWhitespaceExtension(), 'removeWhitespace');

    return instance;
  }, []);

  // Process the HTML to further remove unwanted spacing
  const processHtml = (html: string): string => {
    // Remove any remaining whitespace between tags
    return html.replace(/>\s+</g, '><');
  };

  // Default handlers for component clicks
  const handleCardClick = onCardClick || (() => {});
  const handleCreditClick = onCreditClick || (() => {});
  const handlePerkClick = onPerkClick || (() => {});
  const handleMultiplierClick = onMultiplierClick || (() => {});

  // Render streaming content
  const renderStreamingContent = () => {
    if (!streamingState) return null;

    const { isStreaming, indicatorMessage, streamedText, componentBlock } = streamingState;

    // Only show streaming content while actively streaming
    // Once streaming is done, the message is added to chatHistory, so we don't show it here
    if (!isStreaming) return null;

    return (
      <div className="streaming-content">
        {/* Indicator */}
        <StreamingIndicator
          message={indicatorMessage}
          isVisible={!!indicatorMessage}
        />

        {/* Streaming text */}
        {streamedText && (
          <div className="entry entry-assistant streaming">
            <div className="entry-content">
              <img src={PLACEHOLDER_ASSISTANT_IMAGE} alt="AI Assistant" className="assistant-avatar" />
              <div className="message-text">
                <div
                  dangerouslySetInnerHTML={{ __html: processHtml(converter.makeHtml(streamedText)) }}
                />
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
                    <div
                      dangerouslySetInnerHTML={{
                        __html: processHtml(converter.makeHtml(chatEntry.chatMessage))
                      }}
                    ></div>
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
