import React from 'react';
import { marked } from 'marked';
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
  const chatEntries = chatHistory;
  
  return (
    <div className='prompt-history'>
      {chatEntries.map((chatEntry) => (
        <div key={chatEntry.id} className={`${(chatEntry.chatSource === 'user') ? 'entry entry-user' : 'entry entry-assistant'}`}>
          <div className="entry-content">
            {chatEntry.chatSource === 'assistant' && (
              <img src={PLACEHOLDER_ASSISTANT_IMAGE} alt="AI Assistant" className="assistant-avatar" />
            )}
            <p 
              className="message-text" 
              dangerouslySetInnerHTML={{ 
                __html: marked(chatEntry.chatMessage) 
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PromptHistory;