import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'onboarding-completed-';

interface UseOnboardingStateResult {
  isOnboardingComplete: boolean;
  markOnboardingComplete: () => void;
  resetOnboarding: () => void;
}

export function useOnboardingState(uid: string | undefined): UseOnboardingStateResult {
  const [isComplete, setIsComplete] = useState<boolean>(() => {
    if (!uid) return false;
    return !!localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
  });

  // Re-sync when uid changes (user login/logout/switch)
  useEffect(() => {
    if (!uid) {
      setIsComplete(false);
      return;
    }
    setIsComplete(!!localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`));
  }, [uid]);

  const markOnboardingComplete = useCallback(() => {
    if (!uid) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, new Date().toISOString());
    setIsComplete(true);
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
