import React from 'react';
import './CreditCardDetailView.scss';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import { PLACEHOLDER_CARD_IMAGE, ICON_WHITE, ICON_GRAY } from '../../types';
import { CardIcon } from '../../icons';
import { InfoDisplay } from '../../elements';
import { Icon } from '../../icons';

interface CreditCardDetailViewProps {
    cardDetails: CreditCardDetails | null;
    isLoading: boolean;
    onSetPreferred?: () => void;
    onRemoveCard?: () => void;
}

const CreditCardDetailView: React.FC<CreditCardDetailViewProps> = ({ 
    cardDetails, 
    isLoading, 
    onSetPreferred, 
    onRemoveCard 
}) => {
    // For initial load, show loading state
    if (isLoading) {
        return (
            <div className="card-details-loading">
                <InfoDisplay
                    type="loading"
                    message="Loading card details..."
                    showTitle={false}
                    transparent={true}
                />
            </div>
        );
    }
    
    if (!cardDetails) {
        return <div className="no-card-details">Select a card to view details</div>;
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
                    <p className="card-issuer">{cardDetails.CardIssuer}</p>
                    <p className="card-network">{cardDetails.CardNetwork}</p>
                    
                    {/* Preferred Card Button or Badge */}
                    <div className="card-actions">
                        <div className="card-action-buttons">
                            {onSetPreferred && (
                                <button 
                                    className={`preferred-button ${cardDetails.isDefaultCard ? 'is-preferred' : ''}`}
                                    onClick={onSetPreferred}
                                >
                                    <Icon 
                                        name="star"
                                        variant={cardDetails.isDefaultCard ? 'solid' : 'outline'}
                                        size={16}
                                        color={cardDetails.isDefaultCard ? ICON_WHITE : ICON_GRAY}
                                        className="preferred-icon"
                                    />
                                    {cardDetails.isDefaultCard ? 'Preferred Card' : 'Set as Preferred Card'}
                                </button>
                            )}
                            {onRemoveCard && (
                                <button 
                                    className="button destructive icon with-text"
                                    onClick={onRemoveCard}
                                >
                                    <Icon 
                                        name="delete"
                                        variant="mini"
                                        size={16}
                                        color={ICON_WHITE}
                                        className="delete-icon"
                                    />
                                    Remove Card
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Display the card's description/details */}
            {cardDetails.CardDetails && cardDetails.CardDetails.trim() !== '' && (
                <div className="card-description-section">
                    <p className="card-description">{cardDetails.CardDetails}</p>
                </div>
            )}
            
            <div className="card-info-section">
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
            
            {cardDetails.Multipliers && cardDetails.Multipliers.length > 0 && (
                <div className="card-section">
                    <h3>Reward Multipliers</h3>
                    <div className="multipliers-list">
                        {cardDetails.Multipliers.map((multiplier, index) => (
                            <div key={index} className="multiplier-item">
                                <div className="multiplier-name">{multiplier.Name}</div>
                                <div className="multiplier-value">{multiplier.Multiplier}x</div>
                                <div className="multiplier-desc">{multiplier.Description}</div>
                                {multiplier.Details && (
                                    <div className="multiplier-details">{multiplier.Details}</div>
                                )}
                                {(multiplier.Category || multiplier.SubCategory) && (
                                    <div className="multiplier-category">
                                        {multiplier.Category}{multiplier.SubCategory ? ` › ${multiplier.SubCategory}` : ''}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {cardDetails.Credits && cardDetails.Credits.length > 0 && (
                <div className="card-section">
                    <h3>Card Credits</h3>
                    <div className="credits-list">
                        {cardDetails.Credits.map((credit, index) => (
                            <div key={index} className="credit-item">
                                <div className="credit-header">
                                    <span className="credit-title">{credit.Title}</span>
                                    <span className="credit-value">{credit.Value}</span>
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
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {cardDetails.Perks && cardDetails.Perks.length > 0 && (
                <div className="card-section">
                    <h3>Card Perks</h3>
                    <div className="perks-list">
                        {cardDetails.Perks.map((perk, index) => (
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
