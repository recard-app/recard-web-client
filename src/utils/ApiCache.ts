/**
 * Centralized API caching and deduplication system
 * Prevents duplicate API calls during app initialization and provides smart caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isLoading: boolean;
  promise?: Promise<T>;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

class ApiCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000 }) { // Default 5 minutes
    this.config = config;
  }

  /**
   * Get cached data or execute the API call with deduplication
   */
  async get<T>(
    key: string,
    apiCall: () => Promise<T>,
    options: { ttl?: number; forceRefresh?: boolean } = {}
  ): Promise<T> {
    const now = Date.now();
    const ttl = options.ttl || this.config.ttl;

    // Check if we should force refresh
    if (options.forceRefresh) {
      this.invalidate(key);
    }

    // Check for valid cached data
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached, ttl)) {
      // If data is fresh, return it immediately
      if (cached.data !== undefined) {
        return cached.data;
      }
      // If currently loading, return the existing promise
      if (cached.isLoading && cached.promise) {
        return cached.promise;
      }
    }

    // Check for pending request to avoid duplicate calls
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Create new request
    const promise = this.executeApiCall(key, apiCall, now);
    this.pendingRequests.set(key, promise);

    // Set loading state in cache
    this.cache.set(key, {
      data: cached?.data, // Keep old data if exists
      timestamp: now,
      isLoading: true,
      promise
    });

    try {
      const result = await promise;

      // Update cache with fresh data
      this.cache.set(key, {
        data: result,
        timestamp: now,
        isLoading: false
      });

      return result;
    } catch (error) {
      // Remove from cache on error
      this.cache.delete(key);
      throw error;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Execute the API call with error handling
   */
  private async executeApiCall<T>(key: string, apiCall: () => Promise<T>, timestamp: number): Promise<T> {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error(`API call failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>, ttl: number): boolean {
    return Date.now() - entry.timestamp > ttl;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear all user-specific data (called on logout)
   */
  clearUserData(): void {
    // Clear all caches except global/static data
    const userDataKeys = Object.values(CACHE_KEYS);
    userDataKeys.forEach(key => this.invalidate(key));
  }

  /**
   * Get cache status for debugging
   */
  getStatus(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry, this.config.ttl)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiCache = new ApiCacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes default
  maxSize: 100
});

// Predefined cache keys for consistency
export const CACHE_KEYS = {
  // Card Service
  CREDIT_CARDS: 'credit_cards',
  CREDIT_CARDS_PREVIEWS: 'credit_cards_previews',
  CREDIT_CARDS_DETAILS: 'credit_cards_details',

  // User Service
  USER_SUBSCRIPTION: 'user_subscription',

  // User Credit Service
  CREDIT_TRACKING_PREFERENCES: 'credit_tracking_preferences',

  // User Preferences Service
  USER_PREFERENCES_INSTRUCTIONS: 'user_preferences_instructions',
  USER_PREFERENCES_CHAT_HISTORY: 'user_preferences_chat_history',
  USER_PREFERENCES_SHOW_COMPLETED: 'user_preferences_show_completed',

  // User Credit Card Service
  USER_CARD_DETAILS: 'user_card_details',
  USER_CARD_DETAILS_FULL: 'user_card_details_full',

  // User History Service
  CHAT_HISTORY: 'chat_history',

  // Component Service
  COMPONENTS_PERKS: 'components_perks',
  COMPONENTS_CREDITS: 'components_credits',
  COMPONENTS_MULTIPLIERS: 'components_multipliers',
  COMPONENTS_ALL: 'components_all'
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];