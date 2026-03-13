import React, { useEffect, useState, ReactNode } from 'react';
import { CardPerk, CardCredit, EnrichedMultiplier, isSelectableMultiplier } from '../types/CreditCardTypes';
import { ComponentService } from '../services';
import { useAuth } from '../context/useAuth';
import { apiCache } from '../utils/ApiCache';
import { ComponentsContext } from './useComponents';
import type { ComponentsContextType } from './useComponents';

interface ComponentsProviderProps {
  children: ReactNode;
  autoFetch?: boolean; // Whether to automatically fetch data on mount
}

export const ComponentsProvider: React.FC<ComponentsProviderProps> = ({
  children,
  autoFetch = true
}) => {
  const { user } = useAuth();
  const [perks, setPerks] = useState<CardPerk[]>([]);
  const [credits, setCredits] = useState<CardCredit[]>([]);
  const [multipliers, setMultipliers] = useState<EnrichedMultiplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const componentData = await ComponentService.fetchAllUserCardComponents(forceRefresh);

      setPerks(componentData.perks);
      setCredits(componentData.credits);
      setMultipliers(componentData.multipliers);
    } catch (err) {
      console.error('Failed to fetch components:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch components');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const refetch = async () => {
    // Force refresh to bypass cache and ensure fresh data
    await fetchComponents(true);
  };

  const hydrate = (componentData: { perks: CardPerk[]; credits: CardCredit[]; multipliers: EnrichedMultiplier[] }) => {
    setPerks(componentData.perks || []);
    setCredits(componentData.credits || []);
    setMultipliers(componentData.multipliers || []);
    setError(null);
    setIsLoading(false);
    setIsInitialized(true);
  };

  /**
   * Update user's category selection for a selectable multiplier
   * Uses optimistic update for immediate UI feedback
   */
  const updateMultiplierSelection = async (multiplierId: string, categoryId: string) => {
    // Find the multiplier and its allowed categories
    const multiplier = multipliers.find(m => m.id === multiplierId);
    if (!multiplier || !isSelectableMultiplier(multiplier)) {
      throw new Error('Invalid multiplier or not a selectable type');
    }

    const newCategory = multiplier.allowedCategories?.find(c => c.id === categoryId);
    if (!newCategory) {
      throw new Error('Category not found in allowed categories');
    }

    // Optimistic update
    setMultipliers(prev => prev.map(m => {
      if (m.id === multiplierId) {
        return {
          ...m,
          userSelectedCategory: newCategory,
        };
      }
      return m;
    }));

    try {
      await ComponentService.updateMultiplierSelection(multiplierId, categoryId);
      // Refresh multipliers to get updated data from server
      await fetchComponents(true);
    } catch (err) {
      // Revert on error by refetching
      console.error('Failed to update selection:', err);
      await fetchComponents(true);
      throw err;
    }
  };

  useEffect(() => {
    if (autoFetch && user) {
      fetchComponents();
    } else if (!user) {
      // Clear data when user logs out
      setPerks([]);
      setCredits([]);
      setMultipliers([]);
      setError(null);
      setIsInitialized(false);
      ComponentService.clearCache();
      apiCache.clearUserData();
    }
  }, [autoFetch, user]);

  const value: ComponentsContextType = {
    perks,
    credits,
    multipliers,
    isLoading,
    isInitialized,
    error,
    refetch,
    hydrate,
    updateMultiplierSelection,
  };

  return (
    <ComponentsContext.Provider value={value}>
      {children}
    </ComponentsContext.Provider>
  );
};
