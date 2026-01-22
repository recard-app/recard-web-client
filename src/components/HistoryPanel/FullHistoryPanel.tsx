import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import { InfoDisplay, ErrorWithRetry } from '../../elements';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import {
  Conversation,
  LightweightConversation,
  PaginationData,
  CreditCard,
  TERMINOLOGY,
  HISTORY_PAGE_SIZE
} from '../../types';
import {
  organizeHistoryByDate,
  fetchPagedHistory,
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
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
}

function FullHistoryPanel({
  currentChatId,
  returnCurrentChatId,
  onHistoryUpdate,
  creditCards,
  historyRefreshTrigger
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
  // Error state for fetch failures
  const [fetchError, setFetchError] = useState<string | null>(null);
  // List of paginated conversations
  const [paginatedList, setPaginatedList] = useState<LightweightConversation[]>([]);

  // Ref to track if component has mounted to prevent duplicate initial API calls
  const hasMountedRef = useRef(false);

  // Fetch data function
  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    setFetchError(null);
    try {
      const result = await fetchPagedHistory({
        currentPage,
        pageSize: PAGE_SIZE_LIMIT
      });

      if (result.chatHistory) {
        setPaginatedList(result.chatHistory);
        setPaginationData(result.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setFetchError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount, page change, or refresh trigger
  useEffect(() => {
    if (!user) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
    }

    fetchData();
  }, [user, currentPage, historyRefreshTrigger]);

  if (!user) return null;

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

  return (
    <div className="history-panel full-history">
      {/* Scrollable content area */}
      <div className="history-panel-content">
        {fetchError ? (
          <ErrorWithRetry
            message={fetchError}
            onRetry={fetchData}
            fillContainer
          />
        ) : isLoading && paginatedList.length === 0 ? (
          <div className="loading-history">
            <InfoDisplay
              type="loading"
              message={TERMINOLOGY.loadingHistory}
              showTitle={false}
              transparent={true}
              centered
            />
          </div>
        ) : paginatedList.length === 0 ? (
          <InfoDisplay
            type="default"
            message={TERMINOLOGY.emptyHistoryForPeriod}
            showTitle={false}
            transparent={true}
            showIcon={false}
            centered
          />
        ) : (
          <>
            {organizeHistoryByDate(paginatedList).map(section => (
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
            ))}
          </>
        )}
      </div>

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