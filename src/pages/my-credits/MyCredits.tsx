import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES, CalendarUserCredits, UserCredit, CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS } from '../../types';
import { UserCreditCardService } from '../../services';
import CreditsDisplay from '../../components/CreditsDisplay';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import { PrioritizedCredit } from '../../types';
import { MonthlyStatsResponse } from '../../types/CardCreditsTypes';
import Icon from '../../icons';
import { InfoDisplay } from '../../elements/InfoDisplay/InfoDisplay';
import HeaderControls from '@/components/PageControls/HeaderControls';
import CreditSummary from '../../components/CreditSummary';
import { useFullHeight } from '../../hooks/useFullHeight';
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
  const navigate = useNavigate();

  const [userCards, setUserCards] = useState<CreditCardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [showRedeemed, setShowRedeemed] = useState(false);
  const [stableFilteredCredits, setStableFilteredCredits] = useState<PrioritizedCredit[]>([]);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

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

    // Mark as initially loaded once we have credits data (regardless of whether it's empty)
    if (!isLoadingPrioritizedCredits && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [prioritizedCredits, showRedeemed, isLoadingPrioritizedCredits, hasInitiallyLoaded]);

  // Convert prioritized credits to CalendarUserCredits format for CreditsDisplay
  const calendarUserCredits: CalendarUserCredits | null = stableFilteredCredits.length > 0 ? {
    Credits: stableFilteredCredits.map(credit => ({
      CardId: credit.cardId,
      CreditId: credit.id,
      AssociatedPeriod: credit.period,
      History: credit.History || [],
      ActiveMonths: undefined, // Not needed for prioritized view
      isExpiring: credit.isExpiring, // Include expiration flag
      daysUntilExpiration: credit.daysUntilExpiration, // Include days until expiration
      // Anniversary credit fields for proper expiration calculation
      isAnniversaryBased: credit.isAnniversaryBased,
      anniversaryDate: credit.anniversaryDate,
      anniversaryYear: credit.anniversaryYear
    } as UserCredit)),
    Year: new Date().getFullYear()
  } : null;


  // Handler for toggling showRedeemed (client-side only)
  const handleToggleRedeemed = (newShowRedeemed: boolean) => {
    setShowRedeemed(newShowRedeemed);
  };

  // Load user card details only (prioritized credits come from App level)
  useEffect(() => {
    const loadUserCards = async () => {
      try {
        const userCardsResponse = await UserCreditCardService.fetchUserCardsDetailedInfo();
        setUserCards(userCardsResponse);
      } catch (error) {
        console.warn('Failed to load user cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

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
            {(isLoading || isLoadingPrioritizedCredits) && !hasInitiallyLoaded ? (
              <InfoDisplay
                type="loading"
                message="Loading credits..."
                showTitle={false}
                transparent={true}
                centered
              />
            ) : (
              <>
                <CreditsDisplay
                  key={`credits-display-${showRedeemed}-${stableFilteredCredits.length}`}
                  calendar={calendarUserCredits}
                  isLoading={false}
                  userCards={userCards}
                  now={new Date()}
                  showUsed={true}
                  showNotUsed={true}
                  showPartiallyUsed={true}
                  showInactive={true}
                  showAllPeriods={true}
                  useSimpleDisplay={true}
                  showPeriodLabel={true}
                  customHeaderActions={
                    <button
                      className="button ghost icon with-text no-padding"
                      onClick={() => navigate(PAGES.MY_CREDITS_HISTORY.PATH)}
                    >
                      <Icon name="history-clock" variant="micro" size={14} />
                      View All Credits
                    </button>
                  }
                  onUpdateComplete={onRefreshMonthlyStats}
                  isUpdating={isUpdatingMonthlyStats}
                  onAddUpdatingCreditId={onAddUpdatingCreditId}
                  onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
                  isCreditUpdating={isCreditUpdating}
                >
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
                </CreditsDisplay>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCredits;


