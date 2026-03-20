import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../services';
import { logError } from '../utils/logger';

const STORAGE_KEY_PREFIX = 'onboarding-completed-';
const FORCE_REVISIT_KEY_PREFIX = 'onboarding-force-revisit-';

interface UseOnboardingStateResult {
  isOnboardingComplete: boolean;
  markOnboardingComplete: () => void;
  resetOnboarding: () => void;
}

/**
 * Hybrid onboarding completion state.
 * - Read: localStorage first (instant), server value as upgrade-only override
 * - Write: localStorage immediately (optimistic), fire-and-forget server persist
 * - Graceful degradation: if server call fails, localStorage still has the flag
 * - Force revisit: resetOnboarding sets a flag that overrides server completion
 *   until the user completes onboarding again
 *
 * @param uid The user's Firebase UID
 * @param serverValue Optional server-provided onboarding status from bootstrap
 */
export function useOnboardingState(uid: string | undefined, serverValue?: boolean): UseOnboardingStateResult {
  const reconciliationFiredRef = useRef(false);
  const lastUidRef = useRef(uid);

  // Reset reconciliation guard when uid changes
  if (uid !== lastUidRef.current) {
    reconciliationFiredRef.current = false;
    lastUidRef.current = uid;
  }

  const [isComplete, setIsComplete] = useState<boolean>(() => {
    if (!uid) return false;
    // Force revisit flag takes precedence over everything
    if (localStorage.getItem(`${FORCE_REVISIT_KEY_PREFIX}${uid}`)) return false;
    const localComplete = !!localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
    if (serverValue === true) return true;
    return localComplete;
  });

  // Re-sync when uid or serverValue changes
  useEffect(() => {
    if (!uid) {
      setIsComplete(false);
      return;
    }
    // Force revisit flag overrides server value
    if (localStorage.getItem(`${FORCE_REVISIT_KEY_PREFIX}${uid}`)) {
      setIsComplete(false);
      return;
    }
    const localComplete = !!localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
    // Server true is authoritative (cross-device sync).
    // Server false does NOT override localStorage true (graceful degradation
    // when the fire-and-forget POST hasn't reached the server yet).
    if (serverValue === true) {
      setIsComplete(true);
      if (!localComplete) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, new Date().toISOString());
      }
      return;
    }
    // serverValue is false or undefined -- use localStorage
    setIsComplete(localComplete);

    // Reconciliation: localStorage says complete but server explicitly disagrees.
    // Re-fire the completion POST to heal prior silent failures.
    // Only when serverValue is explicitly false (not undefined, which means bootstrap
    // hasn't loaded yet). Guarded by ref to fire at most once per session.
    if (localComplete && serverValue === false && !reconciliationFiredRef.current) {
      reconciliationFiredRef.current = true;
      apiClient.post('/users/onboarding/complete').catch((err) => {
        logError('Reconciliation: failed to re-sync onboarding completion to server:', err);
      });
    }
  }, [uid, serverValue]);

  const markOnboardingComplete = useCallback(() => {
    if (!uid) return;
    // Clear force-revisit flag (user completed onboarding again)
    localStorage.removeItem(`${FORCE_REVISIT_KEY_PREFIX}${uid}`);
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
    // Set force-revisit flag so server value doesn't override during this session
    localStorage.setItem(`${FORCE_REVISIT_KEY_PREFIX}${uid}`, 'true');
    setIsComplete(false);
    // Fire-and-forget: persist reset to server
    apiClient.post('/users/onboarding/reset').catch((err) => {
      logError('Failed to persist onboarding reset to server:', err);
    });
  }, [uid]);

  return {
    isOnboardingComplete: uid ? isComplete : false,
    markOnboardingComplete,
    resetOnboarding,
  };
}
