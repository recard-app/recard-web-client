import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services';
import { logError } from '../utils/logger';

const STORAGE_KEY_PREFIX = 'onboarding-completed-';

interface UseOnboardingStateResult {
  isOnboardingComplete: boolean;
  markOnboardingComplete: () => void;
  resetOnboarding: () => void;
}

/**
 * Hybrid onboarding completion state.
 * - Read: localStorage first (instant), server value as override
 * - Write: localStorage immediately (optimistic), fire-and-forget server persist
 * - Graceful degradation: if server call fails, localStorage still has the flag
 *
 * @param uid The user's Firebase UID
 * @param serverValue Optional server-provided onboarding status from bootstrap
 */
export function useOnboardingState(uid: string | undefined, serverValue?: boolean): UseOnboardingStateResult {
  const [isComplete, setIsComplete] = useState<boolean>(() => {
    if (!uid) return false;
    const localComplete = !!localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
    // Server true upgrades to complete; server false does NOT downgrade
    // (localStorage may have a completion the server doesn't know about yet)
    if (serverValue === true) return true;
    return localComplete;
  });

  // Re-sync when uid or serverValue changes
  useEffect(() => {
    if (!uid) {
      setIsComplete(false);
      return;
    }
    const localComplete = !!localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
    // Server true is authoritative (cross-device sync).
    // Server false does NOT override localStorage true (graceful degradation
    // when the fire-and-forget POST hasn't reached the server yet).
    if (serverValue === true) {
      setIsComplete(true);
      // Sync localStorage to match server
      if (!localComplete) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, new Date().toISOString());
      }
      return;
    }
    // serverValue is false or undefined -- use localStorage
    setIsComplete(localComplete);
  }, [uid, serverValue]);

  const markOnboardingComplete = useCallback(() => {
    if (!uid) return;
    // Optimistic: set localStorage immediately
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, new Date().toISOString());
    setIsComplete(true);
    // Fire-and-forget: persist to server
    apiClient.post('/users/onboarding/complete').catch((err) => {
      logError('Failed to persist onboarding completion to server:', err);
    });
  }, [uid]);

  const resetOnboarding = useCallback(() => {
    if (!uid) return;
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${uid}`);
    setIsComplete(false);
  }, [uid]);

  return {
    isOnboardingComplete: uid ? isComplete : false,
    markOnboardingComplete,
    resetOnboarding,
  };
}
