import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import './CreditCardManager.scss';
import { CreditCard, CreditCardDetails } from '../../types/CreditCardTypes';
import { UserCreditCard } from '../../types/UserTypes';
import { MOBILE_BREAKPOINT, COLORS } from '../../types';
import SingleCardSelector from '../CreditCardSelector/SingleCardSelector';
import { CardService, UserCreditCardService, UserCreditService } from '../../services';
import CreditCardDetailView from '../CreditCardDetailView';
import { CARD_TABS } from '../CreditCardDetailView/cardTabs';
import type { TabType } from '../CreditCardDetailView/cardTabs';
import { InfoDisplay, SearchField, ErrorWithRetry, TabBar } from '../../elements';
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
  DrawerContent,
  DrawerTitle,
} from '../ui/drawer';
import Icon from '../../icons';
import CardSwitcherDropdown, { CardSelectContent } from '../CardSwitcherDropdown';
import HeaderControls from '../PageControls/HeaderControls';
import FooterControls from '../PageControls/FooterControls';
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
    const [loadError, setLoadError] = useState<string | null>(null);
    const [detailedCards, setDetailedCards] = useState<CreditCardDetails[]>([]);
    const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
    const [userCardsMetadata, setUserCardsMetadata] = useState<Map<string, UserCreditCard>>(new Map());
    
    // Dialog state management
    const [showSelector, setShowSelector] = useState(false);
    const [selectorMode, setSelectorMode] = useState<'add' | 'view'>('add');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // View selector does not use search currently (hidden in UI)
    // Keeping state omitted to avoid unused warnings
    const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    });
    // Mobile tab state for the footer tab selector
    const [mobileActiveTab, setMobileActiveTab] = useState<TabType>('overview');

    // Local feature flags for Add Card selector (drawer vs dialog)
    const USE_DRAWER_FOR_ADD_CARD_DESKTOP = false;
    const USE_DRAWER_FOR_ADD_CARD_MOBILE = true;
    
    // Add card loading state
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [selectedCardForAdding, setSelectedCardForAdding] = useState<CreditCard | null>(null);
    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [addCardSearchTerm, setAddCardSearchTerm] = useState<string>('');

    // Remove card loading state
    const [isRemovingCard, setIsRemovingCard] = useState(false);
    const [cardBeingRemoved, setCardBeingRemoved] = useState<CreditCard | null>(null);

    // Preferred loading state
    const [isSettingPreferred, setIsSettingPreferred] = useState(false);
    // Ref to restore focus to the parent drawer when nested drawer closes
    const parentDrawerHeaderRef = useRef<HTMLDivElement | null>(null);

    // Memoized function to notify parent of card updates
    const notifyCardUpdate = useCallback((cards: CreditCard[]) => {
        onCardsUpdate?.(cards);
    }, [onCardsUpdate]);
    
    // Load user's credit cards
    const loadUserCards = async () => {
        try {
            setIsLoading(true);
            setLoadError(null);

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
            setLoadError('Unable to load your credit cards. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Load user's credit cards on component mount
    useEffect(() => {
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
            toast.error('Unable to load card details. Please try again.');
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
            setIsSettingPreferred(true);
            
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

            // Clear loading state after all state updates are queued
            setIsSettingPreferred(false);
        } catch (error) {
            console.error('Error setting preferred card:', error);
            toast.error('Unable to set this card as preferred. Please try again.');
            setIsSettingPreferred(false);
        }
    };

    // Handle removing a card from the user's selected cards
    const handleRemoveCard = async (card: CreditCard) => {
        // Set the card to delete and open the confirmation modal
        setCardToDelete(card);
        setShowDeleteConfirm(true);
    };

    // Shared helper: update card metadata via API, sync local + parent state
    const updateCardMetadata = async (cardId: string, updates: { openDate?: string | null; isFrozen?: boolean }) => {
        await UserCreditCardService.updateUserCard(cardId, updates);

        // Update local metadata state
        setUserCardsMetadata(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(cardId);
            if (existing) {
                newMap.set(cardId, { ...existing, ...updates });
            }
            return newMap;
        });

        // Refresh cards and notify parent so App.tsx metadata stays in sync
        const refreshedCards = await CardService.fetchCreditCards(true);
        setUserCards(refreshedCards);
        notifyCardUpdate(refreshedCards);

        // Refresh detailed cards data
        const refreshedDetailedCards = await UserCreditCardService.fetchUserCardsDetailedInfo();
        setDetailedCards(refreshedDetailedCards);

        // Update local selected card state if viewing the updated card
        if (selectedCard && selectedCard.id === cardId) {
            setSelectedCard({ ...selectedCard, ...updates });
            const updatedCardDetails = refreshedDetailedCards.find(detail => detail.id === cardId);
            if (updatedCardDetails) {
                setCardDetails(updatedCardDetails);
            }
        }
    };

    // Handle updating a card's open date
    const handleOpenDateChange = async (cardId: string, openDate: string | null) => {
        await updateCardMetadata(cardId, { openDate });
    };

    // Handle toggling a card's frozen state
    const handleFreezeToggle = async (cardId: string, currentFrozenState: boolean) => {
        try {
            await updateCardMetadata(cardId, { isFrozen: !currentFrozenState });
        } catch (error) {
            console.error('Error toggling card freeze state:', error);
            toast.error('Unable to update card freeze state. Please try again.');
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
            toast.error('Unable to remove this card. Please try again.');

            // Clear loading state on error
            setIsRemovingCard(false);
            setCardBeingRemoved(null);
        }
    };

    // Handle adding a new card via the CreditCardSelector
    const handleAddCard = () => {
        if (isMobileViewport) {
            setShowAddDrawer(true);
            return;
        }
        if (onOpenCardSelector) {
            onOpenCardSelector();
            return;
        }
        setSelectorMode('add');
        setShowSelector(true);
    };

    // Open selector to choose a card to view (mobile-only footer control)
    const handleOpenViewSelector = () => {
        setSelectorMode('view');
        setShowSelector(true);
    };

    // Handle add drawer close - clear search and loading state
    const handleAddDrawerChange = (open: boolean) => {
        if (!open) {
            setAddCardSearchTerm('');
            setIsAddingCard(false);
            setSelectedCardForAdding(null);
        }
        setShowAddDrawer(open);
    };

    // Handle dialog close - clear loading state
    const handleSelectorDialogChange = (open: boolean) => {
        if (!open) {
            setIsAddingCard(false);
            setSelectedCardForAdding(null);
        }
        setShowSelector(open);
    };

    // Handle card selection from the SingleCardSelector
    const handleSelectorCardSelect = async (card: CreditCard) => {
        // Set loading state
        setIsAddingCard(true);
        setSelectedCardForAdding(card);
        // Immediately close drawer for snappy UX while work continues
        setShowAddDrawer(false);
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
            // Frozen cards go to bottom
            const aFrozen = a.isFrozen ?? false;
            const bFrozen = b.isFrozen ?? false;
            if (aFrozen !== bFrozen) return aFrozen ? 1 : -1;
            // Sort default card first, then alphabetically
            if (a.isDefaultCard !== b.isDefaultCard) {
                return a.isDefaultCard ? -1 : 1;
            }
            return a.CardName.localeCompare(b.CardName);
        });

    return (
        <div className="credit-card-manager">

            {/* Desktop header with card switcher dropdown */}
            {!isMobileViewport && (
                <HeaderControls className="card-switcher-header">
                    <CardSwitcherDropdown
                        cards={selectedCards}
                        selectedCard={selectedCard}
                        onCardSelect={handleCardSelect}
                        loading={isLoading}
                    />
                    <button className="button icon with-text" onClick={handleAddCard}>
                        <Icon name="card" variant="solid" />
                        Manage Cards
                    </button>
                </HeaderControls>
            )}

            {/* Mobile sticky sub-header: card selector + add button */}
            {isMobileViewport && (
                <HeaderControls className="mobile-card-selector-header">
                    <div className="footer-row">
                        <button
                            className="view-card-select"
                            onClick={selectedCards.length === 0 ? handleAddCard : handleOpenViewSelector}
                            aria-haspopup="dialog"
                            disabled={isLoading || selectedCards.length === 0}
                        >
                            <CardSelectContent selectedCard={selectedCard} hasCards={selectedCards.length > 0} loading={isLoading} />
                        </button>
                        <button className="button icon add-card-button" onClick={handleAddCard} aria-haspopup="dialog" aria-label="Add card">
                            <Icon name="big-plain-plus" variant="solid" size={20} color={COLORS.NEUTRAL_WHITE} />
                        </button>
                    </div>
                </HeaderControls>
            )}

            {/* Main content area for card details */}
            <div className="card-details-panel">
                {loadError ? (
                    <ErrorWithRetry
                        message={loadError}
                        onRetry={loadUserCards}
                        fillContainer
                    />
                ) : (
                    <CreditCardDetailView
                        cardDetails={cardDetails}
                        isLoading={isLoading}
                        isAddingCard={isAddingCard}
                        cardBeingAdded={selectedCardForAdding}
                        isRemovingCard={isRemovingCard}
                        cardBeingRemoved={cardBeingRemoved}
                        noCards={selectedCards.length === 0}
                        onSetPreferred={selectedCard ? () => handleSetPreferred(selectedCard) : undefined}
                        isSettingPreferred={isSettingPreferred}
                        onRemoveCard={selectedCard ? () => handleRemoveCard(selectedCard) : undefined}
                        showTrackingPreferences={true}
                        onPreferencesUpdate={onPreferencesUpdate}
                        openDate={selectedCard ? userCardsMetadata.get(selectedCard.id)?.openDate ?? null : null}
                        onOpenDateChange={selectedCard ? (date) => handleOpenDateChange(selectedCard.id, date) : undefined}
                        isFrozen={selectedCard ? userCardsMetadata.get(selectedCard.id)?.isFrozen ?? false : false}
                        onFreezeToggle={selectedCard ? () => handleFreezeToggle(selectedCard.id, userCardsMetadata.get(selectedCard.id)?.isFrozen ?? false) : undefined}
                        hideInlineTabs={true}
                        externalActiveTab={mobileActiveTab}
                    />
                )}
            </div>

            {/* Tab bar footer -- visible on all viewports when cards exist */}
            {(isLoading || selectedCards.length > 0) && (
                <FooterControls className="card-manager-footer">
                    <TabBar
                        options={CARD_TABS}
                        activeId={mobileActiveTab}
                        onChange={(id) => setMobileActiveTab(id as TabType)}
                    />
                </FooterControls>
            )}

            
            {/* Card selector modal/drawer */}
            {(() => {
                const useDrawer = isMobileViewport ? USE_DRAWER_FOR_ADD_CARD_MOBILE : USE_DRAWER_FOR_ADD_CARD_DESKTOP;
                if (useDrawer) {
                    return (
                        <Drawer open={showSelector} onOpenChange={handleSelectorDialogChange} direction="bottom">
                            <DrawerContent fitContent={true}>
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
            
            {/* Add card drawer (mobile) */}
            {isMobileViewport && (
                <Drawer open={showAddDrawer} onOpenChange={handleAddDrawerChange} direction="bottom" repositionInputs={false}>
                    <DrawerContent fitContent={false} fixedHeight="calc(var(--app-vh, 1vh) * 90)">
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
                                onSelectCard={handleSelectorCardSelect}
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
                </Drawer>
            )}

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
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction destructive onClick={handleDeleteConfirm}>
                                Remove
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CreditCardManager;
