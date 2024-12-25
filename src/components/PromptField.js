import React, { useState } from 'react';

function PromptField({ returnPrompt }) {
  const [promptValue, setPromptValue] = useState('');

  const inputChange = (event) => {
    setPromptValue(event.target.value);
  };

  const handleClick = () => {
    returnPrompt(promptValue);
    setPromptValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
        handleClick();
    }
};

  return (
    <div className='prompt-field'>
      <input
          name='promptField'
          value={promptValue}
          onChange={inputChange}
          onKeyDown={handleKeyDown}
      />
      <button onClick={handleClick}>Make API Call</button>
    </div>
  );

}

export default PromptField;