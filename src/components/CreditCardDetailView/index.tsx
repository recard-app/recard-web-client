import React, { useState, useEffect } from 'react';
import './CreditCardDetailView.scss';
import { CreditCardDetails, CardMultiplier, CreditCard } from '../../types/CreditCardTypes';
import { UserCreditsTrackingPreferences, CREDIT_HIDE_PREFERENCE, CreditHidePreferenceType } from '../../types/CardCreditsTypes';
import { ICON_RED } from '../../types';
import { COLORS } from '../../types/Colors';
import { CardIcon } from '../../icons';
import { InfoDisplay } from '../../elements';
import { Icon } from '../../icons';
import { UserCreditService } from '../../services/UserServices';
import { useCreditsByCardId, usePerksByCardId, useMultipliersByCardId } from '../../contexts/ComponentsContext';

interface CreditCardDetailViewProps {
    cardDetails: CreditCardDetails | null;
    isLoading: boolean;
    isAddingCard?: boolean;
    cardBeingAdded?: CreditCard | null;
    isRemovingCard?: boolean;
    cardBeingRemoved?: CreditCard | null;
    onSetPreferred?: () => void;
    onRemoveCard?: () => void;
    noCards?: boolean;
    showTrackingPreferences?: boolean; // Controls whether to show credit tracking preferences
    onPreferencesUpdate?: () => Promise<void>; // Called when preferences are updated
}

