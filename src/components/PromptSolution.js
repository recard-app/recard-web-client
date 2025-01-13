import React, { useState, useEffect } from 'react';

function PromptSolution({ promptSolutions }) {
    const [solutions, setSolutions] = useState([]);

    useEffect(() => {
        // Convert single object to array if needed
        const solutionsArray = Array.isArray(promptSolutions) 
            ? promptSolutions 
            : promptSolutions ? [promptSolutions] : [];
        setSolutions(solutionsArray);
    }, [promptSolutions]);

    // Don't render anything if there are no solutions
    if (solutions.length === 0) {
        return null;
    }

    return (
        <div className="solutions-container">
            <h2>Best Cards for Your Purchase</h2>
            <div className="solution-cards">
                {solutions.map((solution, index) => (
                    <div key={solution.id || index} className="solution-card">
                        <h3>{solution.cardName}</h3>
                        <div className="card-details">
                            <p><strong>Category:</strong> {solution.rewardCategory}</p>
                            <p><strong>Reward Rate:</strong> {solution.rewardRate}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PromptSolution;