import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export interface SidebarItemProps {
  icon?: string;
  name: string;
  page?: string;
  isDropdown?: boolean;
  children?: React.ReactNode;
  className?: string;
  storageKey?: string; // Optional custom storage key, defaults to name
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  name,
  page,
  isDropdown = false,
  children,
  className = '',
  storageKey
}) => {
  // Use provided storageKey or generate one from name
  const itemStorageKey = storageKey || `sidebar-item-${name.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Initialize state from localStorage if it's a dropdown
  const getInitialState = (): boolean => {
    if (!isDropdown) return false;
    
    try {
      const stored = localStorage.getItem(itemStorageKey);
      return stored !== null ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Error reading sidebar item state from localStorage:', error);
      return false;
    }
  };

  const [isExpanded, setIsExpanded] = useState<boolean>(getInitialState);
  const navigate = useNavigate();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isDropdown) {
      try {
        localStorage.setItem(itemStorageKey, JSON.stringify(isExpanded));
      } catch (error) {
        console.warn('Error saving sidebar item state to localStorage:', error);
      }
    }
  }, [isExpanded, isDropdown, itemStorageKey]);

  const toggleDropdown = () => {
    if (isDropdown) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMainClick = (e: React.MouseEvent) => {
    if (isDropdown) {
      e.preventDefault();
      toggleDropdown();
    } else if (page) {
      navigate(page);
    }
  };

  const handleNavigationClick = (e: React.MouseEvent) => {
    if (isDropdown && page) {
      e.preventDefault();
      e.stopPropagation();
      navigate(page);
    }
  };

  const ItemContent = () => (
    <div className={`sidebar-item-content ${className}`}>
      <div className="sidebar-item-main" onClick={handleMainClick}>
        {icon && (
          <img 
            src={icon} 
            alt={`${name} icon`} 
            className="sidebar-item-icon"
          />
        )}
        <span className="sidebar-item-name" onClick={isDropdown && page ? handleNavigationClick : undefined}>
          {name}
        </span>
        {isDropdown && (
          <span className={`sidebar-item-arrow ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        )}
      </div>
      {isDropdown && isExpanded && children && (
        <div className="sidebar-item-dropdown">
          {children}
        </div>
      )}
    </div>
  );

  // If it's not a dropdown and has a page, wrap in Link for better navigation
  if (!isDropdown && page) {
    return (
      <Link to={page} className="sidebar-item-link">
        <ItemContent />
      </Link>
    );
  }

  // For dropdowns or items without pages, use div
  return (
    <div className="sidebar-item">
      <ItemContent />
    </div>
  );
};
