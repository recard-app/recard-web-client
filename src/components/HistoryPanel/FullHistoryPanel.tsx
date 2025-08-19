import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import { ToggleSwitch, InfoDisplay } from '../../elements';
import Icon from '../../icons';
import {
  Drawer,
  DrawerContent,
  DrawerTitle
} from '../ui/drawer';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import {
  Conversation, 
  PaginationData,
  CreditCard,
  SubscriptionPlan,
  ShowCompletedOnlyPreference,
  SHOW_SUBSCRIPTION_MENTIONS
} from '../../types';
import { HISTORY_PAGE_SIZE, SUBSCRIPTION_PLAN } from '../../types';
// Note: Do not update user preferences from this page; the toggle here is a local filter override
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import HeaderControls from '@/components/PageControls/HeaderControls';
import FooterControls from '@/components/PageControls/FooterControls';

// Define the page size limit as a constant
const PAGE_SIZE_LIMIT = HISTORY_PAGE_SIZE;

/**
 * Props interface for the FullHistoryPanel component
 */
export interface FullHistoryPanelProps {
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
  showCompletedOnlyPreference: ShowCompletedOnlyPreference;
  // Mobile filters drawer control (optional; if not provided, component manages its own state)
  filtersDrawerOpen?: boolean;
  onFiltersDrawerOpenChange?: (open: boolean) => void;
}

