import React from 'react';
import { InfoDisplay } from '../../../elements';
import { Icon, IconName } from '../../../icons';
import './styles.scss';

interface StreamingIndicatorProps {
  message: string | null;
  icon: string | null;
  isVisible: boolean;
  className?: string;
}

/**
 * Streaming indicator for agent responses
 * Shows contextual icon based on the current operation
 */
export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  message,
  icon,
  isVisible,
  className = '',
}) => {
  if (!isVisible) return null;

  const displayMessage = message || 'Processing...';
  const iconName = (icon || 'spinner') as IconName;
  const iconElement = <Icon name={iconName} variant="outline" size={16} />;

  return (
    <div className={`streaming-indicator ${className}`}>
      <InfoDisplay
        type="loading"
        message={displayMessage}
        icon={iconElement}
        showTitle={false}
        transparent={true}
      />
    </div>
  );
};

export default StreamingIndicator;
