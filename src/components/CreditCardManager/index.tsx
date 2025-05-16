import React, { useState, useEffect } from 'react';
import './CreditCardManager.scss';
import { CreditCard, CreditCardDetails } from '../../types/CreditCardTypes';
import SingleCardSelector from '../CreditCardSelector/SingleCardSelector';
import { CardService, UserCreditCardService } from '../../services';
import { Dropdown, DropdownItem } from '../../elements/Elements';
import { PLACEHOLDER_CARD_IMAGE } from '../../types';
import { Modal, useModal } from '../Modal';

const CreditCardManager = () => {
    const [userCards, setUserCards] = useState<CreditCard[]>([]);
    const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
    const [cardDetails, setCardDetails] = useState<CreditCardDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [detailedCards, setDetailedCards] = useState<CreditCardDetails[]>([]);
    const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
    
    // Use the useModal hook for the add card selector
    const { isOpen: showSelector, open: openSelector, close: closeSelector } = useModal(false, 'add_card');
    
    // Use the useModal hook for delete confirmation
    const { isOpen: showDeleteConfirm, open: openDeleteConfirm, close: closeDeleteConfirm } = 
        useModal(false, 'delete_card', cardToDelete?.id);
    
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
                
                // Select the default card if available, otherwise the first card
                const defaultCard = cards.find(card => card.isDefaultCard);
                if (defaultCard) {
                    setSelectedCard(defaultCard);
                    // Find the details directly from the already loaded data
                    const details = detailedCardsData.find(card => card.id === defaultCard.id);
                    setCardDetails(details || null);
                } else if (cards.length > 0) {
                    setSelectedCard(cards[0]);
                    // Find the details directly from the already loaded data
                    const details = detailedCardsData.find(card => card.id === cards[0].id);
                    setCardDetails(details || null);
                }
            } catch (error) {
                console.error('Error loading cards:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserCards();
    }, []);

    // Load detailed information for a specific card
    const loadCardDetails = async (cardId: string) => {
        try {
            // Only show loading state if we don't already have the card details
            const existingDetails = detailedCards.find(card => card.id === cardId);
            if (!existingDetails) {
                setIsLoading(true);
            }
            
            // Check if we already have the details in our cached detailed cards
            let details = detailedCards.find(card => card.id === cardId);
            
            // If not found in cache, fetch the latest details
            if (!details) {
                // Fetch all detailed cards
                const allDetailedCards = await UserCreditCardService.fetchUserCardsDetailedInfo();
                setDetailedCards(allDetailedCards);
                
                // Find the specific card details
                details = allDetailedCards.find(card => card.id === cardId);
            }
            
            setCardDetails(details || null);
        } catch (error) {
            console.error('Error loading card details:', error);
            setCardDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle card selection from the sidebar
    const handleCardSelect = (card: CreditCard) => {
        setSelectedCard(card);
        loadCardDetails(card.id);
    };

    // Handle setting a card as the preferred/default card
    const handleSetPreferred = async (card: CreditCard) => {
        try {
            const updatedCards = userCards.map(c => ({
                ...c,
                isDefaultCard: c.id === card.id
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
            
            // Update selected card with preferred status
            if (selectedCard && selectedCard.id === card.id) {
                setSelectedCard({
                    ...selectedCard,
                    isDefaultCard: true
                });
            }
        } catch (error) {
            console.error('Error setting preferred card:', error);
        }
    };

    // Handle removing a card from the user's selected cards
    const handleRemoveCard = async (card: CreditCard) => {
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
            
            // Close the confirmation modal
            closeDeleteConfirm();
        } catch (error) {
            console.error('Error removing card:', error);
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
                
                // Set the newly added card as selected
                const newlyAddedCard = refreshedCards.find(c => c.id === card.id);
                if (newlyAddedCard) {
                    setSelectedCard(newlyAddedCard);
                    await loadCardDetails(card.id);
                }
            } catch (error) {
                console.error('Error adding card:', error);
            }
        }
        
        // Close the selector
        closeSelector();
    };

    // Render card details section
    const renderCardDetails = () => {
        // For initial load, show loading state
        if (isLoading) {
            return <div className="card-details-loading">Loading cards details...</div>;
        }
        
        if (!cardDetails) {
            return <div className="no-card-details">Select a card to view details</div>;
        }

        return (
            <div className="card-details">
                <div className="card-header">
                    <img 
                        src={cardDetails.CardImage || PLACEHOLDER_CARD_IMAGE} 
                        alt={`${cardDetails.CardName} card`} 
                        className="card-image"
                    />
                    <div className="card-header-info">
                        <h2>{cardDetails.CardName}</h2>
                        <p className="card-issuer">{cardDetails.CardIssuer}</p>
                        <p className="card-network">{cardDetails.CardNetwork}</p>
                        {cardDetails.isDefaultCard && <span className="preferred-badge">Preferred Card</span>}
                    </div>
                </div>
                
                {/* Display the card's description/details */}
                {cardDetails.CardDetails && cardDetails.CardDetails.trim() !== '' && (
                    <div className="card-description-section">
                        <p className="card-description">{cardDetails.CardDetails}</p>
                    </div>
                )}
                
                <div className="card-info-section">
                    <div className="card-basic-info">
                        <div className="info-item">
                            <span className="label">Annual Fee</span>
                            <span className="value">{cardDetails.AnnualFee !== null ? `$${cardDetails.AnnualFee}` : 'None'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Foreign Transaction Fee</span>
                            <span className="value">{cardDetails.ForeignExchangeFee}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Rewards Currency</span>
                            <span className="value">{cardDetails.RewardsCurrency}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Points Per Dollar</span>
                            <span className="value">{cardDetails.PointsPerDollar !== null ? cardDetails.PointsPerDollar : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                {cardDetails.Multipliers && cardDetails.Multipliers.length > 0 && (
                    <div className="card-section">
                        <h3>Reward Multipliers</h3>
                        <div className="multipliers-list">
                            {cardDetails.Multipliers.map((multiplier, index) => (
                                <div key={index} className="multiplier-item">
                                    <div className="multiplier-name">{multiplier.Name}</div>
                                    <div className="multiplier-value">{multiplier.Multiplier}x</div>
                                    <div className="multiplier-desc">{multiplier.Description}</div>
                                    {multiplier.Details && (
                                        <div className="multiplier-details">{multiplier.Details}</div>
                                    )}
                                    {(multiplier.Category || multiplier.SubCategory) && (
                                        <div className="multiplier-category">
                                            {multiplier.Category}{multiplier.SubCategory ? ` › ${multiplier.SubCategory}` : ''}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {cardDetails.Credits && cardDetails.Credits.length > 0 && (
                    <div className="card-section">
                        <h3>Card Credits</h3>
                        <div className="credits-list">
                            {cardDetails.Credits.map((credit, index) => (
                                <div key={index} className="credit-item">
                                    <div className="credit-header">
                                        <span className="credit-title">{credit.Title}</span>
                                        <span className="credit-value">{credit.Value}</span>
                                    </div>
                                    <div className="credit-period">{credit.TimePeriod}</div>
                                    <div className="credit-description">{credit.Description}</div>
                                    {credit.Details && (
                                        <div className="credit-details">{credit.Details}</div>
                                    )}
                                    {(credit.Category || credit.SubCategory) && (
                                        <div className="credit-category">
                                            {credit.Category}{credit.SubCategory ? ` › ${credit.SubCategory}` : ''}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {cardDetails.Perks && cardDetails.Perks.length > 0 && (
                    <div className="card-section">
                        <h3>Card Perks</h3>
                        <div className="perks-list">
                            {cardDetails.Perks.map((perk, index) => (
                                <div key={index} className="perk-item">
                                    <div className="perk-title">{perk.Title}</div>
                                    <div className="perk-description">{perk.Description}</div>
                                    {perk.Details && (
                                        <div className="perk-details">{perk.Details}</div>
                                    )}
                                    {(perk.Category || perk.SubCategory) && (
                                        <div className="perk-category">
                                            {perk.Category}{perk.SubCategory ? ` › ${perk.SubCategory}` : ''}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="credit-card-manager">
            {/* Sidebar for card selection */}
            <div className="card-sidebar">
                <div className="sidebar-header">
                    <h3>My Credit Cards</h3>
                    <button 
                        className="add-card-button"
                        onClick={handleAddCard}
                    >
                        Add Card
                    </button>
                </div>
                
                {isLoading ? (
                    <div className="loading-cards">Loading your cards...</div>
                ) : userCards.filter(card => card.selected).length === 0 ? (
                    <div className="no-cards">
                        <p>You haven't added any cards yet.</p>
                        <button 
                            className="add-first-card-button"
                            onClick={handleAddCard}
                        >
                            Add Your First Card
                        </button>
                    </div>
                ) : (
                    <div className="cards-list">
                        {userCards
                            .filter(card => card.selected)
                            .sort((a, b) => {
                                // Sort default card first, then alphabetically
                                if (a.isDefaultCard !== b.isDefaultCard) {
                                    return a.isDefaultCard ? -1 : 1;
                                }
                                return a.CardName.localeCompare(b.CardName);
                            })
                            .map(card => (
                                <div 
                                    key={card.id} 
                                    className={`sidebar-card ${selectedCard?.id === card.id ? 'selected' : ''}`}
                                    onClick={() => handleCardSelect(card)}
                                >
                                    <div className="card-content">
                                        <img 
                                            src={card.CardImage || PLACEHOLDER_CARD_IMAGE} 
                                            alt={`${card.CardName} card`} 
                                            className="card-thumbnail"
                                        />
                                        <div className="card-info">
                                            <div className="card-name">
                                                {card.CardName}
                                            </div>
                                            <div className="card-issuer">{card.CardIssuer}</div>
                                            {card.isDefaultCard && (
                                                <span className="preferred-card-tag">Preferred Card</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <Dropdown 
                                        trigger={<button className="card-menu-button">•••</button>}
                                        align="right"
                                        className="card-dropdown"
                                    >
                                        {!card.isDefaultCard && (
                                            <DropdownItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetPreferred(card);
                                                }}
                                            >
                                                Set as Preferred Card
                                            </DropdownItem>
                                        )}
                                        <DropdownItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveCard(card);
                                            }}
                                            className="remove-option"
                                        >
                                            Remove Card
                                        </DropdownItem>
                                    </Dropdown>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
            
            {/* Main content area for card details */}
            <div className="card-details-panel">
                {renderCardDetails()}
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