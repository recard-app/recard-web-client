import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { UserCreditService } from '@/services/UserServices/UserCreditService';
import { UserService } from '@/services/UserServices/UserService';
import { CalendarUserCredits, UserCredit } from '@/types/CardCreditsTypes';
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
  const [error, setError] = useState<string | null>(null);

  // Expanded cards state
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  // Modal state
  const [selectedCredit, setSelectedCredit] = useState<SelectedCreditState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AbortController ref for cancelling in-flight requests on rapid year switching
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build credit metadata map from context credits
  const creditMetadataMap = useMemo(() => {
    const map = new Map<string, CardCredit>();
    for (const credit of allCredits) {
      map.set(credit.id, credit);
    }
    return map;
  }, [allCredits]);

  // Organize credits by card ID
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
    return map;
  }, [creditData]);

  // Cards that have credits (sorted: preferred first, then alphabetically)
  const cardsWithCredits = useMemo(() => {
    const filtered = userCardDetails.filter(card => creditsByCard.has(card.id));
    return sortCreditCards(filtered);
  }, [userCardDetails, creditsByCard]);

  // Fetch credit data for selected year
  const fetchCredits = useCallback(async (showLoading: boolean = true) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Only show loading spinner when requested (not during background refreshes)
    if (showLoading) {
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
      }
    }
  }, [selectedYear]);

  // Fetch on mount and when year changes
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits, reloadTrigger]);

  // Cleanup AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle year change
  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    // Collapse all cards when changing year
    setExpandedCardIds(new Set());
  }, []);

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

  // Check if user has any cards with credits (across all years)
  const hasAnyCardsWithCredits = allCredits.length > 0;

  // Empty state - no cards with credits for selected year
  if (cardsWithCredits.length === 0) {
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
            loading={isLoading}
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
          loading={isLoading}
        />
      </HeaderControls>

      {/* Scrollable content area */}
      <div className="portfolio-content">
        {isLoading ? (
          <div className="portfolio-loading">
            <InfoDisplay
              type="loading"
              message="Loading..."
              showTitle={false}
              transparent={true}
              centered={true}
            />
          </div>
        ) : (
          <div className="card-accordions">
            {cardsWithCredits.map(card => (
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
              />
            ))}
          </div>
        )}
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
