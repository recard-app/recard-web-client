import React from 'react';
import { SolutionContent } from '../../../types/ChatTypes';
import { CreditCard } from '../../../types/CreditCardTypes';
import { CardIcon } from '../../../icons';
import { CheckIcon } from 'lucide-react';
import '../PromptSolution/PromptSolution.scss';

interface SolutionBlockProps {
    content: SolutionContent;
    creditCards?: CreditCard[];
    onCardSelect: (cardId: string) => void;
}

/**
 * Component for displaying solution content blocks inline after messages.
 * Shows card recommendations with interactive selection.
 * Each block maintains its own selectedCardId from the content.
 */
function SolutionBlock({ content, creditCards, onCardSelect }: SolutionBlockProps): React.ReactElement | null {
    const solutions = content.solutions;
    const selectedCardId = content.selectedCardId;

    // Don't render anything if there are no solutions or if all solutions lack card names
    if (!solutions || solutions.length === 0 || !solutions.some(solution => solution.cardName)) {
        return null;
    }

    return (
        <div className="solutions-container inline-content-block">
            <div className="collapsible-content expanded">
                <div className="solution-cards">
                    {solutions
                .filter(solution => solution.cardName)
                .map((solution, index) => {
                    // Find matching card details using the solution's id
                    const cardDetails = creditCards?.find(card => card.id === solution.id);

                    // If no matching card is found, use the solution's default values
                    const cardName = cardDetails?.CardName || solution.cardName;

                    // Card is selected if it matches the selected card ID
                    const isSelected = solution.id === selectedCardId;

                    return (
                        <div
                            key={solution.id || index}
                            className={`solution-card ${index === 0 ? 'primary-solution-turned-off' : ''} ${isSelected ? 'selected-card' : ''}`}
                            onClick={() => onCardSelect(solution.id)}
                        >
                            <div className="card-checkbox-container">
                                <button
                                    className={`use-card-button ${isSelected ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCardSelect(solution.id);
                                    }}
                                    aria-label={isSelected ? 'Selected for purchase' : 'Select for purchase'}
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
            </div>
        </div>
    );
}

export default SolutionBlock;
