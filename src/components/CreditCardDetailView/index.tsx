import React, { useState, useEffect } from 'react';
import './CreditCardDetailView.scss';
import { CreditCardDetails, CardMultiplier, CreditCard } from '../../types/CreditCardTypes';
import { UserComponentTrackingPreferences, ComponentType, COMPONENT_TYPES } from '../../types/CardCreditsTypes';
import { ICON_RED, ICON_GRAY } from '../../types';
import { COLORS } from '../../types/Colors';
import { CardIcon } from '../../icons';
import { InfoDisplay, DatePicker } from '../../elements';
import { Icon } from '../../icons';
import { UserComponentService } from '../../services/UserServices';
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
    openDate?: string | null; // Card open/anniversary date (MM/DD/YYYY)
    onOpenDateChange?: (date: string | null) => void; // Called when open date changes
    isFrozen?: boolean; // Whether the card is frozen (excluded from LLM context)
    onFreezeToggle?: () => void; // Called when freeze state is toggled
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
    onPreferencesUpdate,
    openDate,
    onOpenDateChange,
    isFrozen = false,
    onFreezeToggle
}) => {
    // Get component data from ComponentsContext using the card ID
    const cardCredits = useCreditsByCardId(cardDetails?.id || '');
    const cardPerks = usePerksByCardId(cardDetails?.id || '');
    const cardMultipliers = useMultipliersByCardId(cardDetails?.id || '');

    const [componentPreferences, setComponentPreferences] = useState<UserComponentTrackingPreferences | null>(null);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

    // Fetch tracking preferences when component mounts or when cardDetails changes
    // Always fetch preferences so disabled styling applies even in preview mode
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!cardDetails) return;

            setIsLoadingPreferences(true);
            try {
                const preferences = await UserComponentService.fetchComponentTrackingPreferences();
                setComponentPreferences(preferences);
            } catch (error) {
                console.error('Failed to fetch component tracking preferences:', error);
                // Set empty preferences if fetch fails
                setComponentPreferences({ Cards: [] });
            } finally {
                setIsLoadingPreferences(false);
            }
        };

        fetchPreferences();
    }, [cardDetails?.id]);

    // Check if a component is disabled
    const isComponentDisabled = (componentId: string, componentType: ComponentType): boolean => {
        if (!componentPreferences || !cardDetails) return false;

        const cardPref = componentPreferences.Cards.find(c => c.CardId === cardDetails.id);
        if (!cardPref) return false;

        const arrayKey = componentType === COMPONENT_TYPES.CREDIT ? 'Credits'
            : componentType === COMPONENT_TYPES.MULTIPLIER ? 'Multipliers'
            : 'Perks';
        const pref = cardPref[arrayKey].find(p => p.ComponentId === componentId);
        return pref?.Disabled || false;
    };

    // Update the disabled state for any component type
    const handleComponentDisabledChange = async (
        componentId: string,
        componentType: ComponentType,
        disabled: boolean
    ) => {
        if (!cardDetails) return;

        try {
            const updatedPreferences = await UserComponentService.updateComponentDisabledPreference({
                cardId: cardDetails.id,
                componentId,
                componentType,
                disabled
            });
            setComponentPreferences(updatedPreferences);

            // Notify parent components to refresh their preferences
            if (onPreferencesUpdate) {
                await onPreferencesUpdate();
            }
        } catch (error) {
            console.error('Failed to update component disabled preference:', error);
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
                            {onFreezeToggle && (
                                <button
                                    className={`freeze-button ${isFrozen ? 'is-frozen' : ''}`}
                                    onClick={onFreezeToggle}
                                    type="button"
                                >
                                    <Icon
                                        name="snowflake"
                                        variant="solid"
                                        size={16}
                                        color={isFrozen ? COLORS.NEUTRAL_WHITE : ICON_GRAY}
                                        className="freeze-icon"
                                    />
                                    {isFrozen ? 'Card Frozen' : 'Freeze Card'}
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

                        {/* Open Date / Anniversary Date Picker */}
                        {onOpenDateChange && (
                            <div className="open-date-field">
                                <DatePicker
                                    value={openDate ?? null}
                                    onChange={onOpenDateChange}
                                    label="Card Opening Date"
                                    placeholder="MM/DD/YYYY"
                                    clearable={true}
                                />
                            </div>
                        )}
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
                                            <div key={m.id ?? `main-${idx}`} className={`table-row main-row${isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER) ? ' disabled' : ''}`}>
                                                <div className="cell subcategory">
                                                    {isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER) && (
                                                        <span className="disabled-pill">Disabled</span>
                                                    )}
                                                    {m.Name}
                                                </div>
                                                <div className="cell rate">{m.Multiplier !== null ? `${m.Multiplier}x` : '—'}</div>
                                                <div className="cell description">
                                                    <div className="multiplier-desc">{m.Description}</div>
                                                    {m.Details && (
                                                        <div className="multiplier-details">{m.Details}</div>
                                                    )}
                                                </div>
                                                {showTrackingPreferences && (
                                                    <div className="cell toggle">
                                                        <label className="toggle-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={!isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER)}
                                                                onChange={(e) => handleComponentDisabledChange(
                                                                    m.id,
                                                                    COMPONENT_TYPES.MULTIPLIER,
                                                                    !e.target.checked
                                                                )}
                                                                disabled={isLoadingPreferences}
                                                            />
                                                            <span className="toggle-slider"></span>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {subItems.map((m, idx) => (
                                            <div key={m.id ?? `sub-${idx}-${m.SubCategory}`} className={`table-row sub-row${isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER) ? ' disabled' : ''}`}>
                                                <div className="cell subcategory">
                                                    {isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER) && (
                                                        <span className="disabled-pill">Disabled</span>
                                                    )}
                                                    {m.Name}
                                                </div>
                                                <div className="cell rate">{m.Multiplier !== null ? `${m.Multiplier}x` : '—'}</div>
                                                <div className="cell description">
                                                    <div className="multiplier-desc">{m.Description}</div>
                                                    {m.Details && (
                                                        <div className="multiplier-details">{m.Details}</div>
                                                    )}
                                                </div>
                                                {showTrackingPreferences && (
                                                    <div className="cell toggle">
                                                        <label className="toggle-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={!isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER)}
                                                                onChange={(e) => handleComponentDisabledChange(
                                                                    m.id,
                                                                    COMPONENT_TYPES.MULTIPLIER,
                                                                    !e.target.checked
                                                                )}
                                                                disabled={isLoadingPreferences}
                                                            />
                                                            <span className="toggle-slider"></span>
                                                        </label>
                                                    </div>
                                                )}
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
                            <div key={index} className={`credit-item${isComponentDisabled(credit.id, COMPONENT_TYPES.CREDIT) ? ' disabled' : ''}`}>
                                <div className="credit-header">
                                    <span className="credit-title">
                                        {isComponentDisabled(credit.id, COMPONENT_TYPES.CREDIT) && (
                                            <span className="disabled-pill">Disabled</span>
                                        )}
                                        {credit.Title}
                                    </span>
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
                                    <div className="component-tracking-preference">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={!isComponentDisabled(credit.id, COMPONENT_TYPES.CREDIT)}
                                                onChange={(e) => handleComponentDisabledChange(
                                                    credit.id,
                                                    COMPONENT_TYPES.CREDIT,
                                                    !e.target.checked
                                                )}
                                                disabled={isLoadingPreferences}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className="preference-label">
                                            {isComponentDisabled(credit.id, COMPONENT_TYPES.CREDIT) ? 'Disabled' : 'Enabled'}
                                        </span>
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
                            <div key={index} className={`perk-item${isComponentDisabled(perk.id, COMPONENT_TYPES.PERK) ? ' disabled' : ''}`}>
                                <div className="perk-header">
                                    <div className="perk-title">
                                        {isComponentDisabled(perk.id, COMPONENT_TYPES.PERK) && (
                                            <span className="disabled-pill">Disabled</span>
                                        )}
                                        {perk.Title}
                                    </div>
                                    {showTrackingPreferences && (
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={!isComponentDisabled(perk.id, COMPONENT_TYPES.PERK)}
                                                onChange={(e) => handleComponentDisabledChange(
                                                    perk.id,
                                                    COMPONENT_TYPES.PERK,
                                                    !e.target.checked
                                                )}
                                                disabled={isLoadingPreferences}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    )}
                                </div>
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
