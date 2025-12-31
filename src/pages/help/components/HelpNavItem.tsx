import React from 'react';
import { NavLink } from 'react-router-dom';

interface HelpNavItemProps {
  label: string;
  to: string;
  indent?: boolean;
  onClick?: () => void;
}

const HelpNavItem: React.FC<HelpNavItemProps> = ({
  label,
  to,
  indent = false,
  onClick
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `help-nav-item ${isActive ? 'help-nav-item--active' : ''} ${indent ? 'help-nav-item--indent' : ''}`
      }
      end
      onClick={onClick}
    >
      {label}
    </NavLink>
  );
};

export default HelpNavItem;
