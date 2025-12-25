import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CreditCardManager.scss';
import { CreditCard, CreditCardDetails } from '../../types/CreditCardTypes';
import { UserCreditCard } from '../../types/UserTypes';
import { MOBILE_BREAKPOINT } from '../../types';
import SingleCardSelector from '../CreditCardSelector/SingleCardSelector';
import { CardService, UserCreditCardService, UserCreditService } from '../../services';
import CreditCardDetailView from '../CreditCardDetailView';
import CreditCardPreviewList from '../CreditCardPreviewList';
import { InfoDisplay, SearchField } from '../../elements';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '../ui/dialog/dialog';
import {
  Drawer,
  DrawerNestedRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from '../ui/drawer';
import Icon from '../../icons';
import { CardIcon } from '../../icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/dialog/alert-dialog';



interface CreditCardManagerProps {
    onCardsUpdate?: (cards: CreditCard[]) => void;
    onOpenCardSelector?: () => void;
    reloadTrigger?: number;
    onPreferencesUpdate?: () => Promise<void>;
}

const CreditCardManager: React.FC<CreditCardManagerProps> = ({ onCardsUpdate, onOpenCardSelector, reloadTrigger, onPreferencesUpdate }) => {
    const [userCards, setUserCards] = useState<CreditCard[]>([]);
    const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
    const [cardDetails, setCardDetails] = useState<CreditCardDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [detailedCards, setDetailedCards] = useState<CreditCardDetails[]>([]);
    const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
    const [userCardsMetadata, setUserCardsMetadata] = useState<Map<string, UserCreditCard>>(new Map());
    
    // Dialog state management
    const [showSelector, setShowSelector] = useState(false);
    const [selectorMode, setSelectorMode] = useState<'add' | 'view'>('add');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [addCardSearchTerm, setAddCardSearchTerm] = useState<string>('');
    // View selector does not use search currently (hidden in UI)
    // Keeping state omitted to avoid unused warnings
    const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    });
    // Local feature flags for Add Card selector (drawer vs dialog)
    const USE_DRAWER_FOR_ADD_CARD_DESKTOP = false;
    const USE_DRAWER_FOR_ADD_CARD_MOBILE = true;
    
    // Add card loading state
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [selectedCardForAdding, setSelectedCardForAdding] = useState<CreditCard | null>(null);
    const [showAddNested, setShowAddNested] = useState(false);

    // Remove card loading state
    const [isRemovingCard, setIsRemovingCard] = useState(false);
    const [cardBeingRemoved, setCardBeingRemoved] = useState<CreditCard | null>(null);
    // Ref to restore focus to the parent drawer when nested drawer closes
    const parentDrawerHeaderRef = useRef<HTMLDivElement | null>(null);
    
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

                // Load basic cards, detailed cards, and user cards metadata in parallel
                const [cards, detailedCardsData, userCardsData] = await Promise.all([
                    CardService.fetchCreditCards(true),
                    UserCreditCardService.fetchUserCardsDetailedInfo(),
                    UserCreditCardService.fetchUserCards()
                ]);

                setUserCards(cards);
                setDetailedCards(detailedCardsData);

                // Build a map of user card metadata keyed by cardReferenceId
                const metadataMap = new Map<string, UserCreditCard>();
                userCardsData.forEach(uc => {
                    metadataMap.set(uc.cardReferenceId, uc);
                });
                setUserCardsMetadata(metadataMap);

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
    }, [reloadTrigger]);

    // Track viewport size
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
            setIsMobileViewport(matches);
        };
        handleChange(mediaQuery);
        try {
            mediaQuery.addEventListener('change', handleChange as unknown as EventListener);
        } catch {
            // @ts-ignore Safari fallback
            mediaQuery.addListener(handleChange);
        }
        return () => {
            try {
                mediaQuery.removeEventListener('change', handleChange as unknown as EventListener);
            } catch {
                // @ts-ignore Safari fallback
                mediaQuery.removeListener(handleChange);
            }
        };
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

            // Sync credit history to reflect card selection changes
            try {
                await UserCreditService.syncCurrentYearCreditsDebounced();
            } catch (syncError) {
                console.warn('Failed to sync credit history after card update:', syncError);
            }

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
        setShowDeleteConfirm(true);
    };

    // Handle updating a card's open date
    const handleOpenDateChange = async (cardId: string, openDate: string | null) => {
        try {
            // Update the card's open date via API
            await UserCreditCardService.updateUserCard(cardId, { openDate });

            // Update local metadata state
            setUserCardsMetadata(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(cardId);
                if (existing) {
                    newMap.set(cardId, { ...existing, openDate });
                }
                return newMap;
            });
        } catch (error) {
            console.error('Error updating card open date:', error);
            setErrorMessage('Unable to update the card anniversary date. Please try again.');
            setShowError(true);
        }
    };

    // Handle toggling a card's frozen state
    const handleFreezeToggle = async (cardId: string, currentFrozenState: boolean) => {
        try {
            // Clear any previous errors
            setShowError(false);

            const newFrozenState = !currentFrozenState;

            // Update the card's frozen state via API
            await UserCreditCardService.updateUserCard(cardId, { isFrozen: newFrozenState });

            // Update local metadata state
            setUserCardsMetadata(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(cardId);
                if (existing) {
                    newMap.set(cardId, { ...existing, isFrozen: newFrozenState });
                }
                return newMap;
            });

            // Refresh cards after update (same pattern as handleSetPreferred)
            const refreshedCards = await CardService.fetchCreditCards(true);
            setUserCards(refreshedCards);

            // Notify parent component of card updates
            notifyCardUpdate(refreshedCards);

            // Immediately update local state for a responsive UI
            if (selectedCard && selectedCard.id === cardId) {
                setSelectedCard({ ...selectedCard, isFrozen: newFrozenState });
                if (cardDetails) {
                    setCardDetails({ ...cardDetails, isFrozen: newFrozenState });
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
            console.error('Error toggling card freeze state:', error);
            setErrorMessage('Unable to update card freeze state. Please try again.');
            setShowError(true);
        }
    };

    // Handle confirmation of card deletion
    const handleDeleteConfirm = async () => {
        if (!cardToDelete) return;

        try {
            // Set loading state before closing dialog
            setIsRemovingCard(true);
            setCardBeingRemoved(cardToDelete);

            // Close the confirmation modal immediately for snappy UX
            setShowDeleteConfirm(false);

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

            // Sync credit history to reflect card removal
            try {
                await UserCreditService.syncCurrentYearCreditsDebounced();
            } catch (syncError) {
                console.warn('Failed to sync credit history after card removal:', syncError);
            }

            // Notify parent component of card updates
            notifyCardUpdate(refreshedCards);

            // Clear the selection if the removed card was selected
            if (selectedCard && selectedCard.id === cardToDelete.id) {
                setSelectedCard(null);
                setCardDetails(null);
            }

            // Refresh detailed cards data in the background
            const refreshedDetailedCards = await UserCreditCardService.fetchUserCardsDetailedInfo();
            setDetailedCards(refreshedDetailedCards);

            // Clear loading state
            setIsRemovingCard(false);
            setCardBeingRemoved(null);
        } catch (error) {
            console.error('Error removing card:', error);
            setErrorMessage('Unable to remove this card. Please try again.');
            setShowError(true);

            // Clear loading state on error
            setIsRemovingCard(false);
            setCardBeingRemoved(null);
        }
    };

    // Handle adding a new card via the CreditCardSelector
    const handleAddCard = () => {
        if (onOpenCardSelector) {
            onOpenCardSelector();
            return;
        }
        setSelectorMode('add');
        setShowSelector(true);
        if (isMobileViewport) {
            setShowAddNested(true);
        }
    };

    // Open selector to choose a card to view (mobile-only footer control)
    const handleOpenViewSelector = () => {
        setSelectorMode('view');
        setShowSelector(true);
    };

    // Handle dialog close - clear loading state
    const handleSelectorDialogChange = (open: boolean) => {
        if (!open) {
            setIsAddingCard(false);
            setSelectedCardForAdding(null);
            setAddCardSearchTerm('');
        }
        setShowSelector(open);
    };

    // Handle card selection from the SingleCardSelector
    const handleSelectorCardSelect = async (card: CreditCard) => {
        // Set loading state
        setIsAddingCard(true);
        setSelectedCardForAdding(card);
        // Immediately close BOTH drawers for snappy UX while work continues
        setShowAddNested(false);
        setShowSelector(false);

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

                // Sync credit history to reflect new card addition
                try {
                    await UserCreditService.syncCurrentYearCreditsDebounced();
                } catch (syncError) {
                    console.warn('Failed to sync credit history after card addition:', syncError);
                }

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
        
        // Clear loading state
        setIsAddingCard(false);
        setSelectedCardForAdding(null);
    };

    // Handle selecting a card just for viewing (no DB changes)
    const handleViewSelectorCardSelect = async (card: CreditCard) => {
        // Update selection for viewing
        setSelectedCard(card);
        // Use cached details if available, otherwise load
        const cachedDetails = detailedCards.find(detail => detail.id === card.id);
        if (cachedDetails) {
            setCardDetails(cachedDetails);
        } else {
            setIsLoading(true);
            await loadCardDetails(card.id);
        }
        setShowSelector(false);
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
                    variant="my-cards"
                />

                <div className="sidebar-action">
                    <button className="icon with-text" onClick={handleAddCard}>
                        <Icon name="card" variant="solid" />
                        Add Cards
                    </button>
                </div>
            </div>
            
            {/* Main content area for card details */}
            <div className="card-details-panel">
                <CreditCardDetailView
                    cardDetails={cardDetails}
                    isLoading={isLoading}
                    isAddingCard={isAddingCard}
                    cardBeingAdded={selectedCardForAdding}
                    isRemovingCard={isRemovingCard}
                    cardBeingRemoved={cardBeingRemoved}
                    noCards={selectedCards.length === 0}
                    onSetPreferred={selectedCard ? () => handleSetPreferred(selectedCard) : undefined}
                    onRemoveCard={selectedCard ? () => handleRemoveCard(selectedCard) : undefined}
                    showTrackingPreferences={true}
                    onPreferencesUpdate={onPreferencesUpdate}
                    openDate={selectedCard ? userCardsMetadata.get(selectedCard.id)?.openDate ?? null : null}
                    onOpenDateChange={selectedCard ? (date) => handleOpenDateChange(selectedCard.id, date) : undefined}
                    isFrozen={selectedCard ? userCardsMetadata.get(selectedCard.id)?.isFrozen ?? false : false}
                    onFreezeToggle={selectedCard ? () => handleFreezeToggle(selectedCard.id, userCardsMetadata.get(selectedCard.id)?.isFrozen ?? false) : undefined}
                />
            </div>

            {/* Mobile-only sticky footer controls */}
            {isMobileViewport && (
                <div className="mobile-sticky-footer" role="region" aria-label="Card actions">
                    {!isLoading && selectedCards.length === 0 ? (
                        <>
                            <p className="caps-label">Add your credit cards</p>
                            <button className="button icon with-text add-card-button" onClick={handleAddCard} aria-haspopup="dialog">
                                <Icon name="card" variant="solid" />
                                Add Cards
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="caps-label">View or Manage Cards</p>
                            <button className="view-card-select" onClick={handleOpenViewSelector} aria-haspopup="dialog">
                                {selectedCard ? (
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
                                ) : (
                                    <>
                                        <Icon name="card" variant="mini" color="#C9CED3" />
                                        <span className="label-text">Select a card to view</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            )}
            
            {/* Card selector modal/drawer */}
            {(() => {
                const useDrawer = isMobileViewport ? USE_DRAWER_FOR_ADD_CARD_MOBILE : USE_DRAWER_FOR_ADD_CARD_DESKTOP;
                if (useDrawer) {
                    return (
                        <Drawer open={showSelector} onOpenChange={handleSelectorDialogChange} direction="bottom">
                            <DrawerContent fitContent maxHeight="80vh">
                                <DrawerTitle className="sr-only">My Cards</DrawerTitle>
                                <div
                                    className="dialog-header drawer-sticky-header"
                                    ref={parentDrawerHeaderRef}
                                    tabIndex={-1}
                                >
                                    <h2>My Cards</h2>
                                </div>
                                <div className="dialog-body" style={{ overflowY: 'auto' }}>
                                    <SingleCardSelector
                                        creditCards={userCards.filter(card => card.selected)}
                                        onSelectCard={handleViewSelectorCardSelect}
                                        selectedCardId={selectedCard?.id}
                                        showOnlyUnselectedCards={false}
                                        disabled={false}
                                        hideInternalSearch={true}
                                        onlyShowUserCards={true}
                                    />
                                </div>
                                <div className="dialog-footer">
                                    <DrawerNestedRoot
                                        open={showAddNested}
                                        onOpenChange={(open) => {
                                            setShowAddNested(open);
                                            if (!open) {
                                                // When nested closes (swipe down or programmatic), restore focus
                                                setTimeout(() => parentDrawerHeaderRef.current?.focus(), 0);
                                            }
                                        }}
                                    >
                                        <DrawerTrigger asChild>
                                            <button className="button icon with-text add-card-button">
                                                <Icon name="card" variant="solid" />
                                                Add Card
                                            </button>
                                        </DrawerTrigger>
                                        <DrawerPortal>
                                            <DrawerOverlay />
                                            <DrawerContent fitContent maxHeight="80vh">
                                                <DrawerTitle className="sr-only">Add Card</DrawerTitle>
                                                <div className="dialog-header drawer-sticky-header">
                                                    <h2>Add Card</h2>
                                                    <div className="search-container" style={{ marginTop: 6 }}>
                                                        <SearchField
                                                            type="text"
                                                            placeholder="Search cards..."
                                                            value={addCardSearchTerm}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddCardSearchTerm(e.target.value)}
                                                            disabled={isAddingCard}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="dialog-body" style={{ overflowY: 'auto' }}>
                                                    <SingleCardSelector 
                                                        creditCards={userCards.filter(card => !card.selected)}
                                                        onSelectCard={(card) => {
                                                            handleSelectorCardSelect(card);
                                                            setShowAddNested(false);
                                                        }}
                                                        selectedCardId={undefined}
                                                        showOnlyUnselectedCards={true}
                                                        disabled={isAddingCard}
                                                        hideInternalSearch={true}
                                                        externalSearchTerm={addCardSearchTerm}
                                                        onExternalSearchTermChange={setAddCardSearchTerm}
                                                    />
                                                </div>
                                                {isAddingCard && selectedCardForAdding && (
                                                    <div className="dialog-footer">
                                                        <InfoDisplay
                                                            type="loading"
                                                            message={`Adding ${selectedCardForAdding.CardName}...`}
                                                            showTitle={false}
                                                        />
                                                    </div>
                                                )}
                                            </DrawerContent>
                                        </DrawerPortal>
                                    </DrawerNestedRoot>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    );
                }
                return (
                    <Dialog open={showSelector} onOpenChange={handleSelectorDialogChange}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{selectorMode === 'add' ? 'Add Card' : 'My Cards'}</DialogTitle>
                            </DialogHeader>
                            <DialogBody>
                                {selectorMode === 'view' ? (
                                    <SingleCardSelector 
                                        creditCards={userCards.filter(card => card.selected)}
                                        onSelectCard={handleViewSelectorCardSelect}
                                        selectedCardId={selectedCard?.id}
                                        showOnlyUnselectedCards={false}
                                        disabled={false}
                                        hideInternalSearch={true}
                                        onlyShowUserCards={true}
                                    />
                                ) : (
                                    <SingleCardSelector 
                                        creditCards={userCards.filter(card => !card.selected)}
                                        onSelectCard={handleSelectorCardSelect}
                                        selectedCardId={undefined}
                                        showOnlyUnselectedCards={true}
                                        disabled={isAddingCard}
                                    />
                                )}
                            </DialogBody>
                            {selectorMode === 'view' && (
                                <DialogFooter>
                                    <button className="button icon with-text add-card-button" onClick={handleAddCard}>
                                        <Icon name="card" variant="solid" />
                                        Add Card
                                    </button>
                                </DialogFooter>
                            )}
                            {selectorMode === 'add' && isAddingCard && selectedCardForAdding && (
                                <DialogFooter>
                                    <InfoDisplay
                                        type="loading"
                                        message={`Adding ${selectedCardForAdding.CardName}...`}
                                        showTitle={false}
                                    />
                                </DialogFooter>
                            )}
                        </DialogContent>
                    </Dialog>
                );
            })()}
            
            {/* Delete confirmation modal */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Credit Card</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{cardToDelete?.CardName}</strong> from your cards? 
                            You can add it back later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <div className="button-group">
                            <AlertDialogAction destructive onClick={handleDeleteConfirm}>
                                Remove
                            </AlertDialogAction>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CreditCardManager;