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
}

function PromptField({ returnPrompt, isProcessing, onCancel, disabled = false, chatLimitReached = false }: PromptFieldProps): JSX.Element {
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

    // Check if we're on mobile and have visualViewport support
    const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    const visualViewport = (window as any).visualViewport;

    // Early return for non-mobile devices - nothing below this line affects desktop/tablet
    if (!isMobile || !visualViewport) return;

    let initialHeight = window.innerHeight;
    let hasAdjusted = false;

    const handleFocus = () => {
      initialHeight = window.innerHeight;
      hasAdjusted = false;
    };

    // After the keyboard is fully open, nudge the scroll so the input
    // sits right above the keyboard instead of Safari's default padding.
    // This runs AFTER Safari's native scroll has finished, so the
    // adjustment is small (~40-80px) and doesn't cause visible flicker.
    const handleViewportChange = () => {
      if (hasAdjusted) return;

      const currentHeight = visualViewport.height;
      const heightDifference = initialHeight - currentHeight;

      if (heightDifference > 150) {
        hasAdjusted = true;

        // Wait for Safari's native scroll to finish settling
        requestAnimationFrame(() => {
          const textareaRect = textarea.getBoundingClientRect();
          const visibleBottom = visualViewport.height + visualViewport.offsetTop;
          const gap = visibleBottom - textareaRect.bottom;

          // If the input is more than 20px above the keyboard, nudge it down
          if (gap > 20) {
            const nudge = gap - 12; // Leave 12px breathing room above keyboard
            window.scrollBy({ top: -nudge, behavior: 'instant' });
          }
        });
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
