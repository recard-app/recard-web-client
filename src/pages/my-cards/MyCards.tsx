import React, { useCallback } from 'react';
import CreditCardManager from '../../components/CreditCardManager';
import { CreditCard } from '../../types/CreditCardTypes';
import { useFullHeight } from '../../hooks/useFullHeight';
import PageHeader from '../../components/PageHeader';
import './MyCards.scss';

interface MyCardsProps {
    onCardsUpdate?: (cards: CreditCard[]) => void;
}

const MyCards: React.FC<MyCardsProps> = ({ onCardsUpdate }) => {
    // Declare that this component needs full height behavior
    useFullHeight(true);
    
    // Wrap the onCardsUpdate callback with useCallback to prevent unnecessary re-renders
    const handleCardsUpdate = useCallback((cards: CreditCard[]) => {
        onCardsUpdate?.(cards);
    }, [onCardsUpdate]);

    return (
        <div className="my-cards-wrapper">
            <PageHeader 
                title="My Cards"
            />
            <div className="my-cards-page">
                <div className="credit-card-manager-container">
                    <CreditCardManager onCardsUpdate={handleCardsUpdate} />
                </div>
            </div>
        </div>
    );
};

export default MyCards;
