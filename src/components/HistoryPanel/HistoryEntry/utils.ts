import { MONTH_ABBREVIATIONS } from '../../../types';
import { UserHistoryService } from '../../../services';

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
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${MONTH_ABBREVIATIONS[date.getMonth()]} ${date.getDate()}, ${hours}:${minutesStr} ${ampm}`;
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
    navigate: (path: string, options: { replace: boolean }) => void,
    currentPath: string
  }
): Promise<void> => {
  await UserHistoryService.deleteHistoryEntry(chatId);
  
  if (callbacks.onDelete) {
    callbacks.onDelete(chatId);
  }

  // Cancels the renavigation if the user is on the history page. 
  // It should only redirect to the home page if the user is on the home page and deleted their current chat. 
  if (chatId === currentChatId) {
    callbacks.returnCurrentChatId(null);
    // Only navigate if we're NOT on the history page (including any parameters)
    if (!callbacks.currentPath.startsWith('/history')) {
      callbacks.navigate('/', { replace: true });
    }
  }
};
