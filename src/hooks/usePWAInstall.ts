import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UsePWAInstallResult {
  canShow: boolean;
  shouldProactiveShow: boolean;
  platform: 'ios' | 'android' | null;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  markProactiveShown: () => void;
  markDismissed: () => void;
}

const DISMISSED_KEY = 'pwa-install-dismissed';
const PROMPTED_KEY = 'pwa-install-prompted';

function detectPlatform(): 'ios' | 'android' | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;

  // iOS detection (all iOS browsers use WebKit)
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }

  // Android mobile Chrome detection
  if (/Android/.test(ua) && /Mobile/.test(ua)) {
    return 'android';
  }

  return null;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function usePWAInstall(): UsePWAInstallResult {
  const platform = detectPlatform();
  const installed = isStandalone();
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [hasPromptEvent, setHasPromptEvent] = useState(false);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISSED_KEY));
  const [prompted, setPrompted] = useState(() => !!localStorage.getItem(PROMPTED_KEY));

  useEffect(() => {
    if (platform !== 'android' || installed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setHasPromptEvent(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [platform, installed]);

  const canShow = (() => {
    if (installed || platform === null) return false;
    if (platform === 'android') return hasPromptEvent;
    return true; // iOS always shows manual instructions
  })();

  const shouldProactiveShow = canShow && !prompted && !dismissed;

  const promptInstall = useCallback(async () => {
    if (platform !== 'android' || !deferredPromptRef.current) return;
    await deferredPromptRef.current.prompt();
    const choice = await deferredPromptRef.current.userChoice;
    if (choice.outcome === 'accepted') {
      deferredPromptRef.current = null;
      setHasPromptEvent(false);
    }
  }, [platform]);

  const markProactiveShown = useCallback(() => {
    localStorage.setItem(PROMPTED_KEY, 'true');
    setPrompted(true);
  }, []);

  const markDismissed = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    setDismissed(true);
  }, []);

  return {
    canShow,
    shouldProactiveShow,
    platform,
    isInstalled: installed,
    promptInstall,
    markProactiveShown,
    markDismissed,
  };
}
