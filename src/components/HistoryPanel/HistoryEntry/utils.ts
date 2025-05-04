import { CreditCard, SimpleCardDisplay, ChatSolution, PLACEHOLDER_CARD_IMAGE } from '../../../types';
import { UserHistoryService } from '../../../services/UserService';

/**
 * Retrieves the recommended card details from the chat solutions
 * @param solutions - Array of chat solutions
 * @param creditCards - Available credit cards
 * @returns Card display information or null if no recommendation exists
 */
export const getRecommendedCard = (
  solutions: ChatSolution | undefined,
  creditCards: CreditCard[] | undefined
): SimpleCardDisplay | null => {
  const recommendedSolution = Array.isArray(solutions) ? solutions[0] : null;
  if (!recommendedSolution) return null;

  const cardDetails = creditCards?.find(card => card.id === recommendedSolution.id);
  
  return {
    name: cardDetails?.CardName || recommendedSolution.cardName,
    image: cardDetails?.CardImage || PLACEHOLDER_CARD_IMAGE
  };
};

/**
 * Formats a timestamp into a human-readable string
 * @param timestamp - ISO string timestamp to format
 * @returns Formatted string (e.g., "just now", "5 minutes ago", "Jan 1, 2:30 PM")
 */
export const formatDate = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutesStr} ${ampm}`;
};

/**
 * Deletes a chat entry and handles navigation
 * @param chatId - ID of the chat to delete
 * @param currentChatId - Currently selected chat ID
 * @param callbacks - Object containing callback functions
 * @returns Promise that resolves when deletion is complete
 */
export const deleteChatEntry = async (
  chatId: string,
  currentChatId: string | null,
  callbacks: {
    onDelete?: (chatId: string) => void,
    returnCurrentChatId: (chatId: string | null) => void,
    navigate: (path: string, options: { replace: boolean }) => void
  }
): Promise<void> => {
  await UserHistoryService.deleteHistoryEntry(chatId);
  
  if (callbacks.onDelete) {
    callbacks.onDelete(chatId);
  }

  if (chatId === currentChatId) {
    callbacks.returnCurrentChatId(null);
    callbacks.navigate('/', { replace: true });
  }
};
