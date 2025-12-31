import React from 'react';

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryGroup {
  title: string;
  description: string;
  terms: GlossaryTerm[];
}

const Glossary: React.FC = () => {
  const glossaryGroups: GlossaryGroup[] = [
    {
      title: 'Core Concepts',
      description: 'The building blocks of credit card benefits',
      terms: [
        {
          term: 'Card Components',
          definition: 'Each credit card can have three types of benefits: credits, perks, and multipliers. These are usually tied to specific spending categories like dining, travel, or groceries.'
        },
        {
          term: 'Credit',
          definition: 'A fixed-value benefit from your credit card that offsets purchases in specific categories. Unlike points, credits are "use it or lose it."'
        },
        {
          term: 'Perk',
          definition: 'A non-credit card benefit like lounge access, travel insurance, purchase protection, or elite status.'
        },
        {
          term: 'Multiplier',
          definition: 'The bonus earning rate for a spending category, expressed as a multiple (e.g., 3x points on dining) or percentage (e.g., 5% back on groceries).'
        },
        {
          term: 'Category',
          definition: 'A spending type that credits, perks, and multipliers apply to (e.g., dining, travel, groceries, gas, streaming).'
        }
      ]
    },
    {
      title: 'Credit Status',
      description: 'The different states a credit can be in',
      terms: [
        {
          term: 'Available',
          definition: 'A credit status indicating the credit is ready to use and has not been redeemed yet. Shown with a blue indicator.'
        },
        {
          term: 'Partial',
          definition: 'A credit status indicating some value has been used but the full amount hasn\'t been redeemed. Shown with a yellow indicator.'
        },
        {
          term: 'Used',
          definition: 'A credit status indicating the full value has been redeemed for the current period. Shown with a green indicator.'
        },
        {
          term: 'Inactive',
          definition: 'A credit that you\'ve chosen not to track. It won\'t appear in your stats or monthly summaries.'
        }
      ]
    },
    {
      title: 'Timing & Reset Periods',
      description: 'When and how often credits become available',
      terms: [
        {
          term: 'Period',
          definition: 'The time window for using a credit before it resets. Can be a month, quarter, half-year, or year.'
        },
        {
          term: 'Earning Frequency',
          definition: 'How often a credit resets and becomes available again: monthly, quarterly, semi-annually, or annually.'
        },
        {
          term: 'Quarterly',
          definition: 'Credits or bonuses that reset every three months: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec).'
        },
        {
          term: 'Semi-Annual',
          definition: 'Credits that reset twice per year: first half (January-June) and second half (July-December).'
        },
        {
          term: 'Calendar Year',
          definition: 'Credits that reset on January 1 for all cardholders, regardless of when the account was opened.'
        },
        {
          term: 'Anniversary Date',
          definition: 'The date you opened your credit card account. Some credits reset on this date rather than the calendar year.'
        },
        {
          term: 'Anniversary-Based',
          definition: 'Credits that reset on your card\'s anniversary date instead of January 1. Common for airline fee credits and some travel credits.'
        }
      ]
    },
    {
      title: 'Card Management',
      description: 'Terms related to organizing and managing your cards',
      terms: [
        {
          term: 'Preferred Card',
          definition: 'A card you\'ve designated as your go-to choice for a specific spending category. The AI will prioritize this card in recommendations.'
        },
        {
          term: 'Frozen',
          definition: 'A card state where the card is temporarily excluded from AI recommendations but remains in your portfolio.'
        }
      ]
    },
    {
      title: 'Multiplier Types',
      description: 'Different ways cards offer bonus rewards',
      terms: [
        {
          term: 'Selectable Multiplier',
          definition: 'A multiplier where you choose which category earns the bonus. Some cards let you pick one category, others let you select multiple. Your selection may be locked for a period or changeable anytime.'
        },
        {
          term: 'Rotating Multiplier',
          definition: 'Bonus categories that change every quarter on some cards. You may need to activate these categories to earn the bonus. Common on cashback cards like Chase Freedom and Discover it.'
        }
      ]
    }
  ];

  return (
    <div className="help-content">
      <h2>Glossary</h2>
      <p>
        Definitions for common terms used throughout the app, organized by topic.
      </p>

      <div className="glossary">
        {glossaryGroups.map(group => (
          <div key={group.title} className="glossary__group">
            <h3>{group.title}</h3>
            <p className="glossary__group-description">{group.description}</p>
            {group.terms.map(item => (
              <div key={item.term}>
                <p className="glossary__term">{item.term}</p>
                <p className="glossary__definition">{item.definition}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Glossary;
