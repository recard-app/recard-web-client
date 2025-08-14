import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard } from '../../../types/CreditCardTypes';
import { ChatSolutionCard, ChatSolutionSelectedCardId, Conversation, ChatMessage, ICON_GRAY } from '../../../types';
import { LOADING_ICON, LOADING_ICON_SIZE } from '../../../types';
import { CardIcon, Icon } from '../../../icons';
import { UserHistoryService } from '../../../services';
import { CheckIcon } from 'lucide-react';
import SingleCardSelector from '../../CreditCardSelector/SingleCardSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '../../ui/drawer';
import './PromptSolution.scss';
import { SearchField } from '../../../elements';

/**
 * Props for the PromptSolution component.
 * @param {ChatSolutionCard | ChatSolutionCard[]} promptSolutions - The solution(s) to display.
 * @param {CreditCard[]} creditCards - The list of credit cards to display.
 * @param {string} chatId - The ID of the current chat.
 * @param {ChatSolutionSelectedCardId | null} selectedCardId - The ID of the selected card.
 * @param {function} onHistoryUpdate - Callback to update chat history when card selection changes.
 * @param {ChatMessage[]} chatHistory - The chat history between user and AI.
 */
interface PromptSolutionProps {
    promptSolutions: ChatSolutionCard | ChatSolutionCard[];
    creditCards?: CreditCard[];
    chatId: string;
    selectedCardId: ChatSolutionSelectedCardId | null;
    onHistoryUpdate: (chat: Conversation) => void;
    chatHistory: ChatMessage[];
}

interface CardSelectionProps {
    activeCardId: string;
    creditCards?: CreditCard[];
    solutions: ChatSolutionCard[];
    isUpdating: boolean;
    onCardSelectorOpen: () => void;
    noSolutionsMode?: boolean;
    handleCardSelection: (cardId: string) => Promise<void>;
}

const CardSelection: React.FC<CardSelectionProps> = ({
    activeCardId,
    creditCards,
    solutions,
    isUpdating,
    onCardSelectorOpen,
    noSolutionsMode,
    handleCardSelection
}) => {
    // Show selected card if there is an activeCardId and matching card in creditCards
    const selectedCard = creditCards?.find(card => card.id === activeCardId);
    const hasSelectedCard = activeCardId && selectedCard;
    
    return (
        <div className="select-different-card" data-solutions-count={solutions ? solutions.length : 0}>
            {hasSelectedCard ? (
                <>
                    <span className="selection-label">Selected card:</span>
                    <div className="selected-card-container">
                        <button 
                            className={`selected-card-button ${isUpdating ? 'loading icon with-text' : ''}`}
                            onClick={onCardSelectorOpen}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <LOADING_ICON size={LOADING_ICON_SIZE} />
                            ) : (
                                <CardIcon 
                                    title={selectedCard.CardName} 
                                    size={24} 
                                    primary={selectedCard.CardPrimaryColor}
                                    secondary={selectedCard.CardSecondaryColor}
                                    className="selected-card-image"
                                />
                            )}
                            <span className="selected-card-name">
                                {isUpdating ? 'Updating...' : selectedCard.CardName}
                            </span>
                        </button>
                        <button 
                            className="deselect-button"
                            onClick={() => handleCardSelection(activeCardId)}
                            disabled={isUpdating}
                            aria-label="Deselect card"
                        >
                            ✕
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <span className="selection-label">
                        {noSolutionsMode ? 'Select card for purchase:' : 'Select a different card:'}
                    </span>
                    <button 
                        className={`select-card-button ${isUpdating ? 'loading' : ''}`}
                        onClick={onCardSelectorOpen}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <LOADING_ICON size={LOADING_ICON_SIZE} />
                        ) : (
                            <Icon 
                                name="card"
                                variant="micro"
                                color={ICON_GRAY}
                                size={14}
                            />
                        )}
                        {isUpdating ? 'Updating...' : 'Select Card'}
                    </button>
                </>
            )}
        </div>
    );
};

