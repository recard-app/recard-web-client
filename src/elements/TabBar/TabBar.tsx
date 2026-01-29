import React from 'react';
import './TabBar.scss';

export interface TabBarOption {
  id: string;
  label: string;
}

export interface TabBarProps {
  options: TabBarOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'default' | 'small';
}

export const TabBar: React.FC<TabBarProps> = ({
  options,
  activeId,
  onChange,
  className = '',
  size = 'default'
}) => {
  return (
    <div className={`tab-bar ${size} ${className}`.trim()}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`tab-bar-button ${activeId === option.id ? 'active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
