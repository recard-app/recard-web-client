import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, CalendarUserCredits } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../components/ui/dialog/dialog';
import MyCreditsHelpModal from './MyCreditsHelpModal';
import { UserCreditService } from '../../services/UserServices';
import CreditsDisplay from '../../components/CreditsDisplay';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import { InfoDisplay } from '../../elements';

interface MyCreditsProps {
  calendar: CalendarUserCredits | null;
  userCardDetails: CreditCardDetails[];
  reloadTrigger?: number;
}

const MyCredits: React.FC<MyCreditsProps> = ({ calendar, userCardDetails, reloadTrigger }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localCalendar, setLocalCalendar] = useState<CalendarUserCredits | null>(calendar);

  // Keep local state in sync with incoming props
  useEffect(() => {
    setLocalCalendar(calendar);
  }, [calendar]);

  // Load credits on mount and when reloadTrigger changes, similar to MyCards initial load behavior
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const year = new Date().getFullYear();
        // Quick fetch
        const cal = await UserCreditService.fetchCreditHistoryForYear(year);
        if (!mounted) return;
        setLocalCalendar(cal);
        // Immediately show data after quick fetch
        setIsLoading(false);
        // Background sync to resolve discrepancies (do not block UI)
        (async () => {
          try {
            const result = await UserCreditService.syncCurrentYearCredits();
            if (!mounted) return;
            if (result.changed && result.creditHistory) {
              const updated = result.creditHistory.Credits.find(c => c.Year === year) || null;
              if (updated) setLocalCalendar(updated);
            }
          } catch (e) {
            console.error('Credits sync failed:', e);
          }
        })();
      } catch (error) {
        // Ensure at least an empty structure exists
        try {
          await UserCreditService.generateCreditHistory();
          const year = new Date().getFullYear();
          const cal = await UserCreditService.fetchCreditHistoryForYear(year);
          if (mounted) {
            setLocalCalendar(cal);
            setIsLoading(false);
          }
        } catch (e) {
          console.error('Failed to initialize credit history:', e);
          if (mounted) {
            setLocalCalendar(null);
            setIsLoading(false);
          }
        }
      }
    })();
    return () => { mounted = false; };
  }, [reloadTrigger]);

  // Build allowed pairs of (CardId:CreditId) from user's cards to filter displayed user credits
  const allowedPairs = useMemo(() => {
    const set = new Set<string>();
    for (const card of userCardDetails || []) {
      for (const credit of card.Credits || []) {
        set.add(`${card.id}:${credit.id}`);
      }
    }
    return set;
  }, [userCardDetails]);

  const filteredCalendar: CalendarUserCredits | null = useMemo(() => {
    if (!localCalendar) return null;
    const filtered = (localCalendar.Credits || []).filter(uc => allowedPairs.has(`${uc.CardId}:${uc.CreditId}`));
    return { ...localCalendar, Credits: filtered };
  }, [localCalendar, allowedPairs]);

  return (
    <div className="my-credits-wrapper">
      <PageHeader 
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <div className="page-content">
        {isLoading ? (
          <InfoDisplay
            type="loading"
            message="Loading credits..."
            showTitle={false}
            transparent={true}
            centered
          />
        ) : (
          <CreditsDisplay calendar={filteredCalendar} isLoading={false} userCards={userCardDetails} />
        )}
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


