import { User as FirebaseUser } from 'firebase/auth';

/**
 * Props interface for AppHeader component
 * @property {FirebaseUser | null} user - Current Firebase user or null if not authenticated
 * @property {() => void} onModalOpen - Callback to open credit card selection modal
 * @property {() => void} onLogout - Callback to handle user logout
 */
export interface AppHeaderProps {
  user: FirebaseUser | null;
  onModalOpen: () => void;
  onLogout: () => void;
}

/**
 * Handles clicks outside of dropdown menu
 * @param event - Mouse event
 * @param dropdownRef - Reference to dropdown element
 * @param setDropdownOpen - State setter for dropdown visibility
 */
export const handleClickOutside = (
  event: MouseEvent,
  dropdownRef: React.RefObject<HTMLDivElement>,
  setDropdownOpen: (isOpen: boolean) => void
): void => {
  if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    setDropdownOpen(false);
  }
};
