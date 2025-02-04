import React, { useState, useEffect } from 'react';
import './PromptSolution.scss';

function PromptSolution({ promptSolutions }) {
    const [solutions, setSolutions] = useState([]);

    useEffect(() => {
        // Convert single object to array if needed
        const solutionsArray = Array.isArray(promptSolutions) 
            ? promptSolutions 
            : promptSolutions ? [promptSolutions] : [];
        setSolutions(solutionsArray);
    }, [promptSolutions]);

    // Don't render anything if there are no solutions or if solutions lack card names
    if (solutions.length === 0 || !solutions.some(solution => solution.cardName)) {
        return null;
    }

    return (
        <div className="solutions-container">
            <h2>Best Cards for Your Purchase</h2>
            <div className="solution-cards">
                {solutions
                    .filter(solution => solution.cardName)
                    .map((solution, index) => (
                        <div key={solution.id || index} className="solution-card">
                            <h3>{solution.cardName}</h3>
                            <div className="card-details">
                                {solution.rewardCategory && (
                                    <p><strong>Category:</strong> {solution.rewardCategory}</p>
                                )}
                                {solution.rewardRate && (
                                    <p><strong>Reward Rate:</strong> {solution.rewardRate}</p>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default PromptSolution;