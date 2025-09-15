/**
 * Centralized manager for handling optimistic updates to prevent race conditions
 */

interface PendingUpdate {
  cardId: string;
  creditId: string;
  periodNumber: number;
  timestamp: number;
  timeout: NodeJS.Timeout;
}

class OptimisticUpdateManager {
  private pendingUpdates = new Map<string, PendingUpdate>();

  private getUpdateKey(cardId: string, creditId: string, periodNumber: number): string {
    return `${cardId}:${creditId}:${periodNumber}`;
  }

  /**
   * Register an optimistic update to prevent overwrites
   */
  registerUpdate(cardId: string, creditId: string, periodNumber: number): void {
    const key = this.getUpdateKey(cardId, creditId, periodNumber);

    // Clear any existing timeout for this update
    const existing = this.pendingUpdates.get(key);
    if (existing) {
      clearTimeout(existing.timeout);
    }

    console.log(`[OptimisticUpdateManager] Registering update:`, { key, timestamp: Date.now() });

    // Create new pending update with timeout
    const timeout = setTimeout(() => {
      console.log(`[OptimisticUpdateManager] Update expired:`, { key });
      this.pendingUpdates.delete(key);
    }, 3000); // 3 second protection window

    this.pendingUpdates.set(key, {
      cardId,
      creditId,
      periodNumber,
      timestamp: Date.now(),
      timeout
    });
  }

  /**
   * Check if an update is currently protected from overwrites
   */
  isUpdateProtected(cardId: string, creditId: string, periodNumber: number): boolean {
    const key = this.getUpdateKey(cardId, creditId, periodNumber);
    const update = this.pendingUpdates.get(key);

    if (!update) return false;

    const isProtected = Date.now() - update.timestamp < 3000;
    console.log(`[OptimisticUpdateManager] Checking protection:`, {
      key,
      isProtected,
      age: Date.now() - update.timestamp
    });

    return isProtected;
  }

  /**
   * Clear a specific update protection
   */
  clearUpdate(cardId: string, creditId: string, periodNumber: number): void {
    const key = this.getUpdateKey(cardId, creditId, periodNumber);
    const existing = this.pendingUpdates.get(key);

    if (existing) {
      clearTimeout(existing.timeout);
      this.pendingUpdates.delete(key);
      console.log(`[OptimisticUpdateManager] Cleared update:`, { key });
    }
  }

  /**
   * Clear all update protections (useful for debugging)
   */
  clearAll(): void {
    console.log(`[OptimisticUpdateManager] Clearing all updates:`, this.pendingUpdates.size);
    for (const [key, update] of this.pendingUpdates.entries()) {
      clearTimeout(update.timeout);
    }
    this.pendingUpdates.clear();
  }

  /**
   * Get debug info about current updates
   */
  getDebugInfo() {
    return {
      pendingCount: this.pendingUpdates.size,
      updates: Array.from(this.pendingUpdates.entries()).map(([key, update]) => ({
        key,
        age: Date.now() - update.timestamp,
        cardId: update.cardId,
        creditId: update.creditId,
        periodNumber: update.periodNumber
      }))
    };
  }
}

// Export singleton instance
export const optimisticUpdateManager = new OptimisticUpdateManager();