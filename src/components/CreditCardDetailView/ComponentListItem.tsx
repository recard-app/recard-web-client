import React from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import { ICON_GRAY, ICON_GRAY_DARK } from '../../types';

interface ComponentListItemProps {
    id: string;
    title: string;
    isDisabled?: boolean;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    hasExpandableContent: boolean;
    // Inline with title text
    rateBadge?: ReactNode;
    // Rendered on its own row below title, before description
    typeBadge?: ReactNode;

    // Below-title badges row (between title and description)
    infoBadges?: ReactNode;

    // Description text
    description?: string;

    // Below-description preview (collapsed state, e.g. rotating/selectable category previews)
    categoryPreview?: ReactNode;

    // Expanded content (render prop pattern)
    children?: ReactNode;
}

const ComponentListItem: React.FC<ComponentListItemProps> = ({
    id,
    title,
    isDisabled = false,
    isExpanded,
    onToggle,
    hasExpandableContent,
    rateBadge,
    typeBadge,
    infoBadges,
    description,
    categoryPreview,
    children,
}) => {
    const cardClasses = [
        'component-card',
        isExpanded ? 'expanded' : '',
        isDisabled ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses}>
            <div
                className="component-clickable-area"
                onClick={() => hasExpandableContent && onToggle(id)}
                role={hasExpandableContent ? 'button' : undefined}
                tabIndex={hasExpandableContent ? 0 : undefined}
                onKeyDown={(e) => hasExpandableContent && e.key === 'Enter' && onToggle(id)}
            >
                <div className="component-content">
                    <div className="component-header">
                        <div className="component-title-row">
                            {isDisabled && <Icon name="eye-closed" variant="solid" size={20} color={ICON_GRAY_DARK} />}
                            {rateBadge}
                            <span className="component-title-text">{title}</span>
                        </div>
                    </div>
                    {typeBadge}
                    {infoBadges && (
                        <div className="component-info-badges">
                            {infoBadges}
                        </div>
                    )}
                    {description && (
                        <div className="component-description">
                            {description}
                        </div>
                    )}
                    {categoryPreview}
                </div>
                {hasExpandableContent && (
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
            {isExpanded && hasExpandableContent && (
                <div className="component-details-section">
                    {children}
                </div>
            )}
        </div>
    );
};

export default ComponentListItem;
