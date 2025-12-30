import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ICON_GRAY, ICON_PRIMARY } from '@/types';
import Icon from '@/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu/dropdown-menu';
import { YearDropdownProps } from '../types';
import './YearDropdown.scss';

const YearDropdown: React.FC<YearDropdownProps> = ({
  selectedYear,
  onYearChange,
  availableYears,
  disabled = false,
  loading = false,
}) => {
  const isDisabled = disabled || loading || availableYears.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`year-dropdown-trigger ${isDisabled ? 'disabled' : ''}`}
        disabled={isDisabled}
      >
        <span className="year-text">{selectedYear}</span>
        {loading ? (
          <Icon
            name="loading"
            variant="mini"
            size={16}
            color={ICON_GRAY}
            className="trigger-spinner"
          />
        ) : (
          <Icon
            name="chevron-down"
            variant="mini"
            size={16}
            color={ICON_GRAY}
            className="trigger-chevron"
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="year-dropdown-content" align="start">
        {availableYears.map((year) => (
          <DropdownMenuPrimitive.Item
            key={year}
            className={`year-dropdown-item ${selectedYear === year ? 'selected' : ''}`}
            onSelect={() => onYearChange(year)}
          >
            <span className="year-label">{year}</span>
            {selectedYear === year && (
              <Icon
                name="check"
                variant="mini"
                size={16}
                color={ICON_PRIMARY}
                className="check-icon"
              />
            )}
          </DropdownMenuPrimitive.Item>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default YearDropdown;
