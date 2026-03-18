import React, { useRef } from 'react';
import Icon from '../../icons';
import { ICON_GRAY } from '@/types/Constants';
import './DatePicker.scss';

export interface DatePickerProps {
  value: string | null;  // MM/DD/YYYY format or null
  onChange: (date: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  containerClassName?: string;
  min?: string;  // YYYY-MM-DD format, passed to native input
  max?: string;  // YYYY-MM-DD format, passed to native input
}

// Convert MM/DD/YYYY to YYYY-MM-DD for native input
const toNativeFormat = (val: string | null): string => {
  if (!val) return '';
  const parts = val.split('/');
  if (parts.length !== 3) return '';
  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Convert YYYY-MM-DD to MM/DD/YYYY for display
const toDisplayFormat = (val: string): string | null => {
  if (!val) return null;
  const parts = val.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
};

/**
 * DatePicker component using native browser date picker
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabled = false,
  label,
  className = '',
  containerClassName = '',
  min,
  max,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nativeValue = e.target.value; // YYYY-MM-DD or ''
    if (nativeValue === '') {
      onChange(null);
      return;
    }
    // Don't enforce min via JS -- the native picker grays out invalid dates,
    // and save-time validation shows a toast. Blocking on keystroke resets
    // the field while the user is still typing the year.
    if (max && nativeValue > max) return;
    onChange(toDisplayFormat(nativeValue));
  };

  const handleCalendarClick = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      // showPicker() not supported (e.g. some iOS Safari versions) - focus to trigger native picker
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`date-picker ${containerClassName}`.trim()}>
      {label && <label className="date-picker-label">{label}</label>}
      <div className="date-picker-input-wrapper">
        <input
          ref={inputRef}
          type="date"
          value={toNativeFormat(value)}
          onChange={handleChange}
          disabled={disabled}
          min={min}
          max={max}
          className={`date-picker-input default-input ${className}`.trim()}
        />

        <div className="date-picker-actions">
          <button
            type="button"
            disabled={disabled}
            className="date-picker-calendar-btn"
            aria-label="Open calendar"
            onClick={handleCalendarClick}
          >
            <Icon name="calendar" variant="mini" size={16} color={ICON_GRAY} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
