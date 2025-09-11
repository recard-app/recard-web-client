import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, CalendarUserCredits, MONTH_OPTIONS, CREDIT_USAGE_DISPLAY_NAMES } from '../../../types';
import { UserCreditsTrackingPreferences, CREDIT_HIDE_PREFERENCE } from '../../../types/CardCreditsTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../../components/ui/dialog/dialog';
import MyCreditsHelpModal from '../MyCreditsHelpModal';
import { UserCreditService } from '../../../services/UserServices';
import { UserService } from '../../../services/UserServices';
import CreditsDisplay from '../../../components/CreditsDisplay';
import { CreditCardDetails } from '../../../types/CreditCardTypes';
import { InfoDisplay } from '../../../elements';
import HeaderControls from '@/components/PageControls/HeaderControls';
import { ToggleBar, ToggleBarButton } from '@/components/ui/toggle-bar/toggle-bar';
import Icon from '@/icons';
import SingleCardSelector from '../../../components/CreditCardSelector/SingleCardSelector';
import { Drawer, DrawerContent, DrawerTitle } from '../../../components/ui/drawer';
import { SelectCard } from '../../../components/ui/select-card/select-card';
import { CreditCard } from '../../../types/CreditCardTypes';
import { useFullHeight } from '../../../hooks/useFullHeight';
import {
  buildYearOptions,
  clampMonthForYear,
  getNextYearMonth as utilGetNextYearMonth,
  getPrevYearMonth as utilGetPrevYearMonth,
  isAllowedYearMonth as utilIsAllowedYearMonth,
} from '../utils';
import './CreditsHistory.scss';

interface CreditsHistoryProps {
  calendar: CalendarUserCredits | null;
  userCardDetails: CreditCardDetails[];
  reloadTrigger?: number;
  trackingPreferences?: UserCreditsTrackingPreferences | null;
}

