import React, { useState } from 'react';
import { Icon } from '../../../icons';
import { ICON_GRAY } from '../../../types';

interface HelpNavSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const HelpNavSection: React.FC<HelpNavSectionProps> = ({
  title,
  defaultExpanded = true,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="help-nav-section">
      <button
        type="button"
        className="help-nav-section__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="help-nav-section__title">{title}</span>
        <Icon
          name="chevron-down"
          variant="mini"
          size={14}
          color={ICON_GRAY}
          className={`help-nav-section__chevron ${isExpanded ? 'help-nav-section__chevron--expanded' : ''}`}
        />
      </button>
      <div
        className={`help-nav-section__content ${isExpanded ? '' : 'help-nav-section__content--collapsed'}`}
        aria-hidden={!isExpanded}
      >
        <div className="help-nav-section__content-inner">
          <div className="help-nav-section__content-padding">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpNavSection;
