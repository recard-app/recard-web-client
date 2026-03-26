import React, { useState, useRef, useEffect, JSX } from 'react';
import { adjustTextareaHeight, canSubmitPrompt, shouldSubmitOnEnter } from './utils';
import { Icon } from '../../../icons';
import './PromptField.scss';
import { CHAT_MAX_FIELD_HEIGHT, MOBILE_BREAKPOINT } from '../../../types';


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
  chatLimitReached?: boolean;
  /** True when the server is still processing a response (user returned to a streaming chat) */
  isWaitingForResponse?: boolean;
}

function PromptField({ returnPrompt, isProcessing, onCancel, disabled = false, chatLimitReached = false, isWaitingForResponse = false }: PromptFieldProps): JSX.Element {
  // Stores the current value of the prompt textarea
  const [promptValue, setPromptValue] = useState<string>('');
  // Reference to the textarea element for dynamic height adjustment
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * Effect hook to adjust textarea height on initial render
   * and whenever the prompt value changes.
   */
  useEffect(() => {
    adjustTextareaHeight(textareaRef.current, CHAT_MAX_FIELD_HEIGHT);
  }, [promptValue]);

  /**
   * Effect hook for iOS Safari keyboard handling using visualViewport API
   * MOBILE ONLY - All behavior in this effect only applies to mobile devices (max-width: ${MOBILE_BREAKPOINT}px)
   * Desktop and tablet users are completely unaffected
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    const visualViewport = (window as any).visualViewport;

    if (!isMobile || !visualViewport) return;

    let initialHeight = window.innerHeight;

    const handleFocus = () => {
      initialHeight = window.innerHeight;
    };

    const handleViewportChange = () => {
      const currentHeight = visualViewport.height;
      const heightDifference = initialHeight - currentHeight;

      if (heightDifference > 150) {
        // Keyboard appears; no-op by design.
      }
    };

    textarea.addEventListener('focus', handleFocus);
    visualViewport.addEventListener('resize', handleViewportChange);

    return () => {
      textarea.removeEventListener('focus', handleFocus);
      visualViewport.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  /**
   * Handles changes to the textarea input.
   * Updates the prompt value and adjusts the textarea height.
   */
  const inputChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setPromptValue(event.target.value);
  };

  /**
   * Handles the submission of the prompt.
   */
  // Block all input when an active stream is running OR the server is still
  // processing a previous response (user navigated away and back).
  const inputBlocked = isProcessing || isWaitingForResponse;

  const handleSubmit = (): void => {
    if (canSubmitPrompt(promptValue, inputBlocked)) {
      returnPrompt(promptValue);
      setPromptValue('');
    }
  };

  /**
   * Handles keyboard events in the textarea.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (shouldSubmitOnEnter(event, inputBlocked)) {
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
        placeholder={chatLimitReached ? 'Chat limit reached' : 'Where are you shopping today?'}
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
          disabled={disabled || inputBlocked || !promptValue.trim()}
          title="Submit"
        >
          <Icon name="arrow-up" variant="solid" size={16} />
        </button>
      )}
    </div>
  );
}

export default PromptField;
