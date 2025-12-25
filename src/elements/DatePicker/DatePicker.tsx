import React, { useState, useRef, useEffect } from 'react';
import './DatePicker.scss';
import Icon from '../../icons';
import { ICON_GRAY } from '@/types/Constants';

export interface DatePickerProps {
  value: string | null;  // MM/DD/YYYY format or null
  onChange: (date: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  clearable?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * Validates if a string is a valid MM/DD/YYYY date
 */
const isValidDateFormat = (value: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
  if (!regex.test(value)) return false;

  const [month, day, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
};

/**
 * Converts MM/DD/YYYY to YYYY-MM-DD for native date input
 */
const toNativeFormat = (value: string | null): string => {
  if (!value) return '';
  const [month, day, year] = value.split('/');
  return `${year}-${month}-${day}`;
};

/**
 * Converts YYYY-MM-DD from native date input to MM/DD/YYYY
 */
const fromNativeFormat = (value: string): string | null => {
  if (!value) return null;
  const [year, month, day] = value.split('-');
  return `${month}/${day}/${year}`;
};

/**
 * DatePicker component for entering dates in MM/DD/YYYY format
 * Supports direct text input, native date picker, and optional clearing
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  disabled = false,
  label,
  clearable = true,
  className = '',
  containerClassName = '',
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [formatWarning, setFormatWarning] = useState(false);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Sync input value when prop changes externally
  useEffect(() => {
    setInputValue(value || '');
    setFormatWarning(false);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue === '') {
      onChange(null);
      setFormatWarning(false);
      return;
    }

    if (isValidDateFormat(newValue)) {
      onChange(newValue);
      setFormatWarning(false);
    } else {
      setFormatWarning(true);
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nativeValue = e.target.value;
    const formattedValue = fromNativeFormat(nativeValue);
    setInputValue(formattedValue || '');
    onChange(formattedValue);
    setFormatWarning(false);
  };

  const handleCalendarClick = () => {
    if (!disabled && nativeInputRef.current) {
      // showPicker() may not be available in all browsers
      if (typeof nativeInputRef.current.showPicker === 'function') {
        nativeInputRef.current.showPicker();
      } else {
        // Fallback: focus and click the input
        nativeInputRef.current.focus();
        nativeInputRef.current.click();
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setFormatWarning(false);
  };

  const showClearButton = clearable && value && !disabled;

  return (
    <div className={`date-picker ${containerClassName}`.trim()}>
      {label && <label className="date-picker-label">{label}</label>}
      <div className="date-picker-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`date-picker-input default-input ${formatWarning ? 'has-warning' : ''} ${className}`.trim()}
        />

        {/* Hidden native date input for calendar picker */}
        <input
          ref={nativeInputRef}
          type="date"
          value={toNativeFormat(value)}
          onChange={handleNativeDateChange}
          disabled={disabled}
          className="date-picker-native"
          tabIndex={-1}
        />

        <div className="date-picker-actions">
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="date-picker-clear"
              aria-label="Clear date"
            >
              <Icon name="x" variant="mini" size={14} color={ICON_GRAY} />
            </button>
          )}
          <button
            type="button"
            onClick={handleCalendarClick}
            disabled={disabled}
            className="date-picker-calendar-btn"
            aria-label="Open calendar"
          >
            <Icon name="calendar" variant="mini" size={16} color={ICON_GRAY} />
          </button>
        </div>
      </div>

      {formatWarning && (
        <span className="date-picker-warning">Please use format: MM/DD/YYYY</span>
      )}
    </div>
  );
};

export default DatePicker;
