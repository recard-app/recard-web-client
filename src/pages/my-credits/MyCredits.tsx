import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES, CalendarUserCredits } from '../../types';
import { Link } from 'react-router-dom';
import { UserCreditService, UserCreditCardService } from '../../services';
import CreditsDisplay from '../../components/CreditsDisplay';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import './MyCredits.scss';

const MyCredits: React.FC = () => {
  const [currentMonthCredits, setCurrentMonthCredits] = useState<CalendarUserCredits | null>(null);
  const [userCards, setUserCards] = useState<CreditCardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh current year credits data
  const refreshCredits = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const updatedResponse = await UserCreditService.fetchCreditHistoryForYear(currentYear, {
        includeExpiring: true,
        excludeHidden: true
      });

      setCurrentMonthCredits(updatedResponse);
    } catch (error) {
      console.error('Failed to refresh current year credits:', error);
    }
  };

  // Sync credit history and fetch current year credits
  useEffect(() => {
    const loadCredits = async () => {
      try {
        // First sync the credits to ensure they're up to date
        await UserCreditService.syncCurrentYearCreditsDebounced();

        // Fetch user card details and current year credits in parallel
        const currentYear = new Date().getFullYear();
        const [userCardsResponse, creditsResponse] = await Promise.all([
          UserCreditCardService.fetchUserCardsDetailedInfo(),
          UserCreditService.fetchCreditHistoryForYear(currentYear, {
            includeExpiring: true,
            excludeHidden: true
          })
        ]);

        // creditsResponse is already in CalendarUserCredits format
        const calendarCredits: CalendarUserCredits = creditsResponse;

        setUserCards(userCardsResponse);
        setCurrentMonthCredits(calendarCredits);
      } catch (error) {
        console.warn('Failed to load current year credits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCredits();
  }, []);

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

        <div className="current-month-credits">
          <h2>Current Year Credits</h2>
          <CreditsDisplay
            calendar={currentMonthCredits}
            isLoading={isLoading}
            userCards={userCards}
            showAllPeriods={false}
            showUsed={true}
            showNotUsed={true}
            showPartiallyUsed={true}
            showInactive={false}
            onUpdateComplete={refreshCredits}
          />
        </div>
      </div>
    </div>
  );
};

export default MyCredits;


