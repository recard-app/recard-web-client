import React, { useMemo, useState, useEffect } from 'react';
import './CreditEntry.scss';
import { CREDIT_INTERVALS, CREDIT_PERIODS, CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, CreditUsageType, MOBILE_BREAKPOINT } from '../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../types/CreditCardTypes';
import { CREDIT_USAGE_DISPLAY_COLORS } from '../../../../types/CardCreditsTypes';
import { CardIcon } from '../../../../icons';
import Icon from '@/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { getMaxValue } from './utils';
import CreditEntryDetails from './CreditEntryDetails';

export interface CreditEntryProps {
  userCredit: UserCredit;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number; // value of the credit in dollars
  hideSlider?: boolean; // flag to hide the slider in card view
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
}

// Simple hook to detect mobile screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT); // $mobile-breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

const CreditEntry: React.FC<CreditEntryProps> = ({ userCredit, now, card, cardCredit, creditMaxValue, hideSlider = true, onUpdateHistoryEntry }) => {
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const USAGE_ICON_NAME: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: 'used-icon',
    [CREDIT_USAGE.PARTIALLY_USED]: 'partially-used-icon',
    [CREDIT_USAGE.NOT_USED]: 'not-used-icon',
    [CREDIT_USAGE.INACTIVE]: 'inactive',
  };

  // Compute the current period number based on AssociatedPeriod and now
  const currentPeriodNumber = useMemo(() => {
    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === userCredit.AssociatedPeriod
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return 1;

    const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
    if (intervals <= 1) return 1;
    const monthZeroBased = now.getMonth();
    const segmentLength = 12 / intervals;
    return Math.min(Math.max(Math.floor(monthZeroBased / segmentLength) + 1, 1), intervals);
  }, [now, userCredit.AssociatedPeriod]);

  // Get current period history for main list display (always uses current period)
  const currentHistory = useMemo(() => {
    return userCredit.History.find((h) => h.PeriodNumber === currentPeriodNumber) ?? userCredit.History[0];
  }, [userCredit, currentPeriodNumber]);

  // Main list display state (always shows current period)
  const valueUsed = currentHistory?.ValueUsed ?? 0;
  const usage = (currentHistory?.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE;

  const maxValue = getMaxValue(creditMaxValue);

  const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  };


  const usageColor = USAGE_COLOR_BY_STATE[usage];


  return (
    <>
      <div className="credit-entry-row" data-period={userCredit.AssociatedPeriod} onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
        {/* Left side: Credit info */}
        <div className="credit-info">
          <div className="credit-name">{cardCredit?.Title ?? userCredit.CreditId}</div>
          {card && (
            <div className="card-info">
              <CardIcon 
                title={card.CardName}
                size={12}
                primary={card.CardPrimaryColor}
                secondary={card.CardSecondaryColor}
                className="card-thumbnail"
              />
              <span className="card-name">{card.CardName}</span>
            </div>
          )}
        </div>
        
        {/* Right side: Usage display (read-only for list view) */}
        <div className="credit-controls">
          <div className="credit-amount">${valueUsed} / ${maxValue}</div>
          <div className="credit-usage">
            <div className="flex items-center gap-2 h-8 px-3 rounded-md border bg-transparent text-sm" style={{ color: usageColor, borderColor: usageColor }}>
              <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={14} />
              <span>
                {usage === CREDIT_USAGE.USED && CREDIT_USAGE_DISPLAY_NAMES.USED}
                {usage === CREDIT_USAGE.PARTIALLY_USED && CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}
                {usage === CREDIT_USAGE.NOT_USED && CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}
                {usage === CREDIT_USAGE.INACTIVE && CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DrawerContent fitContent>
            <DrawerTitle className="sr-only">Credit Details</DrawerTitle>
            <div className="dialog-header drawer-sticky-header">
              <h2>Credit Details</h2>
            </div>
            <div className="drawer-content-scroll" style={{ padding: '0 16px 16px', overflow: 'auto' }}>
              <CreditEntryDetails
                userCredit={userCredit}
                now={now}
                card={card}
                cardCredit={cardCredit}
                creditMaxValue={creditMaxValue}
                onUpdateHistoryEntry={onUpdateHistoryEntry}
              />
            </div>
            <div className="dialog-footer">
              <button className="button outline" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent width="600px">
            <DialogHeader>
              <DialogTitle>Credit Details</DialogTitle>
            </DialogHeader>
            <div className="dialog-content-scroll" style={{ padding: '0 24px 24px', overflow: 'auto', maxHeight: '70vh' }}>
              <CreditEntryDetails
                userCredit={userCredit}
                now={now}
                card={card}
                cardCredit={cardCredit}
                creditMaxValue={creditMaxValue}
                onUpdateHistoryEntry={onUpdateHistoryEntry}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CreditEntry;