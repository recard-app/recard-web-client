import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './CreditCardDetailView.scss';
import { CreditCardDetails, EnrichedMultiplier, CreditCard, isRotatingMultiplier, isSelectableMultiplier } from '../../types/CreditCardTypes';
import { UserComponentTrackingPreferences, ComponentType, COMPONENT_TYPES } from '../../types/CardCreditsTypes';
import { ICON_RED, ICON_GRAY, ICON_PRIMARY, LOADING_ICON, LOADING_ICON_SIZE } from '../../types';
import { COLORS } from '../../types/Colors';
import { CardIcon } from '../../icons';
import { InfoDisplay, DatePicker } from '../../elements';
import CardDetailSkeleton from './CardDetailSkeleton';
import { Icon, createIconVariant } from '../../icons';
import { UserComponentService } from '../../services/UserServices';
import { useCreditsByCardId, usePerksByCardId, useMultipliersByCardId, useComponents } from '../../contexts/useComponents';
import { MultiplierBadge, CurrentCategoryDisplay, CategorySelector } from '../multipliers';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '../ui/dialog/dialog';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '../ui/dropdown-menu/dropdown-menu';

import type { TabType } from './cardTabs';

// Dropdown menu icon factories
const CARD_ACTION_ICONS = {
    PREFERRED: (props: any = {}) => createIconVariant('star', 'solid', ICON_GRAY, props.size),
    FREEZE: (props: any = {}) => createIconVariant('snowflake', 'solid', ICON_GRAY, props.size),
    CALENDAR: (props: any = {}) => createIconVariant('calendar-days', 'micro', ICON_GRAY, props.size),
    DELETE: (props: any = {}) => createIconVariant('delete', 'mini', ICON_RED, props.size),
};

interface CreditCardDetailViewProps {
    cardDetails: CreditCardDetails | null;
    isLoading: boolean;
    isAddingCard?: boolean;
    cardBeingAdded?: CreditCard | null;
    isRemovingCard?: boolean;
    cardBeingRemoved?: CreditCard | null;
    onSetPreferred?: () => void;
    isSettingPreferred?: boolean; // Loading state for setting preferred
    onRemoveCard?: () => void;
    noCards?: boolean;
    showTrackingPreferences?: boolean; // Controls whether to show credit tracking preferences
    onPreferencesUpdate?: () => Promise<void>; // Called when preferences are updated
    openDate?: string | null; // Card open/anniversary date (MM/DD/YYYY)
    onOpenDateChange?: (date: string | null) => Promise<void>; // Called when open date changes
    isFrozen?: boolean; // Whether the card is frozen (excluded from LLM context)
    onFreezeToggle?: () => void; // Called when freeze state is toggled
    initialTab?: TabType; // Initial tab to display when opening the view
    hideInlineTabs?: boolean; // When true, hides the inline pill tab toggle (mobile)
    externalActiveTab?: TabType; // Controlled tab from parent (mobile)
}

