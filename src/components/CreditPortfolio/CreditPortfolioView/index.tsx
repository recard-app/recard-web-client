import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { UserCreditService } from '@/services/UserServices/UserCreditService';
import { UserService } from '@/services/UserServices/UserService';
import { CalendarUserCredits, UserCredit, CREDIT_PERIODS } from '@/types/CardCreditsTypes';
import { CardCredit, CreditCardDetails } from '@/types/CreditCardTypes';
import { useCredits } from '@/contexts/ComponentsContext';
import { InfoDisplay, ErrorWithRetry } from '@/elements';
import { buildYearOptions } from '@/pages/my-credits/utils';
import HeaderControls from '@/components/PageControls/HeaderControls';
import YearDropdown from '../YearDropdown';
import CreditCardAccordion from '../CreditCardAccordion';
import CreditEditModal from '../CreditEditModal';
import { CreditPortfolioViewProps, SelectedCreditState } from '../types';
import './CreditPortfolioView.scss';

// Sort cards: preferred first, then alphabetically
const sortCreditCards = (cards: CreditCardDetails[]): CreditCardDetails[] => {
  return [...cards].sort((a, b) => {
    // Sort default card first
    if (a.isDefaultCard !== b.isDefaultCard) {
      return a.isDefaultCard ? -1 : 1;
    }
    // Then sort alphabetically by name
    return a.CardName.localeCompare(b.CardName);
  });
};

// Period type sort order (lower = first): monthly -> quarterly -> semiannually -> annually -> anniversary
const PERIOD_SORT_ORDER: Record<string, number> = {
  [CREDIT_PERIODS.Monthly]: 1,
  [CREDIT_PERIODS.Quarterly]: 2,
  [CREDIT_PERIODS.Semiannually]: 3,
  [CREDIT_PERIODS.Annually]: 4
};

// Get sort order for a credit (handles anniversary-based credits)
const getCreditSortOrder = (credit: UserCredit): number => {
  // Anniversary-based credits go after annually (order 5)
  if (credit.isAnniversaryBased) {
    return 5;
  }
  return PERIOD_SORT_ORDER[credit.AssociatedPeriod] ?? 99;
};

// Sort credits: by period type, then alphabetically by title
const sortCredits = (
  credits: UserCredit[],
  creditMetadata: Map<string, CardCredit>
): UserCredit[] => {
  return [...credits].sort((a, b) => {
    // First sort by period type (with anniversary handling)
    const periodOrderA = getCreditSortOrder(a);
    const periodOrderB = getCreditSortOrder(b);

    if (periodOrderA !== periodOrderB) {
      return periodOrderA - periodOrderB;
    }

    // Then sort alphabetically by title
    const titleA = creditMetadata.get(a.CreditId)?.Title ?? '';
    const titleB = creditMetadata.get(b.CreditId)?.Title ?? '';
    return titleA.localeCompare(titleB);
  });
};

