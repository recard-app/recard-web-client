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
import { OptimizedCreditService } from '../../../services/UserServices/OptimizedCreditService';
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
  userCardDetails: CreditCardDetails[];
  reloadTrigger?: number;
}

const CreditsHistory: React.FC<CreditsHistoryProps> = ({ userCardDetails, reloadTrigger }) => {
  // Use the full height hook for this page
  useFullHeight(true);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [localCalendar, setLocalCalendar] = useState<CalendarUserCredits | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
  const [selectedFilterCardId, setSelectedFilterCardId] = useState<string | null>(null);
  const [trackingPreferences, setTrackingPreferences] = useState<UserCreditsTrackingPreferences | null>(null);

  // Clear cache when card filter changes to avoid stale data
  useEffect(() => {
    OptimizedCreditService.clearCacheForOptions({
      cardIds: selectedFilterCardId ? [selectedFilterCardId] : undefined,
      excludeHidden: true
    });
  }, [selectedFilterCardId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't clear cache on unmount as it might be used by other components
      // OptimizedCreditService.clearCache();
    };
  }, []);
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


  // Load credits: current month immediately + full year in background (2 API calls)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setIsLoadingMonth(true);
      try {
        // Build server-side filtering options
        const filterOptions: {
          cardIds?: string[];
          excludeHidden?: boolean;
        } = {
          excludeHidden: true, // Always exclude hidden credits server-side
        };

        // Add card filtering if a specific card is selected
        if (selectedFilterCardId) {
          filterOptions.cardIds = [selectedFilterCardId];
        }

        // API Call #1: Load current month immediately for quick display
        const currentMonthData = await OptimizedCreditService.loadMonthData(
          selectedYear,
          selectedMonth,
          filterOptions
        );

        if (!mounted) return;
        setLocalCalendar(currentMonthData);
        setIsLoading(false);

        // API Call #2: Load full year in background for complete navigation
        // Populate cache with individual months without overwriting current display
        setTimeout(async () => {
          try {
            if (!mounted) return;
            const fullYearData = await UserCreditService.fetchCreditHistoryForYear(selectedYear, filterOptions);
            if (mounted && fullYearData) {
              // Populate cache with all 12 months from the year data
              // This enables fast navigation without overwriting the current month display
              OptimizedCreditService.populateCacheFromYearData(fullYearData, filterOptions);
            }
          } catch (yearError) {
            console.error('Background year loading failed:', yearError);
            // Continue with current month data if year load fails
          }
        }, 100); // Small delay to prioritize current month display

        setIsLoadingMonth(false);
      } catch (error) {
        // Fallback: generate credit history and try again
        try {
          await UserCreditService.generateCreditHistory();

          const fallbackFilterOptions: {
            cardIds?: string[];
            excludeHidden?: boolean;
          } = {
            excludeHidden: true,
          };

          if (selectedFilterCardId) {
            fallbackFilterOptions.cardIds = [selectedFilterCardId];
          }

          // Try loading current month after history generation
          const cal = await OptimizedCreditService.loadMonthData(
            selectedYear,
            selectedMonth,
            fallbackFilterOptions
          );
          if (mounted) {
            setLocalCalendar(cal);
            setIsLoading(false);
            setIsLoadingMonth(false);
          }
        } catch (e) {
          console.error('Failed to initialize credit history:', e);
          if (mounted) {
            setLocalCalendar(null);
            setIsLoading(false);
            setIsLoadingMonth(false);
          }
        }
      }
    })();
    return () => { mounted = false; };
  }, [reloadTrigger, selectedYear, selectedMonth, selectedFilterCardId]);

  // Load tracking preferences on mount
  useEffect(() => {
    const fetchTrackingPreferences = async () => {
      try {
        const preferences = await OptimizedCreditService.fetchCreditTrackingPreferences();
        setTrackingPreferences(preferences);
      } catch (error) {
        console.error('Error fetching credit tracking preferences:', error);
        setTrackingPreferences(null);
      }
    };

    fetchTrackingPreferences();
  }, []);

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

  const filteredCalendar: CalendarUserCredits | null = useMemo(() => {
    if (!localCalendar) return null;

    // Server-side filtering handles: cardIds, excludeHidden
    // Client-side filtering handles: allowedPairs (selected cards validation)
    let filtered = (localCalendar.Credits || [])
      .filter(uc => allowedPairs.has(`${uc.CardId}:${uc.CreditId}`));

    return { ...localCalendar, Credits: filtered };
  }, [localCalendar, allowedPairs]);

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

  const incrementMonth = async () => {
    const { y, m } = utilGetNextYearMonth(selectedYear, selectedMonth);
    if (isAllowedYearMonth(y, m)) {
      setIsLoadingMonth(true);
      try {
        // Build filtering options
        const filterOptions: {
          cardIds?: string[];
          excludeHidden?: boolean;
        } = {
          excludeHidden: true,
        };
        if (selectedFilterCardId) {
          filterOptions.cardIds = [selectedFilterCardId];
        }

        // Load new month data
        const newData = await OptimizedCreditService.loadMonthData(y, m, filterOptions);
        setLocalCalendar(newData);
        setSelectedYear(y);
        setSelectedMonth(m);
      } catch (error) {
        console.error('Failed to load next month:', error);
      } finally {
        setIsLoadingMonth(false);
      }
    }
  };

  const decrementMonth = async () => {
    const { y, m } = utilGetPrevYearMonth(selectedYear, selectedMonth);
    if (isAllowedYearMonth(y, m)) {
      setIsLoadingMonth(true);
      try {
        // Build filtering options
        const filterOptions: {
          cardIds?: string[];
          excludeHidden?: boolean;
        } = {
          excludeHidden: true,
        };
        if (selectedFilterCardId) {
          filterOptions.cardIds = [selectedFilterCardId];
        }

        // Load new month data
        const newData = await OptimizedCreditService.loadMonthData(y, m, filterOptions);
        setLocalCalendar(newData);
        setSelectedYear(y);
        setSelectedMonth(m);
      } catch (error) {
        console.error('Failed to load previous month:', error);
      } finally {
        setIsLoadingMonth(false);
      }
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

  const onJumpMonths = async (deltaMonths: number) => {
    const { y, m } = getYearMonthOffset(selectedYear, selectedMonth, deltaMonths);
    if (isAllowedYearMonth(y, m)) {
      setIsLoadingMonth(true);
      try {
        // Build filtering options
        const filterOptions: {
          cardIds?: string[];
          excludeHidden?: boolean;
        } = {
          excludeHidden: true,
        };
        if (selectedFilterCardId) {
          filterOptions.cardIds = [selectedFilterCardId];
        }

        // Load new month data
        const newData = await OptimizedCreditService.loadMonthData(y, m, filterOptions);
        setLocalCalendar(newData);
        setSelectedYear(y);
        setSelectedMonth(m);
      } catch (error) {
        console.error('Failed to jump to month:', error);
      } finally {
        setIsLoadingMonth(false);
      }
    }
  };

  // Current-month helpers
  const isOnCurrentMonth = useMemo(() => {
    const now = new Date();
    return selectedYear === now.getFullYear() && selectedMonth === (now.getMonth() + 1);
  }, [selectedYear, selectedMonth]);
  const goToCurrentPeriod = async () => {
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

    setIsLoadingMonth(true);
    try {
      // Build filtering options
      const filterOptions: {
        cardIds?: string[];
        excludeHidden?: boolean;
      } = {
        excludeHidden: true,
      };
      if (selectedFilterCardId) {
        filterOptions.cardIds = [selectedFilterCardId];
      }

      // Load current period data
      const newData = await OptimizedCreditService.loadMonthData(targetYear, targetMonth, filterOptions);
      setLocalCalendar(newData);
      setSelectedYear(targetYear);
      setSelectedMonth(targetMonth);
    } catch (error) {
      console.error('Failed to go to current period:', error);
    } finally {
      setIsLoadingMonth(false);
    }
  };

  // Toggles for filtering/visibility
  const [showUsed, setShowUsed] = useState<boolean>(true);
  const [showNotUsed, setShowNotUsed] = useState<boolean>(true);
  const [showPartiallyUsed, setShowPartiallyUsed] = useState<boolean>(true);
  const [showInactive, setShowInactive] = useState<boolean>(true);

  const [isCardFilterOpen, setIsCardFilterOpen] = useState(false);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  
  const handleOpenCardFilter = () => setIsCardFilterOpen(true);
  const handleSelectFilterCard = (card: CreditCard) => {
    setSelectedFilterCardId(card?.id || null);
    setIsCardFilterOpen(false);
  };

  // Filter reset function
  const handleResetFilters = () => {
    setShowUsed(true);
    setShowNotUsed(true);
    setShowPartiallyUsed(true);
    setShowInactive(true);
    setSelectedFilterCardId(null);
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
          <DrawerContent fitContent maxHeight="80vh">
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
            <div className="header-controls desktop-only">
              <div className="date-picker">
                <label className="filter-label">Year</label>
                <select
                  className="year-select default-select"
                  value={selectedYear}
                  onChange={async (e) => {
                    const newYear = parseInt(e.target.value);
                    const newMonth = clampMonthForYear(newYear, selectedMonth, accountCreatedAt);

                    setIsLoadingMonth(true);
                    try {
                      // Build filtering options
                      const filterOptions: {
                        cardIds?: string[];
                        excludeHidden?: boolean;
                      } = {
                        excludeHidden: true,
                      };
                      if (selectedFilterCardId) {
                        filterOptions.cardIds = [selectedFilterCardId];
                      }

                      // Load new year/month data
                      const newData = await OptimizedCreditService.loadMonthData(newYear, newMonth, filterOptions);
                      setLocalCalendar(newData);
                      setSelectedYear(newYear);
                      setSelectedMonth(newMonth);
                    } catch (error) {
                      console.error('Failed to load new year:', error);
                    } finally {
                      setIsLoadingMonth(false);
                    }
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
                    disabled={isLoadingMonth || !isAllowedYearMonth(utilGetPrevYearMonth(selectedYear, selectedMonth).y, utilGetPrevYearMonth(selectedYear, selectedMonth).m)}
                  >
                    <Icon name="chevron-down" variant="mini" size={16} className="rotate-90" />
                  </button>
                  <select
                    className="month-select default-select"
                    value={selectedMonth}
                    onChange={async (e) => {
                      const m = parseInt(e.target.value);
                      if (isAllowedYearMonth(selectedYear, m)) {
                        setIsLoadingMonth(true);
                        try {
                          // Build filtering options
                          const filterOptions: {
                            cardIds?: string[];
                            excludeHidden?: boolean;
                          } = {
                            excludeHidden: true,
                          };
                          if (selectedFilterCardId) {
                            filterOptions.cardIds = [selectedFilterCardId];
                          }

                          // Load new month data
                          const newData = await OptimizedCreditService.loadMonthData(selectedYear, m, filterOptions);
                          setLocalCalendar(newData);
                          setSelectedMonth(m);
                        } catch (error) {
                          console.error('Failed to load new month:', error);
                        } finally {
                          setIsLoadingMonth(false);
                        }
                      }
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
                    disabled={isLoadingMonth || !isAllowedYearMonth(utilGetNextYearMonth(selectedYear, selectedMonth).y, utilGetNextYearMonth(selectedYear, selectedMonth).m)}
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
            <div className="header-controls mobile-only">
              <div className="date-picker">
                <label className="filter-label">Year</label>
                <select
                  className="year-select default-select"
                  value={selectedYear}
                  onChange={async (e) => {
                    const newYear = parseInt(e.target.value);
                    const newMonth = clampMonthForYear(newYear, selectedMonth, accountCreatedAt);

                    setIsLoadingMonth(true);
                    try {
                      // Build filtering options
                      const filterOptions: {
                        cardIds?: string[];
                        excludeHidden?: boolean;
                      } = {
                        excludeHidden: true,
                      };
                      if (selectedFilterCardId) {
                        filterOptions.cardIds = [selectedFilterCardId];
                      }

                      // Load new year/month data
                      const newData = await OptimizedCreditService.loadMonthData(newYear, newMonth, filterOptions);
                      setLocalCalendar(newData);
                      setSelectedYear(newYear);
                      setSelectedMonth(newMonth);
                    } catch (error) {
                      console.error('Failed to load new year:', error);
                    } finally {
                      setIsLoadingMonth(false);
                    }
                  }}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="button outline small desktop-only"
                onClick={handleResetFilters}
                aria-label="Reset filters to defaults"
              >
                Reset Filters
              </button>
              <button
                className="button small mobile-only icon with-text"
                onClick={() => setIsFiltersDrawerOpen(true)}
                aria-label="Open filters drawer"
              >
                <Icon name="filter" variant="mini" size={16} />
                Filters
              </button>
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
                onUpdateHistoryEntry={async ({ cardId, creditId, periodNumber, creditUsage, valueUsed }) => {
                  // Optimistically update localCalendar in place for immediate feedback
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

                  // Persist the change to the database and refresh data
                  try {
                    await OptimizedCreditService.updateCreditHistoryEntry({
                      cardId,
                      creditId,
                      periodNumber,
                      creditUsage,
                      valueUsed
                    });

                    // After successful update, refresh the data from backend
                    const filterOptions: {
                      cardIds?: string[];
                      excludeHidden?: boolean;
                    } = {
                      excludeHidden: true,
                    };
                    if (selectedFilterCardId) {
                      filterOptions.cardIds = [selectedFilterCardId];
                    }

                    // Load current month immediately, then full year in background
                    const currentMonthData = await OptimizedCreditService.loadMonthData(selectedYear, selectedMonth, filterOptions);
                    setLocalCalendar(currentMonthData);

                    // Load full year in background to refresh navigation cache
                    setTimeout(async () => {
                      try {
                        const fullYearData = await UserCreditService.fetchCreditHistoryForYear(selectedYear, filterOptions);
                        if (fullYearData) {
                          // Populate cache with all months from the year data without overwriting display
                          OptimizedCreditService.populateCacheFromYearData(fullYearData, filterOptions);
                        }
                      } catch (yearError) {
                        console.error('Background year refresh failed:', yearError);
                      }
                    }, 50);
                  } catch (error) {
                    console.error('Failed to update credit history entry:', error);
                    // On error, reload current month data
                    try {
                      const filterOptions: {
                        cardIds?: string[];
                        excludeHidden?: boolean;
                      } = {
                        excludeHidden: true,
                      };
                      if (selectedFilterCardId) {
                        filterOptions.cardIds = [selectedFilterCardId];
                      }

                      const updatedCalendar = await OptimizedCreditService.loadMonthData(selectedYear, selectedMonth, filterOptions);
                      setLocalCalendar(updatedCalendar);
                    } catch (reloadError) {
                      console.error('Failed to reload credit history after update error:', reloadError);
                    }
                  }
                }}
                />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer open={isFiltersDrawerOpen} onOpenChange={setIsFiltersDrawerOpen}>
        <DrawerContent className="mobile-credits-filters-drawer" fitContent maxHeight="80vh">
          <DrawerTitle className="sr-only">Filters</DrawerTitle>
          <div className="dialog-header drawer-sticky-header history-filters-header">
            <h2>Filters</h2>
            <div className="header-actions">
              <span
                className="reset-link"
                onClick={handleResetFilters}
                role="button"
                tabIndex={0}
                aria-label="Reset filters to defaults"
              >
                Reset
              </span>
            </div>
          </div>
          <div className="dialog-body">
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
          <div className="dialog-footer">
            <div className="button-group">
              <button
                className="button"
                onClick={() => setIsFiltersDrawerOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile-only sticky footer controls */}
      {isMobileViewport && (
        <div className="mobile-sticky-footer" role="region" aria-label="Month navigation">
          <div className="footer-date-controls">
            <div className="date-control-group">
              <label className="caps-label">Month</label>
              <div className="month-controls">
                <button
                  type="button"
                  aria-label="Previous month"
                  className="button outline small px-2"
                  onClick={decrementMonth}
                  disabled={isLoadingMonth || !isAllowedYearMonth(utilGetPrevYearMonth(selectedYear, selectedMonth).y, utilGetPrevYearMonth(selectedYear, selectedMonth).m)}
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
                  disabled={isLoadingMonth || !isAllowedYearMonth(utilGetNextYearMonth(selectedYear, selectedMonth).y, utilGetNextYearMonth(selectedYear, selectedMonth).m)}
                >
                  <Icon name="chevron-down" variant="mini" size={16} className="-rotate-90" />
                </button>
              </div>
            </div>
            {!isOnCurrentMonth && (
              <button
                type="button"
                aria-label="Go to current period"
                className="button outline small icon with-text current-period-btn"
                onClick={goToCurrentPeriod}
              >
                <Icon name="map-pin" variant="micro" size={16} />
                <span>Back to Today</span>
              </button>
            )}
          </div>
        </div>
      )}

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


