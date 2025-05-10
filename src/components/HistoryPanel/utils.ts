import { 
  Conversation, 
  SubscriptionPlan, 
  HistoryParams, 
  PaginationData
} from '../../types';
import { MONTH_OPTIONS, MONTH_NAMES, SUBSCRIPTION_PLAN } from '../../types';
import { UserHistoryService } from '../../services';

/**
 * Interface representing a month option in the dropdown
 */
export interface MonthOption {
  value: number;
  label: string;
}

/**
 * Interface representing a section of history entries grouped by date
 */
export interface HistorySection {
  title: string;
  entries: Conversation[];
  key?: string | number;
}

/**
 * Fetches paginated history from the API
 */
export const fetchPagedHistory = async (
    params: {
      currentPage: number,
      pageSize: number,
      selectedMonth: string,
      selectedYear: number,
      showCompletedOnly: boolean
    }
  ): Promise<{
    chatHistory: Conversation[],
    pagination: PaginationData | null,
    error?: Error
  }> => {
    try {
      // Build API parameters with proper types
      const apiParams: HistoryParams = {
        page: params.currentPage,
        page_size: params.pageSize
      };
      
      // Only add month/year if selected
      if (params.selectedMonth !== '') {
        apiParams.month = params.selectedMonth;
        apiParams.year = params.selectedYear.toString();
      }
      
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
   * Fetches the first entry date from the API
   */
  export const fetchFirstEntryDate = async (): Promise<Date | null> => {
    try {
      const response = await UserHistoryService.fetchFirstEntryDate();
      if (response.firstEntryDate) {
        return new Date(response.firstEntryDate);
      }
      return null;
    } catch (error) {
      console.error('Error fetching first entry date:', error);
      return null;
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
 * Gets the list of available years based on subscription plan and first entry date
 */
export const getAvailableYears = (
  subscriptionPlan: SubscriptionPlan = SUBSCRIPTION_PLAN.FREE,
  firstEntryDate: Date | null
): number[] => {
  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
  const years: number[] = [];

  if (subscriptionPlan === SUBSCRIPTION_PLAN.PREMIUM && firstEntryDate) {
    // For premium users, show years from first entry up to current
    const startYear = firstEntryDate.getFullYear();
    const endYear = now.getFullYear();
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
  } else {
    // For free users, only show years within 90 days
    const startYear = cutoffDate.getFullYear();
    const endYear = now.getFullYear();
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
  }

  return years;
};

/**
 * Gets the list of available months based on subscription plan and selected year
 */
export const getAvailableMonths = (
  subscriptionPlan: SubscriptionPlan = SUBSCRIPTION_PLAN.FREE,
  firstEntryDate: Date | null,
  selectedYear: number
): MonthOption[] => {
  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
  
  let availableMonths = [...MONTH_OPTIONS];

  if (subscriptionPlan === SUBSCRIPTION_PLAN.PREMIUM && firstEntryDate) {
    // For premium users, limit months based on firstEntryDate
    if (selectedYear === firstEntryDate.getFullYear()) {
      availableMonths = availableMonths.filter(month => 
        month.value >= firstEntryDate.getMonth() + 1
      );
    }
  } else {
    // For free users, only show months within 90 days
    if (selectedYear === cutoffDate.getFullYear()) {
      availableMonths = availableMonths.filter(month => 
        month.value >= cutoffDate.getMonth() + 1
      );
    }
    if (selectedYear === now.getFullYear()) {
      availableMonths = availableMonths.filter(month => 
        month.value <= now.getMonth() + 1
      );
    }
  }

  return availableMonths;
};

/**
 * Organizes history entries into sections based on date
 */
export const organizeHistoryByDate = (entries: Conversation[]): HistorySection[] => {
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

/**
 * Determines if upgrade message should be shown
 */
export const shouldShowUpgradeMessage = (
  fullListSize: boolean,
  paginationData: { current_page: number; total_pages: number } | null,
  subscriptionPlan: SubscriptionPlan,
  selectedMonth: string,
  selectedYear: number,
  firstEntryDate: Date | null
): boolean => {
  if (!fullListSize || !paginationData || subscriptionPlan === SUBSCRIPTION_PLAN.PREMIUM) return false;
  
  // Only show on last page
  if (paginationData.current_page !== paginationData.total_pages) return false;

  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
  
  // If viewing a specific month/year (statement view)
  if (selectedMonth !== '') {
    const selectedDate = new Date(selectedYear, parseInt(selectedMonth) - 1, 1);

    // Show upgrade message if the selected date is more than 90 days old
    return selectedDate < cutoffDate;
  }

  // For regular transaction view, show message if there are entries older than 90 days
  return firstEntryDate ? firstEntryDate < cutoffDate : false;
};

/**
 * Gets the appropriate upgrade message text
 */
export const getUpgradeMessageText = (
  selectedMonth: string,
  selectedYear: number
): string => {
  if (!selectedMonth) {
    return 'Unlock your complete transaction history with Premium';
  }

  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
  const selectedDate = new Date(selectedYear, parseInt(selectedMonth) - 1, 1);

  // Calculate months difference
  const monthsDiff = (cutoffDate.getFullYear() - selectedDate.getFullYear()) * 12 + 
                    (cutoffDate.getMonth() - selectedDate.getMonth());

  // If the selected month is close to the 90-day cutoff (within 1 month)
  if (monthsDiff <= 1 && selectedDate < cutoffDate) {
    return 'Any transactions older than 90 days may be hidden from this statement. Unlock all transaction history with Premium';
  }

  // If the selected month is well beyond the 90-day cutoff
  return `Access your complete ${MONTH_OPTIONS.find(m => m.value === parseInt(selectedMonth))?.label} ${selectedYear} transaction history with Premium`;
};