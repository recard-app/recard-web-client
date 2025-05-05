import React, { useState, useEffect } from 'react';
import './CreditCardSelector.scss';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from '../../types/CreditCardTypes';
import { filterCards, fetchUserCards, toggleCardSelection, setDefaultCard, saveUserCardSelections } from './utils';

/**
 * Props interface for the CreditCardSelector component
 * @property returnCreditCards - Callback function to send selected cards back to parent component
 * @property existingCreditCards - Array of cards that are already selected/saved for the user
 */
interface CreditCardSelectorProps {
  returnCreditCards: (cards: CreditCard[]) => void;
  existingCreditCards: CreditCard[];
}

/**
 * Component for selecting and managing credit cards
 * Allows users to view, select, search, and set default cards
 */
const CreditCardSelector: React.FC<CreditCardSelectorProps> = ({ returnCreditCards, existingCreditCards }) => {
    // State for managing the list of all credit cards, initialized with existing cards
    const [creditCards, setCreditCards] = useState<CreditCard[]>(existingCreditCards || []);
    // State for managing the search input value
    const [searchTerm, setSearchTerm] = useState<string>('');
    // State for displaying save operation status messages
    const [saveStatus, setSaveStatus] = useState<string>('');
    // State for tracking loading state during API calls
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    /**
     * Fetches credit cards from the API on component mount
     * Falls back to existingCreditCards if fetch fails
     */
    useEffect(() => {
        const loadCards = async () => {
            setIsLoading(true);
            if (user) {
                const cards = await fetchUserCards(existingCreditCards);
                setCreditCards(cards);
            }
            setIsLoading(false);
        };

        loadCards();
    }, [user]);

    useEffect(() => {
        returnCreditCards(creditCards);
    }, [creditCards]);

    /**
     * Toggles the selected state of a card
     * Removes default status if card is deselected
     */
    const handleCheckboxChange = (cardId: string): void => {
        setCreditCards(prevCards => toggleCardSelection(prevCards, cardId));
    };

    /**
     * Sets a card as the default/preferred card
     * Removes default status from all other cards
     */
    const handleSetDefault = (cardId: string): void => {
        setCreditCards(prevCards => setDefaultCard(prevCards, cardId));
    };

    /**
     * Saves the user's card selections to the backend
     * Updates local state with fresh data after successful save
     */
    const handleSave = async (): Promise<void> => {
        const result = await saveUserCardSelections(creditCards);
        setSaveStatus(result.message);
        if (result.success && result.updatedCards) {
            setCreditCards(result.updatedCards);
        }
    };

    // Use the filterCards utility function
    const filteredCards = filterCards(creditCards, searchTerm);

    /**
     * Handles navigation to auth pages when user is not logged in
     */
    const handleAuthRedirect = (path: string): void => {
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
};

export default CreditCardSelector;