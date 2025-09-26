import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, CalendarUserCredits, UserCredit } from '../../types';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../components/ui/dialog/dialog';
import MyCreditsHelpModal from './MyCreditsHelpModal';
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
  isCreditUpdating
}) => {
  // Use the full height hook for this page
  useFullHeight(true);

  // Help modal state
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [userCards, setUserCards] = useState<CreditCardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [showRedeemed, setShowRedeemed] = useState(false);
  const [stableFilteredCredits, setStableFilteredCredits] = useState<PrioritizedCredit[]>([]);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Update stable credits only when prioritizedCredits or showRedeemed changes
  // This prevents flickering during the filtering/sorting process
  useEffect(() => {
    const newFilteredCredits = showRedeemed
      ? prioritizedCredits
      : prioritizedCredits.filter(credit => credit.usageStatus !== 'redeemed');

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
      daysUntilExpiration: credit.daysUntilExpiration // Include days until expiration
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
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <div className="standard-page-content--no-padding">
        <div className="credits-history-panel">
          <HeaderControls>
            <CreditSummary
              monthlyStats={monthlyStats}
              loading={isLoadingMonthlyStats}
              isUpdating={isUpdatingMonthlyStats}
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

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Credits Help</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <MyCreditsHelpModal />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCredits;


