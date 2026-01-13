import React from 'react';
import { Icon } from '../../../icons';
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
        className="button ghost icon with-text"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Show fewer items' : `Show ${hiddenCount} more items`}
      >
        <Icon
          name={isExpanded ? 'chevron-up' : 'plus-simple'}
          variant="micro"
          size={14}
        />
        {buttonText}
      </button>
    </div>
  );
};

export default ShowMoreButton;
