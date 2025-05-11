import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import '../../elements/Elements.scss';
import { ToggleSwitch } from '../../elements/Elements';
import { useNavigate } from 'react-router-dom';
import {
  Conversation, 
  PaginationData,
  CreditCard,
  SubscriptionPlan,
  ShowCompletedOnlyPreference
} from '../../types';
import { HISTORY_PAGE_SIZE, SUBSCRIPTION_PLAN } from '../../types';
import { UserPreferencesService } from '../../services/UserService';
import {
  organizeHistoryByDate,
  getAvailableYears,
  getAvailableMonths,
  shouldShowUpgradeMessage,
  getUpgradeMessageText,
  fetchPagedHistory,
  fetchFirstEntryDate,
  handleHistoryDelete
} from './utils';

// Define the page size limit as a constant
const PAGE_SIZE_LIMIT = HISTORY_PAGE_SIZE;

/**
 * Props interface for the HistoryPanel component
 */
export interface HistoryPanelProps {
  existingHistoryList: Conversation[];
  listSize?: number;
  fullListSize: boolean;
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
  showCompletedOnlyPreference: ShowCompletedOnlyPreference;
}

function HistoryPanel({ 
  existingHistoryList, 
  listSize, 
  fullListSize, 
  currentChatId,
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan = SUBSCRIPTION_PLAN.FREE,
  creditCards,
  historyRefreshTrigger,
  showCompletedOnlyPreference
}: HistoryPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Current page number in pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Pagination metadata from the API
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
  // Loading state for API requests
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // List of paginated conversations
  const [paginatedList, setPaginatedList] = useState<Conversation[]>([]);
  // Selected month for filtering
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  // Selected year for filtering
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  // Date of the first entry in history
  const [firstEntryDate, setFirstEntryDate] = useState<Date | null>(null);
  // Show completed only preference
  const [showCompletedOnly, setShowCompletedOnly] = useState<boolean>(showCompletedOnlyPreference);
  // Loading state for toggling completed only preference
  const [isTogglingCompleted, setIsTogglingCompleted] = useState<boolean>(false);

  // Effect to update showCompletedOnly when the preference changes
  useEffect(() => {
    // Only update the local state if the preference changed
    if (showCompletedOnly !== showCompletedOnlyPreference) {
      setShowCompletedOnly(showCompletedOnlyPreference);
    }
  }, [showCompletedOnlyPreference]); // Remove historyRefreshTrigger dependency

  // Initial loading state based on whether we have history
  useEffect(() => {
    setIsLoading(existingHistoryList.length === 0);
  }, []);

  /**
   * Effect hook to fetch history when page changes
   */
  useEffect(() => {
    if (user && fullListSize) {
      fetchPagedHistoryData();
    }
  }, [currentPage, historyRefreshTrigger]);

  /**
   * Effect hook to fetch history when filters change
   */
  useEffect(() => {
    if (user && fullListSize) {
      setCurrentPage(1); // Reset to first page when filters change
      fetchPagedHistoryData();
    } else if (!fullListSize) {
      setPaginatedList([...existingHistoryList]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, listSize));
    }
  }, [fullListSize, user, selectedMonth, selectedYear, showCompletedOnly]);

  /**
   * Effect hook to fetch first entry date on mount
   */
  useEffect(() => {
    if (user && fullListSize) {
      fetchFirstEntryDateData();
    }
  }, [user, fullListSize]);

  if (!user) return null;

  const handleClearFilter = () => {
    setSelectedMonth('');
    setCurrentPage(1);
  };

  /**
   * Wrapper function to fetch paginated history and update state - for view all history page essentially
   */
  const fetchPagedHistoryData = async () => {
    if (!user || !fullListSize) return;
    
    setIsLoading(true);
    try {
      const result = await fetchPagedHistory({
        currentPage,
        pageSize: PAGE_SIZE_LIMIT,
        selectedMonth,
        selectedYear,
        showCompletedOnly
      });
      
      if (result.chatHistory) {
        setPaginatedList(result.chatHistory);
        setPaginationData(result.pagination);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Wrapper function to fetch first entry date and update state
   */
  const fetchFirstEntryDateData = async () => {
    const date = await fetchFirstEntryDate();
    setFirstEntryDate(date);
  };

  /**
   * Wrapper function to handle deletion
   */
  const handleDelete = async (deletedChatId: string) => {
    handleHistoryDelete(deletedChatId, currentChatId, returnCurrentChatId, onHistoryUpdate);
  };

  /**
   * Forces a refresh of the history data
   */
  const forceHistoryRefresh = async () => {
    try {
      // Trigger history refresh via onHistoryUpdate
      onHistoryUpdate(prevHistory => [...prevHistory]);
      return true; // Return success
    } catch (error) {
      console.error('Failed to refresh history:', error);
      return false; // Return failure
    }
  };

  // Use paginatedList instead of displayList for the full view
  const displayList = fullListSize 
    ? paginatedList 
    : existingHistoryList
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, listSize);

  /**
   * Handles the toggle of completed transactions filter
   * @param newValue The new toggle state
   */
  const handleCompletedToggle = async (newValue: boolean) => {
    // Skip if already toggling or if the new value is the same as current
    if (isTogglingCompleted || newValue === showCompletedOnly) return;
    
    try {
      setIsTogglingCompleted(true);
      // Update local state immediately for responsive UI
      setShowCompletedOnly(newValue);
      
      // Update the preference on the server
      await UserPreferencesService.updateShowCompletedOnlyPreference(newValue);
      
      // Use onHistoryUpdate to trigger the historyRefreshTrigger in App.tsx
      // This causes App.tsx to re-fetch the preference from the database
      onHistoryUpdate(prev => [...prev]);
    } catch (error) {
      // Revert the toggle if the update fails
      setShowCompletedOnly(!newValue);
      console.error('Failed to update show completed only preference:', error);
    } finally {
      setIsTogglingCompleted(false);
    }
  };

  /**
   * Renders pagination controls
   * @returns JSX for pagination controls
   */
  const renderPagination = () => {
    if (!paginationData || !fullListSize) return null;

    const totalPages = paginationData.total_pages;
    const currentPage = paginationData.current_page;

    // Calculate which page numbers to show
    let pageNumbers: number[] = [];
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all pages
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Calculate the range of pages to show
      let start = Math.max(currentPage - 2, 1);
      let end = Math.min(start + 4, totalPages);

      // Adjust start if we're near the end
      if (end === totalPages) {
        start = Math.max(end - 4, 1);
      }
      // Adjust end if we're near the start
      if (start === 1) {
        end = Math.min(5, totalPages);
      }

      pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    return (
      <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="pagination-edge-button"
        >
          &lt;&lt;
        </button>
        <button 
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={!paginationData.has_previous}
          className="pagination-nav-button"
        >
          &lt;
        </button>
        <div className="pagination-numbers">
          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!paginationData.has_next}
          className="pagination-nav-button"
        >
          &gt;
        </button>
        <button 
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-edge-button"
        >
          &gt;&gt;
        </button>
      </div>
    );
  };

  /**
   * Renders the upgrade message if needed
   * @returns JSX for upgrade message
   */
  const renderUpgradeMessage = () => {
    if (!shouldShowUpgradeMessage(fullListSize, paginationData, subscriptionPlan, selectedMonth, selectedYear, firstEntryDate)) return null;

    return (
      <div className="upgrade-message">
        <p>{getUpgradeMessageText(selectedMonth, selectedYear)}</p>
      </div>
    );
  };

  /**
   * Renders the date filter controls
   * @returns JSX for date filter controls
   */
  const renderDateFilter = () => {
    if (!fullListSize) return null;

    return (
      <div className="date-filter">
        <label className="filter-label">View Monthly Statement</label>
        <div className={`filter-wrapper ${selectedMonth && selectedYear ? 'active' : ''}`}>
          <select 
            value={selectedYear}
            onChange={(e) => {
              const newYear = e.target.value ? parseInt(e.target.value) : selectedYear;
              setSelectedYear(newYear);
              // Reset month when year changes to prevent invalid combinations
              setSelectedMonth('');
              setCurrentPage(1);
            }}
            className="year-select"
          >
            <option value="">Select Year</option>
            {getAvailableYears(subscriptionPlan, firstEntryDate).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select 
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="month-select"
            disabled={!selectedYear}
          >
            <option value="">Select Month</option>
            {selectedYear && getAvailableMonths(subscriptionPlan, firstEntryDate, selectedYear).map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {selectedMonth && (
            <button 
              className="clear-filter"
              onClick={handleClearFilter}
              aria-label="Clear filter"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renders the completed transactions toggle
   * @returns JSX for completed transactions toggle
   */
  const renderCompletedToggle = () => {
    if (!fullListSize) return null;

    return (
      <ToggleSwitch
        id="completedToggle"
        label="Only show completed transactions"
        checked={showCompletedOnly}
        onChange={handleCompletedToggle}
        disabled={isTogglingCompleted}
      />
    );
  };

  return (
    <div className='history-panel'>
      {!fullListSize && <h2>Recent Transactions</h2>}
      {fullListSize && renderDateFilter()}
      {fullListSize && renderCompletedToggle()}
      {isLoading && displayList.length === 0 ? (
        <p>Loading transaction history...</p>
      ) : displayList.length === 0 ? (
        <p>No transaction history available for this period</p>
      ) : (
        <>
          {fullListSize ? (
            <>
              {/* Show filtered results without categories */}
              {(selectedMonth !== '') ? (
                <div className="history-entries">
                  {displayList.map(entry => (
                    <HistoryEntry 
                      key={entry.chatId} 
                      chatEntry={entry}
                      currentChatId={currentChatId}
                      onDelete={handleDelete}
                      refreshHistory={forceHistoryRefresh}
                      returnCurrentChatId={returnCurrentChatId}
                      creditCards={creditCards}
                    />
                  ))}
                </div>
              ) : (
                // Show categorized view only when no filters are applied
                organizeHistoryByDate(displayList).map(section => (
                  <div key={section.title} className="history-section">
                    <h3 className="section-title">{section.title}</h3>
                    {section.entries.map(entry => (
                      <HistoryEntry 
                        key={entry.chatId} 
                        chatEntry={entry}
                        currentChatId={currentChatId}
                        onDelete={handleDelete}
                        refreshHistory={forceHistoryRefresh}
                        returnCurrentChatId={returnCurrentChatId}
                        creditCards={creditCards}
                      />
                    ))}
                  </div>
                ))
              )}
              {renderUpgradeMessage()}
              {renderPagination()}
            </>
          ) : (
            // Show simple list for sidebar view
            displayList.map(entry => (
              <HistoryEntry 
                key={entry.chatId} 
                chatEntry={entry}
                currentChatId={currentChatId}
                onDelete={handleDelete}
                refreshHistory={forceHistoryRefresh}
                returnCurrentChatId={returnCurrentChatId}
                creditCards={creditCards}
              />
            ))
          )}
          {!fullListSize && (
            <button 
              className="view-all-button"
              onClick={() => navigate('/history')}
            >
              View All History
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default HistoryPanel;