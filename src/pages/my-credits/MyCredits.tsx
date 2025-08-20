import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, CalendarUserCredits, MONTH_OPTIONS } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../components/ui/dialog/dialog';
import MyCreditsHelpModal from './MyCreditsHelpModal';
import { UserCreditService } from '../../services/UserServices';
import { UserService } from '../../services/UserServices';
import CreditsDisplay from '../../components/CreditsDisplay';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import { InfoDisplay } from '../../elements';
import HeaderControls from '@/components/PageControls/HeaderControls';
import Icon from '@/icons';
import {
  buildYearOptions,
  clampMonthForYear,
  getNextYearMonth as utilGetNextYearMonth,
  getPrevYearMonth as utilGetPrevYearMonth,
  isAllowedYearMonth as utilIsAllowedYearMonth,
} from './utils';

interface MyCreditsProps {
  calendar: CalendarUserCredits | null;
  userCardDetails: CreditCardDetails[];
  reloadTrigger?: number;
}

const MyCredits: React.FC<MyCreditsProps> = ({ calendar, userCardDetails, reloadTrigger }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localCalendar, setLocalCalendar] = useState<CalendarUserCredits | null>(calendar);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);

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
        const year = selectedYear;
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
          const year = selectedYear;
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
  }, [reloadTrigger, selectedYear]);

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

  

  const [yearOptions, setYearOptions] = useState<number[]>([]);

  // On mount, compute allowed years from account creation date
  useEffect(() => {
    let mounted = true;
    (async () => {
      const createdAt = await UserService.fetchAccountCreationDate();
      if (mounted) setAccountCreatedAt(createdAt);
      if (mounted) setYearOptions(buildYearOptions(createdAt));
      // Clamp selectedYear to range if needed
      const now = new Date();
      const currentYear = now.getFullYear();
      const minYear = (createdAt ?? now).getFullYear();
      if (mounted && (selectedYear < minYear || selectedYear > currentYear)) {
        setSelectedYear(currentYear);
        setSelectedMonth(clampMonthForYear(currentYear, selectedMonth, createdAt));
      }
    })();
    return () => { mounted = false; };
  }, []);

  const isAllowedYearMonth = (year: number, month: number): boolean =>
    utilIsAllowedYearMonth(year, month, accountCreatedAt);

  const incrementMonth = () => {
    const { y, m } = utilGetNextYearMonth(selectedYear, selectedMonth);
    if (isAllowedYearMonth(y, m)) {
      setSelectedYear(y);
      setSelectedMonth(m);
    }
  };

  const decrementMonth = () => {
    const { y, m } = utilGetPrevYearMonth(selectedYear, selectedMonth);
    if (isAllowedYearMonth(y, m)) {
      setSelectedYear(y);
      setSelectedMonth(m);
    }
  };

  // Navigation helpers moved to utils

  return (
    <div className="my-credits-wrapper">
      <PageHeader 
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <HeaderControls>
        <div className="header-controls">
          <div className="date-picker">
            <label className="filter-label">Year</label>
            <select
              className="year-select default-select"
              value={selectedYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                setSelectedYear(newYear);
                setSelectedMonth(clampMonthForYear(newYear, selectedMonth, accountCreatedAt));
              }}
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="date-picker">
            <label className="filter-label">Month</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous month"
                className="button outline small px-2"
                onClick={decrementMonth}
                disabled={!isAllowedYearMonth(utilGetPrevYearMonth(selectedYear, selectedMonth).y, utilGetPrevYearMonth(selectedYear, selectedMonth).m)}
              >
                <Icon name="chevron-down" variant="mini" size={16} className="rotate-90" />
              </button>
              <select
                className="month-select default-select"
                value={selectedMonth}
                onChange={(e) => {
                  const m = parseInt(e.target.value);
                  if (isAllowedYearMonth(selectedYear, m)) setSelectedMonth(m);
                }}
              >
                {MONTH_OPTIONS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Next month"
                className="button outline small px-2"
                onClick={incrementMonth}
                disabled={!isAllowedYearMonth(utilGetNextYearMonth(selectedYear, selectedMonth).y, utilGetNextYearMonth(selectedYear, selectedMonth).m)}
              >
                <Icon name="chevron-down" variant="mini" size={16} className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </HeaderControls>
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
          <CreditsDisplay
            calendar={filteredCalendar}
            isLoading={false}
            userCards={userCardDetails}
            now={new Date(selectedYear, selectedMonth - 1, 15)}
            onUpdateHistoryEntry={({ cardId, creditId, periodNumber, creditUsage, valueUsed }) => {
              // Optimistically update localCalendar in place
              setLocalCalendar((prev) => {
                if (!prev) return prev;
                if (prev.Year !== selectedYear) return prev;
                const next = { ...prev, Credits: prev.Credits.map((uc) => {
                  if (uc.CardId === cardId && uc.CreditId === creditId) {
                    const existing = uc.History.find((h) => h.PeriodNumber === periodNumber);
                    if (existing) {
                      existing.CreditUsage = creditUsage;
                      existing.ValueUsed = valueUsed;
                    }
                  }
                  return uc;
                }) };
                return next;
              });
            }}
          />
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


