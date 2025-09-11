import React, { useState, useEffect, useMemo } from 'react';
import './CreditEntryDetails.scss';
import { CreditUsageType, CREDIT_USAGE, CREDIT_INTERVALS, CREDIT_PERIODS, UserCredit } from '../../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../../types/CreditCardTypes';
import { CREDIT_USAGE_DISPLAY_COLORS } from '../../../../../types/CardCreditsTypes';
import { Slider } from '../../../../ui/slider';
import { CardIcon } from '../../../../../icons';
import Icon from '@/icons';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu/dropdown-menu';
import { clampValue, getMaxValue, getValueForUsage, getUsageForValue } from '../utils';
import { UserCreditService } from '../../../../../services/UserServices';
import CreditUsageTracker from './CreditUsageTracker';
import { MONTH_NAMES, MONTH_ABBREVIATIONS } from '../../../../../types/Constants';
import { CREDIT_USAGE_DISPLAY_NAMES } from '../../../../../types';

export interface CreditEntryDetailsProps {
  userCredit: UserCredit;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number;
  currentYear: number;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  hideControls?: boolean;
}

const CreditEntryDetails: React.FC<CreditEntryDetailsProps> = ({ 
  userCredit, 
  now, 
  card, 
  cardCredit, 
  creditMaxValue, 
  onUpdateHistoryEntry,
  hideControls = false
}) => {
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

  // Track which period is selected for editing in the modal (starts with current period)
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(currentPeriodNumber);
  
  // Update selected period when current period changes (e.g., year navigation)
  useEffect(() => {
    setSelectedPeriodNumber(currentPeriodNumber);
  }, [currentPeriodNumber]);

  // Get the effective period number (always use selected period in modal)
  const effectivePeriodNumber = selectedPeriodNumber;
  
  const currentHistory = useMemo(() => {
    return userCredit.History.find((h: any) => h.PeriodNumber === effectivePeriodNumber) ?? userCredit.History[0];
  }, [userCredit, effectivePeriodNumber]);

  // Modal-specific state for the selected period
  const [valueUsed, setValueUsed] = useState<number>(currentHistory?.ValueUsed ?? 0);
  const [usage, setUsage] = useState<CreditUsageType>(
    (currentHistory?.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE
  );
  
  // Sync modal state when the selected period changes
  useEffect(() => {
    if (currentHistory) {
      setUsage((currentHistory.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE);
      setValueUsed(currentHistory.ValueUsed ?? 0);
    }
  }, [currentHistory]);

  // Generate period name for display (dynamically calculated using CREDIT_INTERVALS)
  const getPeriodName = (periodNumber: number) => {
    if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
      return MONTH_NAMES[periodNumber - 1] || `Month ${periodNumber}`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
      // Calculate month range for this quarter (3 months per quarter)
      const monthsPerQuarter = 12 / CREDIT_INTERVALS.Quarterly;
      const startMonth = (periodNumber - 1) * monthsPerQuarter;
      const endMonth = startMonth + monthsPerQuarter - 1;
      const startMonthName = MONTH_ABBREVIATIONS[startMonth];
      const endMonthName = MONTH_ABBREVIATIONS[endMonth];
      return `${startMonthName} - ${endMonthName} (Q${periodNumber})`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
      // Calculate month range for this half (6 months per half)
      const monthsPerHalf = 12 / CREDIT_INTERVALS.Semiannually;
      const startMonth = (periodNumber - 1) * monthsPerHalf;
      const endMonth = startMonth + monthsPerHalf - 1;
      const startMonthName = MONTH_ABBREVIATIONS[startMonth];
      const endMonthName = MONTH_ABBREVIATIONS[endMonth];
      return `${startMonthName} - ${endMonthName} (H${periodNumber})`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
      return now.getFullYear().toString();
    }
    return `Period ${periodNumber}`;
  };
  
  // Generate selected period name for display
  const getSelectedPeriodName = () => getPeriodName(effectivePeriodNumber);

  const maxValue = getMaxValue(creditMaxValue);
  const isSliderDisabled = usage === CREDIT_USAGE.INACTIVE;

  const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  };

  const USAGE_ICON_NAME: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: 'used-icon',
    [CREDIT_USAGE.PARTIALLY_USED]: 'partially-used-icon',
    [CREDIT_USAGE.NOT_USED]: 'not-used-icon',
    [CREDIT_USAGE.INACTIVE]: 'inactive',
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
    console.log('[CreditEntryDetails] persistUpdate called with:', {
      effectivePeriodNumber,
      selectedPeriodNumber,
      currentPeriodNumber,
      nextUsage,
      nextValue,
      creditId: userCredit.CreditId
    });
    try {
      await UserCreditService.updateCreditHistoryEntry({
        cardId: userCredit.CardId,
        creditId: userCredit.CreditId,
        periodNumber: effectivePeriodNumber,
        creditUsage: nextUsage,
        valueUsed: nextValue,
      });
      // Optimistic callback to parent to refresh local state (if provided)
      onUpdateHistoryEntry?.({
        cardId: userCredit.CardId,
        creditId: userCredit.CreditId,
        periodNumber: effectivePeriodNumber,
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
    // Only update local state during dragging for visual feedback
    setValueUsed(v);
    const status = getUsageForValue(v, maxValue);
    setUsage(status);
  };

  const handleSliderCommit = async (vals: number[]) => {
    if (isSliderDisabled) return;
    const v = clampValue(vals[0] ?? 0, maxValue);
    const status = getUsageForValue(v, maxValue);
    
    // Wait for backend confirmation like the usage counter does
    try {
      await persistUpdate(status, v);
      // Backend update succeeded, state is already updated via the callback
    } catch (e) {
      // Revert to previous state if backend update failed
      if (currentHistory) {
        setUsage((currentHistory.CreditUsage as CreditUsageType) ?? CREDIT_USAGE.INACTIVE);
        setValueUsed(currentHistory.ValueUsed ?? 0);
      }
    }
  };

  return (
    <div className="credit-detail-content">
      {/* Credit title and card info combined */}
      <div className="credit-header">
        <div className="credit-id">{cardCredit?.Title ?? userCredit.CreditId}</div>
        {card && (
          <p className="card-bubble-display">
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

      {/* Description with stacked label */}
      {cardCredit?.Description && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Description</span>
          <div className="credit-detail-value">{cardCredit.Description}</div>
        </div>
      )}

      {/* Details with stacked label - full width */}
      {cardCredit?.Details && (
        <div className="credit-detail-item">
          <span className="credit-detail-label">Details</span>
          <div className="credit-detail-value">{cardCredit.Details}</div>
        </div>
      )}

      {/* Time Period and Category side-by-side */}
      {(cardCredit?.TimePeriod || cardCredit?.Category || cardCredit?.SubCategory) && (
        <div className="credit-details-section">
          <div className="credit-detail-group">
            {cardCredit?.TimePeriod && (
              <div className="credit-detail-item">
                <span className="credit-detail-label">Time Period</span>
                <div className="credit-detail-value">{cardCredit.TimePeriod}</div>
              </div>
            )}
          </div>
          
          <div className="credit-detail-group">
            {(cardCredit?.Category || cardCredit?.SubCategory) && (
              <div className="credit-detail-item">
                <span className="credit-detail-label">Category</span>
                <div className="credit-detail-value">
                  {cardCredit.Category}{cardCredit.SubCategory ? ` › ${cardCredit.SubCategory}` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Tracker with Statistics */}
      <div className="usage-tracker-section">
        <div className="credit-detail-item">
          <span className="credit-detail-label">Usage This Year</span>
          <div className="credit-detail-value">
            ${userCredit.History.reduce((total: any, entry: any) => total + (entry.ValueUsed || 0), 0)} / ${(Number(cardCredit?.Value) || 0) * userCredit.History.length} used
          </div>
        </div>
        <CreditUsageTracker 
          userCredit={userCredit} 
          currentYear={now.getFullYear()} 
          currentUsage={usage}
          currentValueUsed={valueUsed}
          selectedPeriodNumber={selectedPeriodNumber}
          onPeriodSelect={(periodNumber) => {
            console.log('[CreditEntryDetails] Period selected:', periodNumber);
            setSelectedPeriodNumber(periodNumber);
          }}
        />
      </div>

      {/* Slider and Select Controls - modal layout with full-width slider */}
      {!hideControls && (
        <div className="credit-modal-controls" style={{ backgroundColor: lineTintBackground, '--usage-tint-hover': lineTintHover } as React.CSSProperties}>
        {/* Selected period label */}
        <div className="credit-detail-item">
          <span className="credit-detail-label">Editing Period</span>
          <div className="credit-detail-value">{getSelectedPeriodName()}</div>
        </div>
        
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
            style={{ '--slider-range-color': usageColor, width: '100%' } as React.CSSProperties}
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
      )}
    </div>
  );
};

export default CreditEntryDetails;
