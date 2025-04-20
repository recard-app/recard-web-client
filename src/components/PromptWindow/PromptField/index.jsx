import React, { useState, useRef, useEffect } from 'react';
import './PromptField.scss';

function PromptField({ returnPrompt, isProcessing, onCancel }) {
  const [promptValue, setPromptValue] = useState('');
  const textareaRef = useRef(null);

  // Function to adjust textarea height
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the content (up to max-height defined in CSS)
      textarea.style.height = `${Math.min(textarea.scrollHeight, 250)}px`;
    }
  };

  const inputChange = (event) => {
    setPromptValue(event.target.value);
    adjustHeight();
  };

  // Adjust height on initial render and when value changes
  useEffect(() => {
    adjustHeight();
  }, [promptValue]);

  const handleSubmit = () => {
    if (!isProcessing && promptValue.trim()) {
      returnPrompt(promptValue);
      setPromptValue('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !isProcessing) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='prompt-field'>
      <textarea
        ref={textareaRef}
        name='promptField'
        value={promptValue}
        onChange={inputChange}
        onKeyDown={handleKeyDown}
        placeholder='Where are you shopping today?'
        rows="1"
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