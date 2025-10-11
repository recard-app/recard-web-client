import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import { PAGE_ICONS, PAGE_NAMES, PAGES, CalendarUserCredits, MONTH_OPTIONS, CREDIT_USAGE_DISPLAY_NAMES, MOBILE_BREAKPOINT, DISABLE_MOBILE_CREDITS_STICKY_FOOTER } from '../../../types';
import { NEUTRAL_DARK_GRAY } from '../../../types/Colors';
import { UserCreditsTrackingPreferences, CREDIT_HIDE_PREFERENCE, CREDIT_USAGE_ICON_NAMES, HistoricalMonthlySummaryResponse, CREDIT_SUMMARY_SECTIONS } from '../../../types/CardCreditsTypes';
import { useCredits } from '../../../contexts/ComponentsContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../../components/ui/dialog/dialog';
import CreditsHistoryHelpModal from './CreditsHistoryHelpModal';
import { UserCreditService } from '../../../services/UserServices';
import { UserService } from '../../../services/UserServices';
import CreditsDisplay from '../../../components/CreditsDisplay';
import { CreditCardDetails } from '../../../types/CreditCardTypes';
import { InfoDisplay } from '../../../elements';
import HeaderControls from '@/components/PageControls/HeaderControls';
import FooterControls from '@/components/PageControls/FooterControls';
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
import '../shared-credits-layout.scss';
import './CreditsHistory.scss';

interface CreditsHistoryProps {
  userCardDetails: CreditCardDetails[];
  reloadTrigger?: number;
  onRefreshMonthlyStats?: () => void;
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
  onClearAllUpdatingCredits?: () => void;
}

