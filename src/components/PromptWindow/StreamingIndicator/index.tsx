import React from 'react';
import { InfoDisplay } from '../../../elements';
import { Icon } from '../../../icons';
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
  const iconName = icon || 'spinner';

  // Create icon function for InfoDisplay's IconRenderer
  const iconComponent = (props: { className?: string; size?: number }) => (
    <Icon name={iconName} variant="outline" size={props.size || 16} className={props.className} />
  );

  return (
    <div className={`streaming-indicator ${className}`}>
      <InfoDisplay
        type="loading"
        message={displayMessage}
        icon={iconComponent}
        showTitle={false}
        transparent={true}
      />
    </div>
  );
};

export default StreamingIndicator;
