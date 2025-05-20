import React, { useState, useRef, useEffect, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import './Elements.scss';

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
  const prevChildrenRef = useRef<React.ReactNode>(children);
  const clickTimeoutRef = useRef<number | null>(null);

  // Close dropdown when children change (e.g. menu options change)
  useEffect(() => {
    if (prevChildrenRef.current !== children) {
      setIsOpen(false);
      prevChildrenRef.current = children;
    }
  }, [children]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // If clicking the trigger, let the onClick handler handle it
      if (triggerRef.current?.contains(target)) {
        return;
      }
      
      // If clicking inside dropdown, don't close
      if (dropdownRef.current?.contains(target)) {
        return;
      }
      
      // Otherwise, close the dropdown
      setIsOpen(false);
    };

    if (isOpen) {
      // Add the listener with a slight delay to avoid race conditions
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
            const childElement = child as ReactElement & WithOnClick;
            
            return React.cloneElement(childElement, {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                if (childElement.props.onClick) {
                  childElement.props.onClick(e);
                }
                setIsOpen(false);
              }
            });
          }
          return child;
        })}
      </div>,
      document.body
    )
  ) : null;

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }
    
    // Toggle the dropdown state
    setIsOpen(!isOpen);
  };

  return (
    <div className={`dropdown-container ${className}`}>
      <div 
        ref={triggerRef}
        className="dropdown-trigger" 
        onMouseDown={handleTriggerClick}
      >
        {trigger}
      </div>
      {dropdownMenu}
    </div>
  );
};
