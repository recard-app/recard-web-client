import React, { useMemo, useState } from 'react';
import './CreditEntry.scss';
import { CREDIT_INTERVALS, CREDIT_PERIODS, CREDIT_USAGE, CREDIT_USAGE_DISPLAY_NAMES, UserCredit, CreditUsageType } from '../../../../types';
import { CreditCardDetails, CardCredit } from '../../../../types/CreditCardTypes';
import { Slider } from '../../../ui/slider';
import { CardIcon } from '../../../../icons';
import Icon from '@/icons';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu/dropdown-menu';
import { clampValue, getMaxValue, getValueForUsage, getUsageForValue } from './utils';
import { UserCreditService } from '../../../../services/UserServices';

export interface CreditEntryProps {
  userCredit: UserCredit;
  now: Date;
  card: CreditCardDetails | null;
  cardCredit: CardCredit | null;
  creditMaxValue?: number; // value of the credit in dollars
  onUpdateHistoryEntry?: (update: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage: CreditUsageType;
    valueUsed: number;
  }) => void;
}

const CreditEntry: React.FC<CreditEntryProps> = ({ userCredit, now, card, cardCredit, creditMaxValue, onUpdateHistoryEntry }) => {
  const BAR_COLOR: Record<CreditUsageType, string> = {
    [CREDIT_USAGE.NOT_USED]: 'var(--slider-range-color-unused)',
    [CREDIT_USAGE.INACTIVE]: 'var(--slider-range-color-inactive)',
    [CREDIT_USAGE.PARTIALLY_USED]: 'var(--slider-range-color-partial)',
    [CREDIT_USAGE.USED]: 'var(--slider-range-color-used)'
  };
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
      // Disable slider and set to lowest value
      setValueUsed(0);
      void persistUpdate(newUsage, 0);
      return;
    }
    if (newUsage === CREDIT_USAGE.NOT_USED) {
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

  return (
    <div className="credit-entry" data-period={userCredit.AssociatedPeriod}>
      <div className="credit-line">
        <div className="credit-id">{cardCredit?.Title ?? userCredit.CreditId}</div>
        <div className="credit-usage">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2 h-8 px-3 rounded-md border bg-transparent text-sm">
                <Icon name={USAGE_ICON_NAME[usage]} variant="micro" size={14} />
                <span>
                  {usage === CREDIT_USAGE.USED && CREDIT_USAGE_DISPLAY_NAMES.USED}
                  {usage === CREDIT_USAGE.PARTIALLY_USED && CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}
                  {usage === CREDIT_USAGE.NOT_USED && CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}
                  {usage === CREDIT_USAGE.INACTIVE && CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.USED); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.USED]} variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.USED}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.PARTIALLY_USED); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.PARTIALLY_USED]} variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.NOT_USED); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.NOT_USED]} variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.NOT_USED}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSelectChange(CREDIT_USAGE.INACTIVE); }}>
                <span className="flex items-center gap-2">
                  <Icon name={USAGE_ICON_NAME[CREDIT_USAGE.INACTIVE]} variant="micro" size={14} />
                  <span>{CREDIT_USAGE_DISPLAY_NAMES.INACTIVE}</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="credit-value-used" style={{ minWidth: 120 }}>
          <Slider
            min={0}
            max={maxValue}
            value={[valueUsed]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            disabled={isSliderDisabled}
            className="w-32"
            style={{ ['--slider-range-color' as any]: BAR_COLOR[usage] }}
          />
          <span className="ml-2 text-sm text-muted-foreground">${valueUsed} / ${maxValue}</span>
        </div>
      </div>
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
      {cardCredit?.Description && (
        <div className="credit-desc">{cardCredit.Description}</div>
      )}
    </div>
  );
};

export default CreditEntry;