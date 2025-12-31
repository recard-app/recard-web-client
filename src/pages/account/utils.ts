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

// Display name validation constants
const NAME_MAX_LENGTH = 50;
const NAME_MIN_LENGTH = 1;
// Unicode-aware regex: allows letters from any language, spaces, hyphens, and apostrophes
const NAME_REGEX = /^[\p{L}\s\-']+$/u;

/**
 * Validates a display name for length and character requirements
 * @param name - The name to validate
 * @returns Object containing validation result and optional error message
 */
export const validateDisplayName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (trimmed.length < NAME_MIN_LENGTH) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return { valid: false, error: `Name cannot exceed ${NAME_MAX_LENGTH} characters` };
  }

  if (!NAME_REGEX.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters (any language), spaces, hyphens, and apostrophes' };
  }

  return { valid: true };
};

/**
 * Check if user has password provider (email/password sign-in)
 * @param providerData - Array of provider data from Firebase user
 * @returns True if user has password provider
 */
export const hasPasswordProvider = (providerData: { providerId: string }[]): boolean => {
  return providerData.some(provider => provider.providerId === 'password');
};

// Email validation regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns Object containing validation result and optional error message
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
};

/**
 * Maps Firebase email update error codes to user-friendly messages
 * @param error - Firebase error object
 * @returns User-friendly error message
 */
export const getEmailChangeErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already in use by another account.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/requires-recent-login':
      return 'Please sign out and sign back in, then try again.';
    case 'auth/operation-not-allowed':
      return 'Email change is not allowed. Please contact support.';
    default:
      return error?.message || 'An error occurred. Please try again.';
  }
};