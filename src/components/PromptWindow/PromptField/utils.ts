/**
 * Dynamically adjusts the height of a textarea based on its content.
 * The height is capped at 250px as defined in the CSS.
 * @param textarea - The textarea element to adjust
 */
export const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null, maxHeight: number): void => {
  if (textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to match the content (up to max-height defined in CSS)
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }
};

/**
 * Validates if a prompt can be submitted based on current state
 * @param prompt - The prompt text to validate
 * @param isProcessing - Whether the prompt is currently being processed
 * @returns boolean indicating if the prompt can be submitted
 */
export const canSubmitPrompt = (prompt: string, isProcessing: boolean): boolean => {
  return !isProcessing && prompt.trim().length > 0;
};

/**
 * Checks if the Enter key event should trigger a submit
 * @param event - The keyboard event to check
 * @param isProcessing - Whether the prompt is currently being processed
 * @returns boolean indicating if the event should trigger a submit
 */
export const shouldSubmitOnEnter = (
  event: React.KeyboardEvent<HTMLTextAreaElement>,
  isProcessing: boolean
): boolean => {
  return event.key === 'Enter' && !event.shiftKey && !isProcessing;
};