const CreditPortfolioView: React.FC<CreditPortfolioViewProps> = ({
  userCardDetails,
  reloadTrigger = 0,
  onRefreshMonthlyStats,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating,
  onClearAllUpdatingCredits
}) => {
  // Get all credits from context
  const allCredits = useCredits();

  // Year selection state
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);

  // Fetch account creation date on mount for dynamic year range
  useEffect(() => {
    const fetchAccountDate = async () => {
      const date = await UserService.fetchAccountCreationDate();
      setAccountCreatedAt(date);
    };
    fetchAccountDate();
  }, []);

  // Dynamic year options based on account creation date
  const availableYears = useMemo(() => {
    return buildYearOptions(accountCreatedAt);
  }, [accountCreatedAt]);

  // Credit data state
  const [creditData, setCreditData] = useState<CalendarUserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearLoading, setIsYearLoading] = useState(false);  // Track year-change loading separately
  const [error, setError] = useState<string | null>(null);

  // Expanded cards state
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  // Track cards from previous year to preserve expanded state during year changes
  const [previousCardsWithCredits, setPreviousCardsWithCredits] = useState<CreditCardDetails[]>([]);

  // Modal state
  const [selectedCredit, setSelectedCredit] = useState<SelectedCreditState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AbortController ref for cancelling in-flight requests on rapid year switching
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track if initial load has completed (to distinguish year changes from initial load)
  const hasInitialLoadCompleted = useRef(false);

  // Scroll container ref for preserving scroll position during year changes
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);

  // Build credit metadata map from context credits
  const creditMetadataMap = useMemo(() => {
    const map = new Map<string, CardCredit>();
    for (const credit of allCredits) {
      map.set(credit.id, credit);
    }
    return map;
  }, [allCredits]);

  // Organize credits by card ID and sort within each card
  const creditsByCard = useMemo(() => {
    const map = new Map<string, UserCredit[]>();
    if (!creditData?.Credits) return map;

    for (const credit of creditData.Credits) {
      const cardId = credit.CardId;
      if (!map.has(cardId)) {
        map.set(cardId, []);
      }
      map.get(cardId)!.push(credit);
    }

    // Sort credits within each card by period type, then alphabetically
    for (const [cardId, credits] of map) {
      map.set(cardId, sortCredits(credits, creditMetadataMap));
    }

    return map;
  }, [creditData, creditMetadataMap]);

  // Cards that have credits (sorted: preferred first, then alphabetically)
  const cardsWithCredits = useMemo(() => {
    const filtered = userCardDetails.filter(card => creditsByCard.has(card.id));
    return sortCreditCards(filtered);
  }, [userCardDetails, creditsByCard]);

  // Merge cards for display: show current cards plus any expanded cards from previous year
  // This preserves expanded accordions even if the card has no data in the new year
  const displayCards = useMemo(() => {
    if (previousCardsWithCredits.length === 0) {
      return cardsWithCredits;
    }
    // Merge: current cards + expanded previous cards that aren't in current
    const currentIds = new Set(cardsWithCredits.map(c => c.id));
    const expandedPreviousNotInCurrent = previousCardsWithCredits.filter(
      c => !currentIds.has(c.id) && expandedCardIds.has(c.id)
    );
    if (expandedPreviousNotInCurrent.length === 0) {
      return cardsWithCredits;
    }
    return sortCreditCards([...cardsWithCredits, ...expandedPreviousNotInCurrent]);
  }, [cardsWithCredits, previousCardsWithCredits, expandedCardIds]);

  // Check if user has any cards with credits (across all years)
  const hasAnyCardsWithCredits = allCredits.length > 0;

  // Fetch credit data for selected year
  // isYearChange: true = year change (use pulse animation), false = initial/background load
  const fetchCredits = useCallback(async (showLoading: boolean = true, isYearChange: boolean = false) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Use different loading states for year changes vs initial load
    if (isYearChange) {
      setIsYearLoading(true);
    } else if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // First sync to ensure all credits exist for the year
      const data = await UserCreditService.syncYearCreditsDebounced(selectedYear, {
        excludeHidden: true
      });

      // Only update state if request wasn't aborted
      if (!signal.aborted) {
        setCreditData(data);
        // Don't clear previousCardsWithCredits here - keep them until next year change
        // so expanded cards without data in new year remain visible
      }
    } catch (err) {
      // Ignore aborted requests
      if ((err as Error).name === 'AbortError' || signal.aborted) {
        return;
      }
      console.error('Failed to fetch credits:', err);
      if (!signal.aborted) {
        setError('Failed to load credit history. Please try again.');
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
        setIsYearLoading(false);
      }
    }
  }, [selectedYear]);

  // Fetch on mount and when year changes
  useEffect(() => {
    const isYearChange = hasInitialLoadCompleted.current;
    fetchCredits(true, isYearChange).then(() => {
      hasInitialLoadCompleted.current = true;
    });
  }, [fetchCredits, reloadTrigger]);

  // Cleanup AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Restore scroll position after year loading completes
  useEffect(() => {
    if (!isYearLoading && savedScrollPosition.current > 0 && scrollContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = savedScrollPosition.current;
          savedScrollPosition.current = 0; // Reset after restoring
        }
      });
    }
  }, [isYearLoading]);

  // Handle year change - preserve expanded state and show pulse animation
  const handleYearChange = useCallback((year: number) => {
    // Save scroll position before year change
    if (scrollContainerRef.current) {
      savedScrollPosition.current = scrollContainerRef.current.scrollTop;
    }
    // Save current cards before changing year to preserve expanded accordion state
    setPreviousCardsWithCredits(cardsWithCredits);
    setSelectedYear(year);
    // DON'T reset expandedCardIds - keep accordions open during year change
  }, [cardsWithCredits]);

  // Toggle card expansion
  const toggleCard = useCallback((cardId: string) => {
    setExpandedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  // Handle period click - open modal
  const handlePeriodClick = useCallback((
    credit: UserCredit,
    cardCredit: CardCredit,
    periodNumber: number,
    anniversaryYear?: number
  ) => {
    // Find the card for this credit
    const card = userCardDetails.find(c => c.id === credit.CardId);
    if (!card) return;

    setSelectedCredit({
      credit,
      card,
      cardCredit,
      periodNumber,
      anniversaryYear
    });
    setIsModalOpen(true);
  }, [userCardDetails]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    // Clear selected credit after animation
    setTimeout(() => setSelectedCredit(null), 300);
  }, []);

  // Handle update complete - refresh data
  const handleUpdateComplete = useCallback(async () => {
    // Refresh credit data silently (no loading spinner)
    await fetchCredits(false);

    // Notify parent to refresh monthly stats
    if (onRefreshMonthlyStats) {
      onRefreshMonthlyStats();
    }

    // Clear all updating indicators
    if (onClearAllUpdatingCredits) {
      onClearAllUpdatingCredits();
    }
  }, [fetchCredits, onRefreshMonthlyStats, onClearAllUpdatingCredits]);

  // Check if a specific credit period is updating
  const isUpdatingPeriod = useCallback((cardId: string, creditId: string, periodNumber: number): boolean => {
    if (!isCreditUpdating) return false;
    return isCreditUpdating(cardId, creditId, periodNumber);
  }, [isCreditUpdating]);

  // Loading state
  if (isLoading && !creditData) {
    return (
      <div className="credit-portfolio-panel">
        <div className="portfolio-content">
          <div className="portfolio-loading">
            <InfoDisplay
              type="loading"
              message="Loading credit history..."
              showTitle={false}
              transparent={true}
              centered={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="credit-portfolio-panel">
        <div className="portfolio-content">
          <ErrorWithRetry message={error} onRetry={fetchCredits} fillContainer />
        </div>
      </div>
    );
  }

  // Empty state - no cards with credits for selected year
  // Skip empty state if we have cards to display (either current or expanded previous)
  if (displayCards.length === 0) {
    // Differentiate message based on whether user has credits at all
    const emptyMessage = hasAnyCardsWithCredits
      ? `No credit usage tracked for ${selectedYear}. Select a different year or update your credit usage.`
      : 'No credit cards with credits found. Add credit cards with credits to start tracking.';

    return (
      <div className="credit-portfolio-panel">
        <HeaderControls className="portfolio-header-controls">
          <YearDropdown
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            availableYears={availableYears}
            loading={isLoading || isYearLoading}
          />
        </HeaderControls>

        <div className="portfolio-content">
          <div className="portfolio-empty">
            <InfoDisplay
              type="info"
              message={emptyMessage}
              showTitle={false}
              transparent={true}
              centered={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-portfolio-panel">
      <HeaderControls className="portfolio-header-controls">
        <YearDropdown
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          availableYears={availableYears}
          loading={isLoading || isYearLoading}
        />
      </HeaderControls>

      {/* Scrollable content area */}
      <div ref={scrollContainerRef} className="portfolio-content">
        <div className="card-accordions">
          {displayCards.map(card => (
            <CreditCardAccordion
              key={card.id}
              card={card}
              credits={creditsByCard.get(card.id) || []}
              creditMetadata={creditMetadataMap}
              year={selectedYear}
              isExpanded={expandedCardIds.has(card.id)}
              onToggle={() => toggleCard(card.id)}
              onPeriodClick={handlePeriodClick}
              isUpdating={(creditId, periodNumber) => isUpdatingPeriod(card.id, creditId, periodNumber)}
              isLoading={isYearLoading}
            />
          ))}
        </div>
      </div>

      {/* Credit Edit Modal */}
      <CreditEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        userCredit={selectedCredit?.credit ?? null}
        card={selectedCredit?.card ?? null}
        cardCredit={selectedCredit?.cardCredit ?? null}
        initialPeriodNumber={selectedCredit?.periodNumber}
        year={selectedYear}
        onUpdateComplete={handleUpdateComplete}
        isUpdating={selectedCredit ? isCreditUpdating?.(
          selectedCredit.card.id,
          selectedCredit.credit.CreditId,
          selectedCredit.periodNumber
        ) : false}
        onAddUpdatingCreditId={onAddUpdatingCreditId}
        onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
      />
    </div>
  );
};

export default CreditPortfolioView;
