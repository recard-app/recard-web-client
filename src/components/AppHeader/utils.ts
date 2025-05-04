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