const CreditsHistory: React.FC<CreditsHistoryProps> = ({ calendar, userCardDetails, reloadTrigger, trackingPreferences }) => {
  // Use the full height hook for this page
  useFullHeight(true);
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localCalendar, setLocalCalendar] = useState<CalendarUserCredits | null>(calendar);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 780px)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 780px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsMobileViewport(matches);
    };
    handler(mq);
    try { mq.addEventListener('change', handler as unknown as EventListener); } catch { mq.addListener(handler as any); }
    return () => { try { mq.removeEventListener('change', handler as unknown as EventListener); } catch { mq.removeListener(handler as any); } };
  }, []);

  // Keep local state in sync with incoming props
  useEffect(() => {
    setLocalCalendar(calendar);
  }, [calendar]);

  // Load credits on mount and when reloadTrigger changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const year = selectedYear;
        const cal = await UserCreditService.fetchCreditHistoryForYear(year);
        if (!mounted) return;
        setLocalCalendar(cal);
        setIsLoading(false);
        // Background sync
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

  // Helper function to check if a credit should be hidden based on tracking preferences
  const isCreditHidden = (cardId: string, creditId: string): boolean => {
    if (!trackingPreferences) return false;
    
    const cardPrefs = trackingPreferences.Cards.find(card => card.CardId === cardId);
    if (!cardPrefs) return false;
    
    const creditPref = cardPrefs.Credits.find(credit => credit.CreditId === creditId);
    return creditPref?.HidePreference === CREDIT_HIDE_PREFERENCE.HIDE_ALL;
  };

  // Build allowed pairs of (CardId:CreditId) from user's cards
  const allowedPairs = useMemo(() => {
    const set = new Set<string>();
    for (const card of userCardDetails || []) {
      for (const credit of card.Credits || []) {
        set.add(`${card.id}:${credit.id}`);
      }
    }
    return set;
  }, [userCardDetails]);

  const [selectedFilterCardId, setSelectedFilterCardId] = useState<string | null>(null);
  const filteredCalendar: CalendarUserCredits | null = useMemo(() => {
    if (!localCalendar) return null;
    let filtered = (localCalendar.Credits || [])
      .filter(uc => allowedPairs.has(`${uc.CardId}:${uc.CreditId}`))
      .filter(uc => !isCreditHidden(uc.CardId, uc.CreditId)); // Filter out hidden credits
    
    if (selectedFilterCardId) {
      filtered = filtered.filter(uc => uc.CardId === selectedFilterCardId);
    }
    return { ...localCalendar, Credits: filtered };
  }, [localCalendar, allowedPairs, selectedFilterCardId, trackingPreferences]);

  const [yearOptions, setYearOptions] = useState<number[]>([]);

  // On mount, compute allowed years
  useEffect(() => {
    let mounted = true;
    (async () => {
      const createdAt = await UserService.fetchAccountCreationDate();
      if (mounted) setAccountCreatedAt(createdAt);
      if (mounted) setYearOptions(buildYearOptions(createdAt));
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

  // Generic month offset helper
  const getYearMonthOffset = (y: number, m: number, deltaMonths: number): { y: number; m: number } => {
    const zeroBased = m - 1;
    const total = y * 12 + zeroBased + deltaMonths;
    const newYear = Math.floor(total / 12);
    const newMonthZero = total % 12;
    const normalizedMonthZero = newMonthZero < 0 ? newMonthZero + 12 : newMonthZero;
    const normalizedYear = newMonthZero < 0 ? newYear - 1 : newYear;
    return { y: normalizedYear, m: normalizedMonthZero + 1 };
  };

  const canJumpMonths = (deltaMonths: number): boolean => {
    const { y, m } = getYearMonthOffset(selectedYear, selectedMonth, deltaMonths);
    return isAllowedYearMonth(y, m);
  };

  const onJumpMonths = (deltaMonths: number) => {
    const { y, m } = getYearMonthOffset(selectedYear, selectedMonth, deltaMonths);
    if (isAllowedYearMonth(y, m)) {
      setSelectedYear(y);
      setSelectedMonth(m);
    }
  };

  // Current-month helpers
  const isOnCurrentMonth = useMemo(() => {
    const now = new Date();
    return selectedYear === now.getFullYear() && selectedMonth === (now.getMonth() + 1);
  }, [selectedYear, selectedMonth]);
  const goToCurrentPeriod = () => {
    const now = new Date();
    let targetYear = now.getFullYear();
    let targetMonth = now.getMonth() + 1;
    if (!isAllowedYearMonth(targetYear, targetMonth)) {
      let probeY = targetYear;
      let probeM = targetMonth;
      for (let i = 0; i < 36; i++) {
        const prev = utilGetPrevYearMonth(probeY, probeM);
        if (isAllowedYearMonth(prev.y, prev.m)) {
          targetYear = prev.y;
          targetMonth = prev.m;
          break;
        }
        probeY = prev.y;
        probeM = prev.m;
      }
    }
    setSelectedYear(targetYear);
    setSelectedMonth(targetMonth);
  };

  // Toggles for filtering/visibility
  const [showUsed, setShowUsed] = useState<boolean>(true);
  const [showNotUsed, setShowNotUsed] = useState<boolean>(true);
  const [showPartiallyUsed, setShowPartiallyUsed] = useState<boolean>(true);
  const [showInactive, setShowInactive] = useState<boolean>(true);

  const [isCardFilterOpen, setIsCardFilterOpen] = useState(false);
  const handleOpenCardFilter = () => setIsCardFilterOpen(true);
  const handleSelectFilterCard = (card: CreditCard) => {
    setSelectedFilterCardId(card?.id || null);
    setIsCardFilterOpen(false);
  };

  return (
    <div className="standard-page-layout">
      <PageHeader 
        title={PAGE_NAMES.MY_CREDITS}
        icon={PAGE_ICONS.MY_CREDITS.MINI}
        subtitle={"Full History"}
        showHelpButton={true}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      {/* Card Filter Selector: drawer on mobile, dialog on desktop */}
      {isMobileViewport ? (
        <Drawer open={isCardFilterOpen} onOpenChange={setIsCardFilterOpen} direction="bottom">
          <DrawerContent>
            <DrawerTitle className="sr-only">Select Card</DrawerTitle>
            <div className="dialog-header drawer-sticky-header"><h2>Select Card</h2></div>
            <div className="dialog-body" style={{ overflowY: 'auto' }}>
              <SingleCardSelector
                creditCards={[]}
                onSelectCard={handleSelectFilterCard}
                selectedCardId={selectedFilterCardId || undefined}
                hideInternalSearch={false}
                onlyShowUserCards={false}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isCardFilterOpen} onOpenChange={setIsCardFilterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Card</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <SingleCardSelector
                creditCards={[]}
                onSelectCard={handleSelectFilterCard}
                selectedCardId={selectedFilterCardId || undefined}
                hideInternalSearch={false}
                onlyShowUserCards={false}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
      <div className="standard-page-content--no-padding">
        <div className="credits-history-panel">
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
                {!isOnCurrentMonth && (
                  <button
                    type="button"
                    aria-label="Go to current period"
                    className="button outline small icon with-text"
                    onClick={goToCurrentPeriod}
                  >
                    <Icon name="map-pin" variant="micro" size={16} />
                    <span>Back to Today</span>
                  </button>
                )}
              </div>
              <ToggleBar className="connected items-center gap-2">
                <span className="caps-label">Credits to Show</span>
                <ToggleBarButton pressed={showUsed} onPressedChange={setShowUsed} className="small icon with-text">
                  <Icon name="used-icon" variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.USED}</span>
                </ToggleBarButton>
                <ToggleBarButton pressed={showNotUsed} onPressedChange={setShowNotUsed} className="small icon with-text">
                  <Icon name="not-used-icon" variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}</span>
                </ToggleBarButton>
                <ToggleBarButton pressed={showPartiallyUsed} onPressedChange={setShowPartiallyUsed} className="small icon with-text">
                  <Icon name="partially-used-icon" variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}</span>
                </ToggleBarButton>
                <ToggleBarButton pressed={showInactive} onPressedChange={setShowInactive} className="small icon with-text">
                  <Icon name="inactive" variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}</span>
                </ToggleBarButton>
              </ToggleBar>
              {/* Card Filter */}
              <div className="filter-section">
                <label className="caps-label">Filter by Card</label>
                <SelectCard
                  selectedCardId={selectedFilterCardId || undefined}
                  creditCards={userCardDetails.map(card => ({
                    id: card.id,
                    CardName: card.CardName,
                    CardPrimaryColor: card.CardPrimaryColor,
                    CardSecondaryColor: card.CardSecondaryColor,
                    CardIssuer: card.CardIssuer || '',
                    CardNetwork: card.CardNetwork || '',
                    CardDetails: card.CardDetails || ''
                  }))}
                  isUpdating={false}
                  onSelectCardClick={handleOpenCardFilter}
                  onDeselectCard={() => setSelectedFilterCardId(null)}
                  selectLabel=""
                  selectedLabel=""
                  unselectedIcon={<Icon name="card" variant="micro" color="#C9CED3" size={14} />}
                  className="standalone"
                />
              </div>
            </div>
          </HeaderControls>
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
              <CreditsDisplay
                calendar={filteredCalendar}
                isLoading={false}
                userCards={userCardDetails}
                now={new Date(selectedYear, selectedMonth - 1, 15)}
                onJumpMonths={onJumpMonths}
                canJumpMonths={canJumpMonths}
                showUsed={showUsed}
                showNotUsed={showNotUsed}
                showPartiallyUsed={showPartiallyUsed}
                showInactive={showInactive}
                showAllPeriods={!isMobileViewport}
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

export default CreditsHistory;


