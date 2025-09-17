import React, { useMemo, useState, useEffect } from 'react';
import './CreditEntry.scss';
import { CREDIT_INTERVALS, CREDIT_PERIODS, CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, CreditUsageType, MOBILE_BREAKPOINT } from '../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../types/CreditCardTypes';
import { CREDIT_USAGE_DISPLAY_COLORS } from '../../../../types/CardCreditsTypes';
import { CardIcon } from '../../../../icons';
import Icon from '@/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog/dialog';
import { Drawer, DrawerContent, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { getMaxValue, clampValue, getUsageForValue, getValueForUsage } from './utils';
import { UserCreditService } from '../../../../services/UserServices/UserCreditService';
import CreditEntryDetails from './CreditEntryDetails';
import CreditModalControls from './CreditModalControls';
import CreditUsageTracker from './CreditEntryDetails/CreditUsageTracker';
import UsageDropdown from './UsageDropdown';

export interface CreditEntryProps {
  userCredit: UserCredit;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number; // value of the credit in dollars
  hideSlider?: boolean; // flag to hide the slider in card view
  disableDropdown?: boolean; // flag to disable the dropdown functionality
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

const CreditEntry: React.FC<CreditEntryProps> = ({ userCredit, now, card, cardCredit, creditMaxValue, hideSlider = true, disableDropdown = false, onUpdateHistoryEntry }) => {
  const isMobile = useIsMobile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrichedCredit, setEnrichedCredit] = useState<any>(null);
  
  // State for the main card's usage editing
  const [cardUsage, setCardUsage] = useState<CreditUsageType>(CREDIT_USAGE.INACTIVE);
  const [cardValueUsed, setCardValueUsed] = useState<number>(0);
  
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

  // Shared selected period state for modal editing
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(currentPeriodNumber);

  // Update selected period when current period changes (e.g., when navigating months)
  useEffect(() => {
    setSelectedPeriodNumber(currentPeriodNumber);
  }, [currentPeriodNumber]);

  // Reset selected period to current period when modal opens, clear enriched credit when modal closes
  useEffect(() => {
    if (isModalOpen) {
      setSelectedPeriodNumber(currentPeriodNumber);
    } else {
      // Delay clearing enriched credit to allow modal close animation to complete
      const timer = setTimeout(() => {
        setEnrichedCredit(null);
      }, 300); // Match typical modal animation duration

      return () => clearTimeout(timer);
    }
  }, [isModalOpen, currentPeriodNumber]);

  // Use the existing credit data when modal opens - no need to fetch additional data
  useEffect(() => {
    if (isModalOpen && !enrichedCredit) {
      // Just use the userCredit data that's already available
      setEnrichedCredit(userCredit);
    }
  }, [isModalOpen, userCredit, enrichedCredit]);

  // Get current period history for main list display (always uses current period)
  const currentHistory = useMemo(() => {
    return userCredit.History.find((h) => h.PeriodNumber === currentPeriodNumber) ?? userCredit.History[0];
  }, [userCredit, currentPeriodNumber]);

  // Sync card state with current period history
  useEffect(() => {
    if (currentHistory) {
      setCardUsage((currentHistory.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE);
      setCardValueUsed(currentHistory.ValueUsed ?? 0);
    }
  }, [currentHistory, userCredit.CardId, userCredit.CreditId]);

  // Main list display state (always shows current period)
  const valueUsed = cardValueUsed;
  const usage = cardUsage;

  const maxValue = getMaxValue(creditMaxValue);

  const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  };


  const usageColor = USAGE_COLOR_BY_STATE[usage];

  // Tinting functions for card styling
  const parseHexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    return { r, g, b };
  };

  const tintHexColor = (hex: string, tintFactor: number): string => {
    const { r, g, b } = parseHexToRgb(hex);
    const mix = (channel: number) => Math.round(channel + (255 - channel) * tintFactor);
    const nr = mix(r);
    const ng = mix(g);
    const nb = mix(b);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  const buttonBackgroundColor = tintHexColor(usageColor, 0.9);
  const buttonHoverColor = tintHexColor(usageColor, 0.85);

  // Create a wrapper for onUpdateHistoryEntry that also updates enrichedCredit
  const handleUpdateHistoryEntry = async (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => {
    // Update enrichedCredit optimistically
    if (enrichedCredit && enrichedCredit.CardId === update.cardId && enrichedCredit.CreditId === update.creditId) {
      setEnrichedCredit((prev: any) => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.History = updated.History.map((h: any) => {
          if (h.PeriodNumber === update.periodNumber) {
            return {
              ...h,
              CreditUsage: update.creditUsage,
              ValueUsed: update.valueUsed
            };
          }
          return h;
        });
        return updated;
      });
    }

    // Call the original handler
    if (onUpdateHistoryEntry) {
      await onUpdateHistoryEntry(update);
    }
  };

  // Update handlers for card dropdown
  const handleCardUsageSelect = async (newUsage: CreditUsageType) => {
    setCardUsage(newUsage);
    let val = cardValueUsed;

    if (newUsage === CREDIT_USAGE.USED) {
      val = maxValue;
      setCardValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.PARTIALLY_USED) {
      val = getValueForUsage(newUsage, maxValue);
      setCardValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.NOT_USED) {
      val = 0;
      setCardValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.INACTIVE) {
      val = 0;
      setCardValueUsed(val);
    }

    // Persist the update immediately
    if (onUpdateHistoryEntry) {
      await onUpdateHistoryEntry({
        cardId: userCredit.CardId,
        creditId: userCredit.CreditId,
        periodNumber: currentPeriodNumber,
        creditUsage: newUsage,
        valueUsed: val,
      });
    }
  };


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
        
        {/* Right side: Usage dropdown (interactive for list view) or static display */}
        <div className="credit-controls">
          <div className="credit-usage">
            {disableDropdown ? (
              // Static display when dropdown is disabled
              <div 
                className="credit-usage-button static"
                style={{ 
                  color: usageColor
                } as React.CSSProperties}
              >
                <div className="credit-amount-large">${valueUsed} / ${maxValue}</div>
                <div className="credit-usage-label">
                  <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={12} />
                  <span>
                    {usage === CREDIT_USAGE.USED && CREDIT_USAGE_DISPLAY_NAMES.USED}
                    {usage === CREDIT_USAGE.PARTIALLY_USED && CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}
                    {usage === CREDIT_USAGE.NOT_USED && CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}
                    {usage === CREDIT_USAGE.INACTIVE && CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}
                  </span>
                  {/* No chevron icon for static display */}
                </div>
              </div>
            ) : (
              <UsageDropdown
                usage={usage}
                usageColor={usageColor}
                onUsageSelect={handleCardUsageSelect}
                trigger={
                  <button 
                    className="credit-usage-button"
                    style={{ 
                      color: usageColor
                    } as React.CSSProperties}
                    onClick={(e) => e.stopPropagation()} // Prevent card click from opening modal
                  >
                    <div className="credit-amount-large">${valueUsed} / ${maxValue}</div>
                    <div className="credit-usage-label">
                      <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={12} />
                      <span>
                        {usage === CREDIT_USAGE.USED && CREDIT_USAGE_DISPLAY_NAMES.USED}
                        {usage === CREDIT_USAGE.PARTIALLY_USED && CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}
                        {usage === CREDIT_USAGE.NOT_USED && CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}
                        {usage === CREDIT_USAGE.INACTIVE && CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}
                      </span>
                      <Icon name="chevron-down" variant="micro" size={12} />
                    </div>
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Responsive Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DrawerContent fitContent maxHeight="80vh" className="mobile-credit-details-drawer">
            <DrawerTitle className="sr-only">Credit Details</DrawerTitle>
            <div className="dialog-header drawer-sticky-header">
              <h2>Credit Details</h2>
            </div>
            <div className="drawer-content-scroll" style={{ padding: '0 16px 16px', overflow: 'auto' }}>
              {enrichedCredit && (
                <CreditEntryDetails
                  userCredit={enrichedCredit}
                  now={now}
                  card={card}
                  cardCredit={cardCredit}
                  creditMaxValue={creditMaxValue}
                  currentYear={now.getFullYear()}
                  onUpdateHistoryEntry={handleUpdateHistoryEntry}
                  hideControls={false}
                  selectedPeriodNumber={selectedPeriodNumber}
                  onPeriodSelect={setSelectedPeriodNumber}
                />
              )}
            </div>
            <DrawerFooter>
              {enrichedCredit && (
                <>
                  <CreditUsageTracker 
                    userCredit={enrichedCredit} 
                    currentYear={now.getFullYear()} 
                    selectedPeriodNumber={selectedPeriodNumber}
                    onPeriodSelect={setSelectedPeriodNumber}
                  />
                  <CreditModalControls
                    userCredit={enrichedCredit}
                    cardCredit={cardCredit}
                    creditMaxValue={creditMaxValue}
                    now={now}
                    onUpdateHistoryEntry={handleUpdateHistoryEntry}
                    selectedPeriodNumber={selectedPeriodNumber}
                    onPeriodSelect={setSelectedPeriodNumber}
                  />
                </>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent width="600px">
            <DialogHeader>
              <DialogTitle>Credit Details</DialogTitle>
            </DialogHeader>
            <div className="dialog-content-scroll" style={{ padding: '0 24px 24px', overflow: 'auto', maxHeight: '70vh' }}>
              {enrichedCredit && (
                <>
                  <CreditEntryDetails
                    userCredit={enrichedCredit}
                    now={now}
                    card={card}
                    cardCredit={cardCredit}
                    creditMaxValue={creditMaxValue}
                    currentYear={now.getFullYear()}
                    onUpdateHistoryEntry={handleUpdateHistoryEntry}
                    hideControls={false}
                    selectedPeriodNumber={selectedPeriodNumber}
                    onPeriodSelect={setSelectedPeriodNumber}
                  />
                  <CreditUsageTracker 
                    userCredit={enrichedCredit} 
                    currentYear={now.getFullYear()} 
                    selectedPeriodNumber={selectedPeriodNumber}
                    onPeriodSelect={setSelectedPeriodNumber}
                  />
                </>
              )}
            </div>
            <DialogFooter>
              {enrichedCredit && (
                <CreditModalControls
                  userCredit={enrichedCredit}
                  cardCredit={cardCredit}
                  creditMaxValue={creditMaxValue}
                  now={now}
                  onUpdateHistoryEntry={handleUpdateHistoryEntry}
                  selectedPeriodNumber={selectedPeriodNumber}
                  onPeriodSelect={setSelectedPeriodNumber}
                />
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CreditEntry;