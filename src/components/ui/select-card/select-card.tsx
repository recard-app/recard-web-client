import React from 'react';
import { CreditCard, LOADING_ICON, LOADING_ICON_SIZE } from '../../../types';
import { CardIcon } from '../../../icons';
import Icon from '../../../icons';
import { COLORS } from '../../../types/Colors';
import './SelectCard.scss';

const ICON_GRAY = COLORS.NEUTRAL_GRAY;

export interface SelectCardProps {
  /** Currently selected card ID */
  selectedCardId?: string;
  /** Available credit cards */
  creditCards: CreditCard[];
  /** Whether the component is in a loading/updating state */
  isUpdating?: boolean;
  /** Callback when the select card button is clicked */
  onSelectCardClick: () => void;
  /** Callback when deselect button is clicked */
  onDeselectCard: () => void;
  /** Label text for unselected state */
  selectLabel?: string;
  /** Label text for selected state */
  selectedLabel?: string;
  /** Custom icon for unselected state */
  unselectedIcon?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export const SelectCard: React.FC<SelectCardProps> = ({
  selectedCardId,
  creditCards,
  isUpdating = false,
  onSelectCardClick,
  onDeselectCard,
  selectLabel = 'Select a different card:',
  selectedLabel = 'Selected card:',
  unselectedIcon,
  className = ''
}) => {
  // Find the selected card
  const selectedCard = creditCards?.find(card => card.id === selectedCardId);
  const hasSelectedCard = selectedCardId && selectedCard;

  return (
    <div className={`select-different-card ${className}`.trim()}>
      {hasSelectedCard ? (
        <>
          <span className="selection-label">{selectedLabel}</span>
          <div className="selected-card-container">
            <button 
              className={`selected-card-button ${isUpdating ? 'loading icon with-text' : ''}`}
              onClick={onSelectCardClick}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <LOADING_ICON size={LOADING_ICON_SIZE} />
              ) : (
                <CardIcon 
                  title={selectedCard.CardName} 
                  size={24} 
                  primary={selectedCard.CardPrimaryColor}
                  secondary={selectedCard.CardSecondaryColor}
                  className="selected-card-image"
                />
              )}
              <span className="selected-card-name">
                {isUpdating ? 'Updating...' : selectedCard.CardName}
              </span>
            </button>
            <button 
              className="deselect-button"
              onClick={onDeselectCard}
              disabled={isUpdating}
              aria-label="Deselect card"
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="selection-label">{selectLabel}</span>
          <button 
            className={`select-card-button ${isUpdating ? 'loading' : ''}`}
            onClick={onSelectCardClick}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <LOADING_ICON size={LOADING_ICON_SIZE} />
            ) : (
              unselectedIcon || (
                <Icon 
                  name="card"
                  variant="micro"
                  color={ICON_GRAY}
                  size={14}
                />
              )
            )}
            <span className="label-text">
              {isUpdating ? 'Loading...' : 'Select Card'}
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default SelectCard;
