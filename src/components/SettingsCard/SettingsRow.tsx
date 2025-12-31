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
  loading?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  to,
  onClick,
  variant = 'default',
  disabled = false,
  loading = false
}) => {
  const isDisabled = disabled || loading;

  const content = (
    <>
      <div className="settings-row__content">
        <span className="settings-row__label">{label}</span>
        {(value || loading) && (
          <span className="settings-row__value">
            {loading ? 'Loading...' : value}
          </span>
        )}
      </div>
      <Icon
        name="chevron-right"
        variant="mini"
        size={16}
        color={ICON_GRAY}
        className={`settings-row__chevron ${loading ? 'settings-row__chevron--loading' : ''}`}
      />
    </>
  );

  const className = `settings-row settings-row--${variant} ${isDisabled ? 'settings-row--disabled' : ''} ${loading ? 'settings-row--loading' : ''}`;

  if (to && !isDisabled) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick && !isDisabled) {
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
