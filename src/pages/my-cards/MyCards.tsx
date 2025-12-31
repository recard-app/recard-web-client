import React, { useCallback } from 'react';
import CreditCardManager from '../../components/CreditCardManager';
import { CreditCard } from '../../types/CreditCardTypes';
import { PAGE_NAMES, PAGE_ICONS } from '../../types';
import { useFullHeight } from '../../hooks/useFullHeight';
import PageHeader from '../../components/PageHeader';
import './MyCards.scss';

interface MyCardsProps {
    onCardsUpdate?: (cards: CreditCard[]) => void;
    onOpenCardSelector?: () => void;
    reloadTrigger?: number;
    onPreferencesUpdate?: () => Promise<void>;
}

const MyCards: React.FC<MyCardsProps> = ({ onCardsUpdate, onOpenCardSelector, reloadTrigger, onPreferencesUpdate }) => {
    // Declare that this component needs full height behavior
    useFullHeight(true);

    // Wrap the onCardsUpdate callback with useCallback to prevent unnecessary re-renders
    const handleCardsUpdate = useCallback((cards: CreditCard[]) => {
        onCardsUpdate?.(cards);
    }, [onCardsUpdate]);

    return (
        <div className="standard-page-layout">
            <PageHeader
                title={PAGE_NAMES.MY_CARDS}
                icon={PAGE_ICONS.MY_CARDS.MINI}
            />
            <div className="standard-page-content--no-padding">
                <div className="credit-card-manager-container">
                    <CreditCardManager
                        onCardsUpdate={handleCardsUpdate}
                        onOpenCardSelector={onOpenCardSelector}
                        reloadTrigger={reloadTrigger}
                        onPreferencesUpdate={onPreferencesUpdate}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyCards;
