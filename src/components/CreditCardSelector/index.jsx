import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreditCardSelector.scss';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const apiurl = import.meta.env.VITE_BASE_URL;

function CreditCardSelector({ returnCreditCards, existingCreditCards }) {
    const [creditCards, setCreditCards] = useState(existingCreditCards || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

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
            // Sort alphabetically by card name
            return a.CardName.localeCompare(b.CardName);
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
    }, [user]);

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
        
        try {
            // Get fresh Firebase token from the current user
            const token = await auth.currentUser.getIdToken();
            
            // Save the selected cards
            await axios.post(
                `${apiurl}/cards/update_cards`, 
                { returnCreditCards },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Fetch the full list again to get the updated state
            const fullListResponse = await axios.get(
                `${apiurl}/cards/full-list`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setCreditCards(sortCards(fullListResponse.data));
            setSaveStatus('Cards saved successfully!');
        } catch (error) {
            console.error('Error saving cards:', error);
            setSaveStatus('Error saving cards. Please try again.');
        }
    };

    const filteredCards = creditCards
        .filter(card => 
            card.CardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.CardIssuer.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleAuthRedirect = (path) => {
        navigate(path);
    };

    if (!user) {
        return (
            <div className="auth-prompt">
                <h2>Sign In Required</h2>
                <p>Log in to unlock full features, manage your credit cards, and get the most out of ReCard!</p>
                <div className="auth-buttons">
                    <button onClick={() => handleAuthRedirect('/signin')}>Sign In</button>
                    <button onClick={() => handleAuthRedirect('/signup')}>Sign Up</button>
                </div>
            </div>
        );
    }

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
                            name={card.CardName} 
                            value={card.CardName} 
                            checked={card.selected || false} 
                            onChange={() => handleCheckboxChange(card.id)}
                        />
                        <img src={card.CardImage || '/credit-card-128.png'} alt='Credit Card Img' />
                        <div className='card-desc'>
                            <p className='card-name'>
                                {card.CardName}
                                {card.isDefaultCard && <span className="default-tag">Preferred Card</span>}
                            </p>
                            <p className='card-type'>{card.CardIssuer}</p>
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
                <button onClick={handleSave} className="save-button">
                    Save
                </button>
                {saveStatus && <p className="save-status">{saveStatus}</p>}
            </div>
        </div>
    );
}

export default CreditCardSelector;