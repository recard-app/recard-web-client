import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, CalendarUserCredits, UserCredit, CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS } from '../../types';
import { UserCreditCardService } from '../../services';
import CreditsDisplay from '../../components/CreditsDisplay';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import { PrioritizedCredit } from '../../types';
import { MonthlyStatsResponse } from '../../types/CardCreditsTypes';
import Icon from '../../icons';
import { InfoDisplay, ErrorWithRetry } from '../../elements';
import CreditsDisplaySkeleton from '../../components/CreditsDisplay/CreditsDisplaySkeleton';
import HeaderControls from '@/components/PageControls/HeaderControls';
import CreditSummary from '../../components/CreditSummary';
import CreditsTabFooter from '@/components/PageControls/CreditsTabFooter';
import { useFullHeight } from '../../hooks/useFullHeight';
import { useEdgeToEdge } from '../../hooks/useEdgeToEdge';
import { useComponents } from '../../contexts/useComponents';
import FilterChips, { CreditFilter } from './FilterChips';
import './shared-credits-layout.scss';
import './MyCredits.scss';

interface MyCreditsProps {
  monthlyStats: MonthlyStatsResponse | null;
  isLoadingMonthlyStats: boolean;
  prioritizedCredits: PrioritizedCredit[];
  isLoadingPrioritizedCredits: boolean;
  onRefreshMonthlyStats?: () => void;
  isUpdatingMonthlyStats?: boolean;
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
  onDetailedSummaryClick?: () => void;
}

