import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CreditCard } from '../../types/CreditCardTypes';
import { ICON_PRIMARY, ICON_BLUE, ICON_GRAY } from '../../types';
import { Icon, CardIcon } from '../../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu/dropdown-menu';
import './CardSwitcherDropdown.scss';

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
        className={`card-switcher-trigger ${isDisabled ? 'disabled' : ''}`}
        disabled={isDisabled}
      >
        {selectedCard ? (
          <>
            <CardIcon
              title={`${selectedCard.CardName} card`}
              size={36}
              primary={selectedCard.CardPrimaryColor}
              secondary={selectedCard.CardSecondaryColor}
              className="trigger-card-icon"
            />
            <div className="trigger-card-info">
              <div className="trigger-card-name">
                {selectedCard.isFrozen && (
                  <Icon
                    name="snowflake"
                    variant="mini"
                    size={16}
                    color={ICON_BLUE}
                    className="frozen-icon"
                  />
                )}
                {selectedCard.isDefaultCard && (
                  <Icon
                    name="star"
                    variant="mini"
                    size={16}
                    color={ICON_PRIMARY}
                    className="preferred-star-icon"
                  />
                )}
                {selectedCard.CardName}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="trigger-empty-icon">
              <Icon name="card" variant="outline" size={24} color={ICON_GRAY} />
            </div>
            <div className="trigger-card-info">
              <div className="trigger-card-name placeholder">No cards added</div>
            </div>
          </>
        )}
        <Icon
          name="chevron-down"
          variant="mini"
          size={20}
          color={ICON_GRAY}
          className="trigger-chevron"
        />
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