const CreditsHistory: React.FC<CreditsHistoryProps> = ({ userCardDetails, reloadTrigger, onRefreshMonthlyStats, onAddUpdatingCreditId, onRemoveUpdatingCreditId, isCreditUpdating, onClearAllUpdatingCredits }) => {
  // Use the full height hook for this page
  useFullHeight(true);

  // Get credits data from ComponentsContext
  const allCredits = useCredits();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [localCalendar, setLocalCalendar] = useState<CalendarUserCredits | null>(null);
  const [lastOptimisticUpdate, setLastOptimisticUpdate] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
  const [selectedFilterCardId, setSelectedFilterCardId] = useState<string | null>(null);
  const [trackingPreferences, setTrackingPreferences] = useState<UserCreditsTrackingPreferences | null>(null);
  const [historicalSummary, setHistoricalSummary] = useState<HistoricalMonthlySummaryResponse | null>(null);
  const [isLoadingHistoricalSummary, setIsLoadingHistoricalSummary] = useState<boolean>(false);
  const [isUpdatingHistoricalSummary, setIsUpdatingHistoricalSummary] = useState<boolean>(false);

  // Helper function to clear all updating indicators
  const clearAllUpdatingIndicators = () => {
    if (onClearAllUpdatingCredits) {
      onClearAllUpdatingCredits();
    }
  };

  // Function to refresh calendar data after updates
  const refreshCalendar = async () => {
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

      const updatedCalendar = await UserCreditService.fetchCreditHistoryForYear(selectedYear, filterOptions);
      updateLocalCalendar(updatedCalendar);

      // Also refresh monthly stats when credits are updated
      if (onRefreshMonthlyStats) {
        onRefreshMonthlyStats();
      }

      // Refresh historical summary with updated credit values
      try {
        setIsUpdatingHistoricalSummary(true);
        const summary = await UserCreditService.fetchHistoricalMonthlySummary(selectedYear, selectedMonth, false);
        setHistoricalSummary(summary);
      } catch (summaryError) {
        console.error('Failed to refresh historical summary:', summaryError);
      } finally {
        setIsUpdatingHistoricalSummary(false);
      }
    } catch (error) {
      console.error('Failed to refresh credit history:', error);
    } finally {
      // Clear all updating indicators after refresh completes (success or failure)
      clearAllUpdatingIndicators();
    }
  };

  // Simplified update function - no complex protection, just trust optimistic updates
  const updateLocalCalendar = (data: CalendarUserCredits | null) => {
    setLocalCalendar(data);
  };

  // No cache to clear when card filter changes - using direct API calls

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't clear cache on unmount as it might be used by other components
      // OptimizedCreditService.clearCache();
    };
  }, []);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
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
    console.log(`[CreditsHistory] Main data loading useEffect triggered:`, {
      reloadTrigger,
      selectedYear,
      selectedMonth,
      selectedFilterCardId,
      timestamp: Date.now()
    });

    let mounted = true;
    (async () => {
      setIsLoading(true);
      setIsLoadingMonth(true);

      // Sync credit history on page visit to ensure data is up-to-date
      try {
        await UserCreditService.syncYearCreditsDebounced(selectedYear, { excludeHidden: true });
      } catch (syncError) {
        console.warn('Failed to sync credit history on page visit:', syncError);
      }

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
        const currentMonthData = await UserCreditService.fetchCreditHistoryForYear(selectedYear, filterOptions);

        if (!mounted) return;
        updateLocalCalendar(currentMonthData);
        setIsLoading(false);

        // No background loading - keep it simple

        setIsLoadingMonth(false);
      } catch (error) {
        // Fallback: sync credit history and try again
        try {
          await UserCreditService.syncYearCreditsDebounced(selectedYear, { excludeHidden: true });

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
          const cal = await UserCreditService.fetchCreditHistoryForYear(
            selectedYear,
            fallbackFilterOptions
          );
          if (mounted) {
            updateLocalCalendar(cal);
            setIsLoading(false);
            setIsLoadingMonth(false);
          }
        } catch (e) {
          console.error('Failed to initialize credit history:', e);
          if (mounted) {
    updateLocalCalendar(null);
            setIsLoading(false);
            setIsLoadingMonth(false);
          }
        }
      }
    })();
    return () => { mounted = false; };
  }, [reloadTrigger, selectedYear, selectedMonth, selectedFilterCardId]);

  // Fetch historical summary when year/month changes
  useEffect(() => {
    const fetchHistoricalSummary = async () => {
      setIsLoadingHistoricalSummary(true);
      try {
        const summary = await UserCreditService.fetchHistoricalMonthlySummary(selectedYear, selectedMonth, false);
        setHistoricalSummary(summary);
      } catch (error) {
        console.error('Failed to fetch historical summary:', error);
        setHistoricalSummary(null);
      } finally {
        setIsLoadingHistoricalSummary(false);
      }
    };

    fetchHistoricalSummary();
  }, [selectedYear, selectedMonth]);

  // Load tracking preferences on mount
  useEffect(() => {
    const fetchTrackingPreferences = async () => {
      try {
        const preferences = await UserCreditService.fetchCreditTrackingPreferences();
        setTrackingPreferences(preferences);
      } catch (error) {
        console.error('Error fetching credit tracking preferences:', error);
        setTrackingPreferences(null);
      }
    };

    fetchTrackingPreferences();
  }, []);

  // Helper function to check if a credit should be hidden based on tracking preferences
  // (This is kept for potential future use, but server now handles excludeHidden filtering)
  const isCreditHidden = (cardId: string, creditId: string): boolean => {
    if (!trackingPreferences) return false;

    const cardPrefs = trackingPreferences.Cards.find(card => card.CardId === cardId);
    if (!cardPrefs) return false;

    const creditPref = cardPrefs.Credits.find(credit => credit.CreditId === creditId);
    return creditPref?.HidePreference === CREDIT_HIDE_PREFERENCE.HIDE_ALL;
  };

  // Server now handles all filtering including user's selected cards validation
  // No more client-side allowedPairs filtering needed
  const filteredCalendar: CalendarUserCredits | null = localCalendar;

  // Check if all credits have metadata loaded to prevent showing IDs as titles
  const allCreditsHaveMetadata = useMemo(() => {
    if (!filteredCalendar || !filteredCalendar.Credits || !allCredits) return false;

    return filteredCalendar.Credits.every((uc) => {
      // Find the credit metadata using the separate credits data
      const cardCredit = allCredits.find(credit => credit.id === uc.CreditId);
      return cardCredit != null;
    });
  }, [filteredCalendar, allCredits]);

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
      const currentYear = selectedYear; // Store original year before updating

      // If staying in same year, just update state immediately - no API calls needed
      if (y === currentYear) {
        setSelectedYear(y);
        setSelectedMonth(m);
        return;
      }

      // Different year - need to fetch data
      setIsLoadingMonth(true);

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

      try {
        // Load stale data immediately (fast)
        const staleData = await UserCreditService.fetchCreditHistoryForYear(y, filterOptions);
        updateLocalCalendar(staleData);
        setSelectedYear(y);
        setSelectedMonth(m);
        setIsLoadingMonth(false);

        // Sync in background - sync response already includes filtered data
        try {
          const syncedData = await UserCreditService.syncYearCreditsDebounced(y, { excludeHidden: true });
          updateLocalCalendar(syncedData);
        } catch (syncError) {
          console.warn('Background sync failed for year', y, syncError);
        }
      } catch (error) {
        console.error('Failed to load next month:', error);
        setIsLoadingMonth(false);
      }
    }
  };

  const decrementMonth = async () => {
    const { y, m } = utilGetPrevYearMonth(selectedYear, selectedMonth);
    if (isAllowedYearMonth(y, m)) {
      const currentYear = selectedYear; // Store original year before updating

      // If staying in same year, just update state immediately - no API calls needed
      if (y === currentYear) {
        setSelectedYear(y);
        setSelectedMonth(m);
        return;
      }

      // Different year - need to fetch data
      setIsLoadingMonth(true);

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

      try {
        // Load stale data immediately (fast)
        const staleData = await UserCreditService.fetchCreditHistoryForYear(y, filterOptions);
        updateLocalCalendar(staleData);
        setSelectedYear(y);
        setSelectedMonth(m);
        setIsLoadingMonth(false);

        // Sync in background - sync response already includes filtered data
        try {
          const syncedData = await UserCreditService.syncYearCreditsDebounced(y, { excludeHidden: true });
          updateLocalCalendar(syncedData);
        } catch (syncError) {
          console.warn('Background sync failed for year', y, syncError);
        }
      } catch (error) {
        console.error('Failed to load previous month:', error);
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
      const currentYear = selectedYear; // Store original year before updating

      // If staying in same year, just update state immediately - no API calls needed
      if (y === currentYear) {
        setSelectedYear(y);
        setSelectedMonth(m);
        return;
      }

      // Different year - need to fetch data
      setIsLoadingMonth(true);

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

      try {
        // Load stale data immediately (fast)
        const staleData = await UserCreditService.fetchCreditHistoryForYear(y, filterOptions);
        updateLocalCalendar(staleData);
        setSelectedYear(y);
        setSelectedMonth(m);
        setIsLoadingMonth(false);

        // Sync in background - sync response already includes filtered data
        try {
          const syncedData = await UserCreditService.syncYearCreditsDebounced(y, { excludeHidden: true });
          updateLocalCalendar(syncedData);
        } catch (syncError) {
          console.warn('Background sync failed for year', y, syncError);
        }
      } catch (error) {
        console.error('Failed to jump to month:', error);
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
      const newData = await UserCreditService.fetchCreditHistoryForYear(targetYear, filterOptions);
      updateLocalCalendar(newData);
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
        titleLink={PAGES.MY_CREDITS.PATH}
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
            {!isMobileViewport && (
                <div className="header-controls">
                <div className="date-picker">
                  <label className="filter-label">Year</label>
                  <select
                    className="year-select default-select"
                    value={selectedYear}
                    onChange={async (e) => {
                      const newYear = parseInt(e.target.value);
                      const newMonth = clampMonthForYear(newYear, selectedMonth, accountCreatedAt);

                      setIsLoadingMonth(true);

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

                      try {
                        // Load stale data immediately (fast)
                        const staleData = await UserCreditService.fetchCreditHistoryForYear(newYear, filterOptions);
                        updateLocalCalendar(staleData);
                        setSelectedYear(newYear);
                        setSelectedMonth(newMonth);
                        setIsLoadingMonth(false);

                        // Sync in background - sync response already includes filtered data
                        try {
                          const syncedData = await UserCreditService.syncYearCreditsDebounced(newYear, { excludeHidden: true });
                          updateLocalCalendar(syncedData);
                        } catch (syncError) {
                          console.warn('Background sync failed for year', newYear, syncError);
                        }
                      } catch (error) {
                        console.error('Failed to load new year:', error);
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
                            const newData = await UserCreditService.fetchCreditHistoryForYear(selectedYear, filterOptions);
                            updateLocalCalendar(newData);
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
                    {!isOnCurrentMonth && (
                      <button
                        type="button"
                        aria-label="Go to current period"
                        className="button outline small px-2"
                        onClick={goToCurrentPeriod}
                      >
                        <Icon name="map-pin" variant="micro" size={16} />
                      </button>
                    )}
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
                <ToggleBar className="connected items-center gap-2">
                  <span className="caps-label">Credits to Show</span>
                  <ToggleBarButton pressed={showUsed} onPressedChange={setShowUsed} className="small icon with-text">
                    <Icon name={CREDIT_USAGE_ICON_NAMES.USED} variant="micro" size={14} />
                    <span>{CREDIT_USAGE_DISPLAY_NAMES.USED}</span>
                  </ToggleBarButton>
                  <ToggleBarButton pressed={showNotUsed} onPressedChange={setShowNotUsed} className="small icon with-text">
                    <Icon name={CREDIT_USAGE_ICON_NAMES.NOT_USED} variant="micro" size={14} />
                    <span>{CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}</span>
                  </ToggleBarButton>
                  <ToggleBarButton pressed={showPartiallyUsed} onPressedChange={setShowPartiallyUsed} className="small icon with-text">
                    <Icon name={CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED} variant="micro" size={14} />
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
                      CardDetails: card.CardDetails || '',
                      effectiveFrom: card.effectiveFrom,
                      effectiveTo: card.effectiveTo,
                      lastUpdated: card.lastUpdated
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
            )}
            {isMobileViewport && (
                <div className="header-controls">
                  <div className="date-picker">
                    <select
                      className="year-select default-select"
                      value={selectedYear}
                      onChange={async (e) => {
                        const newYear = parseInt(e.target.value);
                        const newMonth = clampMonthForYear(newYear, selectedMonth, accountCreatedAt);

                        setIsLoadingMonth(true);

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

                        try {
                          // Load stale data immediately (fast)
                          const staleData = await UserCreditService.fetchCreditHistoryForYear(newYear, filterOptions);
                          updateLocalCalendar(staleData);
                          setSelectedYear(newYear);
                          setSelectedMonth(newMonth);
                          setIsLoadingMonth(false);

                          // Sync in background - sync response already includes filtered data
                          try {
                            const syncedData = await UserCreditService.syncYearCreditsDebounced(newYear, { excludeHidden: true });
                            updateLocalCalendar(syncedData);
                          } catch (syncError) {
                            console.warn('Background sync failed for year', newYear, syncError);
                          }
                        } catch (error) {
                          console.error('Failed to load new year:', error);
                          setIsLoadingMonth(false);
                        }
                      }}
                    >
                      {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  {DISABLE_MOBILE_CREDITS_STICKY_FOOTER && (
                    <div className="date-picker">
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
                              const newData = await UserCreditService.fetchCreditHistoryForYear(selectedYear, filterOptions);
                              updateLocalCalendar(newData);
                              setSelectedMonth(m);
                            } catch (error) {
                              console.error('Failed to load new month:', error);
                            } finally {
                              setIsLoadingMonth(false);
                            }
                          }
                        }}
                      >
                        {MONTH_OPTIONS.filter(m => isAllowedYearMonth(selectedYear, m.value)).map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
            )}
            <div className="header-actions">
                {!isMobileViewport && (
                  <button
                    className="button outline small"
                    onClick={handleResetFilters}
                    aria-label="Reset filters to defaults"
                  >
                    Reset Filters
                  </button>
                )}
                {isMobileViewport && (
                  <button
                    className="button small icon with-text"
                    onClick={() => setIsFiltersDrawerOpen(true)}
                    aria-label="Open filters drawer"
                  >
                    <Icon name="filter" variant="mini" size={16} />
                    Filters
                  </button>
                )}
            </div>
          </HeaderControls>

          <div className="credits-history-content">
            {(isLoading || !allCreditsHaveMetadata) ? (
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
                displayPeriod={false}
                onUpdateComplete={refreshCalendar}
                onAddUpdatingCreditId={onAddUpdatingCreditId}
                onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
                isCreditUpdating={isCreditUpdating}
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
                <Icon name={CREDIT_USAGE_ICON_NAMES.USED} variant="micro" size={14} />
                <span>{CREDIT_USAGE_DISPLAY_NAMES.USED}</span>
              </ToggleBarButton>
              <ToggleBarButton pressed={showNotUsed} onPressedChange={setShowNotUsed} className="small icon with-text">
                <Icon name={CREDIT_USAGE_ICON_NAMES.NOT_USED} variant="micro" size={14} />
                <span>{CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}</span>
              </ToggleBarButton>
              <ToggleBarButton pressed={showPartiallyUsed} onPressedChange={setShowPartiallyUsed} className="small icon with-text">
                <Icon name={CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED} variant="micro" size={14} />
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
                  CardDetails: card.CardDetails || '',
                  effectiveFrom: card.effectiveFrom,
                  effectiveTo: card.effectiveTo,
                  lastUpdated: card.lastUpdated
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

      {/* Footer with historical summary */}
      <FooterControls>
        <div className="historical-summary-section">
          {isLoadingHistoricalSummary ? (
            <InfoDisplay
              type="loading"
              message="Loading summary..."
              showTitle={false}
              transparent={true}
              centered
            />
          ) : historicalSummary ? (
            <div className={`summary-stats ${isUpdatingHistoricalSummary ? 'updating' : ''}`}>
              <div className="stat-group">
                <span className="stat-label">
                  <Icon name={CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
                  {CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.displayName}
                </span>
                <div className="stat-value-container">
                  <span className="stat-value">
                    ${historicalSummary.MonthlyCredits.usedValue.toFixed(2)} / ${historicalSummary.MonthlyCredits.possibleValue.toFixed(2)}
                  </span>
                  <span className="stat-detail">
                    ({historicalSummary.MonthlyCredits.usedCount} / {historicalSummary.MonthlyCredits.usedCount + historicalSummary.MonthlyCredits.partiallyUsedCount + historicalSummary.MonthlyCredits.unusedCount})
                  </span>
                </div>
              </div>
              <div className="stat-group">
                <span className="stat-label">
                  <Icon name={CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
                  {CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.displayName}
                </span>
                <div className="stat-value-container">
                  <span className="stat-value">
                    ${historicalSummary.CurrentCredits.usedValue.toFixed(2)} / ${historicalSummary.CurrentCredits.possibleValue.toFixed(2)}
                  </span>
                  <span className="stat-detail">
                    ({historicalSummary.CurrentCredits.usedCount} / {historicalSummary.CurrentCredits.usedCount + historicalSummary.CurrentCredits.partiallyUsedCount + historicalSummary.CurrentCredits.unusedCount})
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </FooterControls>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credits History Help</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <CreditsHistoryHelpModal />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditsHistory;


