/**
 * CreditEntry Component
 *
 * Main component for displaying and interacting with credit usage entries.
 *
 * DOCUMENTATION: For comprehensive documentation of the credits system including
 * data models, edge cases, sync mechanisms, and API reference, see:
 * - Documents/credits-system-documentation.md
 * - Documents/credits-system-audit-report.md
 */

import React, { useMemo, useState, useEffect } from 'react';
import './CreditEntry.scss';
import { CREDIT_INTERVALS, CREDIT_PERIODS, CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, UserCreditWithExpiration, CreditUsageType, MOBILE_BREAKPOINT, SHOW_CARD_NAME_BUBBLE_IN_CREDITS, COLORS } from '../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../types/CreditCardTypes';
import { CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_ICON_NAMES } from '../../../../types/CardCreditsTypes';
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
  userCredit: UserCredit | UserCreditWithExpiration;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number; // value of the credit in dollars
  hideSlider?: boolean; // flag to hide the slider in card view
  disableDropdown?: boolean; // flag to disable the dropdown functionality
  displayPeriod?: boolean; // flag to display the period text (default: true)
  variant?: 'default' | 'sidebar'; // display variant (default: 'default')
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  onUpdateComplete?: () => void; // Optional callback to notify parent that an update was successful
  isUpdating?: boolean; // Optional flag to show updating indicators
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
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

