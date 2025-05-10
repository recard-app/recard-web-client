import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard } from '../../../types/CreditCardTypes';
import { ChatSolutionCard, ChatSolutionSelectedCardId, Conversation } from '../../../types/ChatTypes';
import { PLACEHOLDER_CARD_IMAGE } from '../../../types';
import { UserHistoryService } from '../../../services';
import './PromptSolution.scss';

/**
 * Props for the PromptSolution component.
 * @param {ChatSolutionCard | ChatSolutionCard[]} promptSolutions - The solution(s) to display.
 * @param {CreditCard[]} creditCards - The list of credit cards to display.
 * @param {string} chatId - The ID of the current chat.
 * @param {function} onHistoryUpdate - Callback to update chat history when card selection changes.
 */
interface PromptSolutionProps {
    promptSolutions: ChatSolutionCard | ChatSolutionCard[];
    creditCards?: CreditCard[];
    chatId: string;
    selectedCardId: ChatSolutionSelectedCardId | null;
    onHistoryUpdate: (chat: Conversation) => void;
}

function PromptSolution({ promptSolutions, creditCards, chatId, selectedCardId, onHistoryUpdate }: PromptSolutionProps): React.ReactElement | null {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    // The list of solutions to display
    const [solutions, setSolutions] = useState<ChatSolutionCard[]>([]);
    // Currently selected card in the UI
    const [activeCardId, setActiveCardId] = useState<string>(selectedCardId || '');
    // Card being updated (for UI indication)
    const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);
    // Flag to disable all buttons during updates
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

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

        // Set updating state
        setIsUpdating(true);
        setUpdatingCardId(cardId);

        try {
            // Determine if we're selecting or deselecting
            const isDeselecting = cardId === activeCardId;
            
            // New card ID to send to server
            const newCardId = isDeselecting ? '' : cardId;
            
            // Update UI immediately for responsive feel
            setActiveCardId(newCardId);

            // Send update to server
            await UserHistoryService.updateTransactionCardSelection(effectiveChatId, newCardId);
            
            // Fetch updated chat history to ensure we have the latest state
            const updatedChat = await UserHistoryService.fetchChatHistoryById(effectiveChatId);
            
            // Update parent component
            if (updatedChat) {
                onHistoryUpdate(updatedChat);
            }
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

    // Don't render anything if there are no solutions or if all solutions lack card names
    if (solutions.length === 0 || !solutions.some(solution => solution.cardName)) {
        return null;
    }

    return (
        <div className="solutions-container">
            <h2>Best Cards for Your Purchase</h2>
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
                                    <img src={cardImage} alt={cardName} className="card-thumbnail" />
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
                                        className={`use-card-button ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleCardSelection(solution.id)}
                                        disabled={isUpdating}
                                    >
                                        {isUpdatingThis ? 'Updating...' : isSelected ? 'Used for Purchase' : 'Use this Card'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

export default PromptSolution;