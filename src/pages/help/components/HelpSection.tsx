import React, { useState } from 'react';
import { Icon } from '../../../icons';
import { ICON_GRAY } from '../../../types';

interface HelpSectionProps {
  title: string;
  id?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  id,
  defaultExpanded = true,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="help-section" id={id}>
      <button
        type="button"
        className="help-section__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h3 className="help-section__title">{title}</h3>
        <Icon
          name="chevron-down"
          variant="mini"
          size={16}
          color={ICON_GRAY}
          className={`help-section__chevron ${isExpanded ? 'help-section__chevron--expanded' : ''}`}
        />
      </button>
      <div
        className={`help-section__content ${isExpanded ? '' : 'help-section__content--collapsed'}`}
        aria-hidden={!isExpanded}
      >
        <div className="help-section__content-inner">
          <div className="help-section__content-padding">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;
