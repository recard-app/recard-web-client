import React, { useState, useEffect } from 'react';
import './CreditCardDetailView.scss';
import { CreditCardDetails, CardMultiplier, CreditCard } from '../../types/CreditCardTypes';
import { UserComponentTrackingPreferences, ComponentType, COMPONENT_TYPES } from '../../types/CardCreditsTypes';
import { ICON_RED, ICON_GRAY, LOADING_ICON, LOADING_ICON_SIZE } from '../../types';
import { COLORS } from '../../types/Colors';
import { CardIcon } from '../../icons';
import { InfoDisplay, DatePicker } from '../../elements';
import { Icon } from '../../icons';
import { UserComponentService } from '../../services/UserServices';
import { useCreditsByCardId, usePerksByCardId, useMultipliersByCardId } from '../../contexts/ComponentsContext';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '../ui/dialog/dialog';

type TabType = 'multipliers' | 'credits' | 'perks';

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

    // Tab state for switching between multipliers, credits, and perks
    const [activeTab, setActiveTab] = useState<TabType>('multipliers');

    // Expandable state for credits and perks
    const [expandedCredits, setExpandedCredits] = useState<Set<string>>(new Set());
    const [expandedPerks, setExpandedPerks] = useState<Set<string>>(new Set());

    const toggleCreditExpanded = (id: string) => {
        setExpandedCredits(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const togglePerkExpanded = (id: string) => {
        setExpandedPerks(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllCredits = () => {
        if (!cardCredits) return;
        if (expandedCredits.size === cardCredits.length) {
            setExpandedCredits(new Set());
        } else {
            setExpandedCredits(new Set(cardCredits.map(c => c.id)));
        }
    };

    const toggleAllPerks = () => {
        if (!cardPerks) return;
        if (expandedPerks.size === cardPerks.length) {
            setExpandedPerks(new Set());
        } else {
            setExpandedPerks(new Set(cardPerks.map(p => p.id)));
        }
    };

    // Open date modal state
    const [isOpenDateModalOpen, setIsOpenDateModalOpen] = useState(false);
    const [editingOpenDateValue, setEditingOpenDateValue] = useState<string | null>(null);
    const [isSavingOpenDate, setIsSavingOpenDate] = useState(false);

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

    // Handle opening the date modal
    const handleOpenDateModal = () => {
        setEditingOpenDateValue(openDate ?? null);
        setIsOpenDateModalOpen(true);
    };

    // Handle saving open date from modal
    const handleSaveOpenDate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onOpenDateChange) return;

        setIsSavingOpenDate(true);
        try {
            onOpenDateChange(editingOpenDateValue);
            setIsOpenDateModalOpen(false);
        } finally {
            setIsSavingOpenDate(false);
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
            {/* Compact Header: CardIcon, Name/Meta, Action Buttons */}
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
                </div>
            </div>

            {/* Action Buttons */}
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
                        {cardDetails.isDefaultCard ? 'Preferred Card' : 'Set Preferred'}
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

            {/* Card Description (if available) */}
            {cardDetails.CardDetails && cardDetails.CardDetails.trim() !== '' && (
                <p className="card-description">{cardDetails.CardDetails}</p>
            )}

            {/* Horizontal Stats Bar */}
            <div className="card-stats-bar">
                <div className="stat-item">
                    <span className="stat-value">{cardDetails.AnnualFee !== null ? `$${cardDetails.AnnualFee}` : '$0'}</span>
                    <span className="stat-label">Annual Fee</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-value">{cardDetails.ForeignExchangeFee || 'None'}</span>
                    <span className="stat-label">FX Fee</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-value">
                        {cardDetails.RewardsCurrency || 'N/A'}
                        {cardDetails.PointsPerDollar !== null && ` (${cardDetails.PointsPerDollar}x)`}
                    </span>
                    <span className="stat-label">Rewards</span>
                </div>
                {(onOpenDateChange || openDate !== undefined) && (
                    <>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className={`stat-value ${!openDate ? 'not-set' : ''}`}>
                                {!openDate && (
                                    <Icon
                                        name="exclamation-triangle"
                                        variant="mini"
                                        size={16}
                                        color={ICON_RED}
                                        className="not-set-icon"
                                        aria-hidden="true"
                                    />
                                )}
                                {openDate || 'Not set'}
                            </span>
                            <span className="stat-label">
                                Open Date
                                {onOpenDateChange && (
                                    <button
                                        className="edit-date-inline-button"
                                        onClick={handleOpenDateModal}
                                        aria-label="Edit opening date"
                                        title="Edit opening date"
                                        type="button"
                                    >
                                        <Icon
                                            name="pencil"
                                            variant="mini"
                                            size={16}
                                            color={!openDate ? ICON_RED : ICON_GRAY}
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Tabs for switching between Multipliers, Credits, and Perks */}
            <div className="component-tabs">
                <button
                    className={`tab-button ${activeTab === 'multipliers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('multipliers')}
                    type="button"
                >
                    <span className="tab-label">Multipliers</span>
                    <span className="tab-count">{cardMultipliers?.length || 0}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'credits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('credits')}
                    type="button"
                >
                    <span className="tab-label">Credits</span>
                    <span className="tab-count">{cardCredits?.length || 0}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'perks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('perks')}
                    type="button"
                >
                    <span className="tab-label">Perks</span>
                    <span className="tab-count">{cardPerks?.length || 0}</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Multipliers Tab */}
                {activeTab === 'multipliers' && (
                    cardMultipliers && cardMultipliers.length > 0 ? (
                        <div className="multipliers-content">
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
                    ) : (
                        <div className="empty-tab-state">No multipliers available for this card</div>
                    )
                )}

                {/* Credits Tab */}
                {activeTab === 'credits' && (
                    cardCredits && cardCredits.length > 0 ? (
                        <div className="credits-grid">
                            {cardCredits.map((credit) => {
                                const isExpanded = expandedCredits.has(credit.id);
                                const isDisabled = isComponentDisabled(credit.id, COMPONENT_TYPES.CREDIT);

                                return (
                                    <div key={credit.id} className={`credit-card ${isExpanded ? 'expanded' : ''} ${isDisabled ? 'disabled' : ''}`}>
                                        <div className="credit-card-header">
                                            <div className="credit-title">
                                                {isDisabled && <span className="disabled-pill">Disabled</span>}
                                                {credit.Title}
                                            </div>
                                            <div className="credit-badges">
                                                <span className="credit-value-badge">${credit.Value}</span>
                                                <span className="credit-period-badge">{credit.TimePeriod}</span>
                                            </div>
                                        </div>
                                        {(credit.Category || credit.SubCategory) && (
                                            <span className="category-badge">
                                                {credit.Category}{credit.SubCategory ? ` › ${credit.SubCategory}` : ''}
                                            </span>
                                        )}
                                        <div className="credit-description">
                                            {credit.Description}
                                        </div>
                                        {(credit.Details || showTrackingPreferences) && (
                                            <button
                                                className="details-toggle"
                                                onClick={() => toggleCreditExpanded(credit.id)}
                                                type="button"
                                            >
                                                {isExpanded ? 'Hide Details' : 'Show Details'}
                                                <Icon
                                                    name="chevron-down"
                                                    variant="mini"
                                                    size={14}
                                                    className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}
                                                />
                                            </button>
                                        )}
                                        {isExpanded && (credit.Details || showTrackingPreferences) && (
                                            <div className="credit-details-section">
                                                {credit.Details && <p className="details-text">{credit.Details}</p>}
                                                {showTrackingPreferences && (
                                                    <div className="tracking-toggle">
                                                        <label className="toggle-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={!isDisabled}
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
                                                            {isDisabled ? 'Disabled' : 'Enabled'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-tab-state">No credits available for this card</div>
                    )
                )}

                {/* Perks Tab */}
                {activeTab === 'perks' && (
                    cardPerks && cardPerks.length > 0 ? (
                        <div className="perks-grid">
                            {cardPerks.map((perk) => {
                                const isExpanded = expandedPerks.has(perk.id);
                                const isDisabled = isComponentDisabled(perk.id, COMPONENT_TYPES.PERK);

                                return (
                                    <div key={perk.id} className={`perk-card ${isExpanded ? 'expanded' : ''} ${isDisabled ? 'disabled' : ''}`}>
                                        <div className="perk-card-header">
                                            <div className="perk-title">
                                                {isDisabled && <span className="disabled-pill">Disabled</span>}
                                                {perk.Title}
                                            </div>
                                        </div>
                                        {(perk.Category || perk.SubCategory) && (
                                            <span className="category-badge">
                                                {perk.Category}{perk.SubCategory ? ` › ${perk.SubCategory}` : ''}
                                            </span>
                                        )}
                                        <div className="perk-description">
                                            {perk.Description}
                                        </div>
                                        {(perk.Details || showTrackingPreferences) && (
                                            <button
                                                className="details-toggle"
                                                onClick={() => togglePerkExpanded(perk.id)}
                                                type="button"
                                            >
                                                {isExpanded ? 'Hide Details' : 'Show Details'}
                                                <Icon
                                                    name="chevron-down"
                                                    variant="mini"
                                                    size={14}
                                                    className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}
                                                />
                                            </button>
                                        )}
                                        {isExpanded && (perk.Details || showTrackingPreferences) && (
                                            <div className="perk-details-section">
                                                {perk.Details && <p className="details-text">{perk.Details}</p>}
                                                {showTrackingPreferences && (
                                                    <div className="tracking-toggle">
                                                        <label className="toggle-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={!isDisabled}
                                                                onChange={(e) => handleComponentDisabledChange(
                                                                    perk.id,
                                                                    COMPONENT_TYPES.PERK,
                                                                    !e.target.checked
                                                                )}
                                                                disabled={isLoadingPreferences}
                                                            />
                                                            <span className="toggle-slider"></span>
                                                        </label>
                                                        <span className="preference-label">
                                                            {isDisabled ? 'Disabled' : 'Enabled'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-tab-state">No perks available for this card</div>
                    )
                )}
            </div>

            {/* Open Date Edit Modal */}
            <Dialog open={isOpenDateModalOpen} onOpenChange={setIsOpenDateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Open Date</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <form onSubmit={handleSaveOpenDate}>
                            <DatePicker
                                value={editingOpenDateValue}
                                onChange={setEditingOpenDateValue}
                                placeholder="MM/DD/YYYY"
                                clearable={true}
                                disabled={false}
                            />
                        </form>
                    </DialogBody>
                    <DialogFooter>
                        <div className="button-group">
                            <button
                                type="submit"
                                className={`button ${isSavingOpenDate ? 'loading icon with-text' : ''}`}
                                disabled={isSavingOpenDate}
                                onClick={handleSaveOpenDate}
                            >
                                {isSavingOpenDate && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                                {isSavingOpenDate ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                className={`button outline ${isSavingOpenDate ? 'disabled' : ''}`}
                                onClick={() => setIsOpenDateModalOpen(false)}
                                disabled={isSavingOpenDate}
                            >
                                Cancel
                            </button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CreditCardDetailView;
