import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { IconRenderer } from '../../icons';

export interface SidebarItemProps {
  icon?: string | React.ComponentType<any> | ((...args: any[]) => React.ReactElement);
  name: string;
  page?: string;
  isDropdown?: boolean;
  children?: React.ReactNode;
  className?: string;
  storageKey?: string; // Optional custom storage key, defaults to name
  isCollapsed?: boolean; // Whether the sidebar is in collapsed state
  onShowTooltip?: (name: string, position: { top: number }) => void; // Callback to show tooltip
  onHideTooltip?: () => void; // Callback to hide tooltip
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  name,
  page,
  isDropdown = false,
  children,
  className = '',
  storageKey,
  isCollapsed = false,
  onShowTooltip,
  onHideTooltip
}) => {
  // Use provided storageKey or generate one from name
  const itemStorageKey = storageKey || `sidebar-item-${name.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Initialize state from localStorage if it's a dropdown
  const getInitialState = (): boolean => {
    if (!isDropdown) return false;
    
    try {
      const stored = localStorage.getItem(itemStorageKey);
      return stored !== null ? JSON.parse(stored) : true;
    } catch (error) {
      console.warn('Error reading sidebar item state from localStorage:', error);
      return true;
    }
  };

  const [isExpanded, setIsExpanded] = useState<boolean>(getInitialState);
  const iconRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseOverIcon = useRef<boolean>(false);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Global mouse tracking effect for collapsed mode
  useEffect(() => {
    if (!isCollapsed) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!iconRef.current || !isMouseOverIcon.current) return;

      const rect = iconRef.current.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      if (!isInside) {
        isMouseOverIcon.current = false;
        
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        
        hideTimeoutRef.current = setTimeout(() => {
          if (onHideTooltip) {
            onHideTooltip();
          }
        }, 100);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isCollapsed, onHideTooltip]);

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

  const handleMouseEnter = () => {
    // Set tracking flag
    isMouseOverIcon.current = true;
    
    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (isCollapsed && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const centerY = rect.top + (rect.height / 2);
      const position = {
        top: centerY
      };
      
      if (onShowTooltip) {
        onShowTooltip(name, position);
      }
    }
  };

  const ItemContent = () => (
    <div 
      className={`sidebar-item-content ${className} ${isCollapsed ? 'collapsed' : ''}`}
      onPointerEnter={isCollapsed ? handleMouseEnter : undefined}
      style={isCollapsed ? { 
        cursor: 'pointer',
        userSelect: 'none'
      } : undefined}
    >
      <div 
        ref={iconRef}
        className="sidebar-item-main" 
        onClick={handleMainClick}
      >
        {icon && (
          <IconRenderer 
            icon={icon}
            alt={`${name} icon`}
            className="sidebar-item-icon"
            size={20}
          />
        )}

        {!isCollapsed && (
          <>
            <span className="sidebar-item-name" onClick={isDropdown && page ? handleNavigationClick : undefined}>
              {name}
            </span>
            {isDropdown && (
              <span className={`sidebar-item-arrow ${isExpanded ? 'expanded' : ''}`}>
                ▼
              </span>
            )}
          </>
        )}
      </div>
      
      {isDropdown && isExpanded && children && !isCollapsed && (
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
