import React from 'react';
import { Icon } from '../../../icons';

interface OnboardingHeaderProps {
  icon: string;
  title: string;
  description: string;
  largeTitle?: boolean;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ icon, title, description, largeTitle }) => {
  const titleClass = largeTitle
    ? 'onboarding-step__title onboarding-step__title--large'
    : 'onboarding-step__title';

  return (
    <div className="onboarding-header">
      <div className="onboarding-header__top">
        <div className="onboarding-header__icon">
          <Icon name={icon} variant="solid" size={18} />
        </div>
        <h2 className={titleClass}>{title}</h2>
      </div>
      <p className="onboarding-step__subtitle">{description}</p>
    </div>
  );
};

export default OnboardingHeader;
