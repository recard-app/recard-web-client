import React from 'react';
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
    <select
      className={`year-dropdown default-select ${loading ? 'loading' : ''}`}
      value={selectedYear}
      onChange={(e) => onYearChange(Number(e.target.value))}
      disabled={isDisabled}
    >
      {availableYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};

export default YearDropdown;
