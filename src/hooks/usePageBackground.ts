import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGES } from '../types/Pages';

// Configuration object for page background colors
// You can easily modify this to change which pages have which backgrounds
const PAGE_BACKGROUNDS: Record<string, string> = {
  [PAGES.HOME.PATH]: 'bg-white',                    // Home page - white background
  [PAGES.SIGN_IN.PATH]: 'bg-white',                 // Sign in page - white background
  [PAGES.SIGN_UP.PATH]: 'bg-white',                 // Sign up page - white background
  [PAGES.WELCOME.PATH]: 'bg-white',                 // Welcome page - white background
  [PAGES.FORGOT_PASSWORD.PATH]: 'bg-white',         // Forgot password - white background
  // Add more pages here as needed:
  // [PAGES.PREFERENCES.PATH]: 'bg-primary',        // Example: primary color background
  // [PAGES.ACCOUNT.PATH]: 'bg-dark',               // Example: dark background
  // [PAGES.HISTORY.PATH]: 'bg-light',              // Example: light background (default)
};

// Available background classes
export const BACKGROUND_CLASSES = {
  WHITE: 'bg-white',
  LIGHT: 'bg-light',
  DARK: 'bg-dark',
  PRIMARY: 'bg-primary',
} as const;

/**
 * Custom hook to manage page background colors based on current route
 * 
 * Usage:
 * - Import and call in your main App component
 * - Automatically applies the correct background class to document.body
 * - Falls back to default background if no specific color is configured
 * 
 * @example
 * ```tsx
 * function App() {
 *   usePageBackground();
 *   // ... rest of your component
 * }
 * ```
 */
export const usePageBackground = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove all background classes first
    const allBackgroundClasses = Object.values(BACKGROUND_CLASSES);
    document.body.classList.remove(...allBackgroundClasses);

    // Get the background class for the current path
    const currentPath = location.pathname;
    let backgroundClass = PAGE_BACKGROUNDS[currentPath];
    
    // Handle dynamic routes (like /:chatId)
    if (!backgroundClass && currentPath !== PAGES.HOME.PATH) {
      // Check if this is a chat route (starts with / followed by a chatId)
      const chatIdPattern = /^\/[^\/]+$/;
      if (chatIdPattern.test(currentPath)) {
        backgroundClass = PAGE_BACKGROUNDS[PAGES.HOME.PATH];
      }
    }

    // Apply the background class if one is configured
    if (backgroundClass) {
      document.body.classList.add(backgroundClass);
    }
    
    // Cleanup function to remove classes when component unmounts
    return () => {
      document.body.classList.remove(...allBackgroundClasses);
    };
  }, [location.pathname]);
};

/**
 * Utility function to manually set a background color
 * Useful for temporary background changes or special cases
 * 
 * @param backgroundClass - The background class to apply
 * 
 * @example
 * ```tsx
 * setPageBackground(BACKGROUND_CLASSES.WHITE);
 * ```
 */
export const setPageBackground = (backgroundClass: string) => {
  const allBackgroundClasses = Object.values(BACKGROUND_CLASSES);
  document.body.classList.remove(...allBackgroundClasses);
  document.body.classList.add(backgroundClass);
};

/**
 * Utility function to reset to default background
 * Removes all background classes, falling back to the CSS default
 */
export const resetPageBackground = () => {
  const allBackgroundClasses = Object.values(BACKGROUND_CLASSES);
  document.body.classList.remove(...allBackgroundClasses);
}; 