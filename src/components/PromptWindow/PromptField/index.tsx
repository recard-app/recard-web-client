import React, { useState, useRef, useEffect, JSX } from 'react';
import { adjustTextareaHeight, canSubmitPrompt, shouldSubmitOnEnter } from './utils';
import { Icon } from '../../../icons';
import './PromptField.scss';
import { CHAT_MAX_FIELD_HEIGHT, MOBILE_BREAKPOINT } from '../../../types';

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
  disabled?: boolean;
}

function PromptField({ returnPrompt, isProcessing, onCancel, disabled = false }: PromptFieldProps): JSX.Element {
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
   * Effect hook for iOS Safari keyboard handling.
   * MOBILE ONLY - scrolls chat history to bottom when the input is focused
   * so the user sees the latest messages above the keyboard.
   *
   * The actual keyboard positioning is handled by CSS: useViewportHeight updates
   * --app-vh when the keyboard opens, which shrinks the .app container, and the
   * flex layout keeps the input visible above the keyboard automatically.
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    if (!isMobile) return;

    const handleFocus = () => {
      // Scroll chat history to bottom so the user sees latest messages
      const chatHistoryContainer = document.querySelector('.prompt-history-container');
      if (chatHistoryContainer) {
        chatHistoryContainer.scrollTo({
          top: chatHistoryContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    textarea.addEventListener('focus', handleFocus);
    return () => {
      textarea.removeEventListener('focus', handleFocus);
    };
  }, []);

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
        placeholder={disabled ? 'Chat limit reached' : 'Where are you shopping today?'}
        rows={1}
        data-virtualkeyboard="true"
        disabled={disabled}
      />
      {isProcessing ? (
        <button className="button icon" onClick={onCancel} title="Cancel">
          <Icon name="stop" variant="solid" size={16} />
        </button>
      ) : (
        <button
          className="button icon"
          onClick={handleSubmit}
          disabled={disabled || !promptValue.trim()}
          title="Submit"
        >
          <Icon name="arrow-up" variant="solid" size={16} />
        </button>
      )}
    </div>
  );
}

export default PromptField;