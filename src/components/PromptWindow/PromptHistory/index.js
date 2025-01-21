import React, { useState } from 'react';
import './PromptHistory.scss';
function PromptHistory({ chatHistory }) {
    const chatEntries = chatHistory;
  
    return (
      <div className='prompt-history'>
        {chatEntries.map((chatEntry) => (
          <div key={chatEntry.id} className={`${(chatEntry.chatSource == 'user') ? 'entry entry-user' : 'entry entry-assistant'}`}>
            <p><b>{`${(chatEntry.chatSource == 'user') ? 'You' : 'ReCard AI'}: `}</b>{`${chatEntry.chatMessage}`}</p>
          </div>
        ))}
      </div>
    );
  }
  
  export default PromptHistory;