import { ChatHistory } from '../../types/UserTypes';
import { UserHistoryService } from '../../services';

/**
 * Type for managing the delete operation status
 * @typedef {Object} DeleteStatusType
 * @property {'confirm' | 'success' | 'error'} type - The current state of the delete operation
 * @property {string} message - The message to display to the user
 */
export type DeleteStatusType = {
  type: 'confirm' | 'success' | 'error';
  message: string;
}

/**
 * Handles the verification email sending process
 * @param sendVerificationEmail - Function to send verification email
 * @returns Object containing message and message type
 */
export const handleVerificationEmail = async (
  sendVerificationEmail: () => Promise<boolean>
): Promise<{ message: string; messageType: 'success' | 'error' }> => {
  try {
    // Check if user is logged in and email not verified before sending
    const result = await sendVerificationEmail();
    if (!result) {
      throw new Error('Unable to send verification email. Please try again later.');
    }
    return {
      messageType: 'success',
      message: 'Verification email sent! Please check your inbox.'
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to send verification email. Please try again later or contact support if the issue persists.';
    
    return {
      messageType: 'error',
      message: errorMessage
    };
  }
};

/**
 * Handles the deletion of all chat history
 * @param setChatHistory - Function to update chat history
 * @param setHistoryRefreshTrigger - Function to trigger history refresh
 * @returns Object containing delete status
 */
export const handleDeleteAllChats = async (
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory>>,
  setHistoryRefreshTrigger: React.Dispatch<React.SetStateAction<number>>
): Promise<DeleteStatusType> => {
  try {
    await UserHistoryService.deleteAllHistory();
    setChatHistory([]);
    setHistoryRefreshTrigger(prev => prev + 1);
    return { 
      type: 'success', 
      message: 'All chat history has been deleted successfully.' 
    };
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return { 
      type: 'error', 
      message: 'Failed to delete chat history. Please try again.' 
    };
  }
};