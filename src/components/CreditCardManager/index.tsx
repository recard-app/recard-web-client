import React, { useState, useEffect, useCallback } from 'react';
import './CreditCardManager.scss';
import { CreditCard, CreditCardDetails } from '../../types/CreditCardTypes';
import SingleCardSelector from '../CreditCardSelector/SingleCardSelector';
import { CardService, UserCreditCardService } from '../../services';
import { Modal, useModal } from '../Modal';
import CreditCardDetailView from '../CreditCardDetailView';
import CreditCardPreviewList from '../CreditCardPreviewList';
import { InfoDisplay } from '../../elements';



interface CreditCardManagerProps {
    onCardsUpdate?: (cards: CreditCard[]) => void;
}

const CreditCardManager: React.FC<CreditCardManagerProps> = ({ onCardsUpdate }) => {
    const [userCards, setUserCards] = useState<CreditCard[]>([]);
    const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
    const [cardDetails, setCardDetails] = useState<CreditCardDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [detailedCards, setDetailedCards] = useState<CreditCardDetails[]>([]);
    const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
    
    // Use the useModal hook for the add card selector
    const { isOpen: showSelector, open: openSelector, close: closeSelector } = useModal({
        initialState: false,
        modalType: 'add_card'
    });
    
    // Use the useModal hook for delete confirmation
    const { isOpen: showDeleteConfirm, open: openDeleteConfirm, close: closeDeleteConfirm } = 
        useModal({
            initialState: false,
            modalType: 'delete_card',
            entityId: cardToDelete?.id
        });
    
    // Error message state
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);
    
    // Memoized function to notify parent of card updates
    const notifyCardUpdate = useCallback((cards: CreditCard[]) => {
        onCardsUpdate?.(cards);
    }, [onCardsUpdate]);
    
    // Load user's credit cards on component mount
    useEffect(() => {
        const loadUserCards = async () => {
            try {
                setIsLoading(true);
                
                // Load both basic cards and detailed cards in parallel
                const [cards, detailedCardsData] = await Promise.all([
                    CardService.fetchCreditCards(true),
                    UserCreditCardService.fetchUserCardsDetailedInfo()
                ]);
                
                setUserCards(cards);
                setDetailedCards(detailedCardsData);
                
                // Notify parent component of card updates
                notifyCardUpdate(cards);
                
                // Select the default card if available, otherwise the first card
                const defaultCard = cards.find(card => card.isDefaultCard && card.selected);
                if (defaultCard) {
                    // Find the details directly from the loaded data
                    const details = detailedCardsData.find(card => card.id === defaultCard.id);
                    setSelectedCard(defaultCard);
                    setCardDetails(details || null);
                } else if (cards.length > 0 && cards.some(card => card.selected)) {
                    // Get the first selected card
                    const firstSelectedCard = cards.find(card => card.selected);
                    if (firstSelectedCard) {
                        // Find the details directly from the loaded data
                        const details = detailedCardsData.find(card => card.id === firstSelectedCard.id);
                        setSelectedCard(firstSelectedCard);
                        setCardDetails(details || null);
                    }
                }
            } catch (error) {
                console.error('Error loading cards:', error);
                setErrorMessage('Unable to load your credit cards. Please try again later.');
                setShowError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserCards();
    }, []);

    // Load detailed information for a specific card
    const loadCardDetails = async (cardId: string) => {
        try {
            // If we already loaded cached details in handleCardSelect, don't show loading again
            const existingDetails = detailedCards.find(card => card.id === cardId);
            if (!existingDetails && !cardDetails) {
                setIsLoading(true);
            }
            
            // Always fetch fresh detailed cards data to keep in sync with DB
            const allDetailedCards = await UserCreditCardService.fetchUserCardsDetailedInfo();
            setDetailedCards(allDetailedCards);
            
            // Find the specific card details from the fresh data
            const details = allDetailedCards.find(card => card.id === cardId);
            
            // If the selected card hasn't changed while loading, update the details
            if (selectedCard && selectedCard.id === cardId) {
                setCardDetails(details || null);
            }
        } catch (error) {
            console.error('Error loading card details:', error);
            setErrorMessage('Unable to load card details. Please try again.');
            setShowError(true);
            // Only reset details if we were explicitly loading this card
            if (selectedCard && selectedCard.id === cardId) {
                setCardDetails(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle card selection from the sidebar
    const handleCardSelect = async (card: CreditCard) => {
        // Clear any previous errors
        setShowError(false);
        
        // Update the selected card state immediately for a responsive UI
        setSelectedCard(card);
        
        // Get the latest card details from our cache if available
        const cachedDetails = detailedCards.find(detail => detail.id === card.id);
        if (cachedDetails) {
            setCardDetails(cachedDetails);
        } else {
            // Show loading state if we don't have cached details
            setIsLoading(true);
        }
        
        // Fetch fresh details for the selected card in the background
        await loadCardDetails(card.id);
    };

    // Handle setting a card as the preferred/default card
    const handleSetPreferred = async (card: CreditCard) => {
        try {
            // Clear any previous errors
            setShowError(false);
            
            // Toggle the preferred status
            const newIsDefault = !card.isDefaultCard;
            
            const updatedCards = userCards.map(c => ({
                ...c,
                isDefaultCard: newIsDefault && c.id === card.id
            }));
            
            // Format cards for API submission
            const cardsToSubmit = updatedCards
                .filter(card => card.selected)
                .map(card => ({
                    cardId: card.id,
                    isDefaultCard: card.isDefaultCard || false
                }));
            
            await UserCreditCardService.updateUserCards(cardsToSubmit);
            
            // Refresh cards after update
            const refreshedCards = await CardService.fetchCreditCards(true);
            setUserCards(refreshedCards);
            
            // Notify parent component of card updates
            notifyCardUpdate(refreshedCards);
            
            // Immediately update local state for a responsive UI
            if (selectedCard && selectedCard.id === card.id) {
                setSelectedCard({
                    ...selectedCard,
                    isDefaultCard: newIsDefault
                });
                
                // Update card details as well
                if (cardDetails) {
                    setCardDetails({
                        ...cardDetails,
                        isDefaultCard: newIsDefault
                    });
                }
            }
            
            // Refresh detailed cards data in the background
            const refreshedDetailedCards = await UserCreditCardService.fetchUserCardsDetailedInfo();
            setDetailedCards(refreshedDetailedCards);
            
            // If we're currently viewing a card, update its details
            if (selectedCard) {
                const updatedCardDetails = refreshedDetailedCards.find(detail => detail.id === selectedCard.id);
                if (updatedCardDetails) {
                    setCardDetails(updatedCardDetails);
                }
            }
        } catch (error) {
            console.error('Error setting preferred card:', error);
            setErrorMessage('Unable to set this card as preferred. Please try again.');
            setShowError(true);
        }
    };

    // Handle removing a card from the user's selected cards
    const handleRemoveCard = async (card: CreditCard) => {
        // Clear any previous errors
        setShowError(false);
        
        // Set the card to delete and open the confirmation modal
        setCardToDelete(card);
        openDeleteConfirm();
    };

    // Handle confirmation of card deletion
    const handleDeleteConfirm = async () => {
        if (!cardToDelete) return;
        
        try {
            // Create a copy of the cards with the selected card removed
            const updatedCards = userCards.map(c => ({
                ...c,
                selected: c.id === cardToDelete.id ? false : c.selected,
                isDefaultCard: c.id === cardToDelete.id ? false : c.isDefaultCard
            }));
            
            // Format cards for API submission
            const cardsToSubmit = updatedCards
                .filter(card => card.selected)
                .map(card => ({
                    cardId: card.id,
                    isDefaultCard: card.isDefaultCard || false
                }));
            
            await UserCreditCardService.updateUserCards(cardsToSubmit);
            
            // Refresh cards after update
            const refreshedCards = await CardService.fetchCreditCards(true);
            setUserCards(refreshedCards);
            
            // Notify parent component of card updates
            notifyCardUpdate(refreshedCards);
            
            // Select a new card if the removed card was selected
            if (selectedCard && selectedCard.id === cardToDelete.id) {
                const defaultCard = refreshedCards.find(c => c.isDefaultCard && c.selected);
                const firstCard = refreshedCards.find(c => c.selected);
                
                if (defaultCard) {
                    setSelectedCard(defaultCard);
                    await loadCardDetails(defaultCard.id);
                } else if (firstCard) {
                    setSelectedCard(firstCard);
                    await loadCardDetails(firstCard.id);
                } else {
                    setSelectedCard(null);
                    setCardDetails(null);
                }
            }
            
            // Refresh detailed cards data in the background
            const refreshedDetailedCards = await UserCreditCardService.fetchUserCardsDetailedInfo();
            setDetailedCards(refreshedDetailedCards);
            
            // Close the confirmation modal
            closeDeleteConfirm();
        } catch (error) {
            console.error('Error removing card:', error);
            setErrorMessage('Unable to remove this card. Please try again.');
            setShowError(true);
            // Close the modal even if there's an error
            closeDeleteConfirm();
        }
    };

    // Handle adding a new card via the CreditCardSelector
    const handleAddCard = () => {
        openSelector();
    };

    // Handle card selection from the SingleCardSelector
    const handleSelectorCardSelect = async (card: CreditCard) => {
        // Add the card to user's cards if not already present
        const isCardAlreadyAdded = userCards.some(c => c.id === card.id && c.selected);
        
        if (!isCardAlreadyAdded) {
            try {
                // Update the card as selected
                const updatedCards = userCards.map(c => ({
                    ...c,
                    selected: c.id === card.id ? true : c.selected
                }));
                
                // If no cards are currently selected, make this the default
                const hasSelectedCards = updatedCards.some(c => c.selected && c.id !== card.id);
                if (!hasSelectedCards) {
                    updatedCards.find(c => c.id === card.id)!.isDefaultCard = true;
                }
                
                // Format cards for API submission
                const cardsToSubmit = updatedCards
                    .filter(c => c.selected || c.id === card.id)
                    .map(c => ({
                        cardId: c.id,
                        isDefaultCard: c.id === card.id && !hasSelectedCards ? true : (c.isDefaultCard || false)
                    }));
                
                await UserCreditCardService.updateUserCards(cardsToSubmit);
                
                // Refresh cards after update
                const refreshedCards = await CardService.fetchCreditCards(true);
                setUserCards(refreshedCards);
                
                // Notify parent component of card updates
                notifyCardUpdate(refreshedCards);
                
                // Set the newly added card as selected
                const newlyAddedCard = refreshedCards.find(c => c.id === card.id);
                if (newlyAddedCard) {
                    setSelectedCard(newlyAddedCard);
                    
                    // Refresh detailed cards data in the background
                    const refreshedDetailedCards = await UserCreditCardService.fetchUserCardsDetailedInfo();
                    setDetailedCards(refreshedDetailedCards);
                    
                    // Find details for the newly selected card
                    const newCardDetails = refreshedDetailedCards.find(detail => detail.id === card.id);
                    if (newCardDetails) {
                        setCardDetails(newCardDetails);
                    } else {
                        // If not found in the refreshed data, load details separately
                        await loadCardDetails(card.id);
                    }
                }
            } catch (error) {
                console.error('Error adding card:', error);
            }
        }
        
        // Close the selector
        closeSelector();
    };

    // Get only the selected cards to display
    const selectedCards = userCards.filter(card => card.selected)
        .sort((a, b) => {
            // Sort default card first, then alphabetically
            if (a.isDefaultCard !== b.isDefaultCard) {
                return a.isDefaultCard ? -1 : 1;
            }
            return a.CardName.localeCompare(b.CardName);
        });

    return (
        <div className="credit-card-manager">
            
            {/* Sidebar for card selection using CreditCardPreviewList */}
            <div className="card-sidebar">
                <div className="sidebar-header">
                    <button className="primary" onClick={handleAddCard}>
                        Add Card
                    </button>
                </div>
                {showError && (
                    <div className="error-container">
                        <InfoDisplay
                            type="error"
                            message={errorMessage}
                        />
                    </div>
                )}
                
                <CreditCardPreviewList
                    cards={selectedCards}
                    selectedCardId={selectedCard?.id}
                    onCardSelect={handleCardSelect}
                    loading={isLoading}
                />
            </div>
            
            {/* Main content area for card details */}
            <div className="card-details-panel">
                <CreditCardDetailView 
                    cardDetails={cardDetails}
                    isLoading={isLoading}
                    onSetPreferred={selectedCard ? () => handleSetPreferred(selectedCard) : undefined}
                    onRemoveCard={selectedCard ? () => handleRemoveCard(selectedCard) : undefined}
                />
            </div>
            
            {/* Card selector modal */}
            <Modal 
                isOpen={showSelector} 
                onClose={closeSelector}
                modalType="add_card"
            >
                <div className="modal-header-content">
                    <h3>Add a Credit Card</h3>
                </div>
                <SingleCardSelector 
                    creditCards={userCards.filter(card => !card.selected)}
                    onSelectCard={handleSelectorCardSelect}
                    selectedCardId={undefined}
                    showOnlyUnselectedCards={true}
                />
            </Modal>
            
            {/* Delete confirmation modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={closeDeleteConfirm}
                modalType="delete_card"
                entityId={cardToDelete?.id}
            >
                <div className="delete-confirmation">
                    <h3>Remove Credit Card</h3>
                    <p>
                        Are you sure you want to remove <strong>{cardToDelete?.CardName}</strong> from your cards? 
                        You can add it back later if needed.
                    </p>
                    <div className="button-group">
                        <button 
                            className="confirm-button"
                            onClick={handleDeleteConfirm}
                        >
                            Remove
                        </button>
                        <button 
                            className="cancel-button"
                            onClick={closeDeleteConfirm}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CreditCardManager;