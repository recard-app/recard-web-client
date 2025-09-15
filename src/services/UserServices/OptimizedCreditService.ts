import { CalendarUserCredits, CreditHistory, CreditUsageType, UserCreditsTrackingPreferences, CreditHidePreferenceType } from '../../types';
import { UserCreditService } from './UserCreditService';
import { UserService } from './UserService';

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
  private static prefetchQueue = new Set<string>();
  private static accountCreatedAt: Date | null = null;
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

  // Date validation methods
  private static async ensureAccountCreatedAt(): Promise<void> {
    if (!this.accountCreatedAt) {
      try {
        this.accountCreatedAt = await UserService.fetchAccountCreationDate();
      } catch (error) {
        console.warn('Failed to fetch account creation date, using current date as fallback');
        this.accountCreatedAt = new Date();
      }
    }
  }

  private static isAllowedYearMonth(
    year: number,
    month: number,
    now: Date = new Date()
  ): boolean {
    const currentYear = now.getFullYear();
    const maxMonth = now.getMonth() + 1;

    // Only allow current year
    if (year !== currentYear) return false;

    // Within current year, don't allow future months
    if (month > maxMonth) return false;

    return true;
  }

  /**
   * Load credit data for a specific month with smart caching
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
      // Start prefetching adjacent months in background
      this.prefetchAdjacentMonths(year, month, options);
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

      // Prefetch adjacent months (with date validation)
      this.prefetchAdjacentMonths(year, month, options);

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

  /**
   * Load initial data (current month + adjacent months)
   * This provides immediate data while prefetching context
   */
  static async loadInitialData(year: number, month: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<{
    current: CalendarUserCredits;
    adjacent: {
      prev?: CalendarUserCredits;
      next?: CalendarUserCredits;
    };
  }> {
    // Load current month first (priority)
    const current = await this.loadMonthData(year, month, options);

    // Load adjacent months in parallel (background)
    const adjacentPromises = {
      prev: this.loadAdjacentMonth(year, month, -1, options),
      next: this.loadAdjacentMonth(year, month, 1, options)
    };

    const [prev, next] = await Promise.allSettled([
      adjacentPromises.prev,
      adjacentPromises.next
    ]);

    return {
      current,
      adjacent: {
        prev: prev.status === 'fulfilled' ? prev.value : undefined,
        next: next.status === 'fulfilled' ? next.value : undefined
      }
    };
  }

  /**
   * Load data for a range of months (used for quarter/year views)
   */
  static async loadRangeData(startYear: number, startMonth: number, endYear: number, endMonth: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<CalendarUserCredits> {
    // For small ranges (3 months or less), load individually and merge
    const monthSpan = this.calculateMonthSpan(startYear, startMonth, endYear, endMonth);

    if (monthSpan <= 3) {
      return this.loadMonthsIndividually(startYear, startMonth, endYear, endMonth, options);
    }

    // For larger ranges, use the range endpoint
    const startStr = `${startYear}-${String(startMonth).padStart(2, '0')}`;
    const endStr = `${endYear}-${String(endMonth).padStart(2, '0')}`;

    return UserCreditService.fetchCreditHistoryForRange(startStr, endStr, options);
  }

  /**
   * Prefetch adjacent months in background
   */
  private static async prefetchAdjacentMonths(year: number, month: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<void> {
    // Ensure we have account creation date for validation
    await this.ensureAccountCreatedAt();

    const prefetchPromises: Promise<void>[] = [];

    // Check previous month
    const [prevYear, prevMonth] = this.getAdjacentMonth(year, month, -1);
    if (this.isAllowedYearMonth(prevYear, prevMonth)) {
      const prevKey = this.getCacheKey(prevYear, prevMonth, options);
      if (!this.prefetchQueue.has(prevKey) && !this.getCachedData(prevYear, prevMonth, options)) {
        this.prefetchQueue.add(prevKey);
        prefetchPromises.push(this.prefetchMonth(year, month, -1, options, prevKey));
      }
    }

    // Check next month
    const [nextYear, nextMonth] = this.getAdjacentMonth(year, month, 1);
    if (this.isAllowedYearMonth(nextYear, nextMonth)) {
      const nextKey = this.getCacheKey(nextYear, nextMonth, options);
      if (!this.prefetchQueue.has(nextKey) && !this.getCachedData(nextYear, nextMonth, options)) {
        this.prefetchQueue.add(nextKey);
        prefetchPromises.push(this.prefetchMonth(year, month, 1, options, nextKey));
      }
    }

    // Don't await - let them run in background
    Promise.allSettled(prefetchPromises);
  }

  /**
   * Prefetch a specific month
   */
  private static async prefetchMonth(baseYear: number, baseMonth: number, offset: number, options: {
    cardIds?: string[];
    excludeHidden?: boolean;
  } | undefined, cacheKey: string): Promise<void> {
    try {
      const [targetYear, targetMonth] = this.getAdjacentMonth(baseYear, baseMonth, offset);
      await this.loadMonthData(targetYear, targetMonth, options);
    } catch (error) {
      // Completely silent prefetch failures
    } finally {
      this.prefetchQueue.delete(cacheKey);
    }
  }

  /**
   * Calculate adjacent month
   */
  private static getAdjacentMonth(year: number, month: number, offset: number): [number, number] {
    const totalMonths = year * 12 + (month - 1) + offset;
    const newYear = Math.floor(totalMonths / 12);
    const newMonth = (totalMonths % 12) + 1;
    return [newYear, newMonth];
  }

  /**
   * Load adjacent month with error handling
   */
  private static async loadAdjacentMonth(year: number, month: number, offset: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<CalendarUserCredits | undefined> {
    try {
      const [targetYear, targetMonth] = this.getAdjacentMonth(year, month, offset);
      return await this.loadMonthData(targetYear, targetMonth, options);
    } catch (error) {
      // Return undefined for failed adjacent loads
      return undefined;
    }
  }

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

  /**
   * Calculate number of months in a span
   */
  private static calculateMonthSpan(startYear: number, startMonth: number, endYear: number, endMonth: number): number {
    return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  }

  /**
   * Load multiple months individually and merge the results
   */
  private static async loadMonthsIndividually(startYear: number, startMonth: number, endYear: number, endMonth: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<CalendarUserCredits> {
    const months: Array<{ year: number; month: number }> = [];

    let currentYear = startYear;
    let currentMonth = startMonth;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      months.push({ year: currentYear, month: currentMonth });

      if (currentMonth === 12) {
        currentYear++;
        currentMonth = 1;
      } else {
        currentMonth++;
      }
    }

    // Load all months in parallel
    const monthPromises = months.map(({ year, month }) =>
      this.loadMonthData(year, month, options)
    );

    const monthResults = await Promise.all(monthPromises);

    // Merge the results (use the first month's structure and combine credits)
    if (monthResults.length === 0) {
      throw new Error('No months to load');
    }

    const baseResult = monthResults[0];
    const allCredits = monthResults.flatMap(result => result.Credits || []);

    // Remove duplicates based on CardId + CreditId
    const uniqueCredits = allCredits.filter((credit, index, self) =>
      index === self.findIndex(c => c.CardId === credit.CardId && c.CreditId === credit.CreditId)
    );

    return {
      ...baseResult,
      Credits: uniqueCredits,
      _range: {
        start: `${startYear}-${String(startMonth).padStart(2, '0')}`,
        end: `${endYear}-${String(endMonth).padStart(2, '0')}`
      }
    } as any;
  }

  /**
   * Progressive loading for full year data
   * Loads current month first, then fills in the rest
   */
  static async loadFullYearProgressive(year: number, currentMonth: number, options?: {
    cardIds?: string[];
    excludeHidden?: boolean;
  }): Promise<{
    initial: CalendarUserCredits;
    onProgress: (callback: (loadedMonths: number, totalMonths: number) => void) => void;
  }> {
    // Load current month + adjacent first for immediate display
    const initial = await this.loadInitialData(year, currentMonth, options);

    const onProgress = (callback: (loadedMonths: number, totalMonths: number) => void) => {
      // Background load remaining months
      this.loadRemainingYearMonths(year, currentMonth, options, callback);
    };

    return {
      initial: initial.current,
      onProgress
    };
  }

  /**
   * Load remaining months of the year in background
   */
  private static async loadRemainingYearMonths(year: number, currentMonth: number, options: {
    cardIds?: string[];
    excludeHidden?: boolean;
  } | undefined, progressCallback: (loadedMonths: number, totalMonths: number) => void): Promise<void> {
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const remainingMonths = allMonths.filter(m =>
      m !== currentMonth &&
      m !== currentMonth - 1 &&
      m !== currentMonth + 1
    );

    let loadedCount = 3; // Current + 2 adjacent already loaded
    const totalMonths = 12;

    progressCallback(loadedCount, totalMonths);

    // Load in chunks to avoid overwhelming the server
    const chunkSize = 3;
    for (let i = 0; i < remainingMonths.length; i += chunkSize) {
      const chunk = remainingMonths.slice(i, i + chunkSize);

      await Promise.allSettled(
        chunk.map(month => this.loadMonthData(year, month, options))
      );

      loadedCount += chunk.length;
      progressCallback(loadedCount, totalMonths);
    }
  }

  /**
   * Clear cache (useful for logout or when data needs refresh)
   */
  static clearCache(): void {
    this.cache.clear();
    this.loadingStates.clear();
    this.prefetchQueue.clear();
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

    console.log(`Cleared ${keysToDelete.length} cache entries for non-current years`);
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