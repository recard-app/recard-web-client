import React, { useMemo, useRef, useEffect } from 'react';
import showdown from 'showdown';
import { ChatMessage } from '../../../types/ChatTypes';
import { InfoDisplay } from '../../../elements';
import { ChatComponentBlock } from '../../../elements/ChatComponents';
import { StreamingState } from '../../../types/AgentChatTypes';
import AgentTimeline from '../AgentTimeline';
import { ChatErrorBoundary } from '../ErrorBoundary';
import { DailyDigest } from '../DailyDigest';
import { Skeleton } from '../../ui/skeleton';
import './PromptHistory.scss';
import { CHAT_SOURCE, DAILY_ZEN_FEATURE_NAME } from '../../../types';
import { COLORS } from '../../../types/Colors';
import { Icon } from '../../../icons';
import { sanitizeMarkdownHtml } from '../../../utils/sanitizeMarkdown';

const ASSISTANT_ICONS = ['assistant', 'assistant-2', 'assistant-3', 'assistant-4'] as const;

type AvatarAnimation = 'rock' | 'spin' | 'pulse';

const AVATAR_ANIMATIONS: Record<typeof ASSISTANT_ICONS[number], AvatarAnimation> = {
  'assistant':   'rock',
  'assistant-2': 'rock',
  'assistant-3': 'rock',
  'assistant-4': 'rock',
};

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getAssistantIcon(chatId: string): typeof ASSISTANT_ICONS[number] {
  return ASSISTANT_ICONS[hashString(chatId) % ASSISTANT_ICONS.length];
}

/**
 * Data structure for daily digest
 */
interface DigestData {
  title: string;
  content: string;
  generatedAt?: string;
}

/**
 * Props for the PromptHistory component.
 */
interface PromptHistoryProps {
  chatHistory: ChatMessage[];
  streamingState?: StreamingState;
  isNewChat?: boolean;
  isSwitchingChats?: boolean;
  // Daily digest props
  digest?: DigestData | null;
  digestLoading?: boolean;
  onRegenerateDigest?: () => void;
  isRegeneratingDigest?: boolean;
  chatId?: string;
  /** True when the server is still processing a response (user returned to a streaming chat) */
  isWaitingForResponse?: boolean;
  // Component click handlers
  onCardClick?: (cardId: string) => void;
  onCreditClick?: (cardId: string, creditId: string) => void;
  onPerkClick?: (cardId: string, perkId: string) => void;
  onMultiplierClick?: (cardId: string, multiplierId: string) => void;
}

const SKELETON_RESPONSE_BARS = [
  '95%', '85%', '90%', '70%', '95%', '80%', '88%', '75%', '65%', '50%', '40%', '30%',
];

function ChatSkeleton(): React.ReactElement {
  const totalBars = SKELETON_RESPONSE_BARS.length;
  return (
    <div className="chat-skeleton">
      <Skeleton className="skeleton-user-bubble" />
      <div className="skeleton-bubble skeleton-bubble-assistant">
        {SKELETON_RESPONSE_BARS.map((w, i) => {
          const alpha = 1 - (i / (totalBars - 1));
          return (
            <div
              key={`${i}-${w}`}
              className="h-4 rounded-sm animate-pulse"
              style={{
                width: w,
                backgroundColor: `rgba(0, 0, 0, ${(0.08 * alpha).toFixed(3)})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function PromptHistory({
  chatHistory,
  streamingState,
  isNewChat = false,
  isSwitchingChats = false,
  digest,
  digestLoading = false,
  onRegenerateDigest,
  isRegeneratingDigest = false,
  chatId = '',
  isWaitingForResponse = false,
  onCardClick,
  onCreditClick,
  onPerkClick,
  onMultiplierClick,
}: PromptHistoryProps): React.ReactElement {
  const chatEntries = chatHistory;

  const assistantIconName = useMemo(() => getAssistantIcon(chatId), [chatId]);

  const lastAssistantIndex = useMemo(() => {
    for (let i = chatEntries.length - 1; i >= 0; i--) {
      if (chatEntries[i].chatSource === CHAT_SOURCE.ASSISTANT) return i;
    }
    return -1;
  }, [chatEntries]);

  const streamingAnimationRef = useRef<AvatarAnimation>('rock');

  useEffect(() => {
    if (streamingState?.isStreaming) {
      streamingAnimationRef.current = AVATAR_ANIMATIONS[assistantIconName];
    }
  }, [streamingState?.isStreaming, assistantIconName]);

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

    const { isStreaming, streamedText, componentBlock, timeline } = streamingState;

    // Only show streaming content while actively streaming
    // Once streaming is done, the message is added to chatHistory, so we don't show it here
    if (!isStreaming) return null;

    return (
      <div className="streaming-content">
        {/* Agent Timeline - shows full execution history */}
        <AgentTimeline
          timeline={timeline}
          isStreaming={isStreaming}
        />

        {/* Streaming text (token by token) */}
        {streamedText && (
          <div className="entry entry-assistant streaming">
            <div className="entry-content">
              <div className="message-text">
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeMarkdownHtml(converter, streamedText) }}
                />
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

        {/* Avatar always at the bottom, moves down as content streams */}
        <Icon name={assistantIconName} variant="solid" className={`assistant-avatar avatar-anim-${streamingAnimationRef.current}`} />
      </div>
    );
  };

  return (
    <div className={`prompt-history${isSwitchingChats ? ' is-switching' : ''}`}>
      {chatEntries.length === 0 && !streamingState?.isStreaming ? (
        isNewChat ? (
          <div className="welcome-message">
            <p className="title">What are you looking to purchase?</p>
            <p className="subtitle">I'll help you find the best credit card to maximize your rewards.</p>
            {digestLoading && (
              <InfoDisplay
                type="loading"
                message={`Loading your ${DAILY_ZEN_FEATURE_NAME}...`}
                showTitle={false}
                transparent={true}
                centered={false}
              />
            )}
            {!digestLoading && digest && (
              <DailyDigest
                title={digest.title}
                content={digest.content}
                generatedAt={digest.generatedAt}
                onRegenerate={onRegenerateDigest}
                isRegenerating={isRegeneratingDigest}
              />
            )}
          </div>
        ) : (
          <ChatSkeleton />
        )
      ) : (
        <>
          {chatEntries.map((chatEntry, index) => {
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
                  <div className="message-text">
                    {chatEntry.chatMessage && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizeMarkdownHtml(converter, chatEntry.chatMessage)
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
                  {chatEntry.chatSource === CHAT_SOURCE.ASSISTANT && index === lastAssistantIndex && !streamingState?.isStreaming && (
                    <Icon name={assistantIconName} variant="solid" color={COLORS.PRIMARY_MEDIUM} className="assistant-avatar" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Render streaming content at the end */}
          {renderStreamingContent()}

          {/* Show animated avatar when waiting for server response (returned to streaming chat) */}
          {isWaitingForResponse && !streamingState?.isStreaming && (
            <div className="streaming-content">
              <Icon name={assistantIconName} variant="solid" className={`assistant-avatar avatar-anim-${AVATAR_ANIMATIONS[assistantIconName]}`} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PromptHistory;