function FullHistoryPanel({ 
  currentChatId,
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan = SUBSCRIPTION_PLAN.FREE,
  creditCards,
  historyRefreshTrigger,
  showCompletedOnlyPreference,
  filtersDrawerOpen,
  onFiltersDrawerOpenChange
}: FullHistoryPanelProps) {
  const { user } = useAuth();
  // Use scroll height for this component's scrollable area
  useScrollHeight(true);
  
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
  // Local override for "Only show completed" filter.
  // null means use the user preference value provided via props.
  const [showCompletedOnlyFilter, setShowCompletedOnlyFilter] = useState<boolean | null>(null);
  // Mobile filters drawer state (uncontrolled fallback)
  const [isFiltersDrawerOpenInternal, setIsFiltersDrawerOpenInternal] = useState<boolean>(false);
  const isFiltersDrawerOpen = typeof filtersDrawerOpen === 'boolean' ? filtersDrawerOpen : isFiltersDrawerOpenInternal;
  const setIsFiltersDrawerOpen = (open: boolean) => {
    if (onFiltersDrawerOpenChange) onFiltersDrawerOpenChange(open);
    else setIsFiltersDrawerOpenInternal(open);
  };

  // Removed session storage persistence in favor of App-scoped state

  // Compute effective value from local override or user preference
  const effectiveShowCompletedOnly: boolean = (showCompletedOnlyFilter !== null)
    ? showCompletedOnlyFilter
    : showCompletedOnlyPreference;

  // Initial loading state
  useEffect(() => {
    setIsLoading(true);
  }, []);

  // No external syncing

  /**
   * Effect hook to fetch history when page changes
   */
  useEffect(() => {
    if (user) {
      fetchPagedHistoryData();
    }
  }, [currentPage, historyRefreshTrigger]);

  /**
   * Effect hook to fetch history when filters change
   */
  useEffect(() => {
    if (user) {
      setCurrentPage(1); // Reset to first page when filters change
      fetchPagedHistoryData();
    }
  }, [user, selectedMonth, selectedYear, showCompletedOnlyFilter, showCompletedOnlyPreference]);

  // No propagation

  /**
   * Effect hook to fetch first entry date on mount
   */
  useEffect(() => {
    if (user) {
      fetchFirstEntryDateData();
    }
  }, [user]);

  if (!user) return null;

  const handleClearFilter = () => {
    setSelectedMonth('');
    setCurrentPage(1);
  };

  /**
   * Resets all filters to default state
   * - Month cleared
   * - Year set to current year
   * - Completed toggle set to user preference default
   */
  const handleResetFilters = () => {
    const currentYear = new Date().getFullYear();
    setSelectedMonth('');
    setSelectedYear(currentYear);
    setShowCompletedOnlyFilter(null);
    setCurrentPage(1);
  };

  /**
   * Wrapper function to fetch paginated history and update state
   */
  const fetchPagedHistoryData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await fetchPagedHistory({
        currentPage,
        pageSize: PAGE_SIZE_LIMIT,
        selectedMonth,
        selectedYear,
         showCompletedOnly: effectiveShowCompletedOnly
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

  /**
   * Handles the toggle of completed transactions filter
   * @param newValue The new toggle state
   */
  const handleCompletedToggle = async (newValue: boolean) => {
    // Locally override the preference for this page until filters are reset
    setShowCompletedOnlyFilter(newValue);
  };

  /**
   * Renders pagination controls
   * @returns JSX for pagination controls
   */
  const renderPagination = () => {
    if (!paginationData) return null;

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

    const handleAnchorClick = (
      e: React.MouseEvent<HTMLAnchorElement>,
      handler: () => void,
      isDisabled?: boolean
    ) => {
      e.preventDefault();
      if (isDisabled) return;
      handler();
    };

    return (
      <Pagination className="history-pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to first page"
              onClick={(e) => handleAnchorClick(e, () => setCurrentPage(1), currentPage === 1)}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            >
              «
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => handleAnchorClick(e, () => setCurrentPage(prev => Math.max(1, prev - 1)), !paginationData.has_previous)}
              aria-disabled={!paginationData.has_previous}
              className={!paginationData.has_previous ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {/* Optional left ellipsis */}
          {totalPages > 5 && pageNumbers[0] > 1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                isActive={pageNum === currentPage}
                onClick={(e) => handleAnchorClick(e, () => setCurrentPage(pageNum))}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Optional right ellipsis */}
          {totalPages > 5 && pageNumbers[pageNumbers.length - 1] < totalPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => handleAnchorClick(e, () => setCurrentPage(prev => Math.min(totalPages, prev + 1)), !paginationData.has_next)}
              aria-disabled={!paginationData.has_next}
              className={!paginationData.has_next ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to last page"
              onClick={(e) => handleAnchorClick(e, () => setCurrentPage(totalPages), currentPage === totalPages)}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            >
              »
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  /**
   * Renders the upgrade message if needed
   * @returns JSX for upgrade message
   */
  const renderUpgradeMessage = () => {
    if (!SHOW_SUBSCRIPTION_MENTIONS || !shouldShowUpgradeMessage(true, paginationData, subscriptionPlan, selectedMonth, selectedYear, firstEntryDate)) return null;

    return (
      <InfoDisplay
        type="info"
        message={getUpgradeMessageText(selectedMonth, selectedYear)}
        showTitle={false}
        transparent={false}
      />
    );
  };

  /**
   * Renders the date filter controls
   * @returns JSX for date filter controls
   */
  const renderDateFilter = () => {
    return (
      <div className="date-filter statement-filter">
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
            className="year-select default-select"
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
            className="month-select default-select"
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
    return (
      <ToggleSwitch
        id="completedToggle"
        label="Only show completed transactions"
        checked={effectiveShowCompletedOnly}
        onChange={handleCompletedToggle}
      />
    );
  };

  return (
    <div className="history-panel full-history">
      {/* Sticky header with filters and toggle */}
      <HeaderControls className="history-panel-header">
        <div className="header-controls desktop-only">
          {renderDateFilter()}
          {renderCompletedToggle()}
        </div>
        <div className="header-actions">
          <button
            className="button outline small desktop-only"
            onClick={handleResetFilters}
            aria-label="Reset filters to defaults"
          >
            Reset Filters
          </button>
          <button
            className="button small mobile-only icon with-text"
            onClick={() => setIsFiltersDrawerOpen(true)}
            aria-label="Open filters drawer"
          >
            <Icon name="filter" variant="mini" size={16} />
            Filters
          </button>
        </div>
      </HeaderControls>

      {/* Scrollable content area */}
      <div className="history-panel-content">
        {isLoading && paginatedList.length === 0 ? (
          <div className="loading-history">
            <InfoDisplay
              type="loading"
              message="Loading transaction history..."
              showTitle={false}
              transparent={true}
              centered
            />
          </div>
        ) : paginatedList.length === 0 ? (
          <InfoDisplay
            type="default"
            message="No transaction history available for this period"
            showTitle={false}
            transparent={true}
            showIcon={false}
            centered
          />
        ) : (
          <>
            {/* Show filtered results without categories */}
            {(selectedMonth !== '') ? (
              <div className="section-entries">
                {paginatedList.map(entry => (
                  <HistoryEntry 
                    key={entry.chatId} 
                    chatEntry={entry}
                    currentChatId={currentChatId}
                    onDelete={handleDelete}
                    refreshHistory={forceHistoryRefresh}
                    returnCurrentChatId={returnCurrentChatId}
                    creditCards={creditCards}
                    variant="full-page"
                  />
                ))}
              </div>
            ) : (
              // Show categorized view only when no filters are applied
              organizeHistoryByDate(paginatedList).map(section => (
                <div key={section.title} className="history-section">
                  <div className="section-header">
                    <p className="section-title">{section.title}</p>
                  </div>
                  <div className="section-entries">
                    {section.entries.map(entry => (
                      <HistoryEntry 
                        key={entry.chatId} 
                        chatEntry={entry}
                        currentChatId={currentChatId}
                        onDelete={handleDelete}
                        refreshHistory={forceHistoryRefresh}
                        returnCurrentChatId={returnCurrentChatId}
                        creditCards={creditCards}
                        variant="full-page"
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
            {renderUpgradeMessage()}
          </>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer open={isFiltersDrawerOpen} onOpenChange={setIsFiltersDrawerOpen}>
        <DrawerContent className="mobile-history-filters-drawer" fitContent>
          <DrawerTitle className="sr-only">Filters</DrawerTitle>
          <div className="dialog-header drawer-sticky-header history-filters-header">
            <h2>Filters</h2>
            <div className="header-actions">
              <span
                className="reset-link"
                onClick={handleResetFilters}
                role="button"
                tabIndex={0}
                aria-label="Reset filters to defaults"
              >
                Reset
              </span>
            </div>
          </div>
          <div className="dialog-body">
            {renderDateFilter()}
            {renderCompletedToggle()}
          </div>
          <div className="dialog-footer">
            <div className="button-group">
              <button
                className="button"
                onClick={() => setIsFiltersDrawerOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Sticky footer with pagination */}
      {paginationData && (
        <FooterControls className="history-panel-footer">
          {renderPagination()}
        </FooterControls>
      )}
    </div>
  );
}

export default FullHistoryPanel; 