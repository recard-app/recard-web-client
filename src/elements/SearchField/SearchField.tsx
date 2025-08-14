import React from 'react';
import './SearchField.scss';
import Icon from '../../icons';
import { ICON_GRAY } from '@/types/Constants';

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({
  className = '',
  containerClassName = '',
  ...props
}) => {
  const inputClassName = `search-input default-input ${className}`.trim();

  return (
    <div className={`search-field ${containerClassName}`.trim()}>
      <Icon name="search" variant="mini" size={16} className="search-icon" color={ICON_GRAY} />
      <input {...props} className={inputClassName} />
    </div>
  );
};

export default SearchField;
