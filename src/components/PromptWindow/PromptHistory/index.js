import React from 'react';
import { marked } from 'marked';
import './PromptHistory.scss';

function PromptHistory({ chatHistory }) {
    const chatEntries = chatHistory;
  
    return (
      <div className='prompt-history'>
        {chatEntries.map((chatEntry) => (
          <div key={chatEntry.id} className={`${(chatEntry.chatSource === 'user') ? 'entry entry-user' : 'entry entry-assistant'}`}>
            <div className="entry-content">
              {chatEntry.chatSource === 'assistant' && (
                <img src="https://placehold.co/40" alt="AI Assistant" className="assistant-avatar" />
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