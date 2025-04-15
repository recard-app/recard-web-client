import React, { useState, useEffect } from 'react';
import './PromptSolution.scss';

function PromptSolution({ promptSolutions, userCardDetails }) {
    const [solutions, setSolutions] = useState([]);

    useEffect(() => {
        // Convert single object to array if needed
        const solutionsArray = Array.isArray(promptSolutions) 
            ? promptSolutions 
            : promptSolutions ? [promptSolutions] : [];
        setSolutions(solutionsArray);
    }, [promptSolutions]);

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
                        const cardDetails = userCardDetails?.find(card => card.id === solution.id);
                        
                        // If no matching card is found, use the solution's default values
                        const cardName = cardDetails?.CardName || solution.cardName;
                        const cardImage = cardDetails?.CardImage || 'https://placehold.co/20x20';
                        
                        return (
                            <div key={solution.id || index} className="solution-card">
                                <div className="card-header">
                                    <img src={cardImage} alt={cardName} className="card-thumbnail" />
                                    <h3>{cardName}</h3>
                                </div>
                                <div className="card-details">
                                    {solution.rewardCategory && (
                                        <p><strong>Category:</strong> {solution.rewardCategory}</p>
                                    )}
                                    {solution.rewardRate && (
                                        <p><strong>Reward Rate:</strong> {solution.rewardRate}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

export default PromptSolution;