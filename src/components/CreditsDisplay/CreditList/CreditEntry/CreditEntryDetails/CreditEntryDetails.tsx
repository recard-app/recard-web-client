import React, { useMemo, useState, useEffect } from 'react';
import { CREDIT_PERIODS, CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, CreditUsageType } from '../../../../../types';
import { CardCredit } from '../../../../../types/CreditCardTypes';
import { CREDIT_USAGE_DISPLAY_COLORS } from '../../../../../types/CardCreditsTypes';
import { Slider } from '../../../../ui/slider';
import Icon from '@/icons';
import CreditUsageTracker from './CreditUsageTracker';
import { getMaxValue, clampValue, getUsageForValue, getValueForUsage } from '../utils';
import UsageDropdown from '../UsageDropdown';

interface CreditEntryDetailsProps {
  userCredit: UserCredit;
  now: Date;
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
  renderControls?: boolean;
  renderControlsOnly?: boolean;
}

const CreditEntryDetails: React.FC<CreditEntryDetailsProps> = ({ 
  userCredit, 
  now, 
  cardCredit, 
  creditMaxValue,
  currentYear,
  onUpdateHistoryEntry,
  renderControls = true,
  renderControlsOnly = false
}) => {
  // Separate state for modal view - independent from the main list view
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(() => {
    // Initialize with current period
    const currentMonth = now.getMonth() + 1;
    const isCurrentYear = currentYear === now.getFullYear();
    
    if (!isCurrentYear) return 1;
    
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
  });

  // Get the selected period's history entry
  const selectedHistory = useMemo(() => {
    return userCredit.History.find(h => h.PeriodNumber === selectedPeriodNumber) || userCredit.History[0];
  }, [userCredit.History, selectedPeriodNumber]);

  // State for the selected period (independent from main view)
  const [usage, setUsage] = useState<CreditUsageType>(CREDIT_USAGE.INACTIVE);
  const [valueUsed, setValueUsed] = useState<number>(0);

  // Update local state when selected period changes
  useEffect(() => {
    if (selectedHistory) {
      setUsage(selectedHistory.CreditUsage as CreditUsageType);
      setValueUsed(selectedHistory.ValueUsed ?? 0);
    }
  }, [selectedHistory]);

  const maxValue = getMaxValue(creditMaxValue);
  const isSliderDisabled = usage === CREDIT_USAGE.INACTIVE;

  const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
    [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
    [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
    [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  };

  const usageColor = USAGE_COLOR_BY_STATE[usage];

  // Tinting functions
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

  const lineTintBackground = tintHexColor(usageColor, 0.95);
  const lineTintHover = tintHexColor(usageColor, 0.85);

  // Helper functions are imported from utils

  const persistUpdate = async (newUsage: CreditUsageType, val: number) => {
    if (!onUpdateHistoryEntry) return;
    
    onUpdateHistoryEntry({
      cardId: userCredit.CardId,
      creditId: userCredit.CreditId,
      periodNumber: selectedPeriodNumber,
      creditUsage: newUsage,
      valueUsed: val,
    });
  };

  const handleUsageSelect = async (newUsage: CreditUsageType) => {
    setUsage(newUsage);
    let val = valueUsed;
    if (newUsage === CREDIT_USAGE.USED) {
      val = maxValue;
      setValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.PARTIALLY_USED) {
      val = getValueForUsage(newUsage, maxValue);
      setValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.NOT_USED) {
      val = 0;
      setValueUsed(val);
    } else if (newUsage === CREDIT_USAGE.INACTIVE) {
      val = 0;
      setValueUsed(val);
      void persistUpdate(newUsage, val);
      return;
    }
  };

  const handleSliderChange = (vals: number[]) => {
    if (isSliderDisabled) return;
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

  const getCurrentPeriodName = (): string => {
    if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Monthly) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[selectedPeriodNumber - 1] || `Month ${selectedPeriodNumber}`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Quarterly) {
      return `Q${selectedPeriodNumber} ${currentYear}`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Semiannually) {
      return selectedPeriodNumber === 1 ? `H1 ${currentYear}` : `H2 ${currentYear}`;
    } else if (userCredit.AssociatedPeriod === CREDIT_PERIODS.Annually) {
      return `${currentYear}`;
    }
    return 'Unknown Period';
  };

  return (
    <>
      <div className="usage-tracker-section">
        <div className="usage-tracker-header">
          <span className="usage-tracker-title">Usage This Year</span>
          <span className="usage-tracker-stats">
            ${userCredit.History.reduce((total, entry) => total + (entry.ValueUsed || 0), 0)} / ${Number(cardCredit?.Value || 0) * userCredit.History.length} used
          </span>
        </div>
        <CreditUsageTracker 
          userCredit={userCredit}
          currentYear={currentYear}
          selectedPeriodNumber={selectedPeriodNumber}
          onPeriodSelect={setSelectedPeriodNumber}
          currentUsage={usage}
          currentValueUsed={valueUsed}
        />
      </div>

      {/* Slider and Select Controls - modal layout with full-width slider */}
      <div className="credit-modal-controls" style={{ backgroundColor: lineTintBackground, ['--usage-tint-hover' as any]: lineTintHover }}>
        {/* Current period label */}
        <div className="current-period-label">
          <strong>Period:</strong> {getCurrentPeriodName()}
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
            style={{ ['--slider-range-color' as any]: usageColor, width: '100%' }}
          />
        </div>

        {/* Bottom row with amount and usage selector */}
        <div className="credit-modal-bottom-row">
          <div className="amount-input">
            <span className="amount-label">$</span>
            <input
              type="number"
              min="0"
              max={maxValue}
              step="0.01"
              value={valueUsed.toFixed(2)}
              onChange={(e) => {
                const v = clampValue(parseFloat(e.target.value) || 0, maxValue);
                setValueUsed(v);
                const status = getUsageForValue(v, maxValue);
                setUsage(status);
              }}
              onBlur={(e) => {
                const v = clampValue(parseFloat(e.target.value) || 0, maxValue);
                const status = getUsageForValue(v, maxValue);
                void persistUpdate(status, v);
              }}
              disabled={isSliderDisabled}
              className="amount-input-field"
            />
          </div>

          <UsageDropdown
            usage={usage}
            usageColor={usageColor}
            onUsageSelect={handleUsageSelect}
            trigger={
              <button className="button outline small" style={{ color: usageColor, borderColor: usageColor }}>
                {CREDIT_USAGE_DISPLAY_NAMES[usage.toUpperCase() as keyof typeof CREDIT_USAGE_DISPLAY_NAMES]}
                <Icon name="chevron-down" variant="mini" size={16} />
              </button>
            }
          />
        </div>
      </div>
    </>
  );
};

export default CreditEntryDetails;