import React, { useMemo } from 'react';
import showdown from 'showdown';
import { ChatMessage } from '../../../types/ChatTypes';
import { InfoDisplay } from '../../../elements';
import './PromptHistory.scss';
import { PLACEHOLDER_ASSISTANT_IMAGE } from '../../../types';

/**
 * Props for the PromptHistory component.
 * @param {ChatMessage[]} chatHistory - An array of chat messages representing the history of the conversation.
 */
interface PromptHistoryProps {
  chatHistory: ChatMessage[];
  isNewChat?: boolean;
  isLoading?: boolean;
  isLoadingSolutions?: boolean;
}

function PromptHistory({ chatHistory, isNewChat = false, isLoading = false, isLoadingSolutions = false }: PromptHistoryProps): React.ReactElement {
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
  
  return (
    <div className='prompt-history'>
      {chatEntries.length === 0 ? (
        isNewChat ? (
          <div className="welcome-message">
            <p className="title">What are you looking to purchase today?</p>
            <p className="subtitle">I'll help you find the best credit card to maximize your rewards.</p>
          </div>
        ) : (
          <div className="loading-message">
            <InfoDisplay
              type="loading"
              message="Loading transaction chat history..."
              showTitle={false}
              transparent={true}
            />
          </div>
        )
      ) : (
        <>
          {chatEntries.map((chatEntry) => (
            <div key={chatEntry.id} className={`${(chatEntry.chatSource === 'user') ? 'entry entry-user' : 'entry entry-assistant'}`}>
              <div className="entry-content">
                {chatEntry.chatSource === 'assistant' && (
                  <img src={PLACEHOLDER_ASSISTANT_IMAGE} alt="AI Assistant" className="assistant-avatar" />
                )}
                <div 
                  className="message-text" 
                  dangerouslySetInnerHTML={{ 
                    __html: processHtml(converter.makeHtml(chatEntry.chatMessage))
                  }} 
                ></div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="loading-indicator">
              <InfoDisplay
                type="loading"
                message="Thinking..."
                showTitle={false}
                transparent={true}
              />
            </div>
          )}
          {isLoadingSolutions && (
            <div className="loading-indicator">
              <InfoDisplay
                type="loading"
                message="Looking for Card Recommendations..."
                showTitle={false}
                transparent={true}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PromptHistory;