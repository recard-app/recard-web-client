import React, { useCallback, useState } from 'react';
import CreditCardManager from '../../components/CreditCardManager';
import { CreditCard } from '../../types/CreditCardTypes';
import { PAGE_NAMES, PAGE_ICONS } from '../../types';
import { useFullHeight } from '../../hooks/useFullHeight';
import PageHeader from '../../components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../components/ui/dialog/dialog';
import MyCardsHelpModal from './MyCardsHelpModal';
import './MyCards.scss';

interface MyCardsProps {
    onCardsUpdate?: (cards: CreditCard[]) => void;
    onOpenCardSelector?: () => void;
    reloadTrigger?: number;
}

const MyCards: React.FC<MyCardsProps> = ({ onCardsUpdate, onOpenCardSelector, reloadTrigger }) => {
    // Declare that this component needs full height behavior
    useFullHeight(true);
    
    // Help modal state
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    
    // Wrap the onCardsUpdate callback with useCallback to prevent unnecessary re-renders
    const handleCardsUpdate = useCallback((cards: CreditCard[]) => {
        onCardsUpdate?.(cards);
    }, [onCardsUpdate]);

    return (
        <div className="my-cards-wrapper">
            <PageHeader 
                title={PAGE_NAMES.MY_CARDS}
                icon={PAGE_ICONS.MY_CARDS.MINI}
                showHelpButton={true}
                onHelpClick={() => setIsHelpOpen(true)}
            />
            <div className="my-cards-page">
                <div className="credit-card-manager-container">
                    <CreditCardManager 
                        onCardsUpdate={handleCardsUpdate} 
                        onOpenCardSelector={onOpenCardSelector}
                        reloadTrigger={reloadTrigger}
                    />
                </div>
            </div>

            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>My Cards Help</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <MyCardsHelpModal />
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyCards;
