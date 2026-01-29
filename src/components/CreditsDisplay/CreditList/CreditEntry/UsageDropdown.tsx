import React from 'react';
import './UsageDropdown.scss';
import { CREDIT_USAGE_DISPLAY_NAMES, CreditUsageType, CREDIT_USAGE } from '../../../../types';
import { CREDIT_USAGE_DISPLAY_COLORS, CREDIT_USAGE_ICON_NAMES } from '../../../../types/CardCreditsTypes';
import Icon from '@/icons';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu/dropdown-menu';

interface UsageDropdownProps {
  usage: CreditUsageType;
  usageColor: string;
  onUsageSelect: (usage: CreditUsageType) => void;
  trigger: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

const USAGE_ICON_NAME: Record<CreditUsageType, string> = {
  [CREDIT_USAGE.USED]: CREDIT_USAGE_ICON_NAMES.USED,
  [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_ICON_NAMES.PARTIALLY_USED,
  [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_ICON_NAMES.NOT_USED,
  [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_ICON_NAMES.INACTIVE,
  [CREDIT_USAGE.DISABLED]: CREDIT_USAGE_ICON_NAMES.DISABLED,
};

const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
  [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
  [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
  [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
  [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
  [CREDIT_USAGE.DISABLED]: CREDIT_USAGE_DISPLAY_COLORS.DISABLED,
};

// Explicit order for dropdown options (excludes DISABLED)
const DROPDOWN_OPTION_ORDER: Array<keyof typeof CREDIT_USAGE> = [
  'USED',
  'PARTIALLY_USED',
  'NOT_USED',
  'INACTIVE'
];

const UsageDropdown: React.FC<UsageDropdownProps> = ({
  usage,
  usageColor,
  onUsageSelect,
  trigger,
  align = 'end'
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="usage-dropdown-content"
        sideOffset={4}
        alignOffset={0}
      >
        {DROPDOWN_OPTION_ORDER.map((key) => {
            const usageKey = CREDIT_USAGE[key];
            const label = CREDIT_USAGE_DISPLAY_NAMES[key];
            const isSelected = usage === usageKey;

            return (
              <DropdownMenuItem
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onUsageSelect(usageKey);
                }}
                className={`usage-dropdown-item ${isSelected ? 'selected' : ''}`}
              >
                <Icon
                  name={USAGE_ICON_NAME[usageKey]}
                  variant="micro"
                  size={14}
                  className="usage-dropdown-icon"
                  style={{
                    color: USAGE_COLOR_BY_STATE[usageKey]
                  }}
                />
                <span className="usage-dropdown-text">
                  {label}
                </span>
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UsageDropdown;