const CreditEntry: React.FC<CreditEntryProps> = ({ userCredit, now, card, cardCredit, creditMaxValue, hideSlider = true, disableDropdown = false, displayPeriod = true, variant = 'default', onUpdateHistoryEntry, onUpdateComplete, isUpdating, onAddUpdatingCreditId, onRemoveUpdatingCreditId, isCreditUpdating }) => {
  const isMobile = useIsMobile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrichedCredit, setEnrichedCredit] = useState<any>(null);

  // Check if this credit is expiring (only available on UserCreditWithExpiration)
  const isExpiring = 'isExpiring' in userCredit ? userCredit.isExpiring : false;
  const daysUntilExpiration = 'daysUntilExpiration' in userCredit ? userCredit.daysUntilExpiration : undefined;
  
  // State for the main card's usage editing
  const [cardUsage, setCardUsage] = useState<CreditUsageType>(CREDIT_USAGE.INACTIVE);
  const [cardValueUsed, setCardValueUsed] = useState<number>(0);
  
  const getExpirationText = (days?: number): string => {
    if (days === undefined) {
      return 'Soon';
    }
    if (days === 0) {
      return 'Today';
    }
    return `${days} day${days === 1 ? '' : 's'}`;
  };
  
  const USAGE_ICON_NAME: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_ICON_NAMES.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_ICON_NAMES.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_ICON_NAMES.INACTIVE,
    [CREDIT_USAGE.DISABLED]: CREDIT_USAGE_ICON_NAMES.DISABLED,
  };

  // Mapping for display-friendly period names
  const PERIOD_DISPLAY_NAMES: Record<string, string> = {
    [CREDIT_PERIODS.Monthly]: 'Monthly',
    [CREDIT_PERIODS.Quarterly]: 'Quarterly',
    [CREDIT_PERIODS.Semiannually]: 'Semiannually',
    [CREDIT_PERIODS.Annually]: 'Annually'
  };

  // Check if this is an anniversary-based credit
  const isAnniversaryBased = userCredit.isAnniversaryBased ?? false;
  const anniversaryYear = userCredit.anniversaryYear;
  const anniversaryDate = userCredit.anniversaryDate; // MM-DD format

  /**
   * Calculate anniversary credit period end date dynamically
   * Period runs from anniversary date to day before next anniversary
   */
  const calculateAnniversaryEndDate = (): Date | null => {
    if (!anniversaryDate || !anniversaryYear) return null;

    try {
      // Parse MM-DD or MM/DD format
      const [month, day] = anniversaryDate.includes('-')
        ? anniversaryDate.split('-').map(Number)
        : anniversaryDate.split('/').map(Number);

      if (isNaN(month) || isNaN(day)) return null;

      // Period ends the day before the next anniversary
      const nextAnniversaryYear = anniversaryYear + 1;
      const endDate = new Date(nextAnniversaryYear, month - 1, day);
      endDate.setDate(endDate.getDate() - 1);

      return endDate;
    } catch {
      return null;
    }
  };

  // Get the display text for the credit period (anniversary-aware)
  const getPeriodDisplayText = (): string => {
    if (isAnniversaryBased) {
      // For anniversary credits, calculate expiration date dynamically
      const endDate = calculateAnniversaryEndDate();
      if (endDate) {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `Expires ${endDate.toLocaleDateString('en-US', options)}`;
      }
    }
    return PERIOD_DISPLAY_NAMES[userCredit.AssociatedPeriod] || userCredit.AssociatedPeriod;
  };

  // Get the credit title (use generated Title for anniversary credits if available)
  const getCreditTitle = (): string => {
    if (userCredit.Title) {
      return userCredit.Title;
    }
    return cardCredit?.Title ?? userCredit.CreditId;
  };

  // Compute the current period number based on AssociatedPeriod and now
  const currentPeriodNumber = useMemo(() => {
    // For anniversary credits, there is always exactly 1 period with PeriodNumber=1
    if (userCredit.isAnniversaryBased) {
      return 1;
    }

    // Calendar-based calculation (existing logic for non-anniversary credits)
    const periodKey = (Object.keys(CREDIT_PERIODS) as Array<keyof typeof CREDIT_PERIODS>).find(
      (k) => CREDIT_PERIODS[k] === userCredit.AssociatedPeriod
    ) as keyof typeof CREDIT_INTERVALS | undefined;

    if (!periodKey) return 1;

    const intervals = CREDIT_INTERVALS[periodKey] ?? 1;
    if (intervals <= 1) return 1;
    const monthZeroBased = now.getMonth();
    const segmentLength = 12 / intervals;
    return Math.min(Math.max(Math.floor(monthZeroBased / segmentLength) + 1, 1), intervals);
  }, [now, userCredit.AssociatedPeriod, userCredit.isAnniversaryBased]);

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
    [CREDIT_USAGE.DISABLED]: CREDIT_USAGE_DISPLAY_COLORS.DISABLED,
  };


  const usageColor = USAGE_COLOR_BY_STATE[usage] || CREDIT_USAGE_DISPLAY_COLORS.INACTIVE;

  // Shared modal rendering function to ensure consistency between variants
  const renderModal = () => {
    return isMobile ? (
      <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DrawerContent fitContent maxHeight="80vh" className="mobile-credit-details-drawer">
          <DrawerTitle className="sr-only">{enrichedCredit ? (cardCredit?.Title ?? enrichedCredit.CreditId) : 'Credit Details'}</DrawerTitle>
          <div className="dialog-header drawer-sticky-header">
            <h2>{enrichedCredit ? (cardCredit?.Title ?? enrichedCredit.CreditId) : 'Credit Details'}</h2>
            {enrichedCredit && card && (
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
            )}
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
                  creditMaxValue={creditMaxValue}
                />
                <CreditModalControls
                  userCredit={enrichedCredit}
                  cardCredit={cardCredit}
                  creditMaxValue={creditMaxValue}
                  now={now}
                  onUpdateHistoryEntry={handleUpdateHistoryEntry}
                  selectedPeriodNumber={selectedPeriodNumber}
                  onPeriodSelect={setSelectedPeriodNumber}
                  isUpdating={isUpdating}
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
            <DialogTitle>{enrichedCredit ? (cardCredit?.Title ?? enrichedCredit.CreditId) : 'Credit Details'}</DialogTitle>
            {enrichedCredit && card && (
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
            )}
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
                  isExpiring={isExpiring}
                  daysUntilExpiration={daysUntilExpiration}
                />
                <CreditUsageTracker
                  userCredit={enrichedCredit}
                  currentYear={now.getFullYear()}
                  selectedPeriodNumber={selectedPeriodNumber}
                  onPeriodSelect={setSelectedPeriodNumber}
                  creditMaxValue={creditMaxValue}
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
                isUpdating={isUpdating}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Handle credit history updates by calling the API directly
  const handleUpdateHistoryEntry = async (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => {
    // Add this credit to the updating set
    if (onAddUpdatingCreditId) {
      onAddUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);
    }

    try {
      // Update enrichedCredit optimistically for immediate UI feedback
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

      // Call the API to persist the update
      // Include year and anniversaryYear for anniversary-based credits
      await UserCreditService.updateCreditHistoryEntry({
        cardId: update.cardId,
        creditId: update.creditId,
        periodNumber: update.periodNumber,
        creditUsage: update.creditUsage,
        valueUsed: update.valueUsed,
        year: now.getFullYear(),
        anniversaryYear: userCredit.isAnniversaryBased ? userCredit.anniversaryYear : undefined
      });

      // Call legacy handler if provided (for backward compatibility)
      if (onUpdateHistoryEntry) {
        await onUpdateHistoryEntry(update);
      }

      // Notify parent that update was successful (for data refresh)
      // The parent is responsible for removing the updating indicator after refresh completes
      if (onUpdateComplete) {
        onUpdateComplete();
      }

    } catch (error) {
      console.error('Failed to update credit history entry:', error);

      // Revert optimistic update on error
      if (enrichedCredit && enrichedCredit.CardId === update.cardId && enrichedCredit.CreditId === update.creditId) {
        // Refresh the enriched credit from the original userCredit
        const originalPeriodData = userCredit.History.find(h => h.PeriodNumber === update.periodNumber);
        if (originalPeriodData) {
          setEnrichedCredit((prev: any) => {
            if (!prev) return prev;
            const reverted = { ...prev };
            reverted.History = reverted.History.map((h: any) => {
              if (h.PeriodNumber === update.periodNumber) {
                return {
                  ...h,
                  CreditUsage: originalPeriodData.CreditUsage,
                  ValueUsed: originalPeriodData.ValueUsed
                };
              }
              return h;
            });
            return reverted;
          });
        }
      }

      // Remove this credit from the updating set (error case)
      if (onRemoveUpdatingCreditId) {
        onRemoveUpdatingCreditId(update.cardId, update.creditId, update.periodNumber);
      }

      // Re-throw the error so calling components can handle it if needed
      throw error;
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
    await handleUpdateHistoryEntry({
      cardId: userCredit.CardId,
      creditId: userCredit.CreditId,
      periodNumber: currentPeriodNumber,
      creditUsage: newUsage,
      valueUsed: val,
    });
  };


  // Sidebar variant - simplified display that reuses the same modal system as default variant
  if (variant === 'sidebar') {
    return (
      <>
        <div
          className={`credit-entry-sidebar ${isUpdating ? 'updating' : ''}`}
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="credit-title-row">
            <Icon
              name={USAGE_ICON_NAME[cardUsage]}
              variant="mini"
              size={18}
              style={{ color: USAGE_COLOR_BY_STATE[cardUsage] }}
            />
            <div className="credit-name-group">
              {isExpiring && (
                <Icon name="clock" variant="micro" size={12} style={{ color: COLORS.WARNING, flexShrink: 0 }} />
              )}
              <div className="credit-name">
                {getCreditTitle()}
              </div>
            </div>
          </div>
          <Icon
            name="chevron-right"
            variant="mini"
            size={16}
            color={COLORS.NEUTRAL_MEDIUM_GRAY}
            className="sidebar-chevron"
          />
        </div>

        {/* Modal for sidebar variant - uses shared modal function (same as default) */}
        {renderModal()}
      </>
    );
  }

  // Default variant - full display
  return (
    <>
      <div className={`credit-entry-row ${isUpdating ? 'updating' : ''}`} data-period={userCredit.AssociatedPeriod} onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
        {/* Left side: Credit info */}
        <div className="credit-info">
          <div className="credit-name">
            {getCreditTitle()}
          </div>
          {card && SHOW_CARD_NAME_BUBBLE_IN_CREDITS && (
            <>
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
              {(displayPeriod || isExpiring) && (
                <div className="period-expiring-text">
                  {displayPeriod && (
                    <span className="period-text">
                      {getPeriodDisplayText()}
                    </span>
                  )}
                  {isExpiring && (
                    <span className="expiring-text">
                      <Icon name="clock" variant="micro" size={12} />
                      {getExpirationText(daysUntilExpiration)}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
          {card && !SHOW_CARD_NAME_BUBBLE_IN_CREDITS && (
            <div className="card-info-inline">
              <div className="card-period-group">
                <CardIcon
                  title={card.CardName}
                  size={16}
                  primary={card.CardPrimaryColor}
                  secondary={card.CardSecondaryColor}
                  className="card-thumbnail"
                />
                {displayPeriod && (
                  <span className="period-text-inline">
                    {getPeriodDisplayText()}
                  </span>
                )}
              </div>
              {isExpiring && (
                <span className="expiring-text-inline">
                  <Icon name="clock" variant="micro" size={12} />
                  {getExpirationText(daysUntilExpiration)}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Right side: Usage dropdown (interactive for list view) or static display */}
        <div className="credit-controls">
          {isUpdating ? (
            // Show updating text when updating
            <div className="credit-updating-text" style={{ color: COLORS.DISABLED_GRAY, fontSize: '14px', textAlign: 'center', padding: '8px' }}>
              Updating...
            </div>
          ) : (
            <div className="credit-usage">
              {disableDropdown ? (
                // Static display when dropdown is disabled
                <div
                  className="credit-usage-button static"
                >
                  <div className="credit-amount-large">${valueUsed} / ${maxValue}</div>
                  <div className="credit-usage-label">
                    <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={14} style={{ color: usageColor }} />
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
                      onClick={(e) => e.stopPropagation()} // Prevent card click from opening modal
                    >
                      <div className="credit-amount-large">${valueUsed} / ${maxValue}</div>
                      <div className="credit-usage-label">
                        <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={14} style={{ color: usageColor }} />
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
          )}
        </div>
      </div>

      {/* Responsive Modal/Drawer - uses shared modal function */}
      {renderModal()}
    </>
  );
};

export default CreditEntry;