const CreditCardDetailView: React.FC<CreditCardDetailViewProps> = ({
    cardDetails,
    isLoading,
    isAddingCard = false,
    cardBeingAdded = null,
    isRemovingCard = false,
    cardBeingRemoved = null,
    onSetPreferred,
    onRemoveCard,
    noCards = false,
    showTrackingPreferences = false,
    onPreferencesUpdate
}) => {
    // Get component data from ComponentsContext using the card ID
    const cardCredits = useCreditsByCardId(cardDetails?.id || '');
    const cardPerks = usePerksByCardId(cardDetails?.id || '');
    const cardMultipliers = useMultipliersByCardId(cardDetails?.id || '');

    const [trackingPreferences, setTrackingPreferences] = useState<UserCreditsTrackingPreferences | null>(null);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

    // Fetch tracking preferences when component mounts or when cardDetails changes
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!cardDetails || !showTrackingPreferences) return;
            
            setIsLoadingPreferences(true);
            try {
                const preferences = await UserCreditService.fetchCreditTrackingPreferences();
                setTrackingPreferences(preferences);
            } catch (error) {
                console.error('Failed to fetch credit tracking preferences:', error);
                // Set empty preferences if fetch fails
                setTrackingPreferences({ Cards: [] });
            } finally {
                setIsLoadingPreferences(false);
            }
        };

        fetchPreferences();
    }, [cardDetails?.id, showTrackingPreferences]);

    // Get the current hide preference for a specific credit
    const getCreditHidePreference = (creditId: string): CreditHidePreferenceType => {
        if (!trackingPreferences || !cardDetails) {
            return CREDIT_HIDE_PREFERENCE.DO_NOT_HIDE; // Default to showing
        }

        const cardPrefs = trackingPreferences.Cards.find(card => card.CardId === cardDetails.id);
        if (!cardPrefs) {
            return CREDIT_HIDE_PREFERENCE.DO_NOT_HIDE;
        }

        const creditPref = cardPrefs.Credits.find(credit => credit.CreditId === creditId);
        return creditPref?.HidePreference || CREDIT_HIDE_PREFERENCE.DO_NOT_HIDE;
    };

    // Update the hide preference for a specific credit
    const handleCreditHidePreferenceChange = async (creditId: string, hidePreference: CreditHidePreferenceType) => {
        if (!cardDetails) return;

        try {
            const updatedPreferences = await UserCreditService.updateCreditHidePreference({
                cardId: cardDetails.id,
                creditId,
                hidePreference
            });
            setTrackingPreferences(updatedPreferences);
            
            // Notify parent components to refresh their preferences
            if (onPreferencesUpdate) {
                await onPreferencesUpdate();
            }
        } catch (error) {
            console.error('Failed to update credit hide preference:', error);
            // TODO: Show user-friendly error message
        }
    };
    // Priority order for loading states:
    // 1. Adding a card
    // 2. Removing a card
    // 3. Loading card details
    // 4. No card selected

    if (isAddingCard && cardBeingAdded) {
        return (
            <div className="card-details-loading">
                <InfoDisplay
                    type="loading"
                    message={`Adding ${cardBeingAdded.CardName}...`}
                    showTitle={false}
                    transparent={true}
                    centered={true}
                    hideOverflow={true}
                />
            </div>
        );
    }

    if (isRemovingCard && cardBeingRemoved) {
        return (
            <div className="card-details-loading">
                <InfoDisplay
                    type="loading"
                    message={`Removing ${cardBeingRemoved.CardName}...`}
                    showTitle={false}
                    transparent={true}
                    centered={true}
                    hideOverflow={true}
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="card-details-loading">
                <InfoDisplay
                    type="loading"
                    message="Loading card details..."
                    showTitle={false}
                    transparent={true}
                    centered={true}
                />
            </div>
        );
    }

    if (!cardDetails) {
        return <div className="no-card-details">{noCards ? 'Add your Credit Cards to get started' : 'Select a card to view details'}</div>;
    }

    return (
        <div className="card-details">
            <div className="card-header">
                <CardIcon 
                    title={`${cardDetails.CardName} card`} 
                    size={36} 
                    primary={cardDetails.CardPrimaryColor}
                    secondary={cardDetails.CardSecondaryColor}
                    className="card-image"
                />
                <div className="card-header-info">
                    <h2>{cardDetails.CardName}</h2>
                    <div className="header-meta">
                        <div className="meta-item">
                            <Icon name="bank" variant="micro" color={COLORS.NEUTRAL_GRAY} className="meta-icon" aria-hidden="true" />
                            <span className="meta-label">Issuer:</span>
                            <span className="meta-value">{cardDetails.CardIssuer}</span>
                        </div>
                        <div className="meta-item">
                            <Icon name="card" variant="micro" color={COLORS.NEUTRAL_GRAY} className="meta-icon" aria-hidden="true" />
                            <span className="meta-label">Network:</span>
                            <span className="meta-value">{cardDetails.CardNetwork}</span>
                        </div>
                    </div>
                    
                    {/* Preferred Card Button or Badge */}
                    <div className="card-actions">
                        <div className="card-action-buttons">
                            {onSetPreferred && (
                                <button 
                                    className={`preferred-button ${cardDetails.isDefaultCard ? 'is-preferred' : ''}`}
                                    onClick={onSetPreferred}
                                    type="button"
                                >
                                    <Icon 
                                        name="star"
                                        variant={cardDetails.isDefaultCard ? 'solid' : 'outline'}
                                        size={16}
                                        className="preferred-icon"
                                    />
                                    {cardDetails.isDefaultCard ? 'Preferred Card' : 'Set as Preferred Card'}
                                </button>
                            )}
                            {onRemoveCard && (
                                <button 
                                    className="button ghost destructive icon small square"
                                    onClick={onRemoveCard}
                                    aria-label="Remove Card"
                                    title="Remove Card"
                                    type="button"
                                >
                                    <Icon 
                                        name="delete"
                                        variant="mini"
                                        size={20}
                                        color={ICON_RED}
                                        className="delete-icon"
                                        aria-hidden="true"
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="card-info-section">
                <h3>Card Details</h3>
                {cardDetails.CardDetails && cardDetails.CardDetails.trim() !== '' && (
                    <p className="card-description">{cardDetails.CardDetails}</p>
                )}
                <div className="card-basic-info">
                    <div className="info-item">
                        <span className="label">Annual Fee</span>
                        <span className="value">{cardDetails.AnnualFee !== null ? `$${cardDetails.AnnualFee}` : 'None'}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Foreign Transaction Fee</span>
                        <span className="value">{cardDetails.ForeignExchangeFee}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Rewards Currency</span>
                        <span className="value">{cardDetails.RewardsCurrency}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Points Per Dollar</span>
                        <span className="value">{cardDetails.PointsPerDollar !== null ? cardDetails.PointsPerDollar : 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            {cardMultipliers && cardMultipliers.length > 0 && (
                <div className="card-section">
                    <h3>Reward Multipliers</h3>
                    <div className="multipliers-table">
                        {Array.from(
                            cardMultipliers.reduce((map, m) => {
                                const key = (m.Category && m.Category.trim() !== '') ? m.Category : 'Other';
                                if (!map.has(key)) map.set(key, [] as CardMultiplier[]);
                                map.get(key)!.push(m);
                                return map;
                            }, new Map<string, CardMultiplier[]>())
                        ).map(([category, items]) => {
                            const mainItems = items.filter(i => !i.SubCategory || i.SubCategory.trim() === '');
                            const subItems = items.filter(i => i.SubCategory && i.SubCategory.trim() !== '');
                            return (
                                <div key={category} className="category-group">
                                    <div className="category-title">{category}</div>
                                    <div className="table">
                                        {mainItems.map((m, idx) => (
                                            <div key={m.id ?? `main-${idx}`} className="table-row main-row">
                                                <div className="cell subcategory">{m.Name}</div>
                                                <div className="cell rate">{m.Multiplier !== null ? `${m.Multiplier}x` : '—'}</div>
                                                <div className="cell description">
                                                    <div className="multiplier-desc">{m.Description}</div>
                                                    {m.Details && (
                                                        <div className="multiplier-details">{m.Details}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {subItems.map((m, idx) => (
                                            <div key={m.id ?? `sub-${idx}-${m.SubCategory}`} className="table-row sub-row">
                                                <div className="cell subcategory">{m.Name}</div>
                                                <div className="cell rate">{m.Multiplier !== null ? `${m.Multiplier}x` : '—'}</div>
                                                <div className="cell description">
                                                    <div className="multiplier-desc">{m.Description}</div>
                                                    {m.Details && (
                                                        <div className="multiplier-details">{m.Details}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {cardCredits && cardCredits.length > 0 && (
                <div className="card-section">
                    <h3>Card Credits</h3>
                    <div className="credits-list">
                        {cardCredits.map((credit, index) => (
                            <div key={index} className="credit-item">
                                <div className="credit-header">
                                    <span className="credit-title">{credit.Title}</span>
                                    <span className="credit-value">{`$${credit.Value}`}</span>
                                </div>
                                <div className="credit-period">{credit.TimePeriod}</div>
                                <div className="credit-description">{credit.Description}</div>
                                {credit.Details && (
                                    <div className="credit-details">{credit.Details}</div>
                                )}
                                {(credit.Category || credit.SubCategory) && (
                                    <div className="credit-category">
                                        {credit.Category}{credit.SubCategory ? ` › ${credit.SubCategory}` : ''}
                                    </div>
                                )}
                                {showTrackingPreferences && (
                                    <div className="credit-tracking-preference">
                                        <label htmlFor={`credit-tracking-${credit.id}`} className="preference-label">
                                            Do you want to track this credit?
                                        </label>
                                        <select
                                            id={`credit-tracking-${credit.id}`}
                                            className="default-select"
                                            value={getCreditHidePreference(credit.id)}
                                            onChange={(e) => handleCreditHidePreferenceChange(credit.id, e.target.value as CreditHidePreferenceType)}
                                            disabled={isLoadingPreferences}
                                        >
                                            <option value={CREDIT_HIDE_PREFERENCE.DO_NOT_HIDE}>
                                                Yes, track this credit
                                            </option>
                                            <option value={CREDIT_HIDE_PREFERENCE.HIDE_ALL}>
                                                No, do not track
                                            </option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {cardPerks && cardPerks.length > 0 && (
                <div className="card-section">
                    <h3>Card Perks</h3>
                    <div className="perks-list">
                        {cardPerks.map((perk, index) => (
                            <div key={index} className="perk-item">
                                <div className="perk-title">{perk.Title}</div>
                                <div className="perk-description">{perk.Description}</div>
                                {perk.Details && (
                                    <div className="perk-details">{perk.Details}</div>
                                )}
                                {(perk.Category || perk.SubCategory) && (
                                    <div className="perk-category">
                                        {perk.Category}{perk.SubCategory ? ` › ${perk.SubCategory}` : ''}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardDetailView;
