import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard } from '../../../types/CreditCardTypes';
import { ChatSolutionCard, ChatSolutionSelectedCardId, Conversation, ChatMessage } from '../../../types';
import { PLACEHOLDER_CARD_IMAGE, LOADING_ICON, LOADING_ICON_SIZE } from '../../../types';
import { CardIcon } from '../../../icons';
import { UserHistoryService } from '../../../services';
import SingleCardSelector from '../../CreditCardSelector/SingleCardSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog/dialog';
import './PromptSolution.scss';

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
        <div className="select-different-card">
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
                            <span className="selected-card-name">{selectedCard.CardName}</span>
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
                        className={`select-card-button ${isUpdating ? 'loading icon with-text' : ''}`}
                        onClick={onCardSelectorOpen}
                        disabled={isUpdating}
                    >
                        {isUpdating && <LOADING_ICON size={LOADING_ICON_SIZE} />}
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

    // Update active card when prop changes or when chatId changes
    useEffect(() => {
        setActiveCardId(selectedCardId || '');
    }, [selectedCardId, chatId]);

    // Convert the promptSolutions to an array
    useEffect(() => {
        const solutionsArray = Array.isArray(promptSolutions) 
            ? promptSolutions 
            : promptSolutions ? [promptSolutions] : [];
        setSolutions(solutionsArray);
    }, [promptSolutions]);

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

        // Set updating state
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
            </div>
        );
    }

    return (
        <div className="solutions-container">
            <div className="solutions-header" onClick={() => setIsExpanded(!isExpanded)}>
                <p className="caps-label">Select Card for Purchase</p>
                <button 
                    className={`collapse-button ${isExpanded ? 'expanded' : ''}`}
                    aria-label={isExpanded ? 'Collapse solutions' : 'Expand solutions'}
                >
                    ▼
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
                            const cardImage = cardDetails?.CardImage || PLACEHOLDER_CARD_IMAGE;
                            
                            // Card is selected if it matches the active card ID
                            const isSelected = solution.id === activeCardId;
                            
                            // This specific card is being updated
                            const isUpdatingThis = solution.id === updatingCardId;
                            
                            return (
                                <div 
                                    key={solution.id || index} 
                                    className={`solution-card ${index === 0 ? 'primary-solution' : ''} ${isSelected ? 'selected-card' : ''}`}
                                >
                                    <div className="card-header">
                                        <CardIcon 
                                            title={cardName} 
                                            size={24} 
                                            primary={cardDetails?.CardPrimaryColor}
                                            secondary={cardDetails?.CardSecondaryColor}
                                        />
                                        <h3>{cardName}</h3>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-details">
                                            {solution.rewardCategory && (
                                                <p><strong>Category:</strong> {solution.rewardCategory}</p>
                                            )}
                                            {solution.rewardRate && (
                                                <p><strong>Reward Rate:</strong> {solution.rewardRate}</p>
                                            )}
                                        </div>
                                        <button 
                                            className={`use-card-button ${isSelected ? 'selected' : ''} ${isUpdating ? 'loading icon' : ''}`}
                                            onClick={() => handleCardSelection(solution.id)}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                                            {isUpdatingThis ? 'Updating...' : isSelected ? 'Used for Purchase' : 'Use this Card'}
                                        </button>
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
        </div>
    );
}

export default PromptSolution;