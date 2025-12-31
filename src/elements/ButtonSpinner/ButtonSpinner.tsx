import React from 'react';

interface ButtonSpinnerProps {
  className?: string;
}

/**
 * Small loading spinner for use inside buttons.
 * Inherits color from parent element via currentColor.
 */
const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({ className = '' }) => {
  return (
    <svg
      className={`button-spinner ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
};

export default ButtonSpinner;
