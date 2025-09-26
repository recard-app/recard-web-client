import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, CalendarUserCredits, UserCredit } from '../../types';
import { UserCreditService, UserCreditCardService } from '../../services';
import CreditsDisplay from '../../components/CreditsDisplay';
import { CreditCardDetails, PrioritizedCredit } from '../../types/CreditCardTypes';
import { useCredits } from '../../contexts/ComponentsContext';
import Icon from '../../icons';
import { InfoDisplay } from '../../elements/InfoDisplay/InfoDisplay';
import './shared-credits-layout.scss';
import './MyCredits.scss';

const MyCredits: React.FC = () => {
  const [prioritizedCredits, setPrioritizedCredits] = useState<PrioritizedCredit[]>([]);
  const [userCards, setUserCards] = useState<CreditCardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRedeemed, setShowRedeemed] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const credits = useCredits();

  // Convert prioritized credits to CalendarUserCredits format for CreditsDisplay
  const calendarUserCredits: CalendarUserCredits | null = prioritizedCredits.length > 0 ? {
    Credits: prioritizedCredits.map(credit => ({
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

  // Function to refresh current year credits data using prioritized endpoint
  const refreshCredits = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const prioritizedResponse = await UserCreditService.fetchPrioritizedCreditsList({
        year: currentYear,
        limit: 0, // Get all credits
        excludeHidden: true,
        showRedeemed
      });

      setPrioritizedCredits(prioritizedResponse.credits);
    } catch (error) {
      console.error('Failed to refresh current year credits:', error);
    }
  };

  // Handler for toggling showRedeemed with loading state
  const handleToggleRedeemed = async (newShowRedeemed: boolean) => {
    setIsToggleLoading(true);
    setShowRedeemed(newShowRedeemed);

    try {
      const currentYear = new Date().getFullYear();
      const prioritizedResponse = await UserCreditService.fetchPrioritizedCreditsList({
        year: currentYear,
        limit: 0, // Get all credits
        excludeHidden: true,
        showRedeemed: newShowRedeemed
      });

      setPrioritizedCredits(prioritizedResponse.credits);
    } catch (error) {
      console.error('Failed to toggle redeemed credits:', error);
      // Revert the state on error
      setShowRedeemed(!newShowRedeemed);
    } finally {
      setIsToggleLoading(false);
    }
  };

  // Sync credit history and fetch current year credits using prioritized endpoint
  useEffect(() => {
    const loadCredits = async () => {
      try {
        // First sync the credits to ensure they're up to date
        await UserCreditService.syncCurrentYearCreditsDebounced();

        // Fetch user card details and prioritized credits in parallel
        const currentYear = new Date().getFullYear();
        const [userCardsResponse, prioritizedResponse] = await Promise.all([
          UserCreditCardService.fetchUserCardsDetailedInfo(),
          UserCreditService.fetchPrioritizedCreditsList({
            year: currentYear,
            limit: 0, // Get all credits
            excludeHidden: true,
            showRedeemed
          })
        ]);

        setUserCards(userCardsResponse);
        setPrioritizedCredits(prioritizedResponse.credits);
      } catch (error) {
        console.warn('Failed to load current year credits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCredits();
  }, []);

  // Refetch credits when showRedeemed changes
  useEffect(() => {
    if (!isLoading) {
      refreshCredits();
    }
  }, [showRedeemed]);

  return (
    <div className="standard-page-layout">
      <PageHeader
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
      />
      <div className="standard-page-content--no-padding">
        <div className="credits-history-panel">
          <div className="credits-history-content">
            {isLoading ? (
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
                  onUpdateComplete={refreshCredits}
                />

                <div className="redeemed-credits-toggle-container" style={{ marginTop: '20px', textAlign: 'center', position: 'relative' }}>
                  {isToggleLoading ? (
                    <InfoDisplay
                      type="loading"
                      message="Loading..."
                      showTitle={false}
                      transparent={true}
                      centered={true}
                    />
                  ) : (
                    !showRedeemed ? (
                      <button
                        className="button ghost icon with-text"
                        onClick={() => handleToggleRedeemed(true)}
                      >
                        <Icon name="used-icon" variant="micro" size={14} />
                        See redeemed credits
                      </button>
                    ) : (
                      <button
                        className="button ghost icon with-text"
                        onClick={() => handleToggleRedeemed(false)}
                      >
                        <Icon name="used-icon" variant="micro" size={14} />
                        Hide redeemed credits
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCredits;


