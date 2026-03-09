import React from 'react';
import Icon from '@/icons';
import { NEUTRAL_MEDIUM_GRAY } from '../../types/Colors';
import './RefreshButton.scss';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  title?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  isLoading = false,
  title = 'Refresh',
}) => {
  return (
    <button
      className={`refresh-button${isLoading ? ' refresh-button--loading' : ''}`}
      onClick={onClick}
      disabled={isLoading}
      title={title}
    >
      <Icon name="arrow-refresh" variant="micro" size={12} color={NEUTRAL_MEDIUM_GRAY} />
    </button>
  );
};

export default RefreshButton;
