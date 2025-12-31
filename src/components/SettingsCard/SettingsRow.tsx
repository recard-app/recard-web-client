import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../icons';
import { ICON_GRAY } from '../../types';

interface SettingsRowProps {
  label: string;
  value?: string | React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  to,
  onClick,
  variant = 'default',
  disabled = false
}) => {
  const content = (
    <>
      <div className="settings-row__content">
        <span className="settings-row__label">{label}</span>
        {value && <span className="settings-row__value">{value}</span>}
      </div>
      <Icon
        name="chevron-right"
        variant="mini"
        size={16}
        color={ICON_GRAY}
        className="settings-row__chevron"
      />
    </>
  );

  const className = `settings-row settings-row--${variant} ${disabled ? 'settings-row--disabled' : ''}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick && !disabled) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

export default SettingsRow;
