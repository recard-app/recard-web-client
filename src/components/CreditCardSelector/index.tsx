import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './CreditCardSelector.scss';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from '../../types/CreditCardTypes';
import { filterCards, fetchUserCards, toggleCardSelection, setDefaultCard, saveUserCardSelections, sortCards } from './utils';
import { APP_NAME, PAGES } from '../../types';
import { CardIcon } from '../../icons';
import { InfoDisplay, SearchField } from '../../elements';

/**
 * Props interface for the CreditCardSelector component
 * @property returnCreditCards - Callback function to send selected cards back to parent component
 * @property existingCreditCards - Array of cards that are already selected/saved for the user
 */
interface CreditCardSelectorProps {
  returnCreditCards: (cards: CreditCard[]) => void;
  existingCreditCards: CreditCard[];
  showSaveButton?: boolean;
  onSaveComplete?: (success: boolean, message: string) => void;
  isSaving?: boolean;
  externalSearchTerm?: string;
  onExternalSearchTermChange?: (value: string) => void;
  hideInternalSearch?: boolean;
}

export interface CreditCardSelectorRef {
  handleSave: () => Promise<void>;
}

/**
 * Component for selecting and managing credit cards
 * Allows users to view, select, search, and set default cards
 */
const CreditCardSelector = forwardRef<CreditCardSelectorRef, CreditCardSelectorProps>(({ returnCreditCards, existingCreditCards, showSaveButton = true, onSaveComplete, isSaving = false, externalSearchTerm, onExternalSearchTermChange, hideInternalSearch = false }, ref) => {
    // State for managing the list of all credit cards, initialized with existing cards
    const [creditCards, setCreditCards] = useState<CreditCard[]>(sortCards(existingCreditCards || []));
    // State for managing the search input value
    const [searchTerm, setSearchTerm] = useState<string>('');
    // State for tracking if we're loading initial data
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(creditCards.length === 0);

    const { user } = useAuth();
    const navigate = useNavigate();

    /**
     * Fetches credit cards from the API in the background
     * Shows existing cards immediately while fetching updated data
     */
    useEffect(() => {
        const loadCards = async () => {
            if (user) {
                const cards = await fetchUserCards(creditCards);
                setCreditCards(cards);
                setIsInitialLoad(false);
            }
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
        const previouslySelectedIds = creditCards.filter(c => c.selected).map(c => c.id);
        const result = await saveUserCardSelections(creditCards, previouslySelectedIds);
        if (result.success && result.updatedCards) {
            setCreditCards(result.updatedCards);
        }
        
        // Notify parent component of save completion
        if (onSaveComplete) {
            onSaveComplete(result.success, result.message);
        }
    };

    // Expose handleSave to parent component via ref
    useImperativeHandle(ref, () => ({
        handleSave
    }));

    // Use the filterCards utility function
    const effectiveSearchTerm = typeof externalSearchTerm === 'string' ? externalSearchTerm : searchTerm;
    const filteredCards = filterCards(creditCards, effectiveSearchTerm);
    
    // Split cards into "Your Cards" and "Other Cards"
    const userCards = filteredCards.filter(card => card.selected);
    const otherCards = filteredCards.filter(card => !card.selected);

    // Sort user cards to ensure default card is at the top
    const sortedUserCards = [...userCards].sort((a, b) => {
        if (a.isDefaultCard !== b.isDefaultCard) {
            return a.isDefaultCard ? -1 : 1;
        }
        return a.CardName.localeCompare(b.CardName);
    });

    // Determine section header for non-selected cards
    const otherCardsHeader = userCards.length > 0 ? "Other Cards" : "All Cards";

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
                <p>Log in to unlock full features, manage your credit cards, and get the most out of {APP_NAME}!</p>
                <div className="auth-buttons">
                    <button onClick={() => handleAuthRedirect(PAGES.SIGN_IN.PATH)}>Sign In</button>
                    <button onClick={() => handleAuthRedirect(PAGES.SIGN_UP.PATH)}>Sign Up</button>
                </div>
            </div>
        );
    }

    return (
        <div className='credit-card-selector'>
            
            {!hideInternalSearch && (
                <div className="search-container">
                    <SearchField
                        type="text"
                        placeholder="Search cards..."
                        value={effectiveSearchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (onExternalSearchTermChange) {
                                onExternalSearchTermChange(e.target.value);
                            } else {
                                setSearchTerm(e.target.value);
                            }
                        }}
                        disabled={isSaving}
                    />
                </div>
            )}
            
            {isInitialLoad ? (
                <div className="loading">
                    <InfoDisplay
                        type="loading"
                        message="Loading cards..."
                        showTitle={false}
                        transparent={true}
                        centered
                    />
                </div>
            ) : (
                <div className="cards-container">
                    {userCards.length > 0 && (
                        <div className="card-section">
                            <h4 className="section-header">My Cards</h4>
                            <div className="section-cards">
                                {sortedUserCards.map((card) => (
                                    <div key={card.id} className={`card ${isSaving ? 'disabled' : ''}`}>
                                        <label className='card-select' htmlFor={card.id}>
                                            <input 
                                                type="checkbox" 
                                                id={card.id}
                                                name={card.CardName} 
                                                value={card.CardName} 
                                                checked={card.selected || false} 
                                                onChange={() => handleCheckboxChange(card.id)}
                                                disabled={isSaving}
                                            />
                                            <CardIcon 
                                                title={`${card.CardName} card`} 
                                                size={32} 
                                                primary={card.CardPrimaryColor}
                                                secondary={card.CardSecondaryColor}
                                            />
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
                                                disabled={isSaving}
                                            >
                                                Set as Preferred Card
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {otherCards.length > 0 && (
                        <div className="card-section">
                            <h4 className="section-header">{otherCardsHeader}</h4>
                            <div className="section-cards">
                                {otherCards.map((card) => (
                                    <div key={card.id} className={`card ${isSaving ? 'disabled' : ''}`}>
                                        <label className='card-select' htmlFor={card.id}>
                                            <input 
                                                type="checkbox" 
                                                id={card.id}
                                                name={card.CardName} 
                                                value={card.CardName} 
                                                checked={card.selected || false} 
                                                onChange={() => handleCheckboxChange(card.id)}
                                                disabled={isSaving}
                                            />
                                            <CardIcon 
                                                title={`${card.CardName} card`} 
                                                size={32} 
                                                primary={card.CardPrimaryColor}
                                                secondary={card.CardSecondaryColor}
                                            />
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
                                                disabled={isSaving}
                                            >
                                                Set as Preferred Card
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {filteredCards.length === 0 && (
                        <div className="no-results">
                            <InfoDisplay
                                type="default"
                                message="No cards match your search"
                                showTitle={false}
                                transparent={true}
                                showIcon={false}
                                centered
                            />
                        </div>
                    )}
                    
                    {showSaveButton && (
                        <div className="save-section">
                            <button onClick={handleSave} className="save-button">
                                Save
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default CreditCardSelector;