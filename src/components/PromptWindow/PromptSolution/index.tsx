import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard } from '../../../types/CreditCardTypes';
import { ChatSolutionCard, ChatSolutionSelectedCardId } from '../../../types/ChatTypes';
import { PLACEHOLDER_CARD_IMAGE } from '../../../types';
import { UserHistoryService } from '../../../services';
import './PromptSolution.scss';

/**
 * Props for the PromptSolution component.
 * @param {ChatSolutionCard | ChatSolutionCard[]} promptSolutions - The solution(s) to display.
 * @param {CreditCard[]} creditCards - The list of credit cards to display.
 * @param {string} chatId - The ID of the current chat.
 */
interface PromptSolutionProps {
    promptSolutions: ChatSolutionCard | ChatSolutionCard[];
    creditCards?: CreditCard[];
    chatId: string;
}

function PromptSolution({ promptSolutions, creditCards, chatId }: PromptSolutionProps): React.ReactElement | null {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    // The list of solutions to display.
    const [solutions, setSolutions] = useState<ChatSolutionCard[]>([]);
    // Track which card is selected
    const [selectedCardId, setSelectedCardId] = useState<ChatSolutionSelectedCardId | null>(null);
    // Track which card is currently being updated - this is basically being used as a isloading boolean
    const [updatingCardId, setUpdatingCardId] = useState<ChatSolutionSelectedCardId | null>(null);

    // Initialize selected card from existing chat history
    useEffect(() => {
        const effectiveChatId = chatId || urlChatId;
        if (effectiveChatId) {
            // Fetch the chat history to get the current card selection
            UserHistoryService.fetchChatHistoryById(effectiveChatId)
                .then(chat => {
                    if (chat.cardSelection) {
                        setSelectedCardId(chat.cardSelection);
                    }
                })
                .catch(error => {
                    console.error('Error fetching chat history:', error);
                });
        }
    }, [chatId, urlChatId]);

    // Convert the promptSolutions to an array if it is a valid solution object.
    useEffect(() => {
        const solutionsArray = Array.isArray(promptSolutions) 
            ? promptSolutions 
            : promptSolutions ? [promptSolutions] : [];
        setSolutions(solutionsArray);
    }, [promptSolutions]);

    // Handle card selection
    const handleCardSelection = async (cardId: string) => {
        try {
            setUpdatingCardId(cardId);
            const newSelectedCardId = cardId === selectedCardId ? '' : cardId;
            
            // Use urlChatId as fallback when chatId is empty
            const effectiveChatId = chatId || urlChatId;
            if (!effectiveChatId) {
                throw new Error('No chat ID available');
            }
            await UserHistoryService.updateTransactionCardSelection(effectiveChatId, newSelectedCardId);
            setSelectedCardId(newSelectedCardId || null);
        } catch (error) {
            console.error('Failed to update card selection:', error);
        } finally {
            setUpdatingCardId(null);
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
                        const isSelected = solution.id === selectedCardId;
                        const isUpdating = solution.id === updatingCardId;
                        
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
                                        {isUpdating ? 'Updating...' : isSelected ? 'Used for Purchase' : 'Use this Card'}
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