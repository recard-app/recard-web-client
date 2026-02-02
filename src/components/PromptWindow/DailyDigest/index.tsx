import React, { useMemo } from 'react';
import showdown from 'showdown';
import Icon from '@/icons';
import { PRIMARY_MEDIUM } from '../../../types/Colors';
import './DailyDigest.scss';

interface DailyDigestProps {
    title: string;
    content: string;
}

/**
 * DailyDigest component displays an AI-generated daily summary of credit card benefits.
 * Renders markdown content using showdown converter.
 */
export const DailyDigest: React.FC<DailyDigestProps> = ({ title, content }) => {
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
        </div>
    );
};

export default DailyDigest;
