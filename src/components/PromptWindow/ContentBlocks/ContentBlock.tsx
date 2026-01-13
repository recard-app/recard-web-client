import React from 'react';
import { MessageContentBlock, CreditContent, CardContent } from '../../../types/ChatTypes';
import CreditBlock from './CreditBlock';
import CardBlock from './CardBlock';

interface ContentBlockProps {
    block: MessageContentBlock;
    onCardSelect: (blockId: string, cardId: string) => void;
}

/**
 * Container component that renders different types of content blocks
 * based on the contentType discriminator.
 * Each block maintains its own selectedCardId state.
 */
function ContentBlock({ block, onCardSelect }: ContentBlockProps): React.ReactElement | null {
    switch (block.contentType) {
        case 'credits':
            return <CreditBlock content={block.content as CreditContent} />;
        case 'card':
            return <CardBlock content={block.content as CardContent} />;
        default:
            return null;
    }
}

export default ContentBlock;
