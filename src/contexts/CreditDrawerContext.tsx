import React, { useState, useEffect, useMemo, useCallback, ReactNode, MutableRefObject } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog/dialog';
import { Drawer, DrawerContent, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import CreditShowcase from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditShowcase';
import CreditEntryDetails from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails';
import CreditModalControls from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditModalControls';
import CreditUsageTracker from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails/CreditUsageTracker';
import { InfoDisplay } from '@/elements';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
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

  const openDrawer = useCallback((params: {
    cardId: string;
    creditId: string;
    year?: number;
    isLoading?: boolean;
    initialPeriodNumber?: number;
    fallbackData?: FallbackData;
  }) => {
    setActiveCreditId({ cardId: params.cardId, creditId: params.creditId });
    if (params.year !== undefined) setYear(params.year);
    setIsLoading(params.isLoading ?? false);
    setInitialPeriodNumber(params.initialPeriodNumber);
    setFallbackDataState(params.fallbackData ?? null);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // Delay clearing data to allow close animation to complete
    setTimeout(() => {
      setActiveCreditId(null);
      setFallbackDataState(null);
      setIsLoading(false);
      setYear(new Date().getFullYear());
      setInitialPeriodNumber(undefined);
    }, MODAL_CLOSE_ANIMATION_MS);
  }, []);

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

  // Date for period calculations
  const now = useMemo(() => {
    const date = new Date();
    date.setFullYear(year);
    return date;
  }, [isOpen, year]);

  // Compute current period number
  const currentPeriodNumber = useMemo(() => {
    if (!resolvedData?.userCredit) return 1;
    const uc = resolvedData.userCredit;

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
  }, [now, resolvedData?.userCredit]);

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

  // Sync localUserCredit when resolved data changes
  useEffect(() => {
    if (resolvedData?.userCredit) {
      setLocalUserCredit(resolvedData.userCredit);
    }
  }, [resolvedData?.userCredit?.CardId, resolvedData?.userCredit?.CreditId, resolvedData?.userCredit?.History]);

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
    return resolvedData?.cardCredit?.Value || 0;
  }, [resolvedData?.cardCredit]);

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
    if (!localUserCredit) return;

    onAddUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);

    // Optimistically update local state
    setLocalUserCredit((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        History: prev.History.map((h) => {
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
        anniversaryYear: localUserCredit.isAnniversaryBased ? localUserCredit.anniversaryYear : undefined,
      });

      onUpdateComplete();
    } catch (error) {
      console.error('Failed to update credit history entry:', error);

      // Revert optimistic update
      if (resolvedData?.userCredit) {
        setLocalUserCredit(resolvedData.userCredit);
      }

      onRemoveUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);
      throw error;
    }
  };

  // Render nothing if not open
  if (!isOpen) return null;

  // Loading state
  if (isLoading || !resolvedData || !resolvedData.userCredit || !resolvedData.card || !resolvedData.cardCredit) {
    const loadingContent = (
      <InfoDisplay
        type="loading"
        message="Loading credit details..."
        showTitle={false}
        transparent={true}
        centered={true}
      />
    );

    if (isMobile) {
      return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DrawerContent fitContent maxHeight="40vh" className="credit-edit-modal-drawer">
            <DrawerTitle className="sr-only">Loading</DrawerTitle>
            {loadingContent}
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent width={CREDIT_MODAL_WIDTH}>
          <DialogTitle className="sr-only">Loading</DialogTitle>
          {loadingContent}
        </DialogContent>
      </Dialog>
    );
  }

  const displayCredit = localUserCredit ?? resolvedData.userCredit;
  const { card, cardCredit } = resolvedData;
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
    />
  );

  const modalControls = localUserCredit ? (
    <CreditModalControls
      userCredit={localUserCredit}
      cardCredit={cardCredit}
      creditMaxValue={creditMaxValue}
      now={now}
      onUpdateHistoryEntry={handleUpdateHistoryEntry}
      selectedPeriodNumber={selectedPeriodNumber}
      onPeriodSelect={setSelectedPeriodNumber}
      isUpdating={isUpdating}
      onLiveChange={handleLiveChange}
    />
  ) : null;

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent fitContent maxHeight="80vh" className="mobile-credit-details-drawer">
          <DrawerTitle className="sr-only">{CREDIT_MODAL_TITLE}</DrawerTitle>
          <div className="drawer-content-scroll" style={{ padding: '0 8px 16px', overflow: 'auto' }}>
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
        <div className="dialog-content-scroll" style={{ padding: '0 24px 24px', overflow: 'auto', maxHeight: '70vh' }}>
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
