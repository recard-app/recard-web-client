import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog/dialog';
import { Drawer, DrawerContent, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { CardIcon } from '@/icons';
import { CREDIT_INTERVALS, CREDIT_PERIODS, CreditUsageType, MOBILE_BREAKPOINT } from '@/types';
import { CreditCardDetails, CardCredit } from '@/types/CreditCardTypes';
import { UserCredit } from '@/types/CardCreditsTypes';
import { UserCreditService } from '@/services/UserServices/UserCreditService';
import { InfoDisplay } from '@/elements';
import CreditEntryDetails from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails';
import CreditModalControls from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditModalControls';
import CreditUsageTracker from '@/components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails/CreditUsageTracker';
import './CreditEditModal.scss';

export interface CreditEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCredit: UserCredit | null;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  initialPeriodNumber?: number;
  year: number;
  onUpdateComplete?: () => void;
  isUpdating?: boolean;
  isLoading?: boolean;
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
}

// Simple hook to detect mobile screen size
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

const CreditEditModal: React.FC<CreditEditModalProps> = ({
  isOpen,
  onClose,
  userCredit,
  card,
  cardCredit,
  initialPeriodNumber,
  year,
  onUpdateComplete,
  isUpdating,
  isLoading = false,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId
}) => {
  const isMobile = useIsMobile();
  // Recalculate `now` when modal opens to ensure period calculations are fresh
  const now = useMemo(() => new Date(), [isOpen]);

  // Get credit max value (already a number)
  const creditMaxValue = useMemo(() => {
    return cardCredit?.Value || 0;
  }, [cardCredit]);

  // Compute the current period number based on AssociatedPeriod and now
  const currentPeriodNumber = useMemo(() => {
    if (!userCredit) return 1;

    // For anniversary credits, there is always exactly 1 period with PeriodNumber=1
    if (userCredit.isAnniversaryBased) {
      return 1;
    }

    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === userCredit.AssociatedPeriod
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return 1;

    const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
    if (intervals <= 1) return 1;
    const monthZeroBased = now.getMonth();
    const segmentLength = 12 / intervals;
    return Math.min(Math.max(Math.floor(monthZeroBased / segmentLength) + 1, 1), intervals);
  }, [now, userCredit]);

  // Selected period state - use initial if provided, otherwise current
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(
    initialPeriodNumber ?? currentPeriodNumber
  );

  // Update selected period when modal opens or initial period changes
  useEffect(() => {
    if (isOpen) {
      setSelectedPeriodNumber(initialPeriodNumber ?? currentPeriodNumber);
    }
  }, [isOpen, initialPeriodNumber, currentPeriodNumber]);

  // Handle credit history updates
  const handleUpdateHistoryEntry = async (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => {
    if (!userCredit) return;

    // Add this credit to the updating set
    if (onAddUpdatingCreditId) {
      onAddUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);
    }

    try {
      // Call the API to persist the update
      await UserCreditService.updateCreditHistoryEntry({
        cardId: update.cardId,
        creditId: update.creditId,
        periodNumber: update.periodNumber,
        creditUsage: update.creditUsage,
        valueUsed: update.valueUsed,
        year: year,
        anniversaryYear: userCredit.isAnniversaryBased ? userCredit.anniversaryYear : undefined
      });

      // Notify parent that update was successful
      if (onUpdateComplete) {
        onUpdateComplete();
      }
    } catch (error) {
      console.error('Failed to update credit history entry:', error);

      // Remove from updating set on error
      if (onRemoveUpdatingCreditId) {
        onRemoveUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);
      }

      throw error;
    }
  };

  // Show loading state if modal is open but data is still loading
  if (isLoading || !userCredit || !card || !cardCredit) {
    if (!isOpen) return null;

    // Render loading modal
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
        <DialogContent width="600px">
          {loadingContent}
        </DialogContent>
      </Dialog>
    );
  }

  const title = cardCredit.Title ?? userCredit.CreditId;

  const modalContent = (
    <>
      <CreditEntryDetails
        userCredit={userCredit}
        now={now}
        card={card}
        cardCredit={cardCredit}
        creditMaxValue={creditMaxValue}
        currentYear={year}
        onUpdateHistoryEntry={handleUpdateHistoryEntry}
        hideControls={false}
        selectedPeriodNumber={selectedPeriodNumber}
        onPeriodSelect={setSelectedPeriodNumber}
      />
      <CreditUsageTracker
        userCredit={userCredit}
        currentYear={year}
        selectedPeriodNumber={selectedPeriodNumber}
        onPeriodSelect={setSelectedPeriodNumber}
      />
    </>
  );

  const modalControls = (
    <CreditModalControls
      userCredit={userCredit}
      cardCredit={cardCredit}
      creditMaxValue={creditMaxValue}
      now={now}
      onUpdateHistoryEntry={handleUpdateHistoryEntry}
      selectedPeriodNumber={selectedPeriodNumber}
      onPeriodSelect={setSelectedPeriodNumber}
      isUpdating={isUpdating}
    />
  );

  const cardBubble = (
    <p className="card-bubble-display header-card-display">
      <CardIcon
        title={card.CardName}
        size={12}
        primary={card.CardPrimaryColor}
        secondary={card.CardSecondaryColor}
        className="card-thumbnail"
      />
      {card.CardName}
    </p>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent fitContent maxHeight="80vh" className="credit-edit-modal-drawer">
          <DrawerTitle className="sr-only">{title}</DrawerTitle>
          <div className="dialog-header drawer-sticky-header">
            <h2>{title}</h2>
            {cardBubble}
          </div>
          <div className="drawer-content-scroll">
            {modalContent}
          </div>
          <DrawerFooter>
            {modalControls}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent width="600px">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {cardBubble}
        </DialogHeader>
        <div className="dialog-content-scroll">
          {modalContent}
        </div>
        <DialogFooter>
          {modalControls}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditEditModal;
