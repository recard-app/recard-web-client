import {
  Conversation,
  LightweightConversation,
  HistoryParams,
  PaginationData
} from '../../types';
import { MONTH_NAMES } from '../../types';
import { UserHistoryService } from '../../services';

/**
 * Interface representing a section of history entries grouped by date
 */
export interface HistorySection {
  title: string;
  entries: Conversation[] | LightweightConversation[];
  key?: string | number;
}

/**
 * Fetches paginated history from the API
 */
export const fetchPagedHistory = async (
    params: {
      currentPage: number,
      pageSize: number
    }
  ): Promise<{
    chatHistory: LightweightConversation[],
    pagination: PaginationData | null,
    error?: Error
  }> => {
    try {
      // Build API parameters with proper types
      const apiParams: HistoryParams = {
        page: params.currentPage,
        page_size: params.pageSize
      };

      const response = await UserHistoryService.fetchPagedHistory(apiParams);

      return {
        chatHistory: response.chatHistory || [],
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return {
        chatHistory: [],
        pagination: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  };
  
  /**
   * Handles deletion of a chat entry by updating the history state
   */
  export const handleHistoryDelete = (
    deletedChatId: string,
    currentChatId: string | null,
    returnCurrentChatId: (chatId: string | null) => void,
    onHistoryUpdate?: (updater: (prevHistory: Conversation[]) => Conversation[]) => void
  ): void => {
    // If we're deleting the current chat, clear it first
    if (deletedChatId === currentChatId) {
      returnCurrentChatId(null);
    }
    
    // Update chatHistory by filtering out the deleted chat
    if (onHistoryUpdate) {
      onHistoryUpdate(prevHistory => prevHistory.filter(chat => chat.chatId !== deletedChatId));
    }
  };

/**
 * Organizes history entries into sections based on date
 */
export const organizeHistoryByDate = (entries: Conversation[] | LightweightConversation[]): HistorySection[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Helper function to get month name and year
  const getMonthYear = (date: Date): string => {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Helper function to get unique key for month/year
  const getMonthKey = (date: Date): number => {
    return date.getFullYear() * 12 + date.getMonth();
  };

  // Group entries by their time section
  const sections = entries.reduce<Record<string | number, HistorySection>>((acc, entry) => {
    const entryDate = new Date(entry.timestamp);
    const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    let key: string | number;
    let title: string;

    if (daysDiff < 1) {
      key = 'today';
      title = 'Today';
    } else if (daysDiff < 2) {
      key = 'yesterday';
      title = 'Yesterday';
    } else if (daysDiff < 7) {
      key = 'lastweek';
      title = 'Last Week';
    } else if (daysDiff < 14) {
      key = '2weeks';
      title = '2 Weeks Ago';
    } else if (daysDiff < 21) {
      key = '3weeks';
      title = '3 Weeks Ago';
    } else {
      // Group by month for entries older than 21 days
      key = getMonthKey(entryDate);
      title = getMonthYear(entryDate);
    }

    if (!acc[key]) {
      acc[key] = { title, entries: [], key };
    }
    acc[key].entries.push(entry);
    return acc;
  }, {});

  // Sort sections and entries
  return Object.values(sections)
    .sort((a, b) => {
      // Special handling for non-month sections
      const specialOrder = ['today', 'yesterday', 'lastweek', '2weeks', '3weeks'];
      const aIndex = specialOrder.indexOf(a.key as string);
      const bIndex = specialOrder.indexOf(b.key as string);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // For month sections, sort by their numeric key (most recent first)
      return (b.key as number) - (a.key as number);
    })
    .map(section => ({
      title: section.title,
      entries: section.entries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }));
};