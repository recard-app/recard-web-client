import React from 'react';
import './ShowMoreButton.scss';

interface ShowMoreButtonProps {
  /** Number of hidden items */
  hiddenCount: number;
  /** Whether the list is expanded */
  isExpanded: boolean;
  /** Toggle handler */
  onToggle: () => void;
}

/**
 * Expand/collapse button for lists with more than 5 items.
 */
const ShowMoreButton: React.FC<ShowMoreButtonProps> = ({
  hiddenCount,
  isExpanded,
  onToggle,
}) => {
  const buttonText = isExpanded
    ? 'Show less'
    : `Show ${hiddenCount} more`;

  return (
    <div className="show-more-button">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Show fewer items' : `Show ${hiddenCount} more items`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ShowMoreButton;
