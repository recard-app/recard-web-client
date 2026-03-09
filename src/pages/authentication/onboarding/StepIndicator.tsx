import React from 'react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number; // 1-based
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        let className = 'step-indicator__dot';
        if (step === currentStep) {
          className += ' step-indicator__dot--active';
        } else if (step < currentStep) {
          className += ' step-indicator__dot--completed';
        }
        return <div key={step} className={className} />;
      })}
    </div>
  );
};

export default StepIndicator;
