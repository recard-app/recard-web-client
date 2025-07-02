import React, { useState, useRef, useEffect, JSX } from 'react';
import { adjustTextareaHeight, canSubmitPrompt, shouldSubmitOnEnter } from './utils';
import { Icon } from '../../../icons';
import './PromptField.scss';
import { CHAT_MAX_FIELD_HEIGHT } from '../../../types';

/**
 * Maximum height of the textarea.
 */
const TEXT_AREA_MAX_HEIGHT = CHAT_MAX_FIELD_HEIGHT;

/**
 * Props for the PromptField component.
 * @param {function} returnPrompt - Callback function to handle the submitted prompt text.
 * @param {boolean} isProcessing - Flag indicating whether the prompt is currently being processed.
 * @param {function} onCancel - Callback function to handle cancellation of prompt processing.
 */
interface PromptFieldProps {
  returnPrompt: (prompt: string) => void;
  isProcessing: boolean;
  onCancel: () => void;
}

function PromptField({ returnPrompt, isProcessing, onCancel }: PromptFieldProps): JSX.Element {
  // Stores the current value of the prompt textarea
  const [promptValue, setPromptValue] = useState<string>('');
  // Reference to the textarea element for dynamic height adjustment
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * Effect hook to adjust textarea height on initial render
   * and whenever the prompt value changes.
   */
  useEffect(() => {
    adjustTextareaHeight(textareaRef.current, TEXT_AREA_MAX_HEIGHT);
  }, [promptValue]);

  /**
   * Handles changes to the textarea input.
   * Updates the prompt value and adjusts the textarea height.
   */
  const inputChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setPromptValue(event.target.value);
    adjustTextareaHeight(textareaRef.current, TEXT_AREA_MAX_HEIGHT);
  };

  /**
   * Handles the submission of the prompt.
   */
  const handleSubmit = (): void => {
    if (canSubmitPrompt(promptValue, isProcessing)) {
      returnPrompt(promptValue);
      setPromptValue('');
    }
  };

  /**
   * Handles keyboard events in the textarea.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (shouldSubmitOnEnter(event, isProcessing)) {
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
        rows={1}
      />
      {isProcessing ? (
        <button className="button icon" onClick={onCancel} title="Cancel">
          <Icon name="stop" variant="solid" size={16} />
        </button>
      ) : (
        <button 
          className="button icon" 
          onClick={handleSubmit} 
          disabled={!promptValue.trim()}
          title="Submit"
        >
          <Icon name="arrow-up" variant="solid" size={16} />
        </button>
      )}
    </div>
  );
}

export default PromptField;