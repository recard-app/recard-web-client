import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreditCardSelector.scss';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
const apiurl = process.env.REACT_APP_BASE_URL;

function CreditCardSelector({ returnCreditCards, existingCreditCards }) {
    const [creditCards, setCreditCards] = useState(existingCreditCards || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const sortCards = (cards) => {
        return [...cards].sort((a, b) => {
            // Sort by default card status first
            if (a.isDefaultCard !== b.isDefaultCard) {
                return b.isDefaultCard ? 1 : -1;
            }
            // Then sort by selected status
            if (a.selected !== b.selected) {
                return b.selected ? 1 : -1;
            }
            // If both status are same, sort by ID
            return a.id - b.id;
        });
    };

    useEffect(() => {
        const fetchCards = async () => {
            setIsLoading(true);
            try {
                // Only get fresh token if user is logged in
                const headers = {};
                if (user) {
                    const token = await auth.currentUser.getIdToken();
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await axios.get(`${apiurl}/cards/full-list`, { headers });
                setCreditCards(sortCards(response.data));
            } catch (error) {
                console.error('Error fetching cards:', error);
                // Keep using existingCreditCards if fetch fails
                if (existingCreditCards) {
                    setCreditCards(sortCards(existingCreditCards));
                }
            } finally {
                setIsLoading(false);
            }
        };

        // Initialize cards once on mount or when user changes
        fetchCards();
    }, [user]); // Remove existingCreditCards dependency

    useEffect(() => {
        //console.log(creditCards);
        returnCreditCards(creditCards);
    }, [creditCards]);

    const handleCheckboxChange = (cardId) => {
        setCreditCards(prevCards => 
            prevCards.map(card => {
                if (card.id === cardId) {
                    const newSelected = !card.selected;
                    return {
                        ...card,
                        selected: newSelected,
                        // Remove isDefaultCard if card is being unselected
                        ...(newSelected ? {} : { isDefaultCard: false })
                    };
                }
                return card;
            })
        );
    };

    const handleSetDefault = (cardId) => {
        setCreditCards(prevCards => 
            prevCards.map(card => ({
                ...card,
                isDefaultCard: card.id === cardId // true for selected card, false for all others
            }))
        );
    };

    const handleSave = async () => {
        const returnCreditCards = creditCards
            .filter(card => card.selected)
            .map(card => ({
                cardId: card.id,
                isDefaultCard: card.isDefaultCard || false
            }));
        
        console.log('Selected card data being sent:', returnCreditCards);
        
        try {
            // Get fresh Firebase token from the current user
            const token = await auth.currentUser.getIdToken();
            const response = await axios.post(`${apiurl}/cards/update_cards`, 
                { returnCreditCards },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('Response from server:', response.data);
            setCreditCards(sortCards(response.data));
            setSaveStatus('Cards saved successfully!');
        } catch (error) {
            console.error('Error saving cards:', error);
            setSaveStatus('Error saving cards. Please try again.');
        }
    };

    const filteredCards = creditCards
        .filter(card => 
            card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.cardType.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className='credit-card-selector'>
            <h3>Select your Credit Cards</h3>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            {isLoading && existingCreditCards.length === 0 && (
                <div className="loading">Loading cards...</div>
            )}
            {filteredCards.map((card) => (
                <div key={card.id} className='card'>
                    <label className='card-select' htmlFor={card.id}>
                        <input 
                            type="checkbox" 
                            id={card.id}
                            name={card.cardName} 
                            value={card.cardName} 
                            checked={card.selected || false} 
                            onChange={() => handleCheckboxChange(card.id)}
                        />
                        <img src='/credit-card-128.png' alt='Credit Card Img' />
                        <div className='card-desc'>
                            <p className='card-name'>
                                {card.cardName}
                                {card.isDefaultCard && <span className="default-tag">Preferred Card</span>}
                            </p>
                            <p className='card-type'>{card.cardType}</p>
                        </div>
                    </label>
                    {card.selected && !card.isDefaultCard && (
                        <button 
                            className="set-default-button"
                            onClick={() => handleSetDefault(card.id)}
                        >
                            Set as Preferred Card
                        </button>
                    )}
                </div>
            ))}
            <div className="save-section">
                {user && ( // Only show the save button if the user is logged in
                    <button onClick={handleSave} className="save-button">
                        Save
                    </button>
                )}
                {saveStatus && <p className="save-status">{saveStatus}</p>}
            </div>
        </div>
    );
}

export default CreditCardSelector;