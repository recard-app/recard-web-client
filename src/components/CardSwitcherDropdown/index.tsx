import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CreditCard } from '../../types/CreditCardTypes';
import { ICON_PRIMARY, ICON_BLUE } from '../../types';
import { COLORS } from '../../types/Colors';
import { Icon, CardIcon } from '../../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu/dropdown-menu';
import './CardSwitcherDropdown.scss';

interface CardSelectContentProps {
  selectedCard: CreditCard | null;
  hasCards: boolean;
  loading?: boolean;
}

export const CardSelectContent: React.FC<CardSelectContentProps> = ({ selectedCard, hasCards, loading }) => {
  if (selectedCard) {
    return (
      <>
        <CardIcon
          title={`${selectedCard.CardName} card`}
          size={24}
          primary={selectedCard.CardPrimaryColor}
          secondary={selectedCard.CardSecondaryColor}
          className="select-card-icon"
        />
        <span className="label-text">{selectedCard.CardName}</span>
      </>
    );
  }

  const label = loading ? 'Loading cards...' : hasCards ? 'Select a card to view' : 'No cards added';
  const title = loading ? 'Loading cards' : hasCards ? 'Select a card' : 'No cards';

  return (
    <>
      <CardIcon
        title={title}
        size={24}
        primary={COLORS.NEUTRAL_GRAY}
        secondary={COLORS.NEUTRAL_LIGHT_GRAY}
        className="select-card-icon"
      />
      <span className="label-text">{label}</span>
    </>
  );
};

interface CardSwitcherDropdownProps {
  cards: CreditCard[];
  selectedCard: CreditCard | null;
  onCardSelect: (card: CreditCard) => void;
  loading?: boolean;
}

const CardSwitcherDropdown: React.FC<CardSwitcherDropdownProps> = ({
  cards,
  selectedCard,
  onCardSelect,
  loading = false,
}) => {
  const hasCards = cards.length > 0;
  const isDisabled = !hasCards || loading;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="view-card-select"
        disabled={isDisabled}
      >
        <CardSelectContent selectedCard={selectedCard} hasCards={hasCards} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="card-switcher-content" align="start">
        {cards.map((card) => (
          <DropdownMenuPrimitive.Item
            key={card.id}
            className={`card-switcher-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
            onSelect={() => onCardSelect(card)}
          >
            <CardIcon
              title={`${card.CardName} card`}
              size={36}
              primary={card.CardPrimaryColor}
              secondary={card.CardSecondaryColor}
              className="item-card-icon"
            />
            <div className="item-card-info">
              <div className="item-card-name">
                {card.isFrozen && (
                  <Icon
                    name="snowflake"
                    variant="mini"
                    size={16}
                    color={ICON_BLUE}
                    className="frozen-icon"
                  />
                )}
                {card.isDefaultCard && (
                  <Icon
                    name="star"
                    variant="mini"
                    size={16}
                    color={ICON_PRIMARY}
                    className="preferred-star-icon"
                  />
                )}
                {card.CardName}
              </div>
              <div className="item-card-network">{card.CardNetwork}</div>
            </div>
          </DropdownMenuPrimitive.Item>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CardSwitcherDropdown;
