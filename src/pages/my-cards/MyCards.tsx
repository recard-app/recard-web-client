import React from 'react';
import CreditCardManager from '../../components/CreditCardManager';
import { CreditCard } from '../../types/CreditCardTypes';

interface MyCardsProps {
    onCardsUpdate?: (cards: CreditCard[]) => void;
}

const MyCards: React.FC<MyCardsProps> = ({ onCardsUpdate }) => {
    return (
        <div>
            <h1>My Cards</h1>
            <p>Set your credit cards to be used for your account.</p>
            <CreditCardManager onCardsUpdate={onCardsUpdate} />
        </div>
    );
};

export default MyCards;
