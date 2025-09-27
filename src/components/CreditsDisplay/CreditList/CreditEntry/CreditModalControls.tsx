import React, { useMemo, useState, useEffect } from 'react';
import { CREDIT_PERIODS, CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, CreditUsageType, MOBILE_BREAKPOINT } from '../../../../types';
import { CardCredit } from '../../../../types/CreditCardTypes';
import { MONTH_ABBREVIATIONS } from '../../../../types/Constants';
import { CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_ICON_NAMES } from '../../../../types/CardCreditsTypes';
import { Slider } from '../../../ui/slider';
import Icon from '@/icons';
import { getMaxValue, clampValue, getUsageForValue, getValueForUsage } from './utils';
import { generateSmartSteps, snapToClosestStep } from '../../../../utils/slider-steps';
import UsageDropdown from './UsageDropdown';

interface CreditModalControlsProps {
  userCredit: UserCredit;
  cardCredit: CardCredit | null;
  creditMaxValue?: number;
  now: Date;
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
  selectedPeriodNumber?: number;
  onPeriodSelect?: (periodNumber: number) => void;
  isUpdating?: boolean;
}

const CreditModalControls: React.FC<CreditModalControlsProps> = ({
  userCredit,
  cardCredit,
  creditMaxValue,
  now,
  onUpdateHistoryEntry,
  selectedPeriodNumber: propSelectedPeriodNumber,
  onPeriodSelect: propOnPeriodSelect,
  isUpdating
}) => {
  // Calculate default current period using the selected date context
  const defaultCurrentPeriod = (() => {
    const currentMonth = now.getMonth() + 1;

    if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
      return currentMonth;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
      return Math.ceil(currentMonth / 3);
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
      return Math.ceil(currentMonth / 6);
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
      return 1;
    }
    return 1;
  })();

  // Use props if provided, otherwise fall back to local state
  const [localSelectedPeriodNumber, setLocalSelectedPeriodNumber] = useState<number>(defaultCurrentPeriod);
  const selectedPeriodNumber = propSelectedPeriodNumber ?? localSelectedPeriodNumber;

  // Get the selected period's history entry
  const selectedHistory = useMemo(() => {
    return userCredit.History.find(h => h.PeriodNumber === selectedPeriodNumber) || userCredit.History[0];
  }, [userCredit.History, selectedPeriodNumber]);

  // State for the selected period
  const [usage, setUsage] = useState<CreditUsageType>(CREDIT_USAGE.INACTIVE);
  const [valueUsed, setValueUsed] = useState<number>(0);

  // Update local state when selected period changes
  useEffect(() => {
    if (selectedHistory) {
      setUsage(selectedHistory.CreditUsage as CreditUsageType);
      setValueUsed(selectedHistory.ValueUsed ?? 0);
    }
  }, [selectedHistory, userCredit.CardId, userCredit.CreditId, selectedPeriodNumber]);

  const maxValue = getMaxValue(creditMaxValue);
  const isSliderDisabled = usage === CREDIT_USAGE.INACTIVE || usage === CREDIT_USAGE.DISABLED;
  const isCompletelyDisabled = usage === CREDIT_USAGE.DISABLED;

  // Generate smart steps for this credit's maximum value
  const smartSteps = useMemo(() => generateSmartSteps(maxValue, 1), [maxValue]);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
    [CREDIT_USAGE.DISABLED]: CREDIT_USAGE_DISPLAY_COLORS.DISABLED,
    [CREDIT_USAGE.FUTURE]: CREDIT_USAGE_DISPLAY_COLORS.DISABLED,
  };

  const usageColor = USAGE_COLOR_BY_STATE[usage];

  const USAGE_ICON_NAME: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_ICON_NAMES.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_ICON_NAMES.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_ICON_NAMES.INACTIVE,
    [CREDIT_USAGE.DISABLED]: CREDIT_USAGE_ICON_NAMES.DISABLED,
    [CREDIT_USAGE.FUTURE]: CREDIT_USAGE_ICON_NAMES.FUTURE,
  };

  // Tinting functions
  const parseHexToRgb = (hex: string | undefined): { r: number; g: number; b: number } => {
    // Default to gray if hex is undefined/null
    if (!hex) {
      return { r: 156, g: 163, b: 175 }; // #9CA3AF
    }
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

  const lineTintBackground = tintHexColor(usageColor, 0.95);
  const lineTintHover = tintHexColor(usageColor, 0.85);
  const buttonBackgroundColor = tintHexColor(usageColor, 0.9);

  const persistUpdate = async (newUsage: CreditUsageType, val: number) => {
    if (!onUpdateHistoryEntry) return;
    
    try {
      onUpdateHistoryEntry({
        cardId: userCredit.CardId,
        creditId: userCredit.CreditId,
        periodNumber: selectedPeriodNumber,
        creditUsage: newUsage,
        valueUsed: val,
      });
    } catch (e) {
      // Swallow errors for now; caller controls UI state already
      console.error('Failed to update credit history entry', e);
    }
  };

  const handleUsageSelect = async (newUsage: CreditUsageType) => {
    // Don't allow changing DISABLED status
    if (usage === CREDIT_USAGE.DISABLED || newUsage === CREDIT_USAGE.DISABLED) {
      return;
    }

    setUsage(newUsage);
    // Update slider according to the rules and (un)disable
    try {
      if (newUsage === CREDIT_USAGE.INACTIVE) {
        // Disable slider but RETAIN existing value; persist same value
        await persistUpdate(newUsage, valueUsed);
        return;
      }
      if (newUsage === CREDIT_USAGE.NOT_USED) {
        // Keep value at 0, reflect NOT_USED state
        setValueUsed(0);
        await persistUpdate(newUsage, 0);
        return;
      }
      if (newUsage === CREDIT_USAGE.PARTIALLY_USED) {
        const val = getValueForUsage(CREDIT_USAGE.PARTIALLY_USED, maxValue);
        setValueUsed(val);
        await persistUpdate(newUsage, val);
        return;
      }
      if (newUsage === CREDIT_USAGE.USED) {
        const val = maxValue;
        setValueUsed(val);
        await persistUpdate(newUsage, val);
        return;
      }
    } catch (e) {
      console.error('Failed to update credit via usage select:', e);
    }
  };

  const handleSliderChange = (vals: number[]) => {
    if (isSliderDisabled) return; // Only undisable via select

    const rawValue = vals[0] ?? 0;
    // Snap to closest smart step
    const snappedValue = snapToClosestStep(rawValue, smartSteps);
    const v = clampValue(snappedValue, maxValue);

    // Only update local state during dragging for visual feedback
    setValueUsed(v);
    const status = getUsageForValue(v, maxValue);
    setUsage(status);
  };

  const handleSliderCommit = async (vals: number[]) => {
    if (isSliderDisabled) return;

    const rawValue = vals[0] ?? 0;
    // Snap to closest smart step for final value
    const snappedValue = snapToClosestStep(rawValue, smartSteps);
    const v = clampValue(snappedValue, maxValue);

    // Use the current local state values instead of recalculating
    // This ensures consistency with what the user sees
    const finalValue = valueUsed;
    const finalStatus = usage;

    // Double-check that our local state matches the snapped slider value
    // This handles any edge cases with precision
    if (Math.abs(finalValue - v) > 0.01) {
      // If there's a discrepancy, use the snapped slider value and recalculate
      const correctedStatus = getUsageForValue(v, maxValue);
      setValueUsed(v);
      setUsage(correctedStatus);

      try {
        await persistUpdate(correctedStatus, v);
      } catch (e) {
        console.error('Failed to update credit via slider:', e);
      }
    } else {
      // Use the consistent local state values
      try {
        await persistUpdate(finalStatus, finalValue);
      } catch (e) {
        console.error('Failed to update credit via slider:', e);
      }
    }
  };

  const getCurrentPeriodName = (): string => {
    const currentYear = now.getFullYear();
    if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return monthNames[selectedPeriodNumber - 1] || `Month ${selectedPeriodNumber}`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
      const quarterSize = 3;
      const startIdx = (selectedPeriodNumber - 1) * quarterSize;
      const endIdx = startIdx + quarterSize - 1;
      return `Q${selectedPeriodNumber} (${MONTH_ABBREVIATIONS[startIdx]}-${MONTH_ABBREVIATIONS[endIdx]})`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
      const halfSize = 6;
      if (selectedPeriodNumber === 1) {
        return `H1 (${MONTH_ABBREVIATIONS[0]}-${MONTH_ABBREVIATIONS[halfSize - 1]})`;
      } else {
        return `H2 (${MONTH_ABBREVIATIONS[halfSize]}-${MONTH_ABBREVIATIONS[11]})`;
      }
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
      return `${currentYear} (${MONTH_ABBREVIATIONS[0]}-${MONTH_ABBREVIATIONS[11]})`;
    }
    return 'Unknown Period';
  };

  return (
    <div 
      className="credit-modal-controls" 
      style={{ 
        '--usage-tint-hover': lineTintHover
      } as React.CSSProperties}
    >
      {/* Period and amount display */}
      <div className="credit-period-row">
        <div className="period-name">{getCurrentPeriodName()}</div>
        <div className="amount-display">
          <span className="amount-text">${valueUsed} / ${maxValue}</span>
        </div>
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

      {/* Usage selector */}
      <div className="credit-modal-bottom-row">
        <UsageDropdown
          usage={usage}
          usageColor={usageColor}
          onUsageSelect={handleUsageSelect}
          align="start"
          trigger={
            <button
              className="button outline small"
              disabled={isCompletelyDisabled}
              style={{
                color: usageColor,
                borderColor: usageColor,
                backgroundColor: buttonBackgroundColor,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                '--button-hover-bg': lineTintHover,
                opacity: isCompletelyDisabled ? 0.6 : 1,
                cursor: isCompletelyDisabled ? 'not-allowed' : 'pointer',
                // Mobile-specific styling
                ...(isMobile && {
                  width: '100%',
                  minHeight: '48px',
                  fontSize: '16px',
                  padding: '12px 16px',
                  justifyContent: 'space-between'
                })
              } as React.CSSProperties}
            >
              <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={14} />
              {CREDIT_USAGE_DISPLAY_NAMES[usage.toUpperCase() as keyof typeof CREDIT_USAGE_DISPLAY_NAMES]}
              {!isCompletelyDisabled && <Icon name="chevron-down" variant="micro" size={12} />}
            </button>
          }
        />
      </div>
    </div>
  );
};

export default CreditModalControls;