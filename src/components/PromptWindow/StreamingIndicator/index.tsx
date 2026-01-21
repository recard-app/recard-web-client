import React from 'react';
import { InfoDisplay } from '../../../elements';
import './styles.scss';

interface StreamingIndicatorProps {
  message: string | null;
  isVisible: boolean;
  className?: string;
}

/**
 * Streaming indicator for agent responses
 * Reuses InfoDisplay component for visual consistency
 */
export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  message,
  isVisible,
  className = '',
}) => {
  if (!isVisible) return null;

  return (
    <div className={`streaming-indicator ${className}`}>
      <InfoDisplay
        type="loading"
        message={message || 'Processing...'}
        showTitle={false}
        transparent={true}
      />
    </div>
  );
};

export default StreamingIndicator;
