import React from 'react';
import InfoDisplay from '../InfoDisplay/InfoDisplay';
import './ErrorWithRetry.scss';

interface ErrorWithRetryProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showTitle?: boolean;
  transparent?: boolean;
  centered?: boolean;
  /** When true, component fills its container and centers content (for full-page errors) */
  fillContainer?: boolean;
}

const ErrorWithRetry: React.FC<ErrorWithRetryProps> = ({
  message,
  onRetry,
  retryText = 'Try Again',
  showTitle = false,
  transparent = true,
  centered = true,
  fillContainer = false
}) => {
  const className = fillContainer
    ? 'error-with-retry error-with-retry--fill'
    : 'error-with-retry';

  return (
    <div className={className}>
      <InfoDisplay
        type="error"
        message={message}
        showTitle={showTitle}
        transparent={transparent}
        centered={centered}
      />
      {onRetry && (
        <button onClick={onRetry} type="button">
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorWithRetry;
