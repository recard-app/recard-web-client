import React, { useState, useRef, useEffect, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import './Elements.scss';
import { TEMP_ICON } from '../types';

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="toggle-container">
      <label htmlFor={id}>{label}</label>
      <label className="toggle-switch">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

// Define a type for elements with onClick handlers
interface WithOnClick {
  props: {
    onClick?: (e: React.MouseEvent) => void;
  };
}

// New component for dropdown menu items with icons
export interface DropdownItemProps {
  icon?: string; // Optional icon URL
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  icon, // Changed from default value to truly optional
  className = '',
  onClick,
  children
}) => {
  return (
    <button className={`dropdown-item ${className} ${!icon ? 'no-icon' : ''}`} onClick={onClick}>
      {icon && <img src={icon} alt="" className="dropdown-item-icon" />}
      <span className="dropdown-item-text">{children}</span>
    </button>
  );
};

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  className = '',
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Position state for the dropdown
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    right: 0
  });

  // Update position when trigger is clicked
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        right: window.innerWidth - (rect.right + window.scrollX)
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Create the dropdown menu component
  const dropdownMenu = isOpen ? (
    ReactDOM.createPortal(
      <div 
        ref={dropdownRef}
        className={`dropdown-menu dropdown-align-${align}`}
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          ...(align === 'right' ? { right: `${position.right}px` } : { left: `${position.left}px` }),
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Type assertion to let TypeScript know this element might have onClick
            const childElement = child as ReactElement & WithOnClick;
            
            // If it's not already a DropdownItem and has a standard onClick
            if (childElement.type !== DropdownItem) {
              return React.cloneElement(childElement, {
                onClick: (e: React.MouseEvent) => {
                  if (childElement.props.onClick) {
                    childElement.props.onClick(e);
                  }
                  setIsOpen(false);
                }
              });
            } 
            // If it's a DropdownItem, we need to handle the onClick differently
            else {
              return React.cloneElement(childElement, {
                onClick: (e: React.MouseEvent) => {
                  if (childElement.props.onClick) {
                    childElement.props.onClick(e);
                  }
                  setIsOpen(false);
                }
              });
            }
          }
          return child;
        })}
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={`dropdown-container ${className}`}>
      <div 
        ref={triggerRef}
        className="dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>
      {dropdownMenu}
    </div>
  );
};