const MyCredits: React.FC<MyCreditsProps> = ({
  monthlyStats,
  isLoadingMonthlyStats,
  prioritizedCredits,
  isLoadingPrioritizedCredits,
  onRefreshMonthlyStats,
  isUpdatingMonthlyStats,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating,
  onDetailedSummaryClick
}) => {
  // Use the full height hook for this page
  useFullHeight(true);
  useEdgeToEdge(true);

  const [userCards, setUserCards] = useState<CreditCardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [showRedeemed, setShowRedeemed] = useState(false);
  const [stableFilteredCredits, setStableFilteredCredits] = useState<PrioritizedCredit[]>([]);
  const [hasRequestedPrioritizedCredits, setHasRequestedPrioritizedCredits] = useState(isLoadingPrioritizedCredits);
  const [activeFilter, setActiveFilter] = useState<CreditFilter | null>(null);
  const { isInitialized: isComponentsInitialized, credits: componentCredits } = useComponents();

  const hasInitiallyLoaded =
    isComponentsInitialized && (monthlyStats !== null || (hasRequestedPrioritizedCredits && !isLoadingPrioritizedCredits));

  // Helper to get current period number for a credit
  const getCurrentPeriodNumber = (credit: PrioritizedCredit): number => {
    // For anniversary credits, there's only 1 period
    if (credit.isAnniversaryBased) {
      return 1;
    }

    // Calendar-based calculation
    const now = new Date();
    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === credit.period
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return 1;

    const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
    if (intervals <= 1) return 1;
    const monthZeroBased = now.getMonth();
    const segmentLength = 12 / intervals;
    return Math.min(Math.max(Math.floor(monthZeroBased / segmentLength) + 1, 1), intervals);
  };

  // Helper to get current period CreditUsage from History
  const getCurrentPeriodCreditUsage = (credit: PrioritizedCredit) => {
    const currentPeriodNumber = getCurrentPeriodNumber(credit);
    const currentHistory = credit.History?.find(h => h.PeriodNumber === currentPeriodNumber);
    return currentHistory?.CreditUsage;
  };

  // Update stable credits only when prioritizedCredits or showRedeemed changes
  // This prevents flickering during the filtering/sorting process
  useEffect(() => {
    const newFilteredCredits = showRedeemed
      ? prioritizedCredits
      : prioritizedCredits.filter(credit => {
          const creditUsage = getCurrentPeriodCreditUsage(credit);
          return creditUsage !== CREDIT_USAGE.USED;
        });

    setStableFilteredCredits(newFilteredCredits);
  }, [prioritizedCredits, showRedeemed]);

  // Track whether the prioritized credits request has actually started.
  // This prevents briefly showing the empty state before the first API load begins.
  useEffect(() => {
    if (isLoadingPrioritizedCredits) {
      setHasRequestedPrioritizedCredits(true);
    }
  }, [isLoadingPrioritizedCredits]);

  const hasRedeemedCredits = prioritizedCredits.some(credit => {
    const creditUsage = getCurrentPeriodCreditUsage(credit);
    return creditUsage === CREDIT_USAGE.USED;
  });

  // Helper to convert PrioritizedCredit[] to CalendarUserCredits
  const toCalendarCredits = (credits: PrioritizedCredit[]): CalendarUserCredits | null => {
    if (credits.length === 0) return null;
    return {
      Credits: credits.map(credit => ({
        CardId: credit.cardId,
        CreditId: credit.id,
        AssociatedPeriod: credit.period,
        History: credit.History || [],
        ActiveMonths: undefined,
        isExpiring: credit.isExpiring,
        daysUntilExpiration: credit.daysUntilExpiration,
        isAnniversaryBased: credit.isAnniversaryBased,
        anniversaryDate: credit.anniversaryDate,
        anniversaryYear: credit.anniversaryYear,
      } as UserCredit)),
      Year: new Date().getFullYear(),
    };
  };

  // Convert prioritized credits to CalendarUserCredits format for CreditsDisplay
  const calendarUserCredits = toCalendarCredits(stableFilteredCredits);

  // Category lookup from component credits
  const categoryByCredit = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of componentCredits) {
      map.set(`${c.ReferenceCardId}:${c.id}`, c.Category);
    }
    return map;
  }, [componentCredits]);

  // Count expiring credits for chip visibility
  const expiringCount = useMemo(
    () => stableFilteredCredits.filter(c => c.isExpiring).length,
    [stableFilteredCredits]
  );

  // Compute grouped sections when a filter is active
  const groupedSections = useMemo(() => {
    if (!activeFilter) return null;

    if (activeFilter === 'expiring') {
      const expiring = stableFilteredCredits
        .filter(c => c.isExpiring)
        .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
      return expiring.length > 0
        ? [{ label: 'Expiring Soon', credits: expiring }]
        : null;
    }

    const groups = new Map<string, PrioritizedCredit[]>();
    for (const credit of stableFilteredCredits) {
      const key = activeFilter === 'card'
        ? credit.cardName
        : (categoryByCredit.get(`${credit.cardId}:${credit.id}`) || 'Other');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(credit);
    }

    const result = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, credits]) => ({ label, credits }));
    return result.length > 0 ? result : null;
  }, [activeFilter, stableFilteredCredits, categoryByCredit]);

  // Reset expiring filter when no expiring credits remain
  useEffect(() => {
    if (activeFilter === 'expiring' && expiringCount === 0) {
      setActiveFilter(null);
    }
  }, [activeFilter, expiringCount]);


  // Handler for toggling showRedeemed (client-side only)
  const handleToggleRedeemed = (newShowRedeemed: boolean) => {
    setShowRedeemed(newShowRedeemed);
  };

  // Load user card details
  const loadUserCards = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const userCardsResponse = await UserCreditCardService.fetchUserCardsDetailedInfo();
      setUserCards(userCardsResponse);
    } catch (error) {
      console.warn('Failed to load user cards:', error);
      setLoadError('Failed to load credit cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user card details only (prioritized credits come from App level)
  useEffect(() => {
    loadUserCards();
  }, []);


  return (
    <div className="standard-page-layout">
      <PageHeader
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
      />
      <div className="standard-page-content--no-padding">
        <div className="credits-history-panel">
          <HeaderControls>
            <CreditSummary
              monthlyStats={monthlyStats}
              loading={isLoadingMonthlyStats}
              isUpdating={isUpdatingMonthlyStats}
              onDetailedSummaryClick={onDetailedSummaryClick}
            />
          </HeaderControls>
          <div className="credits-history-content">
            {loadError ? (
              <ErrorWithRetry
                message={loadError}
                onRetry={loadUserCards}
                fillContainer
              />
            ) : isLoading || !hasInitiallyLoaded ? (
              <div className="credits-display loading">
                <CreditsDisplaySkeleton />
              </div>
            ) : !showRedeemed && hasRedeemedCredits && !calendarUserCredits && !groupedSections ? (
              <div className="credits-display empty">
                <FilterChips
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  expiringCount={expiringCount}
                />
                <InfoDisplay
                  type="success"
                  message="All active credits have been redeemed."
                  showTitle={false}
                />
                <div className="redeemed-credits-toggle-container">
                  <button
                    className="button ghost icon with-text"
                    onClick={() => handleToggleRedeemed(true)}
                  >
                    <Icon name="visibility-on" variant="micro" size={14} />
                    Show redeemed credits
                  </button>
                </div>
              </div>
            ) : (
              <>
                <FilterChips
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  expiringCount={expiringCount}
                />
                {groupedSections ? (
                  <>
                    {groupedSections.map(section => (
                      <React.Fragment key={section.label}>
                        <div className="credits-section-label">{section.label}</div>
                        <CreditsDisplay
                          key={`credits-display-${section.label}-${showRedeemed}`}
                          calendar={toCalendarCredits(section.credits)}
                          isLoading={false}
                          userCards={userCards}
                          now={new Date()}
                          onUpdateComplete={onRefreshMonthlyStats}
                          isUpdating={isUpdatingMonthlyStats}
                          onAddUpdatingCreditId={onAddUpdatingCreditId}
                          onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
                          isCreditUpdating={isCreditUpdating}
                        />
                      </React.Fragment>
                    ))}
                    {hasRedeemedCredits && (
                      <div className="redeemed-credits-toggle-container">
                        {!showRedeemed ? (
                          <button
                            className="button ghost icon with-text"
                            onClick={() => handleToggleRedeemed(true)}
                          >
                            <Icon name="visibility-on" variant="micro" size={14} />
                            Show redeemed credits
                          </button>
                        ) : (
                          <button
                            className="button ghost icon with-text"
                            onClick={() => handleToggleRedeemed(false)}
                          >
                            <Icon name="visibility-off" variant="micro" size={14} />
                            Hide redeemed credits
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <CreditsDisplay
                    key={`credits-display-${showRedeemed}-${stableFilteredCredits.length}`}
                    calendar={calendarUserCredits}
                    isLoading={false}
                    userCards={userCards}
                    now={new Date()}
                    onUpdateComplete={onRefreshMonthlyStats}
                    isUpdating={isUpdatingMonthlyStats}
                    onAddUpdatingCreditId={onAddUpdatingCreditId}
                    onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
                    isCreditUpdating={isCreditUpdating}
                  >
                    {hasRedeemedCredits && (
                      <div className="redeemed-credits-toggle-container">
                        {!showRedeemed ? (
                          <button
                            className="button ghost icon with-text"
                            onClick={() => handleToggleRedeemed(true)}
                          >
                            <Icon name="visibility-on" variant="micro" size={14} />
                            Show redeemed credits
                          </button>
                        ) : (
                          <button
                            className="button ghost icon with-text"
                            onClick={() => handleToggleRedeemed(false)}
                          >
                            <Icon name="visibility-off" variant="micro" size={14} />
                            Hide redeemed credits
                          </button>
                        )}
                      </div>
                    )}
                  </CreditsDisplay>
                )}
              </>
            )}
          </div>
          <CreditsTabFooter />
        </div>
      </div>
    </div>
  );
};

export default MyCredits;

