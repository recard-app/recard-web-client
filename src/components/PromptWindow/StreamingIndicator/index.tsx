import React from 'react';
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
 * Shows: <icon> action text with pulsing animation
 */
export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  message,
  icon,
  isVisible,
  className = '',
}) => {
  if (!isVisible) return null;

  const displayMessage = message || 'Thinking...';
  const iconName = icon || 'chat-bubble-oval-left-ellipsis';

  return (
    <div className={`streaming-indicator ${className}`}>
      <div className="streaming-indicator-content pulsing">
        <Icon
          name={iconName}
          variant="mini"
          size={16}
          className="streaming-icon"
        />
        <span className="streaming-message">{displayMessage}</span>
      </div>
    </div>
  );
};

export default StreamingIndicator;
