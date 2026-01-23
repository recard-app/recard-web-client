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

    let initialHeight = visualViewport.height;

    const scrollToKeyboard = () => {
      const htmlElement = document.documentElement;
      const textareaRect = textarea.getBoundingClientRect();
      const viewportHeight = visualViewport.height;
      const initialViewportHeight = initialHeight;
      const keyboardHeight = initialViewportHeight - viewportHeight;
      
      // First, scroll chat history to bottom so user can see latest messages (mobile only)
      const chatHistoryContainer = document.querySelector('.prompt-history-container');
      if (chatHistoryContainer) {
        chatHistoryContainer.scrollTo({
          top: chatHistoryContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      // Use adaptive spacing: 4% of viewport height or minimum 18px, maximum 50px
      const adaptiveSpacing = Math.max(18, Math.min(50, viewportHeight * 0.04));
      
      // Alternative approach: use a percentage of the keyboard height for spacing
      const keyboardBasedSpacing = Math.max(15, keyboardHeight * 0.05); // 5% of keyboard height
      
      // Choose the smaller of the two for optimal positioning
      const optimalSpacing = Math.min(adaptiveSpacing, keyboardBasedSpacing);
      
      const targetInputBottom = viewportHeight - optimalSpacing;
      const currentInputBottom = textareaRect.bottom;
      const scrollAdjustment = currentInputBottom - targetInputBottom;
      const newScrollTop = htmlElement.scrollTop + scrollAdjustment;
      
      // Use the calculated position with exact keyboard timing to prevent shaking
      htmlElement.style.scrollBehavior = 'auto'; // Disable smooth for manual control
      
      // Animate scroll manually to match keyboard timing exactly
      const startScroll = htmlElement.scrollTop;
      const scrollDistance = newScrollTop - startScroll;
      const duration = 250; // Match iOS keyboard animation duration
      const startTime = performance.now();
      
      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOutCubic for natural iOS-like animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentScrollTop = startScroll + (scrollDistance * easeOutCubic);
        
        htmlElement.scrollTop = currentScrollTop;
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Restore smooth behavior after animation
          htmlElement.style.scrollBehavior = '';
        }
      };
      
      requestAnimationFrame(animateScroll);
    };

    const handleFocus = () => {
      // This function only runs on mobile devices (event listener only added on mobile)
      
      // Immediately scroll chat to bottom so user sees latest messages
      const chatHistoryContainer = document.querySelector('.prompt-history-container');
      if (chatHistoryContainer) {
        chatHistoryContainer.scrollTo({
          top: chatHistoryContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      // First scroll to bring input into view
      textarea.scrollIntoView({ 
        behavior: "instant", 
        block: "nearest",
        inline: "nearest"
      });
      
      // Then position precisely above keyboard - reduced delay for tighter sync
      setTimeout(scrollToKeyboard, 50);
    };

    const handleViewportChange = () => {
      const currentHeight = visualViewport.height;
      const heightDifference = initialHeight - currentHeight;
      
      // If keyboard appeared (height reduced significantly)
      if (heightDifference > 150) {
        // Position input precisely above keyboard - start immediately for sync
        setTimeout(scrollToKeyboard, 16); // Single frame delay for viewport stabilization
      }
    };

    // Add event listeners
    textarea.addEventListener('focus', handleFocus);
    visualViewport.addEventListener('resize', handleViewportChange);
    
    // Cleanup
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