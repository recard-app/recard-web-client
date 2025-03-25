import React, { useState } from 'react';
import './PromptField.scss';

function PromptField({ returnPrompt, isProcessing, onCancel }) {
  const [promptValue, setPromptValue] = useState('');

  const inputChange = (event) => {
    setPromptValue(event.target.value);
  };

  const handleSubmit = () => {
    if (!isProcessing && promptValue.trim()) {
      returnPrompt(promptValue);
      setPromptValue('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isProcessing) {
      handleSubmit();
    }
  };

  return (
    <div className='prompt-field'>
      <input
        name='promptField'
        value={promptValue}
        onChange={inputChange}
        onKeyDown={handleKeyDown}
        placeholder='Where are you shopping today?'
      />
      {isProcessing ? (
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      ) : (
        <button onClick={handleSubmit} disabled={!promptValue.trim()}>
          Submit
        </button>
      )}
    </div>
  );
}

export default PromptField;