function PromptSolution({ promptSolutions, creditCards, chatId, selectedCardId, onHistoryUpdate, chatHistory }: PromptSolutionProps): React.ReactElement | null {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    // The list of solutions to display
    const [solutions, setSolutions] = useState<ChatSolutionCard[]>([]);
    // Currently selected card in the UI
    const [activeCardId, setActiveCardId] = useState<string>(selectedCardId || '');
    // Card being updated (for UI indication)
    const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);
    // Flag to disable all buttons during updates
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    // Dialog state management
    const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
    // Flag to expand the solutions container
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(max-width: 780px)').matches;
    });
    const USE_DRAWER_FOR_SELECT_CARD_DESKTOP = false;
    const USE_DRAWER_FOR_SELECT_CARD_MOBILE = true;
    const [selectCardSearchTerm, setSelectCardSearchTerm] = useState<string>('');

    // Update active card when prop changes
    useEffect(() => {
        setActiveCardId(selectedCardId || '');
    }, [selectedCardId]);

    // Normalize and store solutions for current chat; renderer will filter as needed
    useEffect(() => {
        const incoming = Array.isArray(promptSolutions)
            ? promptSolutions
            : promptSolutions
            ? [promptSolutions]
            : [];
        setSolutions(incoming as ChatSolutionCard[]);
    }, [promptSolutions]);

    // On route chat change, clear UI once; PromptWindow will repopulate promptSolutions and chatId later
    useEffect(() => {
        setSolutions([]);
        setIsCardSelectorOpen(false);
        setIsExpanded(true);
        setSelectCardSearchTerm('');
        setUpdatingCardId(null);
        setIsUpdating(false);
        setActiveCardId(selectedCardId || '');
    }, [urlChatId]);

    // Track viewport size
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(max-width: 780px)');
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

    // Handle card selection
    const handleCardSelection = async (cardId: string) => {
        // Get effective chat ID
        const effectiveChatId = chatId || urlChatId;
        if (!effectiveChatId) {
            return;
        }

        // Prevent actions during updates
        if (isUpdating) {
            return;
        }

        // Only allow deselection from the X button, not from the modal
        const isDeselecting = cardId === activeCardId && !isCardSelectorOpen;
        
        // New card ID to send to server
        const newCardId = isDeselecting ? '' : cardId;

        // If we're not deselecting and the card is already selected, do nothing
        if (!isDeselecting && cardId === activeCardId) {
            setIsCardSelectorOpen(false);
            return;
        }

        // Set updating state for this specific card only
        setIsUpdating(true);
        setUpdatingCardId(cardId);

        try {
            // Send update to server first
            await UserHistoryService.updateTransactionCardSelection(effectiveChatId, newCardId);
            
            // Fetch updated chat history to ensure we have the latest state
            const updatedChat = await UserHistoryService.fetchChatHistoryById(effectiveChatId);
            
            // Update parent component
            if (updatedChat) {
                onHistoryUpdate(updatedChat);
            }

            // Update local state after successful server update
            setActiveCardId(newCardId);
        } catch (error) {
            console.error('Error updating card selection:', error);
            // Reset UI to match server state on error
            setActiveCardId(selectedCardId || '');
        } finally {
            // Clear updating states
            setUpdatingCardId(null);
            setIsUpdating(false);
        }
    };

    // Handle selection from the SingleCardSelector
    const handleCardSelectedFromModal = (card: CreditCard) => {
        handleCardSelection(card.id);
        setIsCardSelectorOpen(false);
    };

    // Don't render anything if there are no solutions or if all solutions lack card names
    if (solutions.length === 0 || !solutions.some(solution => solution.cardName)) {
        return (
            <div className="solutions-container">
                {chatHistory.length >= 2 && (
                        <CardSelection
                            activeCardId={activeCardId}
                            creditCards={creditCards}
                            solutions={solutions}
                            isUpdating={isUpdating}
                            onCardSelectorOpen={() => setIsCardSelectorOpen(true)}
                            noSolutionsMode={true}
                            handleCardSelection={handleCardSelection}
                        />
                )}

                {(() => {
                    const useDrawer = isMobileViewport ? USE_DRAWER_FOR_SELECT_CARD_MOBILE : USE_DRAWER_FOR_SELECT_CARD_DESKTOP;
                    if (useDrawer) {
                        return (
                            <Drawer open={isCardSelectorOpen} onOpenChange={setIsCardSelectorOpen} direction="bottom">
                                <DrawerContent>
                                    <DrawerTitle className="sr-only">Select a Credit Card</DrawerTitle>
                                    <div className="dialog-header drawer-sticky-header">
                                        <h2>Select a Credit Card</h2>
                                        <div className="search-container" style={{ marginTop: 6 }}>
                                            <SearchField
                                                type="text"
                                                placeholder="Search cards..."
                                                value={selectCardSearchTerm}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectCardSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="dialog-body" style={{ overflowY: 'auto' }}>
                                        {creditCards && (
                                            <SingleCardSelector
                                                creditCards={creditCards}
                                                onSelectCard={handleCardSelectedFromModal}
                                                selectedCardId={activeCardId}
                                                hideInternalSearch={true}
                                                externalSearchTerm={selectCardSearchTerm}
                                                onExternalSearchTermChange={setSelectCardSearchTerm}
                                            />
                                        )}
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        );
                    }
                    return (
                        <Dialog open={isCardSelectorOpen} onOpenChange={setIsCardSelectorOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Select a Credit Card</DialogTitle>
                                </DialogHeader>
                                {creditCards && (
                                    <SingleCardSelector
                                        creditCards={creditCards}
                                        onSelectCard={handleCardSelectedFromModal}
                                        selectedCardId={activeCardId}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>
                    );
                })()}
            </div>
        );
    }

    return (
        <div className="solutions-container">
            <div className="solutions-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="header-title">
                    <Icon 
                        name="card"
                        variant="mini"
                        color="#B5BBC2"
                        size={18}
                    />
                    <p className="caps-label">Select Card for Purchase</p>
                </div>
                <button 
                    className={`collapse-button ${isExpanded ? 'expanded' : ''}`}
                    aria-label={isExpanded ? 'Collapse solutions' : 'Expand solutions'}
                >
                    <Icon 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        variant="mini"
                        color="black"
                        size={18}
                    />
                </button>
            </div>
            <div className={`collapsible-content ${isExpanded ? 'expanded' : ''}`}>
                <div className="solution-cards">
                    {solutions
                        .filter(solution => solution.cardName)
                        .map((solution, index) => {
                            // Find matching card details using the solution's id
                            const cardDetails = creditCards?.find(card => card.id === solution.id);
                            
                            // If no matching card is found, use the solution's default values
                            const cardName = cardDetails?.CardName || solution.cardName;
                            // const cardImage = cardDetails?.CardImage || PLACEHOLDER_CARD_IMAGE;
                            
                            // Card is selected if it matches the active card ID
                            const isSelected = solution.id === activeCardId;
                            
                                                                        // This specific card is being updated
                                            const isUpdatingThis = isUpdating && solution.id === updatingCardId;
                            
                            return (
                                <div 
                                    key={solution.id || index} 
                                    className={`solution-card ${index === 0 ? 'primary-solution-turned-off' : ''} ${isSelected ? 'selected-card' : ''}`}
                                    onClick={() => handleCardSelection(solution.id)}
                                >
                                    <div className="card-checkbox-container">
                                        <button 
                                            className={`use-card-button ${isSelected ? 'selected' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardSelection(solution.id);
                                            }}
                                            disabled={isUpdating}
                                            aria-label={isUpdatingThis ? 'Updating...' : isSelected ? 'Selected for purchase' : 'Select for purchase'}
                                        >
                                            {isSelected ? (
                                                <CheckIcon size={16} />
                                            ) : null}
                                        </button>
                                    </div>
                                    <div className="card-content-container">
                                        <div className="card-header">
                                            <CardIcon 
                                                title={cardName} 
                                                size={24} 
                                                primary={cardDetails?.CardPrimaryColor}
                                                secondary={cardDetails?.CardSecondaryColor}
                                            />
                                            <h3>
                                                {cardName}
                                                {index === 0 && (
                                                    <span className="recommended-badge">Recommended</span>
                                                )}
                                            </h3>
                                        </div>
                                        <div className="card-content">
                                            <div className="card-details">
                                                {(solution.rewardCategory || solution.rewardRate) && (
                                                    <p>
                                                        {solution.rewardCategory && solution.rewardRate 
                                                            ? `${solution.rewardCategory}: ${solution.rewardRate}`
                                                            : solution.rewardCategory || solution.rewardRate
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                <CardSelection
                    activeCardId={activeCardId}
                    creditCards={creditCards}
                    solutions={solutions}
                    isUpdating={isUpdating}
                    onCardSelectorOpen={() => setIsCardSelectorOpen(true)}
                    handleCardSelection={handleCardSelection}
                />

            </div>

            {(() => {
                const useDrawer = isMobileViewport ? USE_DRAWER_FOR_SELECT_CARD_MOBILE : USE_DRAWER_FOR_SELECT_CARD_DESKTOP;
                if (useDrawer) {
                    return (
                        <Drawer open={isCardSelectorOpen} onOpenChange={setIsCardSelectorOpen} direction="bottom">
                            <DrawerContent>
                                <DrawerTitle className="sr-only">Select a Credit Card</DrawerTitle>
                                    <div className="dialog-header drawer-sticky-header">
                                    <h2>Select a Credit Card</h2>
                                        <div className="search-container" style={{ marginTop: 6 }}>
                                            <SearchField
                                                type="text"
                                                placeholder="Search cards..."
                                                value={selectCardSearchTerm}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectCardSearchTerm(e.target.value)}
                                            />
                                        </div>
                                </div>
                                <div className="dialog-body" style={{ overflowY: 'auto' }}>
                                    {creditCards && (
                                        <SingleCardSelector
                                            creditCards={creditCards}
                                            onSelectCard={handleCardSelectedFromModal}
                                            selectedCardId={activeCardId}
                                            hideInternalSearch={true}
                                            externalSearchTerm={selectCardSearchTerm}
                                            onExternalSearchTermChange={setSelectCardSearchTerm}
                                        />
                                    )}
                                </div>
                            </DrawerContent>
                        </Drawer>
                    );
                }
                return (
                    <Dialog open={isCardSelectorOpen} onOpenChange={setIsCardSelectorOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Select a Credit Card</DialogTitle>
                            </DialogHeader>
                            {creditCards && (
                                <SingleCardSelector
                                    creditCards={creditCards}
                                    onSelectCard={handleCardSelectedFromModal}
                                    selectedCardId={activeCardId}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                );
            })()}
        </div>
    );
}

export default PromptSolution;