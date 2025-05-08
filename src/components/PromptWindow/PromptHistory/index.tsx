import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ChatMessage } from '../../../types/ChatTypes';
import './PromptHistory.scss';
import { PLACEHOLDER_ASSISTANT_IMAGE } from '../../../types';

/**
 * Props for the PromptHistory component.
 * @param {ChatMessage[]} chatHistory - An array of chat messages representing the history of the conversation.
 */
interface PromptHistoryProps {
  chatHistory: ChatMessage[];
}

function PromptHistory({ chatHistory }: PromptHistoryProps): React.ReactElement {
  return (
    <div className='prompt-history'>
      {chatHistory.map((chatEntry) => (
        <div key={chatEntry.id} className={`${(chatEntry.chatSource === 'user') ? 'entry entry-user' : 'entry entry-assistant'}`}>
          <div className="entry-content">
            {chatEntry.chatSource === 'assistant' && (
              <img src={PLACEHOLDER_ASSISTANT_IMAGE} alt="AI Assistant" className="assistant-avatar" />
            )}
            <div className="message-text">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  p: ({node, ...props}) => <p className="markdown-paragraph" {...props} />,
                  // Ensure line breaks are respected
                  br: () => <br className="custom-break" />
                }}
              >
                {chatEntry.chatMessage}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PromptHistory;