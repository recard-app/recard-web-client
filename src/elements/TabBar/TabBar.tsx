import React from 'react';
import Icon, { IconName } from '@/icons';
import './TabBar.scss';

export interface TabBarOption {
  id: string;
  label: string;
  icon?: IconName;
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
          {option.icon && <Icon name={option.icon} variant="micro" size={14} />}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
