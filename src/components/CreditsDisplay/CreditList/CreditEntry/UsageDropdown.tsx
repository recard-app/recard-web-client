import React from 'react';
import './UsageDropdown.scss';
import { CREDIT_USAGE_DISPLAY_NAMES, CreditUsageType, CREDIT_USAGE } from '../../../../types';
import { CREDIT_USAGE_DISPLAY_COLORS } from '../../../../types/CardCreditsTypes';
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
  [CREDIT_USAGE.USED]: 'used-icon',
  [CREDIT_USAGE.PARTIALLY_USED]: 'partially-used-icon',
  [CREDIT_USAGE.NOT_USED]: 'not-used-icon',
  [CREDIT_USAGE.INACTIVE]: 'inactive',
};

const USAGE_COLOR_BY_STATE: Record<CreditUsageType, string> = {
  [CREDIT_USAGE.USED]: CREDIT_USAGE_DISPLAY_COLORS.USED,
  [CREDIT_USAGE.PARTIALLY_USED]: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
  [CREDIT_USAGE.NOT_USED]: CREDIT_USAGE_DISPLAY_COLORS.NOT_USED,
  [CREDIT_USAGE.INACTIVE]: CREDIT_USAGE_DISPLAY_COLORS.INACTIVE,
};

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
      <DropdownMenuContent align={align} className="usage-dropdown-content">
        {Object.entries(CREDIT_USAGE_DISPLAY_NAMES).map(([key, label]) => {
          const usageKey = CREDIT_USAGE[key as keyof typeof CREDIT_USAGE];
          const isSelected = usage === usageKey;
          
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onUsageSelect(usageKey)}
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
              <span className="usage-dropdown-text" style={{ color: USAGE_COLOR_BY_STATE[usageKey] }}>
                {label}
              </span>
              {isSelected && (
                <Icon 
                  name="check" 
                  variant="micro" 
                  size={12}
                  className="usage-dropdown-check"
                  style={{ 
                    color: usageColor
                  }}
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UsageDropdown;