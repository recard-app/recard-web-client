import React from 'react';
import './ToggleBar.scss';

export interface ToggleBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const ToggleBar: React.FC<ToggleBarProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`toggle-bar ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export interface ToggleBarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: 'default' | 'small' | 'mini';
  variant?: 'default' | 'outline' | 'ghost';
}

export const ToggleBarButton: React.FC<ToggleBarButtonProps> = ({
  pressed,
  onPressedChange,
  size = 'small',
  variant = 'outline',
  className = '',
  children,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onPressedChange?.(!pressed);
  };

  const sizeClass = size === 'mini' ? 'mini' : size === 'small' ? 'small' : '';
  const variantClass = variant === 'outline' ? 'outline' : variant === 'ghost' ? 'ghost' : '';
  const activeClass = pressed ? 'active' : '';

  return (
    <button
      type="button"
      aria-pressed={!!pressed}
      data-pressed={pressed ? 'true' : 'false'}
      className={`toggle-bar-button ${sizeClass} ${variantClass} ${activeClass} ${className}`.trim()}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default ToggleBar;