const CreditCardDetailView: React.FC<CreditCardDetailViewProps> = ({
    cardDetails,
    isLoading,
    isAddingCard = false,
    cardBeingAdded = null,
    isRemovingCard = false,
    cardBeingRemoved = null,
    onSetPreferred,
    isSettingPreferred = false,
    onRemoveCard,
    noCards = false,
    showTrackingPreferences = false,
    onPreferencesUpdate,
    openDate,
    onOpenDateChange,
    isFrozen = false,
    onFreezeToggle,
    initialTab = 'multipliers',
    hideInlineTabs = false,
    externalActiveTab,
}) => {
    // Get component data from ComponentsContext using the card ID
    const cardCredits = useCreditsByCardId(cardDetails?.id || '');
    const cardPerks = usePerksByCardId(cardDetails?.id || '');
    const cardMultipliers = useMultipliersByCardId(cardDetails?.id || '');
    const { updateMultiplierSelection } = useComponents();

    const [componentPreferences, setComponentPreferences] = useState<UserComponentTrackingPreferences | null>(null);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

    // Tab state for switching between multipliers, credits, and perks
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    // Derive effective tab: external (mobile) takes priority over internal state
    const effectiveTab: TabType = externalActiveTab ?? activeTab;

    // Update tab when initialTab prop changes (e.g., opening from different contexts)
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    // Expandable state for multipliers, credits and perks
    const [expandedMultipliers, setExpandedMultipliers] = useState<Set<string>>(new Set());
    const [expandedCredits, setExpandedCredits] = useState<Set<string>>(new Set());
    const [expandedPerks, setExpandedPerks] = useState<Set<string>>(new Set());

    // Reset expanded states when card changes
    useEffect(() => {
        setExpandedMultipliers(new Set());
        setExpandedCredits(new Set());
        setExpandedPerks(new Set());
    }, [cardDetails?.id]);

    const toggleMultiplierExpanded = (id: string) => {
        setExpandedMultipliers(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

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

    // Detect if changing the open date would reset anniversary credits
    const getMonthDay = (date: string | null | undefined): string | null => {
        if (!date) return null;
        const parts = date.split('/');
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
    };
    const hasAnniversaryCredits = cardCredits.some(c => c.isAnniversaryBased);
    const willResetAnniversary = hasAnniversaryCredits
        && !!openDate
        && !!editingOpenDateValue
        && getMonthDay(openDate) !== getMonthDay(editingOpenDateValue);
    const willClearAnniversary = hasAnniversaryCredits
        && !!openDate
        && editingOpenDateValue === null;

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

        // Client-side validation for non-null dates
        if (editingOpenDateValue) {
            const parts = editingOpenDateValue.split('/');
            if (parts.length !== 3) {
                toast.error('Date must be in MM/DD/YYYY format.');
                return;
            }
            const [month, day, year] = parts.map(Number);
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                toast.error('Please enter a valid calendar date.');
                return;
            }
            if (year < 2024) {
                toast.error('Start date must be year 2024 or later.');
                return;
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date > today) {
                toast.error('Start date cannot be in the future.');
                return;
            }
        }

        setIsSavingOpenDate(true);
        try {
            await onOpenDateChange(editingOpenDateValue);
            setIsOpenDateModalOpen(false);
            toast.success('Start date updated.');
        } catch {
            toast.error('Failed to update start date. Please try again.');
        } finally {
            setIsSavingOpenDate(false);
        }
    };

    // Priority order for loading states:
    // 1. Adding a card
    // 2. Removing a card
    // 3. Loading card details
    // 4. No card selected

    if (isAddingCard || isRemovingCard || isLoading) {
        return <CardDetailSkeleton />;
    }

    if (!cardDetails) {
        return <div className="no-card-details">{noCards ? 'Add your Credit Cards to get started' : 'Select a card to view details'}</div>;
    }

    return (
        <div className="card-details">
            {/* Overview sections: showcase, description, stats - hidden on mobile when non-overview tab active */}
            {(!hideInlineTabs || effectiveTab === 'overview') && (<>
            {/* Card Showcase Header */}
            <div className="card-showcase-wrapper">
            <div
                className="card-showcase"
                style={cardDetails.CardPrimaryColor ? {
                    '--showcase-solid': `color-mix(in srgb, ${cardDetails.CardPrimaryColor} 8%, white)`,
                    '--showcase-gradient': `linear-gradient(to bottom, color-mix(in srgb, ${cardDetails.CardPrimaryColor} 12%, white), white)`,
                } as React.CSSProperties : undefined}
            >
                {/* Card Actions Dropdown -- top-right of showcase */}
                {(onSetPreferred || onFreezeToggle || onOpenDateChange || onRemoveCard) && (
                <div className="showcase-actions">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="card-actions-trigger" aria-label="Card actions" type="button">
                            <Icon name="pencil" variant="solid" size={16} color={ICON_GRAY} aria-hidden="true" />
                            <span className="card-actions-trigger-text">Edit Card</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onSetPreferred && (
                            <DropdownMenuItem
                                onClick={onSetPreferred}
                                disabled={isSettingPreferred}
                                icon={CARD_ACTION_ICONS.PREFERRED}
                            >
                                {cardDetails.isDefaultCard ? 'Remove Preferred' : 'Set Preferred'}
                            </DropdownMenuItem>
                        )}
                        {onFreezeToggle && (
                            <DropdownMenuItem
                                onClick={onFreezeToggle}
                                icon={CARD_ACTION_ICONS.FREEZE}
                            >
                                {isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
                            </DropdownMenuItem>
                        )}
                        {onOpenDateChange && (
                            <DropdownMenuItem
                                onClick={handleOpenDateModal}
                                icon={CARD_ACTION_ICONS.CALENDAR}
                            >
                                {openDate ? 'Edit Start Date' : 'Set Start Date'}
                            </DropdownMenuItem>
                        )}
                        {onRemoveCard && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onRemoveCard}
                                    variant="destructive"
                                    icon={CARD_ACTION_ICONS.DELETE}
                                >
                                    Remove Card
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
                )}

                <div className="showcase-identity">
                    <CardIcon
                        title={`${cardDetails.CardName} card`}
                        size={64}
                        primary={cardDetails.CardPrimaryColor}
                        secondary={cardDetails.CardSecondaryColor}
                        className="card-image"
                    />
                    <div className="showcase-info">
                        <h2>{cardDetails.CardName}</h2>
                        {(cardDetails.isDefaultCard || isFrozen) && (
                            <div className="showcase-badges">
                                {cardDetails.isDefaultCard && (
                                    <span className="badge badge-preferred">
                                        <Icon name="star" variant="solid" size={12} aria-hidden="true" />
                                        Preferred
                                    </span>
                                )}
                                {isFrozen && (
                                    <span className="badge badge-frozen">
                                        <Icon name="snowflake" variant="solid" size={12} aria-hidden="true" />
                                        Frozen
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="card-footer">
                <div className="meta-item">
                    <span className="meta-label">Issuer</span>
                    <span className="meta-value">{cardDetails.CardIssuer}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Network</span>
                    <span className="meta-value">{cardDetails.CardNetwork}</span>
                </div>
            </div>
            </div>

            {/* Card Description (if available) */}
            {cardDetails.CardDetails && cardDetails.CardDetails.trim() !== '' && (
                <p className="card-description">
                    {cardDetails.CardDetails}
                </p>
            )}

            {/* Stats Grid */}
            <div className="card-stats-grid">
                <div className="stat-tile">
                    <div className="stat-icon-wrap">
                        <Icon name="banknotes" variant="mini" size={16} color={ICON_GRAY} aria-hidden="true" />
                    </div>
                    <span className="stat-value">{cardDetails.AnnualFee !== null ? `$${cardDetails.AnnualFee}` : '$0'}</span>
                    <span className="stat-label">Annual Fee</span>
                </div>
                <div className="stat-tile">
                    <div className="stat-icon-wrap">
                        <Icon name="globe-alt" variant="mini" size={16} color={ICON_GRAY} aria-hidden="true" />
                    </div>
                    <span className="stat-value">{cardDetails.ForeignExchangeFee || 'None'}</span>
                    <span className="stat-label">FX Fee</span>
                </div>
                <div className="stat-tile">
                    <div className="stat-icon-wrap">
                        <Icon name="arrow-trending-up" variant="mini" size={16} color={ICON_GRAY} aria-hidden="true" />
                    </div>
                    <span className="stat-value">{cardDetails.RewardsCurrency || 'N/A'}</span>
                    <span className="stat-label">Rewards</span>
                </div>
                {(onOpenDateChange || openDate !== undefined) && (
                    <div className="stat-tile">
                        <div className="stat-icon-wrap">
                            <Icon name="calendar" variant="mini" size={16} color={ICON_GRAY} aria-hidden="true" />
                        </div>
                        <span className={`stat-value${!openDate ? ' not-set' : ''}`}>
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
                        <span className="stat-label">Start Date</span>
                    </div>
                )}
            </div>

            </>)}

            {/* Tabs for switching between Multipliers, Credits, and Perks */}
            {!hideInlineTabs && (
            <div className="component-tabs">
                <button
                    className={`tab-button ${effectiveTab === 'multipliers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('multipliers')}
                    type="button"
                >
                    <span className="tab-label">Multipliers</span>
                    <span className="tab-count">{cardMultipliers?.length || 0}</span>
                </button>
                <button
                    className={`tab-button ${effectiveTab === 'credits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('credits')}
                    type="button"
                >
                    <span className="tab-label">Credits</span>
                    <span className="tab-count">{cardCredits?.length || 0}</span>
                </button>
                <button
                    className={`tab-button ${effectiveTab === 'perks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('perks')}
                    type="button"
                >
                    <span className="tab-label">Perks</span>
                    <span className="tab-count">{cardPerks?.length || 0}</span>
                </button>
            </div>
            )}

            {/* Tab Content */}
            <div className="tab-content">
                {/* Multipliers Tab */}
                {effectiveTab === 'multipliers' && (
                    cardMultipliers && cardMultipliers.length > 0 ? (
                        <div className="multipliers-content">
                            <div className="multipliers-table">
                                {Array.from(
                                    cardMultipliers.reduce((map, m) => {
                                        // For rotating/selectable, use the multiplier name as category since they're dynamic
                                        const key = (isRotatingMultiplier(m) || isSelectableMultiplier(m))
                                            ? 'Dynamic Categories'
                                            : (m.Category && m.Category.trim() !== '') ? m.Category : 'Other';
                                        if (!map.has(key)) map.set(key, [] as EnrichedMultiplier[]);
                                        map.get(key)!.push(m);
                                        return map;
                                    }, new Map<string, EnrichedMultiplier[]>())
                                ).map(([category, items]) => {
                                    const mainItems = items.filter(i => !i.SubCategory || i.SubCategory.trim() === '');
                                    const subItems = items.filter(i => i.SubCategory && i.SubCategory.trim() !== '');
                                    return (
                                        <div key={category} className="category-group">
                                            <div className="category-title">{category}</div>
                                            <div className="table">
                                                {mainItems.map((m, idx) => {
                                                    const isExpanded = expandedMultipliers.has(m.id);
                                                    const isDisabled = isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER);
                                                    const isRotating = isRotatingMultiplier(m);
                                                    const isSelectable = isSelectableMultiplier(m);
                                                    const hasExpandableContent = m.Requirements || m.Details || showTrackingPreferences || isRotating || isSelectable;

                                                    return (
                                                        <div key={m.id ?? `main-${idx}`} className={`table-row main-row${isDisabled ? ' disabled' : ''}${isExpanded ? ' expanded' : ''}`}>
                                                            <div
                                                                className={`multiplier-row-clickable${hasExpandableContent ? ' has-expandable' : ''}`}
                                                                onClick={() => hasExpandableContent && toggleMultiplierExpanded(m.id)}
                                                                role={hasExpandableContent ? 'button' : undefined}
                                                                tabIndex={hasExpandableContent ? 0 : undefined}
                                                                onKeyDown={(e) => hasExpandableContent && e.key === 'Enter' && toggleMultiplierExpanded(m.id)}
                                                            >
                                                                <div className="cell rate">
                                                                    {m.Multiplier !== null ? (
                                                                        <span className="rate-badge">{m.Multiplier}x</span>
                                                                    ) : '—'}
                                                                </div>
                                                                <div className="cell subcategory">
                                                                    {isDisabled && (
                                                                        <span className="disabled-pill">Disabled</span>
                                                                    )}
                                                                    {m.Name}
                                                                    <MultiplierBadge multiplierType={m.multiplierType} />
                                                                </div>
                                                                <div className="cell description">
                                                                    <div className="multiplier-desc">{m.Description}</div>
                                                                    {isRotating && m.currentSchedules && m.currentSchedules.length > 0 && (
                                                                        <div className="rotating-category-preview">
                                                                            <span className="category-label">Current:</span>
                                                                            <div className="category-values">
                                                                                {m.currentSchedules.map((schedule, scheduleIdx) => (
                                                                                    <span key={schedule.id || scheduleIdx} className="category-value">
                                                                                        {schedule.title}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {isSelectable && m.userSelectedCategory && (
                                                                        <div className="selected-category-preview">
                                                                            <span className="category-label">Your category:</span>
                                                                            <span className="category-value">{m.userSelectedCategory.displayName}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {hasExpandableContent && (
                                                                    <div className="cell chevron">
                                                                        <Icon
                                                                            name="chevron-down"
                                                                            variant="mini"
                                                                            size={20}
                                                                            color={ICON_GRAY}
                                                                            className={`toggle-icon${isExpanded ? ' rotated' : ''}`}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isExpanded && hasExpandableContent && (
                                                                <div className="multiplier-expanded-content">
                                                                    {/* Rotating: Show current schedules */}
                                                                    {isRotating && m.currentSchedules && m.currentSchedules.length > 0 && m.currentSchedules.map((schedule, scheduleIdx) => (
                                                                        <CurrentCategoryDisplay key={schedule.id || scheduleIdx} scheduleEntry={schedule} />
                                                                    ))}
                                                                    {isRotating && (!m.currentSchedules || m.currentSchedules.length === 0) && (
                                                                        <div className="multiplier-no-schedule">
                                                                            No category scheduled for current period
                                                                        </div>
                                                                    )}
                                                                    {/* Selectable: Show category selector */}
                                                                    {isSelectable && m.allowedCategories && m.allowedCategories.length > 0 && (
                                                                        <div className="multiplier-category-selector">
                                                                            <span className="selector-label">Your Category:</span>
                                                                            <CategorySelector
                                                                                allowedCategories={m.allowedCategories}
                                                                                selectedCategoryId={m.userSelectedCategory?.id || m.allowedCategories[0]?.id || ''}
                                                                                onSelect={(categoryId) => updateMultiplierSelection(m.id, categoryId)}
                                                                                disabled={!showTrackingPreferences}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {m.Requirements && (
                                                                        <div className="multiplier-requirements">
                                                                            <span className="label">Requirements:</span> {m.Requirements}
                                                                        </div>
                                                                    )}
                                                                    {m.Details && (
                                                                        <div className="multiplier-details-text">
                                                                            <span className="label">Details:</span> {m.Details}
                                                                        </div>
                                                                    )}
                                                                    {showTrackingPreferences && (
                                                                        <div className="tracking-toggle">
                                                                            <label className="toggle-switch">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!isDisabled}
                                                                                    onChange={(e) => handleComponentDisabledChange(
                                                                                        m.id,
                                                                                        COMPONENT_TYPES.MULTIPLIER,
                                                                                        !e.target.checked
                                                                                    )}
                                                                                    disabled={isLoadingPreferences}
                                                                                />
                                                                                <span className="toggle-slider"></span>
                                                                            </label>
                                                                            <span className="preference-label">
                                                                                {isDisabled ? 'Multiplier Inactive' : 'Multiplier Active'}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {subItems.map((m, idx) => {
                                                    const isExpanded = expandedMultipliers.has(m.id);
                                                    const isDisabled = isComponentDisabled(m.id, COMPONENT_TYPES.MULTIPLIER);
                                                    const isRotating = isRotatingMultiplier(m);
                                                    const isSelectable = isSelectableMultiplier(m);
                                                    const hasExpandableContent = m.Requirements || m.Details || showTrackingPreferences || isRotating || isSelectable;

                                                    return (
                                                        <div key={m.id ?? `sub-${idx}-${m.SubCategory}`} className={`table-row sub-row${isDisabled ? ' disabled' : ''}${isExpanded ? ' expanded' : ''}`}>
                                                            <div
                                                                className={`multiplier-row-clickable${hasExpandableContent ? ' has-expandable' : ''}`}
                                                                onClick={() => hasExpandableContent && toggleMultiplierExpanded(m.id)}
                                                                role={hasExpandableContent ? 'button' : undefined}
                                                                tabIndex={hasExpandableContent ? 0 : undefined}
                                                                onKeyDown={(e) => hasExpandableContent && e.key === 'Enter' && toggleMultiplierExpanded(m.id)}
                                                            >
                                                                <div className="cell rate">
                                                                    {m.Multiplier !== null ? (
                                                                        <span className="rate-badge">{m.Multiplier}x</span>
                                                                    ) : '—'}
                                                                </div>
                                                                <div className="cell subcategory">
                                                                    {isDisabled && (
                                                                        <span className="disabled-pill">Disabled</span>
                                                                    )}
                                                                    {m.Name}
                                                                    <MultiplierBadge multiplierType={m.multiplierType} />
                                                                </div>
                                                                <div className="cell description">
                                                                    <div className="multiplier-desc">{m.Description}</div>
                                                                    {isRotating && m.currentSchedules && m.currentSchedules.length > 0 && (
                                                                        <div className="rotating-category-preview">
                                                                            <span className="category-label">Current:</span>
                                                                            <div className="category-values">
                                                                                {m.currentSchedules.map((schedule, scheduleIdx) => (
                                                                                    <span key={schedule.id || scheduleIdx} className="category-value">
                                                                                        {schedule.title}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {isSelectable && m.userSelectedCategory && (
                                                                        <div className="selected-category-preview">
                                                                            <span className="category-label">Your category:</span>
                                                                            <span className="category-value">{m.userSelectedCategory.displayName}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {hasExpandableContent && (
                                                                    <div className="cell chevron">
                                                                        <Icon
                                                                            name="chevron-down"
                                                                            variant="mini"
                                                                            size={20}
                                                                            color={ICON_GRAY}
                                                                            className={`toggle-icon${isExpanded ? ' rotated' : ''}`}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isExpanded && hasExpandableContent && (
                                                                <div className="multiplier-expanded-content">
                                                                    {/* Rotating: Show current schedules */}
                                                                    {isRotating && m.currentSchedules && m.currentSchedules.length > 0 && m.currentSchedules.map((schedule, scheduleIdx) => (
                                                                        <CurrentCategoryDisplay key={schedule.id || scheduleIdx} scheduleEntry={schedule} />
                                                                    ))}
                                                                    {isRotating && (!m.currentSchedules || m.currentSchedules.length === 0) && (
                                                                        <div className="multiplier-no-schedule">
                                                                            No category scheduled for current period
                                                                        </div>
                                                                    )}
                                                                    {/* Selectable: Show category selector */}
                                                                    {isSelectable && m.allowedCategories && m.allowedCategories.length > 0 && (
                                                                        <div className="multiplier-category-selector">
                                                                            <span className="selector-label">Your Category:</span>
                                                                            <CategorySelector
                                                                                allowedCategories={m.allowedCategories}
                                                                                selectedCategoryId={m.userSelectedCategory?.id || m.allowedCategories[0]?.id || ''}
                                                                                onSelect={(categoryId) => updateMultiplierSelection(m.id, categoryId)}
                                                                                disabled={!showTrackingPreferences}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {m.Requirements && (
                                                                        <div className="multiplier-requirements">
                                                                            <span className="label">Requirements:</span> {m.Requirements}
                                                                        </div>
                                                                    )}
                                                                    {m.Details && (
                                                                        <div className="multiplier-details-text">
                                                                            <span className="label">Details:</span> {m.Details}
                                                                        </div>
                                                                    )}
                                                                    {showTrackingPreferences && (
                                                                        <div className="tracking-toggle">
                                                                            <label className="toggle-switch">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!isDisabled}
                                                                                    onChange={(e) => handleComponentDisabledChange(
                                                                                        m.id,
                                                                                        COMPONENT_TYPES.MULTIPLIER,
                                                                                        !e.target.checked
                                                                                    )}
                                                                                    disabled={isLoadingPreferences}
                                                                                />
                                                                                <span className="toggle-slider"></span>
                                                                            </label>
                                                                            <span className="preference-label">
                                                                                {isDisabled ? 'Multiplier Inactive' : 'Multiplier Active'}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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
                {effectiveTab === 'credits' && (
                    cardCredits && cardCredits.length > 0 ? (
                        <div className="credits-grid">
                            {cardCredits.map((credit) => {
                                const isExpanded = expandedCredits.has(credit.id);
                                const isDisabled = isComponentDisabled(credit.id, COMPONENT_TYPES.CREDIT);
                                const hasDetails = credit.Requirements || credit.Details || showTrackingPreferences || credit.Category || credit.SubCategory;

                                return (
                                    <div key={credit.id} className={`component-card ${isExpanded ? 'expanded' : ''} ${isDisabled ? 'disabled' : ''}`}>
                                        <div
                                            className="component-clickable-area"
                                            onClick={() => toggleCreditExpanded(credit.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && toggleCreditExpanded(credit.id)}
                                        >
                                            <div className="component-content">
                                                <div className="component-header">
                                                    <div className="component-title">
                                                        {isDisabled && <span className="disabled-pill">Disabled</span>}
                                                        {credit.Title}
                                                    </div>
                                                </div>
                                                <div className="component-value-info">
                                                    <span className="value-badge">${credit.Value}</span>
                                                    <span className="period-badge">{credit.isAnniversaryBased ? 'Anniversary' : credit.TimePeriod}</span>
                                                </div>
                                                <div className="component-description">
                                                    {credit.Description}
                                                </div>
                                            </div>
                                            {hasDetails && (
                                                <div className="component-chevron">
                                                    <Icon
                                                        name="chevron-down"
                                                        variant="mini"
                                                        size={20}
                                                        color={ICON_GRAY}
                                                        className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {isExpanded && hasDetails && (
                                            <div className="component-details-section">
                                                {credit.Requirements && (
                                                    <div className="component-requirements">
                                                        <span className="label">Requirements:</span> {credit.Requirements}
                                                    </div>
                                                )}
                                                {credit.Details && (
                                                    <div className="component-details-text">
                                                        <span className="label">Details:</span> {credit.Details}
                                                    </div>
                                                )}
                                                {credit.isAnniversaryBased && (
                                                    <div className="component-anniversary-note">
                                                        <span className="label">Note:</span> This credit renews annually on your card's anniversary date rather than the calendar year.
                                                    </div>
                                                )}
                                                {(credit.Category || credit.SubCategory) && (
                                                    <span className="category-badge">
                                                        {credit.Category}{credit.SubCategory ? ` › ${credit.SubCategory}` : ''}
                                                    </span>
                                                )}
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
                                                            {isDisabled ? 'Not Tracking Credit' : 'Tracking Credit'}
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
                {effectiveTab === 'perks' && (
                    cardPerks && cardPerks.length > 0 ? (
                        <div className="perks-grid">
                            {cardPerks.map((perk) => {
                                const isExpanded = expandedPerks.has(perk.id);
                                const isDisabled = isComponentDisabled(perk.id, COMPONENT_TYPES.PERK);
                                const hasDetails = perk.Requirements || perk.Details || showTrackingPreferences || perk.Category || perk.SubCategory;

                                return (
                                    <div key={perk.id} className={`component-card ${isExpanded ? 'expanded' : ''} ${isDisabled ? 'disabled' : ''}`}>
                                        <div
                                            className="component-clickable-area"
                                            onClick={() => togglePerkExpanded(perk.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && togglePerkExpanded(perk.id)}
                                        >
                                            <div className="component-content">
                                                <div className="component-header">
                                                    <div className="component-title">
                                                        {isDisabled && <span className="disabled-pill">Disabled</span>}
                                                        {perk.Title}
                                                    </div>
                                                </div>
                                                {(perk.Category || perk.SubCategory) && (
                                                    <span className="category-badge">
                                                        {perk.Category}{perk.SubCategory ? ` › ${perk.SubCategory}` : ''}
                                                    </span>
                                                )}
                                                <div className="component-description">
                                                    {perk.Description}
                                                </div>
                                            </div>
                                            {hasDetails && (
                                                <div className="component-chevron">
                                                    <Icon
                                                        name="chevron-down"
                                                        variant="mini"
                                                        size={20}
                                                        color={ICON_GRAY}
                                                        className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {isExpanded && hasDetails && (
                                            <div className="component-details-section">
                                                {perk.Requirements && (
                                                    <div className="component-requirements">
                                                        <span className="label">Requirements:</span> {perk.Requirements}
                                                    </div>
                                                )}
                                                {perk.Details && (
                                                    <div className="component-details-text">
                                                        <span className="label">Details:</span> {perk.Details}
                                                    </div>
                                                )}
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
                                                            {isDisabled ? 'Perk Inactive' : 'Perk Active'}
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

            {/* Start Date Edit Modal */}
            <Dialog open={isOpenDateModalOpen} onOpenChange={setIsOpenDateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Start Date</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <form onSubmit={handleSaveOpenDate}>
                            <DatePicker
                                value={editingOpenDateValue}
                                onChange={setEditingOpenDateValue}
                                placeholder="MM/DD/YYYY"
                                disabled={false}
                                min="2024-01-01"
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {editingOpenDateValue && (
                                <button
                                    type="button"
                                    className="clear-date-link"
                                    onClick={() => setEditingOpenDateValue(null)}
                                >
                                    Clear date
                                </button>
                            )}
                        </form>
                        {(willResetAnniversary || willClearAnniversary) && (
                            <div className="open-date-reset-warning">
                                <InfoDisplay
                                    type="warning"
                                    message={willClearAnniversary
                                        ? 'Clearing your start date will reset anniversary credit tracking and revert to the default calendar year.'
                                        : 'Changing the month/day of your start date will reset anniversary credit tracking for this card.'}
                                    showTitle={false}
                                />
                            </div>
                        )}
                    </DialogBody>
                    <DialogFooter>
                        <div className="button-group">
                            <button
                                type="button"
                                className={`button outline ${isSavingOpenDate ? 'disabled' : ''}`}
                                onClick={() => setIsOpenDateModalOpen(false)}
                                disabled={isSavingOpenDate}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`button ${isSavingOpenDate ? 'loading icon with-text' : ''}`}
                                disabled={isSavingOpenDate}
                                onClick={handleSaveOpenDate}
                            >
                                {isSavingOpenDate && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                                {isSavingOpenDate ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CreditCardDetailView;
