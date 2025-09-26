import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES } from '../../types';
import { Link } from 'react-router-dom';
import { UserCreditService, UserCreditCardService } from '../../services';
import CreditList from '../../components/CreditsDisplay/CreditList';
import { CreditCardDetails, PrioritizedCredit, UserCreditWithExpiration } from '../../types/CreditCardTypes';
import { useCredits } from '../../contexts/ComponentsContext';
import Icon from '../../icons';
import { InfoDisplay } from '../../elements/InfoDisplay/InfoDisplay';
import './MyCredits.scss';

const MyCredits: React.FC = () => {
  const [prioritizedCredits, setPrioritizedCredits] = useState<PrioritizedCredit[]>([]);
  const [userCards, setUserCards] = useState<CreditCardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRedeemed, setShowRedeemed] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const credits = useCredits();

  // Convert prioritized credits to UserCreditWithExpiration format for CreditList
  const userCreditsFromPrioritized: UserCreditWithExpiration[] = prioritizedCredits.map(credit => ({
    CardId: credit.cardId,
    CreditId: credit.id,
    AssociatedPeriod: credit.period,
    History: credit.History || [],
    // Add expiration info as extended properties
    daysUntilExpiration: credit.daysUntilExpiration,
    isExpiring: credit.isExpiring, // Use the proper isExpiring flag from API
  }));

  // Build lookup maps for CreditList
  const cardById = new Map<string, CreditCardDetails>();
  for (const card of userCards) {
    cardById.set(card.id, card);
  }

  const creditByPair = new Map<string, any>();
  for (const credit of credits) {
    creditByPair.set(`${credit.ReferenceCardId}:${credit.id}`, credit);
  }

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
      <div className="standard-page-content--padded" style={{ paddingTop: 12 }}>
        <div className="my-credits-actions">
          <Link to={`${PAGES.MY_CREDITS.PATH}/history`} className="button icon with-text">
            See Credits History
          </Link>
        </div>

        <div className="current-year-credits">
          <h2>Prioritized Credits</h2>
          {isLoading ? (
            <div className="credits-loading">Loading credits...</div>
          ) : (
            <>
              <CreditList
                credits={userCreditsFromPrioritized}
                now={new Date()}
                cardById={cardById}
                creditByPair={creditByPair}
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
  );
};

export default MyCredits;


