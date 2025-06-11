/* ========================================================================
   LEGACY DROPDOWN COMPONENT
   ========================================================================
   This is a legacy dropdown component that is no longer used.
   It is kept here for reference only.
   ======================================================================== */

import React, { useState, useRef, useEffect, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import './Dropdown.scss';

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

// Component for dropdown menu items with icons
export interface DropdownItemProps {
  icon?: string; // Optional icon URL
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
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
    right: 0,
    shouldOpenUpward: false,
    shouldOpenRightward: false
  });

  // Update position when trigger is clicked
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Estimate dropdown dimensions
      const estimatedDropdownHeight = 200;
      const estimatedDropdownWidth = 150;
      
      // Calculate available space
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.left;
      const spaceLeft = rect.right;
      
      // Decide positioning
      const shouldOpenUpward = spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight;
      const shouldOpenRightward = spaceLeft < estimatedDropdownWidth && spaceRight > estimatedDropdownWidth;
      
      setPosition({
        top: shouldOpenUpward ? rect.top + scrollY : rect.bottom + scrollY,
        left: shouldOpenRightward 
          ? (shouldOpenUpward ? rect.left + scrollX : rect.right + scrollX)
          : rect.left + scrollX,
        right: shouldOpenRightward 
          ? (shouldOpenUpward ? viewportWidth - (rect.left + scrollX) : viewportWidth - (rect.right + scrollX))
          : viewportWidth - (rect.right + scrollX),
        shouldOpenUpward,
        shouldOpenRightward
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
        className={`dropdown-menu dropdown-align-${align} ${position.shouldOpenUpward ? 'dropdown-upward' : 'dropdown-downward'} ${position.shouldOpenRightward ? 'dropdown-rightward' : 'dropdown-leftward'}`}
        style={{
          position: 'absolute',
          ...(position.shouldOpenUpward 
            ? { bottom: `${window.innerHeight - position.top + window.scrollY}px` }
            : { top: `${position.top}px` }
          ),
          ...(position.shouldOpenRightward
            ? { left: `${position.left}px` }
            : align === 'right' 
              ? { right: `${position.right}px` } 
              : { left: `${position.left}px` }
          ),
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

export default Dropdown;
