// Centralized page configuration for routes, titles, and metadata
export const PAGES = {
  // Home/Chat pages
  HOME: {
    PATH: '/',
    TITLE: 'Home',
    DYNAMIC_PATH: '/:chatId', // For chat routes
  },
  
  // Authentication pages
  SIGN_IN: {
    PATH: '/signin',
    TITLE: 'Sign In',
  },
  SIGN_UP: {
    PATH: '/signup', 
    TITLE: 'Sign Up',
  },
  FORGOT_PASSWORD: {
    PATH: '/forgotpassword',
    TITLE: 'Reset Password',
  },
  WELCOME: {
    PATH: '/welcome',
    TITLE: 'Welcome',
  },
  
  // Main application pages
  PREFERENCES: {
    PATH: '/preferences',
    TITLE: 'Preferences',
  },
  ACCOUNT: {
    PATH: '/account',
    TITLE: 'Account',
  },
  HISTORY: {
    PATH: '/history',
    TITLE: 'History',
  },
  MY_CARDS: {
    PATH: '/my-cards',
    TITLE: 'My Cards',
  },
  MY_CREDITS: {
    PATH: '/my-credits',
    TITLE: 'My Credits',
  },
  MY_CREDITS_HISTORY: {
    PATH: '/my-credits/history',
    TITLE: 'My Credits',
  },
  DELETE_HISTORY: {
    PATH: '/delete-history',
    TITLE: 'Delete History',
  },
} as const;

// Helper type for page keys
export type PageKey = keyof typeof PAGES;

// Helper type for page configuration
export type PageConfig = {
  PATH: string;
  TITLE: string;
  DYNAMIC_PATH?: string;
};

// Utility functions for working with pages
export const PageUtils = {
  /**
   * Get page configuration by path
   * @param path - The current pathname
   * @returns Page configuration or null if not found
   */
  getPageByPath: (path: string): PageConfig | null => {
    const page = Object.values(PAGES).find(p => {
      if (p.PATH === path) return true;
      if ('DYNAMIC_PATH' in p && p.DYNAMIC_PATH) {
        const dynamicPage = p as PageConfig & { DYNAMIC_PATH: string };
        return new RegExp(`^${dynamicPage.DYNAMIC_PATH.replace(':chatId', '[^/]+')}$`).test(path);
      }
      return false;
    });
    return page || null;
  },

  /**
   * Get page title by path
   * @param path - The current pathname
   * @returns Page title or null if not found
   */
  getTitleByPath: (path: string): string | null => {
    const page = PageUtils.getPageByPath(path);
    return page ? page.TITLE : null;
  },

  /**
   * Check if a path matches a specific page
   * @param path - The current pathname
   * @param pageKey - The page key to check against
   * @returns True if the path matches the page
   */
  isPage: (path: string, pageKey: PageKey): boolean => {
    const page = PAGES[pageKey];
    if (path === page.PATH) return true;
    if ('DYNAMIC_PATH' in page && page.DYNAMIC_PATH) {
      const dynamicPage = page as PageConfig & { DYNAMIC_PATH: string };
      return new RegExp(`^${dynamicPage.DYNAMIC_PATH.replace(':chatId', '[^/]+')}$`).test(path);
    }
    return false;
  },

  /**
   * Get all page paths as an array
   * @returns Array of all page paths
   */
  getAllPaths: (): string[] => {
    return Object.values(PAGES).map(page => page.PATH);
  },

  /**
   * Get all page titles as an array  
   * @returns Array of all page titles
   */
  getAllTitles: (): string[] => {
    return Object.values(PAGES).map(page => page.TITLE);
  },
};

// Export individual pages for convenience
export const {
  HOME,
  SIGN_IN,
  SIGN_UP, 
  FORGOT_PASSWORD,
  WELCOME,
  PREFERENCES,
  ACCOUNT,
  HISTORY,
  MY_CARDS,
  MY_CREDITS,
  DELETE_HISTORY,
} = PAGES;
