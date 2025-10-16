import React from 'react';
import { MessageContentBlock, SolutionContent, CreditContent, CardContent } from '../../../types/ChatTypes';
import { CreditCard } from '../../../types/CreditCardTypes';
import SolutionBlock from './SolutionBlock';
import CreditBlock from './CreditBlock';
import CardBlock from './CardBlock';

interface ContentBlockProps {
    block: MessageContentBlock;
    creditCards?: CreditCard[];
    onCardSelect: (blockId: string, cardId: string) => void;
}

/**
 * Container component that renders different types of content blocks
 * based on the contentType discriminator.
 * Each block maintains its own selectedCardId state.
 */
function ContentBlock({ block, creditCards, onCardSelect }: ContentBlockProps): React.ReactElement | null {
    switch (block.contentType) {
        case 'solutions':
            return (
                <SolutionBlock
                    content={block.content as SolutionContent}
                    creditCards={creditCards}
                    onCardSelect={(cardId) => onCardSelect(block.id, cardId)}
                />
            );
        case 'credits':
            return <CreditBlock content={block.content as CreditContent} />;
        case 'card':
            return <CardBlock content={block.content as CardContent} />;
        default:
            return null;
    }
}

export default ContentBlock;
