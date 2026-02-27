import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import showdown from 'showdown';
import Icon from '@/icons';
import { PRIMARY_MEDIUM, NEUTRAL_MEDIUM_GRAY } from '../../../types/Colors';
import { sanitizeMarkdownHtml } from '../../../utils/sanitizeMarkdown';
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
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const checkOverflow = useCallback(() => {
        const el = contentRef.current;
        if (el) {
            setIsOverflowing(el.scrollHeight > el.clientHeight);
        }
    }, []);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        checkOverflow();
        const observer = new ResizeObserver(checkOverflow);
        observer.observe(el);
        return () => observer.disconnect();
    }, [checkOverflow]);

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
                <Icon name="lotus" variant="solid" height={11} width={16} viewBox="0 80 512 345" color={PRIMARY_MEDIUM} />
                <h3 className="daily-digest__title">{title}</h3>
            </div>
            <div
                ref={contentRef}
                className="daily-digest__content"
                dangerouslySetInnerHTML={{ __html: sanitizeMarkdownHtml(converter, content) }}
            />
            {(generatedAt || onRegenerate) && (
                <div className={`daily-digest__footer${isOverflowing ? ' daily-digest__footer--shadow' : ''}`}>
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
