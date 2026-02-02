import React, { useMemo } from 'react';
import showdown from 'showdown';
import Icon from '@/icons';
import { PRIMARY_MEDIUM, NEUTRAL_MEDIUM_GRAY } from '../../../types/Colors';
import './DailyDigest.scss';

interface DailyDigestProps {
    title: string;
    content: string;
    generatedAt?: string;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
}

/**
 * Formats an ISO date string to local time (e.g., "11:55am")
 */
const formatGeneratedTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * DailyDigest component displays an AI-generated daily summary of credit card benefits.
 * Renders markdown content using showdown converter.
 */
export const DailyDigest: React.FC<DailyDigestProps> = ({
    title,
    content,
    generatedAt,
    onRegenerate,
    isRegenerating = false
}) => {
    const converter = useMemo(() => {
        return new showdown.Converter({
            simpleLineBreaks: false,
            literalMidWordUnderscores: true,
            disableForced4SpacesIndentedSublists: true,
        });
    }, []);

    // Hide component if content is empty
    if (!content?.trim()) {
        return null;
    }

    return (
        <div className="daily-digest">
            <div className="daily-digest__header">
                <Icon name="calendar-days" variant="micro" size={12} color={PRIMARY_MEDIUM} />
                <h3 className="daily-digest__title">{title}</h3>
            </div>
            <div
                className="daily-digest__content"
                dangerouslySetInnerHTML={{ __html: converter.makeHtml(content) }}
            />
            {(generatedAt || onRegenerate) && (
                <div className="daily-digest__footer">
                    {generatedAt && (
                        <span className="daily-digest__timestamp">
                            Generated {formatGeneratedTime(generatedAt)}
                        </span>
                    )}
                    {onRegenerate && (
                        <button
                            className={`daily-digest__regenerate-button ${isRegenerating ? 'daily-digest__regenerate-button--loading' : ''}`}
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            title="Regenerate snapshot"
                        >
                            <Icon name="arrow-refresh" variant="micro" size={12} color={NEUTRAL_MEDIUM_GRAY} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyDigest;
