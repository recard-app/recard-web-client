import React, { useState, useEffect, useMemo, useCallback, useRef, ReactNode, MutableRefObject } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog/dialog';
import { Drawer, DrawerContent, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import CreditShowcase from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditShowcase';
import CreditEntryDetails from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails';
import CreditModalControls from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditModalControls';
import CreditUsageTracker from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails/CreditUsageTracker';
import { CreditDrawerShowcaseSkeleton, CreditDrawerTrackerSkeleton, CreditDrawerControlsSkeleton } from './CreditDrawerSkeleton';
import { UserCreditService } from '@/services/UserServices/UserCreditService';
import {
  CreditUsageType,
  MOBILE_BREAKPOINT,
  CREDIT_MODAL_TITLE,
  CREDIT_MODAL_WIDTH,
  MODAL_CLOSE_ANIMATION_MS,
  CREDIT_INTERVALS,
  CREDIT_PERIODS,
  UserCredit,
  PrioritizedCredit,
} from '@/types';
import { CreditCardDetails } from '@/types/CreditCardTypes';
import { useCredits } from './useComponents';
import { CreditDrawerContext, useCreditDrawer } from './useCreditDrawer';
import type { CreditDrawerContextType, CreditDrawerIdentifier, FallbackData } from './useCreditDrawer';

// --- Types ---

interface CreditDrawerProviderProps {
  prioritizedCredits: PrioritizedCredit[];
  userDetailedCardDetails: CreditCardDetails[];
  onUpdateComplete: () => void;
  onAddUpdatingCreditId: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating: (cardId: string, creditId: string, periodNumber: number) => boolean;
  children: ReactNode;
}

// --- Hook: useIsMobile ---

const useIsMobile = () => {
  const getIsMobile = () => (
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkScreenSize = () => {
      setIsMobile(getIsMobile());
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

// --- Provider ---

export const CreditDrawerProvider: React.FC<CreditDrawerProviderProps> = ({
  prioritizedCredits,
  userDetailedCardDetails,
  onUpdateComplete,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCreditId, setActiveCreditId] = useState<CreditDrawerIdentifier | null>(null);
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [initialPeriodNumber, setInitialPeriodNumber] = useState<number | undefined>(undefined);
  const [fallbackData, setFallbackDataState] = useState<FallbackData | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openDrawer = useCallback((params: {
    cardId: string;
    creditId: string;
    year?: number;
    isLoading?: boolean;
    initialPeriodNumber?: number;
    fallbackData?: FallbackData;
  }) => {
    clearCloseTimeout();
    setActiveCreditId({ cardId: params.cardId, creditId: params.creditId });
    if (params.year !== undefined) setYear(params.year);
    setIsLoading(params.isLoading ?? false);
    setInitialPeriodNumber(params.initialPeriodNumber);
    setFallbackDataState(params.fallbackData ?? null);
    setIsOpen(true);
  }, [clearCloseTimeout]);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    clearCloseTimeout();
    // Delay clearing data to allow close animation to complete
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveCreditId(null);
      setFallbackDataState(null);
      setIsLoading(false);
      setYear(new Date().getFullYear());
      setInitialPeriodNumber(undefined);
      closeTimeoutRef.current = null;
    }, MODAL_CLOSE_ANIMATION_MS);
  }, [clearCloseTimeout]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  const setFallbackData = useCallback((data: FallbackData) => {
    setFallbackDataState(data);
  }, []);

  const contextValue = useMemo<CreditDrawerContextType>(() => ({
    isOpen,
    activeCreditId,
    year,
    isLoading,
    openDrawer,
    closeDrawer,
    setYear,
    setLoading: setIsLoading,
    setFallbackData,
  }), [isOpen, activeCreditId, year, isLoading, openDrawer, closeDrawer, setFallbackData]);

  return (
    <CreditDrawerContext.Provider value={contextValue}>
      {children}
      <CreditDrawerRenderer
        activeCreditId={activeCreditId}
        isOpen={isOpen}
        isLoading={isLoading}
        year={year}
        initialPeriodNumber={initialPeriodNumber}
        fallbackData={fallbackData}
        prioritizedCredits={prioritizedCredits}
        userDetailedCardDetails={userDetailedCardDetails}
        onUpdateComplete={onUpdateComplete}
        onAddUpdatingCreditId={onAddUpdatingCreditId}
        onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
        isCreditUpdating={isCreditUpdating}
        onClose={closeDrawer}
      />
    </CreditDrawerContext.Provider>
  );
};

// --- Renderer ---

interface CreditDrawerRendererProps {
  activeCreditId: CreditDrawerIdentifier | null;
  isOpen: boolean;
  isLoading: boolean;
  year: number;
  initialPeriodNumber: number | undefined;
  fallbackData: FallbackData | null;
  prioritizedCredits: PrioritizedCredit[];
  userDetailedCardDetails: CreditCardDetails[];
  onUpdateComplete: () => void;
  onAddUpdatingCreditId: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating: (cardId: string, creditId: string, periodNumber: number) => boolean;
  onClose: () => void;
}

const CreditDrawerRenderer: React.FC<CreditDrawerRendererProps> = ({
  activeCreditId,
  isOpen,
  isLoading,
  year,
  initialPeriodNumber,
  fallbackData,
  prioritizedCredits,
  userDetailedCardDetails,
  onUpdateComplete,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const allCredits = useCredits();
  const activeCreditKey = useMemo(
    () => (activeCreditId ? `${activeCreditId.cardId}:${activeCreditId.creditId}` : null),
    [activeCreditId]
  );

  // Resolve live data from prioritizedCredits or fallbackData
  const resolvedData = useMemo(() => {
    if (!activeCreditId) return null;

    // If fallbackData is provided, prefer it — the caller supplied the correct
    // data for their context (e.g., history page viewing a previous year).
    if (fallbackData) {
      return {
        userCredit: fallbackData.userCredit,
        card: fallbackData.card,
        cardCredit: fallbackData.cardCredit,
      };
    }

    // Otherwise resolve from prioritizedCredits (current-year data)
    const pc = prioritizedCredits.find(
      c => c.CardId === activeCreditId.cardId && c.CreditId === activeCreditId.creditId
    );

    if (pc) {
      // Convert PrioritizedCredit to UserCredit format
      const userCredit: UserCredit = {
        CardId: pc.CardId,
        CreditId: pc.CreditId,
        AssociatedPeriod: pc.AssociatedPeriod,
        History: pc.History || [],
        isAnniversaryBased: pc.isAnniversaryBased,
        anniversaryDate: pc.anniversaryDate,
        anniversaryYear: pc.anniversaryYear,
        Title: pc.name,
      };

      const card = userDetailedCardDetails.find(c => c.id === pc.CardId) || null;
      const cardCredit = allCredits.find(
        c => c.ReferenceCardId === activeCreditId.cardId && c.id === activeCreditId.creditId
      ) || null;

      return { userCredit, card, cardCredit };
    }

    return null;
  }, [activeCreditId, prioritizedCredits, userDetailedCardDetails, allCredits, fallbackData]);

  const [stableResolvedData, setStableResolvedData] = useState<{
    key: string;
    data: {
      userCredit: UserCredit;
      card: CreditCardDetails;
      cardCredit: NonNullable<FallbackData['cardCredit']>;
    };
  } | null>(null);

  // Keep the latest fully-resolved payload for the active credit so drawer content
  // can stay visible if the active credit is filtered out during background refresh.
  useEffect(() => {
    if (
      !activeCreditKey ||
      !resolvedData?.userCredit ||
      !resolvedData.card ||
      !resolvedData.cardCredit
    ) {
      return;
    }

    setStableResolvedData({
      key: activeCreditKey,
      data: {
        userCredit: resolvedData.userCredit,
        card: resolvedData.card,
        cardCredit: resolvedData.cardCredit,
      },
    });
  }, [activeCreditKey, resolvedData]);

  // Replace stale snapshot immediately when the active credit changes.
  useEffect(() => {
    setStableResolvedData((prev) => {
      if (!activeCreditKey) return null;
      if (!prev) return prev;
      return prev.key === activeCreditKey ? prev : null;
    });
  }, [activeCreditKey]);

  // Ensure no stale snapshot survives a close/unmount.
  useEffect(() => {
    if (!isOpen) {
      setStableResolvedData(null);
    }
  }, [isOpen]);

  const stableSnapshotForActiveKey = useMemo(() => {
    if (!activeCreditKey || !stableResolvedData) return null;
    return stableResolvedData.key === activeCreditKey ? stableResolvedData.data : null;
  }, [activeCreditKey, stableResolvedData]);

  const effectiveResolvedData = resolvedData ?? stableSnapshotForActiveKey;

  // Date for period calculations
  const now = useMemo(() => {
    const date = new Date();
    date.setFullYear(year);
    return date;
  }, [isOpen, year]);

  // Compute current period number
  const currentPeriodNumber = useMemo(() => {
    if (!effectiveResolvedData?.userCredit) return 1;
    const uc = effectiveResolvedData.userCredit;

    if (uc.isAnniversaryBased) return 1;

    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === uc.AssociatedPeriod
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return 1;

    const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
    if (intervals <= 1) return 1;
    const monthZeroBased = now.getMonth();
    const segmentLength = 12 / intervals;
    return Math.min(Math.max(Math.floor(monthZeroBased / segmentLength) + 1, 1), intervals);
  }, [now, effectiveResolvedData?.userCredit]);

  // Selected period state
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(
    initialPeriodNumber ?? currentPeriodNumber
  );

  // Local copy for optimistic updates
  const [localUserCredit, setLocalUserCredit] = useState<UserCredit | null>(null);

  // Live update state for real-time bar graph updates
  const [liveUsage, setLiveUsage] = useState<CreditUsageType | undefined>(undefined);
  const [liveValueUsed, setLiveValueUsed] = useState<number | undefined>(undefined);

  const handleLiveChange = useCallback((usage: CreditUsageType, valueUsed: number) => {
    setLiveUsage(usage);
    setLiveValueUsed(valueUsed);
  }, []);

  // Sync localUserCredit when effective resolved data changes
  useEffect(() => {
    if (effectiveResolvedData?.userCredit) {
      setLocalUserCredit(effectiveResolvedData.userCredit);
    }
  }, [effectiveResolvedData?.userCredit?.CardId, effectiveResolvedData?.userCredit?.CreditId, effectiveResolvedData?.userCredit?.History]);

  // Prevent rendering stale optimistic data from a previous active credit.
  useEffect(() => {
    setLocalUserCredit((prev) => {
      if (!prev || !activeCreditId) return prev;
      if (prev.CardId === activeCreditId.cardId && prev.CreditId === activeCreditId.creditId) {
        return prev;
      }
      return null;
    });
  }, [activeCreditId]);

  // Reset period selection when drawer opens or initialPeriodNumber changes
  useEffect(() => {
    if (isOpen) {
      setSelectedPeriodNumber(initialPeriodNumber ?? currentPeriodNumber);
      setLiveUsage(undefined);
      setLiveValueUsed(undefined);
    }
  }, [isOpen, initialPeriodNumber, currentPeriodNumber]);

  // Reset live values when selected period changes
  useEffect(() => {
    setLiveUsage(undefined);
    setLiveValueUsed(undefined);
  }, [selectedPeriodNumber]);

  // Credit max value
  const creditMaxValue = useMemo(() => {
    return effectiveResolvedData?.cardCredit?.Value || 0;
  }, [effectiveResolvedData?.cardCredit]);

  // Expiration info
  const isExpiring = useMemo(() => {
    if (!activeCreditId) return false;
    if (year !== new Date().getFullYear()) return false;
    const pc = prioritizedCredits.find(
      c => c.CardId === activeCreditId.cardId && c.CreditId === activeCreditId.creditId
    );
    return pc?.isExpiring ?? false;
  }, [activeCreditId, prioritizedCredits, year]);

  const daysUntilExpiration = useMemo(() => {
    if (!activeCreditId) return undefined;
    const pc = prioritizedCredits.find(
      c => c.CardId === activeCreditId.cardId && c.CreditId === activeCreditId.creditId
    );
    return pc?.daysUntilExpiration;
  }, [activeCreditId, prioritizedCredits]);

  // Handle credit history updates
  const handleUpdateHistoryEntry = async (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => {
    const activeLocalCredit = (
      localUserCredit &&
      activeCreditId &&
      localUserCredit.CardId === activeCreditId.cardId &&
      localUserCredit.CreditId === activeCreditId.creditId
    ) ? localUserCredit : null;
    const baseUserCredit = activeLocalCredit ?? effectiveResolvedData?.userCredit;
    if (!baseUserCredit) return;

    onAddUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);

    // Optimistically update local state
    setLocalUserCredit((prev) => {
      const prevMatchesActive = Boolean(
        prev &&
        activeCreditId &&
        prev.CardId === activeCreditId.cardId &&
        prev.CreditId === activeCreditId.creditId
      );
      const sourceCredit = prevMatchesActive ? prev : baseUserCredit;
      if (!sourceCredit) return prev;
      return {
        ...sourceCredit,
        History: sourceCredit.History.map((h) => {
          if (h.PeriodNumber === update.periodNumber) {
            return {
              ...h,
              CreditUsage: update.creditUsage,
              ValueUsed: update.valueUsed,
            };
          }
          return h;
        }),
      };
    });

    try {
      await UserCreditService.updateCreditHistoryEntry({
        cardId: update.cardId,
        creditId: update.creditId,
        periodNumber: update.periodNumber,
        creditUsage: update.creditUsage,
        valueUsed: update.valueUsed,
        year: year,
        anniversaryYear: baseUserCredit.isAnniversaryBased ? baseUserCredit.anniversaryYear : undefined,
      });

      onUpdateComplete();
    } catch (error) {
      console.error('Failed to update credit history entry:', error);

      // Revert optimistic update
      if (effectiveResolvedData?.userCredit) {
        setLocalUserCredit(effectiveResolvedData.userCredit);
      }

      onRemoveUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);
      throw error;
    }
  };

  // Keep renderer mounted during close animation and unmount after delayed state clear
  if (!isOpen && !activeCreditId) return null;

  // Loading state
  if (
    isLoading ||
    !effectiveResolvedData ||
    !effectiveResolvedData.userCredit ||
    !effectiveResolvedData.card ||
    !effectiveResolvedData.cardCredit
  ) {
    if (isMobile) {
      return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DrawerContent fitContent maxHeight="80vh" className="mobile-credit-details-drawer">
            <DrawerTitle className="sr-only">Loading</DrawerTitle>
            <div className="drawer-content-scroll" style={{ padding: '12px 8px 16px', overflow: 'auto' }}>
              <CreditDrawerShowcaseSkeleton />
            </div>
            <DrawerFooter>
              <CreditDrawerTrackerSkeleton />
              <CreditDrawerControlsSkeleton />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent width={CREDIT_MODAL_WIDTH}>
          <DialogHeader>
            <DialogTitle className="sr-only">Loading</DialogTitle>
          </DialogHeader>
          <div className="dialog-content-scroll" style={{ padding: '8px 24px 24px', overflow: 'auto', maxHeight: '70vh' }}>
            <CreditDrawerShowcaseSkeleton />
            <CreditDrawerTrackerSkeleton />
          </div>
          <DialogFooter>
            <CreditDrawerControlsSkeleton />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const hasLocalForActiveCredit = Boolean(
    localUserCredit &&
    activeCreditId &&
    localUserCredit.CardId === activeCreditId.cardId &&
    localUserCredit.CreditId === activeCreditId.creditId
  );

  const activeLocalUserCredit = hasLocalForActiveCredit ? localUserCredit : null;
  const displayCredit = activeLocalUserCredit ?? effectiveResolvedData.userCredit;
  const { card, cardCredit } = effectiveResolvedData;
  const isUpdating = isCreditUpdating(
    activeCreditId!.cardId,
    activeCreditId!.creditId,
    selectedPeriodNumber
  );

  const detailsContent = (
    <CreditEntryDetails
      userCredit={displayCredit}
      now={now}
      card={card}
      cardCredit={cardCredit}
      creditMaxValue={creditMaxValue}
      currentYear={year}
      onUpdateHistoryEntry={handleUpdateHistoryEntry}
      hideControls={false}
      selectedPeriodNumber={selectedPeriodNumber}
      onPeriodSelect={setSelectedPeriodNumber}
      isExpiring={isExpiring}
      daysUntilExpiration={daysUntilExpiration}
    />
  );

  const usageTracker = (
    <CreditUsageTracker
      userCredit={displayCredit}
      currentYear={year}
      selectedPeriodNumber={selectedPeriodNumber}
      onPeriodSelect={setSelectedPeriodNumber}
      creditMaxValue={creditMaxValue}
      currentUsage={liveUsage}
      currentValueUsed={liveValueUsed}
      isExpiring={isExpiring}
      currentPeriodNumber={currentPeriodNumber}
      isNonMonetary={cardCredit?.isNonMonetary}
    />
  );

  const modalControls = (
    <CreditModalControls
      userCredit={displayCredit}
      cardCredit={cardCredit}
      creditMaxValue={creditMaxValue}
      now={now}
      onUpdateHistoryEntry={handleUpdateHistoryEntry}
      selectedPeriodNumber={selectedPeriodNumber}
      onPeriodSelect={setSelectedPeriodNumber}
      isUpdating={isUpdating}
      onLiveChange={handleLiveChange}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent fitContent maxHeight="80vh" className="mobile-credit-details-drawer">
          <DrawerTitle className="sr-only">{CREDIT_MODAL_TITLE}</DrawerTitle>
          <div className="drawer-content-scroll" style={{ padding: '12px 8px 16px', overflow: 'auto' }}>
            <CreditShowcase
              card={card}
              cardCredit={cardCredit}
              userCredit={displayCredit}
              currentYear={year}
            />
            {detailsContent}
          </div>
          <DrawerFooter>
            {usageTracker}
            {modalControls}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent width={CREDIT_MODAL_WIDTH}>
        <DialogHeader>
          <DialogTitle>{CREDIT_MODAL_TITLE}</DialogTitle>
        </DialogHeader>
        <div className="dialog-content-scroll" style={{ padding: '8px 24px 24px', overflow: 'auto', maxHeight: '70vh' }}>
          <CreditShowcase
            card={card}
            cardCredit={cardCredit}
            userCredit={displayCredit}
            currentYear={year}
          />
          {detailsContent}
          {usageTracker}
        </div>
        <DialogFooter>
          {modalControls}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Bridge Component ---
// Syncs the drawer context to a parent-provided ref so parent components
// can call openDrawer/closeDrawer etc. without being inside the provider themselves.

interface CreditDrawerBridgeProps {
  drawerRef: MutableRefObject<{
    openDrawer: CreditDrawerContextType['openDrawer'];
    closeDrawer: CreditDrawerContextType['closeDrawer'];
    setLoading: CreditDrawerContextType['setLoading'];
    setFallbackData: CreditDrawerContextType['setFallbackData'];
  } | null>;
}

export const CreditDrawerBridge: React.FC<CreditDrawerBridgeProps> = ({ drawerRef }) => {
  const { openDrawer, closeDrawer, setLoading, setFallbackData } = useCreditDrawer();

  useEffect(() => {
    drawerRef.current = { openDrawer, closeDrawer, setLoading, setFallbackData };
    return () => { drawerRef.current = null; };
  }, [openDrawer, closeDrawer, setLoading, setFallbackData, drawerRef]);

  return null;
};
