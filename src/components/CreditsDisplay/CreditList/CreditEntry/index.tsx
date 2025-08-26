import React, { useMemo, useState, useEffect } from 'react';
import './CreditEntry.scss';
import { CREDIT_INTERVALS, CREDIT_PERIODS, CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, CreditUsageType, MOBILE_BREAKPOINT } from '../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../types/CreditCardTypes';
import { CREDIT_USAGE_DISPLAY_COLORS } from '../../../../types/CardCreditsTypes';
import { Slider } from '../../../ui/slider';
import { CardIcon } from '../../../../icons';
import Icon from '@/icons';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { clampValue, getMaxValue, getValueForUsage, getUsageForValue } from './utils';
import { UserCreditService } from '../../../../services/UserServices';

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
  
  // Slider color now syncs with CREDIT_USAGE_DISPLAY_COLORS via CSS var injection
  // const SELECT_COLOR: Record<CreditUsageType, string> = BAR_COLOR;
  const USAGE_ICON_NAME: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: 'used-icon',
    [CREDIT_USAGE.PARTIALLY_USED]: 'partially-used-icon',
    [CREDIT_USAGE.NOT_USED]: 'not-used-icon',
    [CREDIT_USAGE.INACTIVE]: 'inactive',
  };
  const [valueUsed, setValueUsed] = useState<number>(
    userCredit.History?.[0]?.ValueUsed ?? 0
  );
  const [usage, setUsage] = useState<CreditUsageType>(
    (userCredit.History?.[0]?.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE
  );
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

  const currentHistory = useMemo(() => {
    return userCredit.History.find((h) => h.PeriodNumber === currentPeriodNumber) ?? userCredit.History[0];
  }, [userCredit, currentPeriodNumber]);
  
  // Sync local UI state when the active period changes
  React.useEffect(() => {
    if (currentHistory) {
      setUsage((currentHistory.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE);
      setValueUsed(currentHistory.ValueUsed ?? 0);
    }
  }, [currentHistory]);

  const maxValue = getMaxValue(creditMaxValue);
  const isSliderDisabled = usage === CREDIT_USAGE.INACTIVE;

  const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  };

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

  const usageColor = USAGE_COLOR_BY_STATE[usage];
  const lineTintBackground = tintHexColor(usageColor, 0.95);
  const lineTintHover = tintHexColor(usageColor, 0.8);

  const persistUpdate = async (nextUsage: CreditUsageType, nextValue: number) => {
    try {
      await UserCreditService.updateCreditHistoryEntry({
        cardId: userCredit.CardId,
        creditId: userCredit.CreditId,
        periodNumber: currentPeriodNumber,
        creditUsage: nextUsage,
        valueUsed: nextValue,
      });
      // Optimistic callback to parent to refresh local state (if provided)
      onUpdateHistoryEntry?.({
        cardId: userCredit.CardId,
        creditId: userCredit.CreditId,
        periodNumber: currentPeriodNumber,
        creditUsage: nextUsage,
        valueUsed: nextValue,
      });
    } catch (e) {
      // Swallow errors for now; caller controls UI state already
      console.error('Failed to update credit history entry', e);
    }
  };

  const handleSelectChange = (newUsage: CreditUsageType) => {
    setUsage(newUsage);
    // Update slider according to the rules and (un)disable
    if (newUsage === CREDIT_USAGE.INACTIVE) {
      // Disable slider but RETAIN existing value; persist same value
      void persistUpdate(newUsage, valueUsed);
      return;
    }
    if (newUsage === CREDIT_USAGE.NOT_USED) {
      // Keep value at 0, reflect NOT_USED state
      setValueUsed(0);
      void persistUpdate(newUsage, 0);
      return;
    }
    if (newUsage === CREDIT_USAGE.PARTIALLY_USED) {
      const val = getValueForUsage(CREDIT_USAGE.PARTIALLY_USED, maxValue);
      setValueUsed(val);
      void persistUpdate(newUsage, val);
      return;
    }
    if (newUsage === CREDIT_USAGE.USED) {
      const val = getValueForUsage(CREDIT_USAGE.USED, maxValue);
      setValueUsed(val);
      void persistUpdate(newUsage, val);
      return;
    }
  };

  const handleSliderChange = (vals: number[]) => {
    if (isSliderDisabled) return; // Only undisable via select
    const v = clampValue(vals[0] ?? 0, maxValue);
    setValueUsed(v);
    const status = getUsageForValue(v, maxValue);
    setUsage(status);
  };

  const handleSliderCommit = (vals: number[]) => {
    if (isSliderDisabled) return;
    const v = clampValue(vals[0] ?? 0, maxValue);
    const status = getUsageForValue(v, maxValue);
    void persistUpdate(status, v);
  };

  const renderModalContent = () => (
    <div className="credit-detail-content">
      {/* Credit title */}
      <div className="credit-id">{cardCredit?.Title ?? userCredit.CreditId}</div>
      
      {/* Card directly below title */}
      {card && (
        <p className="card-bubble-display" style={{ marginTop: 6 }}>
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

      {/* Description */}
      {cardCredit?.Description && (
        <div className="credit-desc">{cardCredit.Description}</div>
      )}

      {/* Details section below description */}
      {cardCredit?.TimePeriod && (
        <div className="credit-detail-field">
          <strong>Time Period:</strong> {cardCredit.TimePeriod}
        </div>
      )}

      {cardCredit?.Details && (
        <div className="credit-detail-field">
          <strong>Details:</strong> {cardCredit.Details}
        </div>
      )}

      {(cardCredit?.Category || cardCredit?.SubCategory) && (
        <div className="credit-detail-field">
          <strong>Category:</strong> {cardCredit.Category}{cardCredit.SubCategory ? ` › ${cardCredit.SubCategory}` : ''}
        </div>
      )}

      {/* Slider and Select Controls - modal layout with full-width slider */}
      <div className="credit-modal-controls" style={{ backgroundColor: lineTintBackground, ['--usage-tint-hover' as any]: lineTintHover }}>
        {/* Full-width slider */}
        <div className="credit-modal-slider">
          <Slider
            min={0}
            max={maxValue}
            value={[valueUsed]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            disabled={isSliderDisabled}
            className="w-full"
            style={{ ['--slider-range-color' as any]: usageColor, width: '100%' }}
          />
        </div>
        
        {/* Amount and dropdown on separate row */}
        <div className="credit-modal-bottom-row">
          <span className="credit-amount mr-2 text-sm text-muted-foreground">${valueUsed} / ${maxValue}</span>
          <div className="credit-usage">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-2 h-8 px-3 rounded-md border bg-transparent text-sm" style={{ color: usageColor, borderColor: usageColor }}>
                  <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={14} />
                  <span>
                    {usage === CREDIT_USAGE.USED && CREDIT_USAGE_DISPLAY_NAMES.USED}
                    {usage === CREDIT_USAGE.PARTIALLY_USED && CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}
                    {usage === CREDIT_USAGE.NOT_USED && CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}
                    {usage === CREDIT_USAGE.INACTIVE && CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}
                  </span>
                  <Icon name="chevron-down" variant="mini" size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.USED); }}>
                  <span className="flex items-center gap-2">
                    <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.USED]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.USED] }} />
                    <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.USED] }}>{CREDIT_USAGE_DISPLAY_NAMES.USED}</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.PARTIALLY_USED); }}>
                  <span className="flex items-center gap-2">
                    <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.PARTIALLY_USED]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.PARTIALLY_USED] }} />
                    <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.PARTIALLY_USED] }}>{CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.NOT_USED); }}>
                  <span className="flex items-center gap-2">
                    <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.NOT_USED]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.NOT_USED] }} />
                    <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.NOT_USED] }}>{CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.INACTIVE); }}>
                  <span className="flex items-center gap-2">
                    <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.INACTIVE]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.INACTIVE] }} />
                    <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.INACTIVE] }}>{CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}</span>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="credit-entry" data-period={userCredit.AssociatedPeriod}>
        <div className="credit-description" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
          <div className="credit-id">{cardCredit?.Title ?? userCredit.CreditId}</div>
        {cardCredit?.Description && (
          <div className="credit-desc">{cardCredit.Description}</div>
        )}
        {card && (
          <p className="card-bubble-display" style={{ marginTop: 6 }}>
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
      <div className="credit-line" style={{ backgroundColor: lineTintBackground, ['--usage-tint-hover' as any]: lineTintHover }}>
        <div className="credit-value-used">
          <span className="credit-amount mr-2 text-sm text-muted-foreground">${valueUsed} / ${maxValue}</span>
          {!hideSlider && (
            <div className="credit-slider">
              <Slider
                min={0}
                max={maxValue}
                value={[valueUsed]}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                disabled={isSliderDisabled}
                className="w-full"
                style={{ ['--slider-range-color' as any]: usageColor, width: '100%' }}
              />
            </div>
          )}
        </div>
        <div className="credit-usage">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2 h-8 px-3 rounded-md border bg-transparent text-sm" style={{ color: usageColor, borderColor: usageColor }}>
                <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={14} />
                <span>
                  {usage === CREDIT_USAGE.USED && CREDIT_USAGE_DISPLAY_NAMES.USED}
                  {usage === CREDIT_USAGE.PARTIALLY_USED && CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}
                  {usage === CREDIT_USAGE.NOT_USED && CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}
                  {usage === CREDIT_USAGE.INACTIVE && CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}
                </span>
                <Icon name="chevron-down" variant="mini" size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.USED); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.USED]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.USED] }} />
                  <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.USED] }}>{CREDIT_USAGE_DISPLAY_NAMES.USED}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.PARTIALLY_USED); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.PARTIALLY_USED]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.PARTIALLY_USED] }} />
                  <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.PARTIALLY_USED] }}>{CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.NOT_USED); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.NOT_USED]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.NOT_USED] }} />
                  <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.NOT_USED] }}>{CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.INACTIVE); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.INACTIVE]} variant="micro" size={14} style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.INACTIVE] }} />
                  <span style={{ color: USAGE_COLOR_BY_STATE[CREDIT_USAGE.INACTIVE] }}>{CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              {renderModalContent()}
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
              {renderModalContent()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CreditEntry;