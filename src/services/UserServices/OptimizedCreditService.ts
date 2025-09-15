import { CalendarUserCredits, CreditHistory, CreditUsageType, UserCreditsTrackingPreferences, CreditHidePreferenceType } from '../../types';
import { UserCreditService } from './UserCreditService';

interface CacheEntry {
  data: CalendarUserCredits;
  timestamp: number;
  year: number;
  month: number;
}

interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export class OptimizedCreditService {
  private static cache = new Map<string, CacheEntry>();
  private static loadingStates = new Map<string, LoadingState>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  // REMOVED: prefetchQueue - no longer needed
  private static hasCleanedNonCurrentYearCache = false;

  // Generate cache key for month data
  private static getCacheKey(year: number, month: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): string {
    const cardIdsStr = options?.cardIds?.sort().join(',') || '';
    const excludeHidden = options?.excludeHidden || false;
    return `${year}-${month}-${cardIdsStr}-${excludeHidden}`;
  }

  // Check if cache entry is valid
  private static isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  // Get cached data if valid
  private static getCachedData(year: number, month: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): CalendarUserCredits | null {
    const key = this.getCacheKey(year, month, options);
    const entry = this.cache.get(key);

    if (entry && this.isCacheValid(entry)) {
      return entry.data;
    }

    if (entry) {
      this.cache.delete(key); // Remove expired entry
    }

    return null;
  }

  // Store data in cache
  private static setCachedData(year: number, month: number, data: CalendarUserCredits, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): void {
    const key = this.getCacheKey(year, month, options);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      year,
      month
    });
  }

  // Get loading state
  private static getLoadingState(year: number, month: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): LoadingState {
    const key = this.getCacheKey(year, month, options);
    return this.loadingStates.get(key) || { isLoading: false };
  }

  // Set loading state
  private static setLoadingState(year: number, month: number, state: LoadingState, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): void {
    const key = this.getCacheKey(year, month, options);
    this.loadingStates.set(key, state);
  }

  // REMOVED: Date validation methods - no longer needed for prefetching

  /**
   * Load credit data for a specific month with caching - NO prefetching
   * This is the main method to replace the year-based loading
   */
  static async loadMonthData(year: number, month: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<CalendarUserCredits> {
    // Clear any cached data from non-current years on first use only
    if (!this.hasCleanedNonCurrentYearCache) {
      this.clearNonCurrentYearCache();
      this.hasCleanedNonCurrentYearCache = true;
    }

    // Only allow current year
    if (year !== new Date().getFullYear()) {
      console.warn(`OptimizedCreditService: Skipping request for non-current year ${year}`);
      return {
        Year: year,
        Credits: [],
        _month: month
      } as any;
    }

    // Check cache first
    const cached = this.getCachedData(year, month, options);
    if (cached) {
      return cached;
    }

    // Check if already loading
    const loadingState = this.getLoadingState(year, month, options);
    if (loadingState.isLoading) {
      // Wait for existing request to complete
      return this.waitForLoadingToComplete(year, month, options);
    }

    // Start loading
    this.setLoadingState(year, month, { isLoading: true }, options);

    try {
      // Use month-specific endpoint only
      const data = await UserCreditService.fetchCreditHistoryForMonth(year, month, options);

      // Cache the result
      this.setCachedData(year, month, data, options);

      return data;
    } catch (error) {
      // Silently handle month endpoint failures
      console.debug(`Month endpoint failed for ${year}/${month} - returning empty data`);
      const emptyData: CalendarUserCredits = {
        Year: year,
        Credits: [],
        _month: month
      } as any;

      // Cache empty result to avoid repeated failed requests
      this.setCachedData(year, month, emptyData, options);

      return emptyData;
    } finally {
      this.setLoadingState(year, month, { isLoading: false }, options);
    }
  }

  // REMOVED: loadInitialData - no longer needed without prefetching

  // REMOVED: loadRangeData - no longer needed without prefetching

  // REMOVED: prefetchAdjacentMonths and prefetchMonth - no longer needed

  // REMOVED: getAdjacentMonth - no longer needed

  // REMOVED: loadAdjacentMonth - no longer needed

  /**
   * Wait for an existing loading operation to complete
   */
  private static async waitForLoadingToComplete(year: number, month: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<CalendarUserCredits> {
    const maxWait = 10000; // 10 seconds max wait
    const checkInterval = 100; // Check every 100ms
    let elapsed = 0;

    while (elapsed < maxWait) {
      const cached = this.getCachedData(year, month, options);
      if (cached) {
        return cached;
      }

      const loadingState = this.getLoadingState(year, month, options);
      if (!loadingState.isLoading) {
        if (loadingState.error) {
          throw new Error(loadingState.error);
        }
        // Try loading again if no longer loading and no error
        return this.loadMonthData(year, month, options);
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }

    throw new Error('Timeout waiting for month data to load');
  }

  // REMOVED: calculateMonthSpan - no longer needed

  // REMOVED: loadMonthsIndividually - no longer needed

  // REMOVED: loadFullYearProgressive and loadRemainingYearMonths - no longer needed

  /**
   * Clear cache (useful for logout or when data needs refresh)
   */
  static clearCache(): void {
    this.cache.clear();
    this.loadingStates.clear();
    this.hasCleanedNonCurrentYearCache = false;
  }

  /**
   * Clear cache for specific options (useful when filters change)
   */
  static clearCacheForOptions(options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const entryKey = this.getCacheKey(entry.year, entry.month, options);
      if (key === entryKey) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.loadingStates.delete(key);
    });
  }

  /**
   * Clear cache for non-current years (useful for restricting to current year only)
   */
  static clearNonCurrentYearCache(): void {
    const currentYear = new Date().getFullYear();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.year !== currentYear) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.loadingStates.delete(key);
    });
  }

  /**
   * Fallback to original service methods when needed
   */
  static async updateCreditHistoryEntry(params: {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage?: CreditUsageType;
    valueUsed?: number;
  }): Promise<CreditHistory> {
    // Clear cache after updates to ensure fresh data
    this.clearCache();
    return UserCreditService.updateCreditHistoryEntry(params);
  }

  static async syncCurrentYearCredits(): Promise<{ changed: boolean; creditHistory?: CreditHistory }> {
    const result = await UserCreditService.syncCurrentYearCredits();
    if (result.changed) {
      // Clear cache when data structure changes
      this.clearCache();
    }
    return result;
  }

  static async fetchCreditTrackingPreferences(): Promise<UserCreditsTrackingPreferences> {
    return UserCreditService.fetchCreditTrackingPreferences();
  }

  static async updateCreditHidePreference(params: {
    cardId: string;
    creditId: string;
    hidePreference: CreditHidePreferenceType;
  }): Promise<UserCreditsTrackingPreferences> {
    const result = await UserCreditService.updateCreditHidePreference(params);
    // Clear cache when preferences change
    this.clearCache();
    return result;
  }
}